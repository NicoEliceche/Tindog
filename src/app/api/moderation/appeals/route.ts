import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { writeSecurityAudit } from '@core/security/audit';
import { enforceRateLimit } from '@core/security/rateLimit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../auth/cors';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request);
    const rate = await enforceRateLimit(`moderation-appeal:${user.id}`, 5, 30 * 24 * 60 * 60 * 1000);
    if (!rate.allowed) return withAuthCors(NextResponse.json({ error: 'Appeal limit reached' }, { status: 429 }), request);
    const body = await request.json() as { caseId?: unknown; reason?: unknown };
    const caseId = typeof body.caseId === 'string' ? body.caseId : '';
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    if (!caseId || reason.length < 20 || reason.length > 2000) return withAuthCors(NextResponse.json({ error: 'Invalid appeal' }, { status: 400 }), request);
    const moderationCase = await prisma.moderationCase.findFirst({ where: { id: caseId, OR: [{ subjectUserId: user.id }, { report: { reporterId: user.id } }] }, select: { id: true } });
    if (!moderationCase) throw new ApiAuthError(403, 'Moderation case is not available');
    const appeal = await prisma.moderationAppeal.create({ data: { moderationCaseId: caseId, userId: user.id, reason }, select: { id: true, status: true, createdAt: true } });
    await prisma.moderationCase.update({ where: { id: caseId }, data: { status: 'appealed' } });
    await writeSecurityAudit({ request, actor: user, action: 'moderation.appeal_created', outcome: 'success', targetType: 'moderation_case', targetId: caseId });
    return withAuthCors(NextResponse.json(appeal, { status: 201 }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 409;
    return withAuthCors(NextResponse.json({ error: status === 409 ? 'Appeal already exists or cannot be created' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}
