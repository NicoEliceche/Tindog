import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../auth/cors';
import { enqueuePush } from '@core/security/pushQueue';
import { writeSecurityAudit } from '@core/security/audit';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'GET, POST, OPTIONS'); }
const fail = (error: unknown, request: NextRequest) => error instanceof ApiAuthError ? withAuthCors(NextResponse.json({ error: error.message }, { status: error.status }), request) : (console.error('Appointment API failed', error), withAuthCors(NextResponse.json({ error: 'Unable to process appointments' }, { status: 500 }), request));

export async function GET(request: NextRequest) {
  try { const user = await requireAuthenticatedUser(request); const appointments = await prisma.appointment.findMany({ where: { OR: [{ participants: { some: { userId: user.id } } }, { ownerIds: { has: user.id } }] }, orderBy: { datetime: 'desc' }, take: 200, select: { id: true, conversationId: true, petIds: true, ownerIds: true, datetime: true, endAt: true, status: true, notes: true, location: { select: { id: true, name: true, address: true, placeId: true, type: true, lat: true, lng: true } }, participants: { select: { userId: true, petId: true } }, reviews: { where: { userId: user.id }, select: { id: true } } } }); return withAuthCors(NextResponse.json(appointments), request); } catch (error) { return fail(error, request); }
}

export async function POST(request: NextRequest) {
  try {
    assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request); const body = await request.json() as { conversationId?: unknown; locationId?: unknown; startAt?: unknown; petIds?: unknown; notes?: unknown };
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId : ''; const locationId = typeof body.locationId === 'string' ? body.locationId : ''; const startAt = typeof body.startAt === 'string' ? new Date(body.startAt) : new Date(NaN); const petIds = Array.isArray(body.petIds) ? Array.from(new Set(body.petIds.filter((id): id is string => typeof id === 'string'))).slice(0, 4) : [];
    if (!conversationId || !locationId || !Number.isFinite(startAt.getTime()) || petIds.length < 1) return withAuthCors(NextResponse.json({ error: 'Invalid appointment data' }, { status: 400 }), request);
    const minStart = Date.now() + 15 * 60 * 1000; const maxStart = Date.now() + 180 * 24 * 60 * 60 * 1000; if (startAt.getTime() < minStart || startAt.getTime() > maxStart) return withAuthCors(NextResponse.json({ error: 'Appointment must be between 15 minutes and 180 days from now' }, { status: 400 }), request);
    const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, users: { some: { id: user.id } } }, select: { id: true, users: { select: { id: true } } } }); if (!conversation) throw new ApiAuthError(403, 'Conversation is not available'); const userIds = conversation.users.map((item) => item.id); if (userIds.length !== 2) return withAuthCors(NextResponse.json({ error: 'Appointments require a two-party conversation' }, { status: 409 }), request);
    const block = await prisma.userBlock.findFirst({ where: { OR: [{ blockerId: userIds[0], blockedId: userIds[1] }, { blockerId: userIds[1], blockedId: userIds[0] }] }, select: { id: true } }); if (block) throw new ApiAuthError(403, 'Appointment is not available');
    const [location, pets] = await Promise.all([prisma.location.findFirst({ where: { id: locationId, isActive: true }, select: { id: true } }), prisma.pet.findMany({ where: { id: { in: petIds }, ownerId: { in: userIds } }, select: { id: true, ownerId: true } })]); if (!location || pets.length !== petIds.length) return withAuthCors(NextResponse.json({ error: 'Location or pets are not available' }, { status: 404 }), request);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000); const created = await prisma.appointment.create({ data: { conversationId, locationId, datetime: startAt, endAt, status: 'scheduled', ownerIds: userIds, petIds, notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : null, participants: { create: userIds.map((userId) => ({ userId, petId: pets.find((pet) => pet.ownerId === userId)?.id })) } }, select: { id: true, datetime: true, endAt: true, status: true, location: true } });
    await Promise.all(userIds.filter((id) => id !== user.id).map((id) => enqueuePush(id, 'appointment', '/appointments', created.id)));
    await writeSecurityAudit({ request, actor: user, action: 'appointment.created', outcome: 'success', targetType: 'appointment', targetId: created.id, metadata: { conversationId, status: created.status } });
    return withAuthCors(NextResponse.json(created, { status: 201 }), request);
  } catch (error) { return fail(error, request); }
}
