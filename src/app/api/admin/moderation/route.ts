import { ApiAuthError, assertTrustedWriteOrigin, requireAdministrator, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { writeSecurityAudit } from '@core/security/audit';
import { assertAdminNetworkAuthorization } from '@core/security/workerAuth';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../auth/cors';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    assertAdminNetworkAuthorization(request);
    const user = await requireAuthenticatedUser(request); requireAdministrator(user);
    const status = request.nextUrl.searchParams.get('status') || 'open';
    if (!['open', 'appealed', 'actioned', 'dismissed'].includes(status)) return withAuthCors(NextResponse.json({ error: 'Invalid status' }, { status: 400 }), request);
    const cases = await prisma.moderationCase.findMany({ where: { status }, orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }], take: 100, select: { id: true, targetType: true, targetId: true, source: true, status: true, severity: true, categories: true, automatedDecision: true, provider: true, createdAt: true, legalHoldUntil: true, report: { select: { id: true, category: true, detail: true, createdAt: true } }, appeals: { select: { id: true, reason: true, status: true, createdAt: true } } } });
    await writeSecurityAudit({ request, actor: user, action: 'admin.moderation_queue_viewed', outcome: 'success', targetType: 'moderation_queue', metadata: { status, count: cases.length } });
    return withAuthCors(NextResponse.json(cases), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 403;
    return withAuthCors(NextResponse.json({ error: 'Administrator access denied' }, { status }), request);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    assertAdminNetworkAuthorization(request); assertTrustedWriteOrigin(request);
    const user = await requireAuthenticatedUser(request); requireAdministrator(user);
    const body = await request.json() as { caseId?: unknown; status?: unknown; appealStatus?: unknown };
    const caseId = typeof body.caseId === 'string' ? body.caseId : '';
    const status = typeof body.status === 'string' ? body.status : '';
    if (!caseId || !['actioned', 'dismissed'].includes(status)) return withAuthCors(NextResponse.json({ error: 'Invalid moderation decision' }, { status: 400 }), request);
    const updated = await prisma.$transaction(async (tx) => {
      const moderationCase = await tx.moderationCase.update({ where: { id: caseId }, data: { status, resolvedAt: new Date() }, select: { id: true, status: true, subjectUserId: true } });
      if (body.appealStatus === 'accepted' || body.appealStatus === 'rejected') await tx.moderationAppeal.updateMany({ where: { moderationCaseId: caseId, status: 'pending' }, data: { status: body.appealStatus, reviewedAt: new Date() } });
      return moderationCase;
    });
    await writeSecurityAudit({ request, actor: user, action: 'admin.moderation_case_resolved', outcome: 'success', targetType: 'moderation_case', targetId: caseId, metadata: { status } });
    return withAuthCors(NextResponse.json(updated), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 403;
    return withAuthCors(NextResponse.json({ error: 'Administrator action denied' }, { status }), request);
  }
}
