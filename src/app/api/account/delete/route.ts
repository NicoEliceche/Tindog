import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser, requireRecentStepUp } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { writeSecurityAudit } from '@core/security/audit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../auth/cors';

export const runtime = 'nodejs';
const RECOVERY_DAYS = 14;
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'POST, DELETE, OPTIONS'); }

export async function POST(request: NextRequest) {
  try {
    assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request); requireRecentStepUp(user);
    const body = await request.json().catch(() => ({})) as { reason?: unknown };
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : undefined;
    const scheduledAt = new Date(Date.now() + RECOVERY_DAYS * 24 * 60 * 60 * 1000);
    const deletion = await prisma.$transaction(async (tx) => {
      const requestRecord = await tx.accountDeletionRequest.upsert({ where: { userId: user.id }, create: { userId: user.id, scheduledAt, reason }, update: { status: 'scheduled', scheduledAt, reason, cancelledAt: null, completedAt: null } });
      await tx.user.update({ where: { id: user.id }, data: { status: 'pending_deletion', deletionScheduledAt: scheduledAt } });
      await tx.authSession.deleteMany({ where: { userId: user.id, id: { not: user.sessionId } } });
      return requestRecord;
    });
    await writeSecurityAudit({ request, actor: user, action: 'account.deletion_scheduled', outcome: 'success', targetType: 'account_deletion', targetId: deletion.id, metadata: { recoveryDays: RECOVERY_DAYS } });
    return withAuthCors(NextResponse.json({ status: deletion.status, scheduledAt: deletion.scheduledAt, recoveryDays: RECOVERY_DAYS }, { status: 202 }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to schedule deletion' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request); requireRecentStepUp(user);
    const deletion = await prisma.$transaction(async (tx) => {
      const record = await tx.accountDeletionRequest.update({ where: { userId: user.id }, data: { status: 'cancelled', cancelledAt: new Date() } });
      await tx.user.update({ where: { id: user.id }, data: { status: 'active', deletionScheduledAt: null } });
      return record;
    });
    await writeSecurityAudit({ request, actor: user, action: 'account.deletion_cancelled', outcome: 'success', targetType: 'account_deletion', targetId: deletion.id });
    return withAuthCors(NextResponse.json({ status: 'cancelled' }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 409;
    return withAuthCors(NextResponse.json({ error: status === 409 ? 'No deletion request can be cancelled' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}
