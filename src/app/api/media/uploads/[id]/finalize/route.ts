import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { writeSecurityAudit } from '@core/security/audit';
import { processQuarantinedImage } from '@core/security/mediaPipeline';
import { createModerationCase } from '@core/security/moderation';
import { deleteStorageObject } from '@core/security/objectStorage';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../../../auth/cors';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'POST, OPTIONS'); }

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let actor: Awaited<ReturnType<typeof requireAuthenticatedUser>> | undefined;
  try {
    assertTrustedWriteOrigin(request);
    actor = await requireAuthenticatedUser(request);
    const asset = await prisma.mediaAsset.findFirst({ where: { id, ownerId: actor.id, status: { in: ['awaiting_upload', 'processing_failed'] } } });
    if (!asset) throw new ApiAuthError(403, 'Upload is not available');
    const lock = await prisma.mediaAsset.updateMany({ where: { id, ownerId: actor.id, status: asset.status }, data: { status: 'scanning', rejectionReason: null } });
    if (lock.count !== 1) return withAuthCors(NextResponse.json({ error: 'Upload is already being processed' }, { status: 409 }), request);
    const processedKey = `processed/${actor.id}/${asset.id}.webp`;
    const result = await processQuarantinedImage({ quarantineKey: asset.quarantineKey, declaredMime: asset.declaredMime, declaredSize: asset.declaredSize, checksumSha256: asset.checksumSha256, processedKey });
    if (!result.allowed) {
      const moderationCase = await createModerationCase({ subjectUserId: actor.id, targetType: 'media_asset', targetId: asset.id, source: 'image_upload', decision: result.decision });
      await prisma.mediaAsset.update({ where: { id: asset.id }, data: { status: 'rejected', detectedMime: result.detectedMime, observedSize: result.observedSize, width: result.width, height: result.height, moderationLabels: result.labels, rejectionReason: 'moderation_rejected', retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
      await writeSecurityAudit({ request, actor, action: 'media.upload_rejected', outcome: 'denied', targetType: 'media_asset', targetId: asset.id, metadata: { moderationCaseId: moderationCase.id } });
      return withAuthCors(NextResponse.json({ error: 'Image requires moderation review', caseId: moderationCase.id }, { status: 422 }), request);
    }
    await prisma.$transaction(async (tx) => {
      await tx.mediaAsset.update({ where: { id: asset.id }, data: { status: 'ready', processedKey, publicUrl: result.publicUrl, detectedMime: result.detectedMime, observedSize: result.observedSize, width: result.width, height: result.height, moderationLabels: result.labels, retentionUntil: null } });
      if (asset.purpose === 'profile_avatar') await tx.user.update({ where: { id: actor!.id }, data: { avatarUrl: result.publicUrl } });
      else if (asset.petId) await tx.pet.update({ where: { id: asset.petId }, data: { photos: { push: result.publicUrl } } });
    });
    await deleteStorageObject('quarantine', asset.quarantineKey).catch(() => undefined);
    await writeSecurityAudit({ request, actor, action: 'media.upload_published', outcome: 'success', targetType: 'media_asset', targetId: asset.id, metadata: { purpose: asset.purpose, width: result.width, height: result.height } });
    return withAuthCors(NextResponse.json({ id: asset.id, url: result.publicUrl, status: 'ready' }), request);
  } catch (error) {
    if (actor) {
      await prisma.mediaAsset.updateMany({ where: { id, ownerId: actor.id, status: 'scanning' }, data: { status: 'processing_failed', rejectionReason: 'security_pipeline_failed', retentionUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      await writeSecurityAudit({ request, actor, action: 'media.upload_processing', outcome: 'failure', targetType: 'media_asset', targetId: id });
    }
    const status = error instanceof ApiAuthError ? error.status : 422;
    return withAuthCors(NextResponse.json({ error: status === 422 ? 'Image could not pass the security pipeline' : error instanceof Error ? error.message : 'Forbidden' }, { status }), request);
  }
}
