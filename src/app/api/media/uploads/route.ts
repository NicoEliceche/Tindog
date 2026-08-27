import crypto from 'crypto';
import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_BYTES } from '@core/security/mediaPipeline';
import { createPresignedUpload } from '@core/security/objectStorage';
import { attachmentKindForMime, attachmentRuleFor } from '@core/security/attachmentPipeline';
import { enforceRateLimit } from '@core/security/rateLimit';
import { writeSecurityAudit } from '@core/security/audit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../auth/cors';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'POST, OPTIONS'); }

export async function POST(request: NextRequest) {
  try {
    assertTrustedWriteOrigin(request);
    const user = await requireAuthenticatedUser(request);
    const rate = await enforceRateLimit(`media-upload:${user.id}`, 20, 60 * 60 * 1000);
    if (!rate.allowed) return withAuthCors(NextResponse.json({ error: 'Upload limit reached' }, { status: 429 }), request);
    const body = await request.json() as { purpose?: unknown; petId?: unknown; conversationId?: unknown; mime?: unknown; size?: unknown; checksumSha256?: unknown };
    const purpose = body.purpose;
    const petId = typeof body.petId === 'string' ? body.petId : undefined;
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId : undefined;
    const mime = typeof body.mime === 'string' ? body.mime.toLowerCase() : '';
    const size = Number(body.size);
    const checksumSha256 = typeof body.checksumSha256 === 'string' ? body.checksumSha256 : '';

    const known = purpose === 'profile_avatar' || purpose === 'pet_photo' || purpose === 'chat_attachment';
    if (!known || !Number.isInteger(size) || size < 1 || !/^[A-Za-z0-9+/]{43}=$/.test(checksumSha256)) {
      return withAuthCors(NextResponse.json({ error: 'Invalid upload request' }, { status: 400 }), request);
    }

    /*
     * Los adjuntos de chat aceptan foto, video y documento; el resto sigue
     * siendo solo imagen, porque esas se recodifican con sharp.
     */
    if (purpose === 'chat_attachment') {
      const kind = attachmentKindForMime(mime);
      if (!kind || size > attachmentRuleFor(kind).maxBytes) {
        return withAuthCors(NextResponse.json({ error: 'Invalid upload request' }, { status: 400 }), request);
      }
      if (!conversationId) return withAuthCors(NextResponse.json({ error: 'conversationId is required' }, { status: 400 }), request);
      // Sólo se adjunta a una conversación propia.
      const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, users: { some: { id: user.id } } }, select: { id: true } });
      if (!conversation) throw new ApiAuthError(403, 'Conversation is not available');
    } else if (!ALLOWED_IMAGE_MIMES.has(mime) || size > MAX_IMAGE_BYTES) {
      return withAuthCors(NextResponse.json({ error: 'Invalid upload request' }, { status: 400 }), request);
    }

    if (purpose === 'pet_photo') {
      if (!petId) return withAuthCors(NextResponse.json({ error: 'petId is required' }, { status: 400 }), request);
      const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id }, select: { id: true } });
      if (!pet) throw new ApiAuthError(403, 'Pet is not available');
    }
    const id = crypto.randomUUID();
    const quarantineKey = `quarantine/${user.id}/${id}`;
    const asset = await prisma.mediaAsset.create({ data: { id, ownerId: user.id, petId, purpose, quarantineKey, declaredMime: mime, declaredSize: size, checksumSha256, moderationLabels: [], retentionUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) }, select: { id: true } });
    const uploadUrl = await createPresignedUpload({ key: quarantineKey, mime, size, checksumSha256 });
    await writeSecurityAudit({ request, actor: user, action: 'media.upload_authorized', outcome: 'success', targetType: 'media_asset', targetId: asset.id, metadata: { purpose, size } });
    return withAuthCors(NextResponse.json({ assetId: asset.id, uploadUrl, method: 'PUT', expiresInSeconds: 300, requiredHeaders: { 'Content-Type': mime, 'Content-Length': String(size), 'x-amz-checksum-sha256': checksumSha256 } }, { status: 201 }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 503;
    return withAuthCors(NextResponse.json({ error: status === 503 ? 'Secure upload is temporarily unavailable' : error instanceof Error ? error.message : 'Forbidden' }, { status }), request);
  }
}
