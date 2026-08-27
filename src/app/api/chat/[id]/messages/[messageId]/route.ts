import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import { createModerationCase, moderateText } from '@core/security/moderation';
import { enforceRateLimit } from '@core/security/rateLimit';
import { writeSecurityAudit } from '@core/security/audit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../../../auth/cors';

export const runtime = 'nodejs';
export function generateStaticParams() { return []; }
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'PATCH, DELETE, OPTIONS'); }

function failure(error: unknown, request: NextRequest) {
  if (error instanceof ApiAuthError) return withAuthCors(NextResponse.json({ error: error.message }, { status: error.status }), request);
  console.error('Message API failed', error);
  return withAuthCors(NextResponse.json({ error: 'Unable to process message' }, { status: 500 }), request);
}

/**
 * Busca un mensaje propio de esta conversación, que todavía se pueda tocar.
 *
 * Sólo el autor edita o borra lo suyo, y un mensaje ya borrado no se vuelve
 * a tocar: su texto quedó reemplazado por "Borrado" del otro lado.
 */
async function ownMessage(conversationId: string, messageId: string, userId: string) {
  return prisma.message.findFirst({
    where: { id: messageId, conversationId, senderId: userId, deletedAt: null },
    select: { id: true, text: true },
  });
}

/** Editar el texto de un mensaje propio. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; messageId: string }> }) {
  if (isGitHubPagesStaticBuild()) return withAuthCors(NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 }), request);
  try {
    const { id, messageId } = await params;
    assertTrustedWriteOrigin(request);
    const user = await requireAuthenticatedUser(request);

    const rate = await enforceRateLimit(`message-edit:${user.id}`, 30, 60_000);
    if (!rate.allowed) return withAuthCors(NextResponse.json({ error: 'Edit rate limit reached' }, { status: 429 }), request);

    const existing = await ownMessage(id, messageId, user.id);
    if (!existing) throw new ApiAuthError(403, 'Message is not available');

    const body = await request.json() as { text?: unknown };
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text || text.length > 1000) return withAuthCors(NextResponse.json({ error: 'Message must contain 1 to 1000 characters' }, { status: 400 }), request);

    // El texto editado se modera igual que uno nuevo: si no, editar seria la
    // via para publicar lo que el envio rechaza.
    const decision = await moderateText(text);
    if (!decision.allowed) {
      const moderationCase = await createModerationCase({ subjectUserId: user.id, targetType: 'message', targetId: messageId, source: 'chat', content: text, decision });
      await writeSecurityAudit({ request, actor: user, action: 'chat.message_blocked', outcome: 'denied', targetType: 'moderation_case', targetId: moderationCase.id, metadata: { severity: decision.severity, edit: true } });
      return withAuthCors(NextResponse.json({ error: 'Message violates safety rules', caseId: moderationCase.id }, { status: 422 }), request);
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { text, editedAt: new Date(), moderationStatus: decision.labels.length ? 'flagged' : 'approved' },
      select: { id: true, text: true, editedAt: true },
    });

    await writeSecurityAudit({ request, actor: user, action: 'chat.message_edited', outcome: 'success', targetType: 'message', targetId: messageId, metadata: { conversationId: id } });
    return withAuthCors(NextResponse.json(message), request);
  } catch (error) { return failure(error, request); }
}

/**
 * Borrar un mensaje propio.
 *
 * No se elimina la fila: se marca con `deletedAt` y la burbuja pasa a decir
 * "Borrado". Sacarlo dejaría huecos en una charla que la otra persona ya
 * leyó, y perdería la referencia de cualquier respuesta que lo cite.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; messageId: string }> }) {
  if (isGitHubPagesStaticBuild()) return withAuthCors(NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 }), request);
  try {
    const { id, messageId } = await params;
    assertTrustedWriteOrigin(request);
    const user = await requireAuthenticatedUser(request);

    const existing = await ownMessage(id, messageId, user.id);
    if (!existing) throw new ApiAuthError(403, 'Message is not available');

    await prisma.message.update({ where: { id: messageId }, data: { deletedAt: new Date() } });
    await writeSecurityAudit({ request, actor: user, action: 'chat.message_deleted', outcome: 'success', targetType: 'message', targetId: messageId, metadata: { conversationId: id } });
    return withAuthCors(NextResponse.json({ id: messageId, deleted: true }), request);
  } catch (error) { return failure(error, request); }
}
