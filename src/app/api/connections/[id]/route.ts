import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../auth/cors';
import { enqueuePush } from '@core/security/pushQueue';
import { writeSecurityAudit } from '@core/security/audit';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'PATCH, OPTIONS'); }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request); const body = await request.json() as { action?: unknown }; const action = body.action; if (action !== 'accept' && action !== 'decline') return withAuthCors(NextResponse.json({ error: 'action must be accept or decline' }, { status: 400 }), request);
    const connection = await prisma.connectionRequest.findFirst({ where: { id, receiverId: user.id, status: 'pending' }, select: { id: true, senderId: true, receiverId: true } }); if (!connection) return withAuthCors(NextResponse.json({ error: 'Pending request not found' }, { status: 404 }), request);
    if (action === 'decline') { await prisma.connectionRequest.updateMany({ where: { id: connection.id, receiverId: user.id, status: 'pending' }, data: { status: 'declined', respondedAt: new Date() } }); await enqueuePush(connection.senderId, 'connection_response', '/chat', connection.id); await writeSecurityAudit({ request, actor: user, action: 'connection.request_declined', outcome: 'success', targetType: 'connection_request', targetId: connection.id }); return withAuthCors(NextResponse.json({ status: 'declined' }), request); }
    const result = await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({ data: { users: { connect: [{ id: connection.senderId }, { id: connection.receiverId }] } }, select: { id: true } });
      const updated = await tx.connectionRequest.updateMany({ where: { id: connection.id, receiverId: user.id, status: 'pending' }, data: { status: 'accepted', respondedAt: new Date(), conversationId: conversation.id } });
      if (updated.count !== 1) throw new Error('Request was already processed');
      await tx.message.create({ data: { conversationId: conversation.id, senderId: user.id, kind: 'system', text: 'Solicitud aceptada. Coordiná el primer encuentro en un lugar público.' } });
      return conversation;
    });
    await enqueuePush(connection.senderId, 'connection_response', `/chat/${result.id}`, connection.id);
    await writeSecurityAudit({ request, actor: user, action: 'connection.request_accepted', outcome: 'success', targetType: 'connection_request', targetId: connection.id, metadata: { conversationId: result.id } });
    return withAuthCors(NextResponse.json({ status: 'accepted', conversationId: result.id }), request);
  } catch (error) { if (error instanceof ApiAuthError) return withAuthCors(NextResponse.json({ error: error.message }, { status: error.status }), request); console.error('Connection response failed', error); return withAuthCors(NextResponse.json({ error: 'Unable to respond to request' }, { status: 409 }), request); }
}
