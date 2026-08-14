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
    const { id } = await params; assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request); const body = await request.json() as { status?: unknown }; const status = body.status; if (status !== 'cancelled' && status !== 'completed') return withAuthCors(NextResponse.json({ error: 'Invalid status transition' }, { status: 400 }), request);
    const appointment = await prisma.appointment.findFirst({ where: { id, OR: [{ participants: { some: { userId: user.id } } }, { ownerIds: { has: user.id } }] }, select: { id: true, status: true, datetime: true, endAt: true } }); if (!appointment) throw new ApiAuthError(403, 'Appointment is not available'); if (appointment.status === 'cancelled' || appointment.status === 'completed') return withAuthCors(NextResponse.json({ error: 'Appointment is already closed' }, { status: 409 }), request);
    if (status === 'completed') { const now = Date.now(); const allowedFrom = appointment.datetime.getTime() - 15 * 60 * 1000; const allowedUntil = (appointment.endAt ?? new Date(appointment.datetime.getTime() + 60 * 60 * 1000)).getTime() + 2 * 60 * 60 * 1000; if (now < allowedFrom || now > allowedUntil) return withAuthCors(NextResponse.json({ error: 'Appointment cannot be completed outside its active window' }, { status: 409 }), request); }
    const updated = await prisma.appointment.update({ where: { id: appointment.id }, data: { status }, select: { id: true, status: true, updatedAt: true, participants: { select: { userId: true } } } });
    await Promise.all(updated.participants.filter((participant) => participant.userId !== user.id).map((participant) => enqueuePush(participant.userId, 'appointment', '/appointments', updated.id)));
    await writeSecurityAudit({ request, actor: user, action: `appointment.${status}`, outcome: 'success', targetType: 'appointment', targetId: updated.id });
    return withAuthCors(NextResponse.json(updated), request);
  } catch (error) { const status = error instanceof ApiAuthError ? error.status : 500; if (!(error instanceof ApiAuthError)) console.error('Appointment update failed', error); return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to update appointment' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request); }
}
