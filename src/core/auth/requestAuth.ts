import { SESSION_COOKIE_NAME, hashSessionToken, verifySessionToken } from '@core/auth/session';
import prisma from '@core/data/client/PrismaClient';
import type { AuthPlatform, AuthUser } from '@core/types/auth.types';
import type { NextRequest } from 'next/server';
import { getAllowedAuthOrigins } from '@/app/api/auth/cors';

export class ApiAuthError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export interface AuthenticatedRequestUser extends AuthUser {
  platform: AuthPlatform;
  sessionId: string;
  role: string;
  status: string;
  stepUpVerifiedAt?: Date;
}

function readToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (authorization) {
    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() === 'bearer' && token?.trim()) return token.trim();
  }
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

function platform(value: string): AuthPlatform | null {
  return value === 'web' || value === 'android' || value === 'ios' ? value : null;
}

export function assertTrustedWriteOrigin(request: NextRequest): void {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (origin && !getAllowedAuthOrigins().includes(origin)) throw new ApiAuthError(403, 'Origin is not allowed');
  if (!origin && fetchSite === 'cross-site') throw new ApiAuthError(403, 'Cross-site request is not allowed');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (Number.isFinite(contentLength) && contentLength > 64 * 1024) throw new ApiAuthError(413, 'Request body is too large');
    const contentType = request.headers.get('content-type');
    if (contentLength > 0 && !contentType?.toLowerCase().startsWith('application/json')) throw new ApiAuthError(415, 'Only application/json is accepted');
  }
}

export async function requireAuthenticatedUser(request: NextRequest): Promise<AuthenticatedRequestUser> {
  const token = readToken(request);
  if (!token) throw new ApiAuthError(401, 'Authentication required');
  const session = await prisma.authSession.findUnique({ where: { tokenHash: hashSessionToken(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.authSession.deleteMany({ where: { id: session.id } });
    throw new ApiAuthError(401, 'Session expired');
  }
  const verified = await verifySessionToken(token).catch(() => null);
  const sessionPlatform = platform(session.platform);
  if (!verified || !sessionPlatform || verified.id !== session.userId || verified.platform !== sessionPlatform) {
    await prisma.authSession.deleteMany({ where: { id: session.id } });
    throw new ApiAuthError(401, 'Invalid session');
  }
  if (session.user.status === 'deleted') throw new ApiAuthError(403, 'Account is not available');
  if (Date.now() - session.lastUsedAt.getTime() > 5 * 60 * 1000) {
    await prisma.authSession.updateMany({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
  }
  return { id: session.user.id, email: session.user.email, name: session.user.name ?? session.user.email.split('@')[0], avatar: session.user.avatarUrl ?? undefined, platform: sessionPlatform, sessionId: session.id, role: session.user.role, status: session.user.status, stepUpVerifiedAt: session.stepUpVerifiedAt ?? undefined };
}

export function requireRecentStepUp(user: AuthenticatedRequestUser, maxAgeMs = 10 * 60 * 1000): void {
  if (!user.stepUpVerifiedAt || Date.now() - user.stepUpVerifiedAt.getTime() > maxAgeMs) {
    throw new ApiAuthError(403, 'Recent Google reauthentication is required');
  }
}

export function requireAdministrator(user: AuthenticatedRequestUser): void {
  if (user.role !== 'admin' && user.role !== 'moderator') throw new ApiAuthError(403, 'Administrator access required');
  requireRecentStepUp(user);
}
