import crypto from 'crypto';
import prisma from '@core/data/client/PrismaClient';
import { createPresignedExportDownload, deleteStorageObject, writePrivateExport } from '@core/security/objectStorage';

const DAY = 24 * 60 * 60 * 1000;

export async function processDataExports(limit = 5): Promise<number> {
  const jobs = await prisma.dataExportJob.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'asc' }, take: limit });
  let completed = 0;
  for (const job of jobs) {
    const lock = await prisma.dataExportJob.updateMany({ where: { id: job.id, status: 'pending' }, data: { status: 'processing' } });
    if (lock.count !== 1) continue;
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: job.userId },
        select: {
          id: true, email: true, name: true, avatarUrl: true, status: true, createdAt: true, updatedAt: true,
          settings: true,
          pets: true,
          sentConnectionRequests: true,
          receivedConnectionRequests: true,
          messages: { select: { id: true, text: true, conversationId: true, kind: true, readAt: true, deletedAt: true, createdAt: true } },
          appointmentParticipants: { include: { appointment: true } },
          safeLocationReviews: true,
          safetyCheckIns: true,
          reportsCreated: true,
          blocksCreated: true,
          pushDevices: { select: { id: true, platform: true, createdAt: true, lastSeenAt: true, revokedAt: true } },
        },
      });
      const objectKey = `exports/${job.userId}/${job.id}.json`;
      const body = Buffer.from(JSON.stringify({ generatedAt: new Date().toISOString(), user }, null, 2));
      await writePrivateExport(objectKey, body);
      await prisma.dataExportJob.update({ where: { id: job.id }, data: { status: 'ready', objectKey, completedAt: new Date(), expiresAt: new Date(Date.now() + 7 * DAY), lastError: null } });
      completed += 1;
    } catch (error) {
      await prisma.dataExportJob.update({ where: { id: job.id }, data: { status: 'failed', lastError: error instanceof Error ? error.message.slice(0, 160) : 'export_failed' } });
    }
  }
  return completed;
}

export async function exportDownloadUrl(userId: string, jobId: string): Promise<string | null> {
  const job = await prisma.dataExportJob.findFirst({ where: { id: jobId, userId, status: 'ready', expiresAt: { gt: new Date() }, objectKey: { not: null } }, select: { objectKey: true } });
  return job?.objectKey ? createPresignedExportDownload(job.objectKey) : null;
}

async function eraseAccount(userId: string, requestId: string): Promise<void> {
  const media = await prisma.mediaAsset.findMany({ where: { ownerId: userId }, select: { quarantineKey: true, processedKey: true } });
  for (const asset of media) {
    await deleteStorageObject('quarantine', asset.quarantineKey).catch(() => undefined);
    if (asset.processedKey) await deleteStorageObject('processed', asset.processedKey).catch(() => undefined);
  }
  const pets = await prisma.pet.findMany({ where: { ownerId: userId }, select: { id: true } });
  const petIds = pets.map((pet) => pet.id);
  const anonymousHash = crypto.createHash('sha256').update(`${userId}:${process.env.AUDIT_HASH_SECRET || 'development'}`).digest('hex').slice(0, 24);
  await prisma.$transaction(async (tx) => {
    await tx.message.updateMany({ where: { senderId: userId }, data: { text: '[mensaje eliminado por el usuario]', deletedAt: new Date(), moderationStatus: 'deleted' } });
    await tx.safeLocationReview.updateMany({ where: { userId }, data: { comment: '[reseña anonimizada por eliminación de cuenta]' } });
    await tx.connectionRequest.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });
    await tx.appointmentParticipant.deleteMany({ where: { userId } });
    await tx.safetyCheckIn.deleteMany({ where: { userId } });
    await tx.userBlock.deleteMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] } });
    await tx.moderationAppeal.deleteMany({ where: { userId } });
    await tx.pushJob.deleteMany({ where: { userId } });
    await tx.pushDevice.deleteMany({ where: { userId } });
    await tx.userSettings.deleteMany({ where: { userId } });
    await tx.authAccount.deleteMany({ where: { userId } });
    await tx.authSession.deleteMany({ where: { userId } });
    await tx.mediaAsset.deleteMany({ where: { ownerId: userId } });
    if (petIds.length) {
      await tx.competition.deleteMany({ where: { petId: { in: petIds } } });
      await tx.healthRecord.deleteMany({ where: { petId: { in: petIds } } });
      await tx.breedingPreference.deleteMany({ where: { petId: { in: petIds } } });
      await tx.appointmentParticipant.updateMany({ where: { petId: { in: petIds } }, data: { petId: null } });
      await tx.pet.deleteMany({ where: { id: { in: petIds } } });
      await tx.$executeRaw`UPDATE "Appointment" SET "petIds" = ARRAY(SELECT unnest("petIds") EXCEPT SELECT unnest(${petIds}::text[])), "ownerIds" = array_remove("ownerIds", ${userId}) WHERE ${userId} = ANY("ownerIds") OR "petIds" && ${petIds}::text[]`;
    } else {
      await tx.$executeRaw`UPDATE "Appointment" SET "ownerIds" = array_remove("ownerIds", ${userId}) WHERE ${userId} = ANY("ownerIds")`;
    }
    const conversations = await tx.conversation.findMany({ where: { users: { some: { id: userId } } }, select: { id: true } });
    for (const conversation of conversations) await tx.conversation.update({ where: { id: conversation.id }, data: { users: { disconnect: { id: userId } } } });
    await tx.report.updateMany({ where: { reporterId: userId }, data: { detail: '[contenido preservado bajo política de reporte; identidad anonimizada]' } });
    await tx.user.update({ where: { id: userId }, data: { email: `deleted+${anonymousHash}@invalid.tindog`, name: 'Cuenta eliminada', avatarUrl: null, googleSub: null, status: 'deleted', deletionScheduledAt: null, deletedAt: new Date() } });
    await tx.accountDeletionRequest.update({ where: { id: requestId }, data: { status: 'completed', completedAt: new Date() } });
  });
}

