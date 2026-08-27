import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import { enforceRateLimit } from '@core/security/rateLimit';
import { createModerationCase, moderateText, type ModerationDecision } from '@core/security/moderation';
import { enqueuePush } from '@core/security/pushQueue';
import { writeSecurityAudit } from '@core/security/audit';
import { NextRequest, NextResponse } from 'next/server';
import { attachmentKindForMime } from '@core/security/attachmentPipeline';
import { withAuthCors } from '../../auth/cors';

export const runtime = 'nodejs';
export function generateStaticParams() { return [{ id: 'chat-1' }, { id: 'chat-2' }, { id: 'chat-3' }, { id: '1' }, { id: '2' }]; }
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'GET, POST, OPTIONS'); }

async function membership(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, users: { some: { id: userId } } }, select: { id: true, users: { where: { id: { not: userId } }, select: { id: true } } } });
  if (!conversation) return null;
  const otherIds = conversation.users.map((item) => item.id);
  const block = await prisma.userBlock.findFirst({ where: { OR: [{ blockerId: userId, blockedId: { in: otherIds } }, { blockedId: userId, blockerId: { in: otherIds } }] }, select: { id: true } });
  return block ? null : conversation;
}
function failure(error: unknown, request: NextRequest) { if (error instanceof ApiAuthError) return withAuthCors(NextResponse.json({ error: error.message }, { status: error.status }), request); console.error('Chat API failed', error); return withAuthCors(NextResponse.json({ error: 'Unable to process conversation' }, { status: 500 }), request); }

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isGitHubPagesStaticBuild()) return withAuthCors(NextResponse.json([]), request);
  try {
    const { id } = await params; const user = await requireAuthenticatedUser(request); if (!await membership(id, user.id)) throw new ApiAuthError(403, 'Conversation is not available');
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: 500,
      select: {
        id: true, text: true, kind: true, senderId: true, createdAt: true, readAt: true,
        // Los borrados viajan igual: la burbuja muestra "Borrado" en su
        // lugar, como WhatsApp. Sacarlos dejaria huecos en una charla que
        // la otra persona ya leyo.
        deletedAt: true, editedAt: true, replyToId: true,
        attachmentKind: true, attachmentName: true, attachmentSize: true, attachmentUrl: true,
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    return withAuthCors(NextResponse.json(messages), request);
  } catch (error) { return failure(error, request); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isGitHubPagesStaticBuild()) return withAuthCors(NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 }), request);
  try {
    const { id } = await params; assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request); const conversation = await membership(id, user.id); if (!conversation) throw new ApiAuthError(403, 'Conversation is not available');
    const rate = await enforceRateLimit(`message:${user.id}:${id}`, 30, 60_000); if (!rate.allowed) { const response = NextResponse.json({ error: 'Message rate limit reached' }, { status: 429 }); response.headers.set('Retry-After', String(rate.retryAfterSeconds)); return withAuthCors(response, request); }
    const body = await request.json() as { text?: unknown; replyToId?: unknown; attachmentId?: unknown; attachmentName?: unknown };
    const messageText = typeof body.text === 'string' ? body.text.trim() : '';
    const replyToId = typeof body.replyToId === 'string' ? body.replyToId : undefined;
    const attachmentId = typeof body.attachmentId === 'string' ? body.attachmentId : undefined;

    // Un adjunto solo, sin texto, es un mensaje valido.
    if ((!messageText && !attachmentId) || messageText.length > 1000) {
      return withAuthCors(NextResponse.json({ error: 'Message must contain 1 to 1000 characters' }, { status: 400 }), request);
    }

    // Solo se cita un mensaje de esta misma conversacion: si no, se podria
    // traer texto de una charla ajena a la vista de otra persona.
    if (replyToId) {
      const quoted = await prisma.message.findFirst({ where: { id: replyToId, conversationId: id }, select: { id: true } });
      if (!quoted) return withAuthCors(NextResponse.json({ error: 'Quoted message is not available' }, { status: 400 }), request);
    }

    // El adjunto tiene que ser propio, estar listo y no haberse usado antes.
    let attachment: { id: string; publicUrl: string | null; detectedMime: string | null; observedSize: number | null } | null = null;
    if (attachmentId) {
      attachment = await prisma.mediaAsset.findFirst({
        where: { id: attachmentId, ownerId: user.id, purpose: 'chat_attachment', status: 'ready', message: null },
        select: { id: true, publicUrl: true, detectedMime: true, observedSize: true },
      });
      if (!attachment?.publicUrl) return withAuthCors(NextResponse.json({ error: 'Attachment is not available' }, { status: 400 }), request);
    }
    // Un mensaje que es solo adjunto no tiene texto que moderar; el archivo
    // ya paso su propia revision al subirse.
    const decision: ModerationDecision = messageText
      ? await moderateText(messageText)
      : { allowed: true, labels: [], severity: 'low', provider: 'skipped', urgentAnimalWelfare: false };
    if (!decision.allowed) {
      const moderationCase = await createModerationCase({ subjectUserId: user.id, targetType: 'message_attempt', targetId: id, source: 'chat', content: messageText, decision });
      await writeSecurityAudit({ request, actor: user, action: 'chat.message_blocked', outcome: 'denied', targetType: 'moderation_case', targetId: moderationCase.id, metadata: { severity: decision.severity } });
      return withAuthCors(NextResponse.json({ error: 'Message violates safety rules', caseId: moderationCase.id }, { status: 422 }), request);
    }
    const attachmentKind = attachment ? attachmentKindForMime(attachment.detectedMime ?? '') : null;
    const message = await prisma.message.create({
      data: {
        text: messageText,
        senderId: user.id,
        conversationId: id,
        kind: 'text',
        moderationStatus: decision.labels.length ? 'flagged' : 'approved',
        ...(replyToId ? { replyToId } : {}),
        ...(attachment ? {
          attachmentId: attachment.id,
          attachmentKind,
          attachmentName: typeof body.attachmentName === 'string' ? body.attachmentName.slice(0, 200) : null,
          attachmentSize: attachment.observedSize,
          attachmentUrl: attachment.publicUrl,
        } : {}),
      },
      select: {
        id: true, text: true, kind: true, senderId: true, createdAt: true, replyToId: true,
        attachmentKind: true, attachmentName: true, attachmentSize: true, attachmentUrl: true,
      },
    });
    if (decision.labels.length) await createModerationCase({ subjectUserId: user.id, targetType: 'message', targetId: message.id, source: 'chat', content: messageText, decision });
    await Promise.all(conversation.users.map((participant) => enqueuePush(participant.id, 'message', `/chat/${id}`, id)));
    await writeSecurityAudit({ request, actor: user, action: 'chat.message_created', outcome: 'success', targetType: 'message', targetId: message.id, metadata: { conversationId: id, moderationStatus: decision.labels.length ? 'flagged' : 'approved' } });
    return withAuthCors(NextResponse.json(message, { status: 201 }), request);
  } catch (error) { return failure(error, request); }
}
