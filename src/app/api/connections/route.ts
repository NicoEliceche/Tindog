import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { enforceRateLimit } from '@core/security/rateLimit';
import { enqueuePush } from '@core/security/pushQueue';
import { writeSecurityAudit } from '@core/security/audit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../auth/cors';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'GET, POST, OPTIONS'); }
const fail = (error: unknown, request: NextRequest) => error instanceof ApiAuthError ? withAuthCors(NextResponse.json({ error: error.message }, { status: error.status }), request) : (console.error('Connection API failed', error), withAuthCors(NextResponse.json({ error: 'Unable to process connection request' }, { status: 500 }), request));

export async function GET(request: NextRequest) {
  try { const user = await requireAuthenticatedUser(request); const requests = await prisma.connectionRequest.findMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] }, orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, senderId: true, receiverId: true, status: true, createdAt: true, respondedAt: true, conversationId: true, pet: { select: { id: true, name: true, breed: true, age: true, photos: true } }, sender: { select: { id: true, name: true, avatarUrl: true } }, receiver: { select: { id: true, name: true, avatarUrl: true } } } }); return withAuthCors(NextResponse.json(requests), request); } catch (error) { return fail(error, request); }
}

export async function POST(request: NextRequest) {
  try {
    assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request); const rate = await enforceRateLimit(`connections:${user.id}`, 20, 24 * 60 * 60 * 1000); if (!rate.allowed) { const response = NextResponse.json({ error: 'Daily connection request limit reached' }, { status: 429 }); response.headers.set('Retry-After', String(rate.retryAfterSeconds)); return withAuthCors(response, request); }
    const body = await request.json() as { petId?: unknown }; const petId = typeof body.petId === 'string' ? body.petId : ''; if (!petId) return withAuthCors(NextResponse.json({ error: 'petId is required' }, { status: 400 }), request);
    const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: { not: user.id }, breedingPrefs: { is: { looking_for_pair: true } } }, select: { id: true, ownerId: true } }); if (!pet) return withAuthCors(NextResponse.json({ error: 'Pet is not available' }, { status: 404 }), request);
    const blocked = await prisma.userBlock.findFirst({ where: { OR: [{ blockerId: user.id, blockedId: pet.ownerId }, { blockerId: pet.ownerId, blockedId: user.id }] }, select: { id: true } }); if (blocked) throw new ApiAuthError(403, 'Connection is not available');
    const existing = await prisma.connectionRequest.findFirst({ where: { senderId: user.id, receiverId: pet.ownerId, petId, status: 'pending' }, select: { id: true } }); if (existing) return withAuthCors(NextResponse.json(existing), request);
    const created = await prisma.connectionRequest.create({ data: { senderId: user.id, receiverId: pet.ownerId, petId }, select: { id: true, status: true, createdAt: true } });
    await enqueuePush(pet.ownerId, 'connection_request', '/chat', created.id);
    await writeSecurityAudit({ request, actor: user, action: 'connection.request_created', outcome: 'success', targetType: 'connection_request', targetId: created.id, metadata: { petId } });
    return withAuthCors(NextResponse.json(created, { status: 201 }), request);
  } catch (error) { return fail(error, request); }
}
