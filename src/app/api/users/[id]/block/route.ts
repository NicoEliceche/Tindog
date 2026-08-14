import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../../auth/cors';
import { writeSecurityAudit } from '@core/security/audit';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'POST, DELETE, OPTIONS'); }

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    assertTrustedWriteOrigin(request);
    const user = await requireAuthenticatedUser(request);
    if (id === user.id) return withAuthCors(NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 }), request);
    const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!target) return withAuthCors(NextResponse.json({ error: 'User not found' }, { status: 404 }), request);
    await prisma.$transaction([
      prisma.userBlock.upsert({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: target.id } }, create: { blockerId: user.id, blockedId: target.id }, update: {} }),
      prisma.connectionRequest.updateMany({ where: { status: 'pending', OR: [{ senderId: user.id, receiverId: target.id }, { senderId: target.id, receiverId: user.id }] }, data: { status: 'declined', respondedAt: new Date() } }),
    ]);
    await writeSecurityAudit({ request, actor: user, action: 'safety.user_blocked', outcome: 'success', targetType: 'user', targetId: target.id });
    return withAuthCors(NextResponse.json({ ok: true }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to block user' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    assertTrustedWriteOrigin(request);
    const user = await requireAuthenticatedUser(request);
    await prisma.userBlock.deleteMany({ where: { blockerId: user.id, blockedId: id } });
    await writeSecurityAudit({ request, actor: user, action: 'safety.user_unblocked', outcome: 'success', targetType: 'user', targetId: id });
    return withAuthCors(NextResponse.json({ ok: true }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to unblock user' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}