export async function runRetentionWorker(): Promise<{ accountsErased: number; exportsCompleted: number; expiredSessions: number; expiredMedia: number }> {
  const now = new Date();
  const expiredSessions = (await prisma.authSession.deleteMany({ where: { expiresAt: { lt: now } } })).count;
  await prisma.pushDevice.deleteMany({ where: { revokedAt: { lt: new Date(Date.now() - 30 * DAY) } } });
  await prisma.connectionRequest.deleteMany({ where: { status: { in: ['declined', 'cancelled'] }, createdAt: { lt: new Date(Date.now() - 180 * DAY) } } });
  await prisma.report.updateMany({ where: { status: 'resolved', resolvedAt: { lt: new Date(Date.now() - 730 * DAY) }, OR: [{ legalHoldUntil: null }, { legalHoldUntil: { lt: now } }] }, data: { detail: '[contenido eliminado por política de retención]', reportedUserId: null, conversationId: null } });
  const expiredAssets = await prisma.mediaAsset.findMany({ where: { retentionUntil: { lt: now }, status: { not: 'ready' } }, select: { id: true, quarantineKey: true, processedKey: true } });
  for (const asset of expiredAssets) {
    await deleteStorageObject('quarantine', asset.quarantineKey).catch(() => undefined);
    if (asset.processedKey) await deleteStorageObject('processed', asset.processedKey).catch(() => undefined);
  }
  await prisma.mediaAsset.deleteMany({ where: { id: { in: expiredAssets.map((asset) => asset.id) } } });
  const expiredExports = await prisma.dataExportJob.findMany({ where: { expiresAt: { lt: now }, objectKey: { not: null } }, select: { id: true, objectKey: true } });
  for (const job of expiredExports) if (job.objectKey) await deleteStorageObject('exports', job.objectKey).catch(() => undefined);
  await prisma.dataExportJob.deleteMany({ where: { id: { in: expiredExports.map((job) => job.id) } } });
  const due = await prisma.accountDeletionRequest.findMany({ where: { status: 'scheduled', scheduledAt: { lte: now } }, take: 20, orderBy: { scheduledAt: 'asc' } });
  let accountsErased = 0;
  for (const request of due) { await eraseAccount(request.userId, request.id); accountsErased += 1; }
  const exportsCompleted = await processDataExports();
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SET LOCAL tindog.retention_worker = 'on'`;
    await tx.$executeRaw`DELETE FROM "SecurityAuditEvent" WHERE "occurredAt" < NOW() - INTERVAL '730 days'`;
  });
  return { accountsErased, exportsCompleted, expiredSessions, expiredMedia: expiredAssets.length };
}
