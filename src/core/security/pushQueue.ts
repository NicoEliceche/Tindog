import prisma from '@core/data/client/PrismaClient';

export type PushCategory = 'message' | 'connection_request' | 'connection_response' | 'appointment';

const copy: Record<PushCategory, { title: string; body: string; preference: 'pushMessages' | 'pushRequests' | 'pushAppointments' }> = {
  message: { title: 'Nuevo mensaje', body: 'Tenés un nuevo mensaje en Tindog.', preference: 'pushMessages' },
  connection_request: { title: 'Nueva conexión', body: 'Una persona quiere conectar a través de Tindog.', preference: 'pushRequests' },
  connection_response: { title: 'Solicitud actualizada', body: 'Tu solicitud de conexión tiene una actualización.', preference: 'pushRequests' },
  appointment: { title: 'Actualización de cita', body: 'Hay una actualización en una cita de Tindog.', preference: 'pushAppointments' },
};

export async function enqueuePush(userId: string, category: PushCategory, route: string, entityId?: string): Promise<void> {
  await prisma.pushJob.create({ data: { userId, category, payload: { route: route.slice(0, 120), entityId: entityId?.slice(0, 80) } } });
}

export async function processPushQueue(limit = 50): Promise<{ processed: number; sent: number; failed: number }> {
  const jobs = await prisma.pushJob.findMany({ where: { status: 'pending', notBefore: { lte: new Date() } }, orderBy: { createdAt: 'asc' }, take: Math.min(100, Math.max(1, limit)), include: { user: { select: { settings: true, pushDevices: { where: { revokedAt: null } } } } } });
  let sent = 0; let failed = 0;
  for (const job of jobs) {
    const locked = await prisma.pushJob.updateMany({ where: { id: job.id, status: 'pending' }, data: { status: 'processing', lockedAt: new Date(), attempts: { increment: 1 } } });
    if (locked.count !== 1) continue;
    const category = job.category as PushCategory;
    const messageCopy = copy[category];
    const enabled = messageCopy && (job.user.settings?.[messageCopy.preference] ?? true);
    const devices = job.user.pushDevices;
    if (!enabled || devices.length === 0) {
      await prisma.pushJob.update({ where: { id: job.id }, data: { status: 'skipped', sentAt: new Date(), lastError: enabled ? 'no_active_device' : 'disabled_by_user' } });
      continue;
    }
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { accept: 'application/json', 'accept-encoding': 'gzip, deflate', 'content-type': 'application/json' },
        body: JSON.stringify(devices.map((device) => ({ to: device.token, sound: 'default', title: messageCopy.title, body: messageCopy.body, data: job.payload, channelId: 'tindog-social', priority: 'high' }))),
      });
      if (!response.ok) throw new Error(`expo_push_${response.status}`);
      const result = await response.json() as { data?: Array<{ status?: string; details?: { error?: string } }> };
      const receipts = result.data ?? [];
      await Promise.all(receipts.map((receipt, index) => receipt.details?.error === 'DeviceNotRegistered' && devices[index] ? prisma.pushDevice.update({ where: { id: devices[index].id }, data: { revokedAt: new Date() } }) : Promise.resolve()));
      if (receipts.some((receipt) => receipt.status === 'error' && receipt.details?.error !== 'DeviceNotRegistered')) throw new Error('expo_push_rejected');
      await prisma.pushJob.update({ where: { id: job.id }, data: { status: 'sent', sentAt: new Date(), lastError: null } });
      sent += 1;
    } catch (error) {
      const attempts = job.attempts + 1;
      await prisma.pushJob.update({ where: { id: job.id }, data: { status: attempts >= 5 ? 'failed' : 'pending', notBefore: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60 * 1000), lockedAt: null, lastError: error instanceof Error ? error.message.slice(0, 120) : 'push_failed' } });
      failed += 1;
    }
  }
  return { processed: jobs.length, sent, failed };
}
