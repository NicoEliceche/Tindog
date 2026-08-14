import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser, requireRecentStepUp } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { exportDownloadUrl } from '@core/security/accountLifecycle';
import { writeSecurityAudit } from '@core/security/audit';
import { enforceRateLimit } from '@core/security/rateLimit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../auth/cors';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'GET, POST, OPTIONS'); }

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request); requireRecentStepUp(user);
    const id = request.nextUrl.searchParams.get('id');
    if (id) {
      const downloadUrl = await exportDownloadUrl(user.id, id);
      if (!downloadUrl) return withAuthCors(NextResponse.json({ error: 'Export is not available' }, { status: 404 }), request);
      await writeSecurityAudit({ request, actor: user, action: 'account.export_downloaded', outcome: 'success', targetType: 'data_export', targetId: id });
      return withAuthCors(NextResponse.json({ downloadUrl, expiresInSeconds: 300 }), request);
    }
    const jobs = await prisma.dataExportJob.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, status: true, createdAt: true, completedAt: true, expiresAt: true } });
    return withAuthCors(NextResponse.json(jobs), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to load exports' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request); requireRecentStepUp(user);
    const rate = await enforceRateLimit(`data-export:${user.id}`, 2, 24 * 60 * 60 * 1000);
    if (!rate.allowed) return withAuthCors(NextResponse.json({ error: 'Export request limit reached' }, { status: 429 }), request);
    const existing = await prisma.dataExportJob.findFirst({ where: { userId: user.id, status: { in: ['pending', 'processing'] } }, select: { id: true, status: true } });
    const job = existing ?? await prisma.dataExportJob.create({ data: { userId: user.id }, select: { id: true, status: true } });
    await writeSecurityAudit({ request, actor: user, action: 'account.export_requested', outcome: 'success', targetType: 'data_export', targetId: job.id });
    return withAuthCors(NextResponse.json(job, { status: existing ? 200 : 202 }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to request export' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}
