import { ApiAuthError, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../auth/cors';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'GET, OPTIONS'); }
export async function GET(request: NextRequest) { try { const user = await requireAuthenticatedUser(request); const conversations = await prisma.conversation.findMany({ where: { users: { some: { id: user.id } } }, orderBy: { updatedAt: 'desc' }, take: 100, select: { id: true, updatedAt: true, users: { where: { id: { not: user.id } }, select: { id: true, name: true, avatarUrl: true } }, messages: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 1, select: { text: true, kind: true, createdAt: true, senderId: true, readAt: true } }, connectionRequest: { select: { pet: { select: { id: true, name: true, photos: true } } } } } }); return withAuthCors(NextResponse.json(conversations), request); } catch (error) { const status = error instanceof ApiAuthError ? error.status : 500; return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to load conversations' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request); } }
