import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import type { AuthPlatform, AuthUser } from '@core/types/auth.types';

export const SESSION_COOKIE_NAME = 'tindog_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function sessionCookieOptions(
  requestOrigin: string | null,
  apiOrigin: string,
  maxAge = SESSION_MAX_AGE_SECONDS,
) {
  let isCrossSite = false;

  if (requestOrigin) {
    try {
      isCrossSite = new URL(requestOrigin).origin !== new URL(apiOrigin).origin;
    } catch {
      isCrossSite = false;
    }
  }

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || isCrossSite,
    sameSite: isCrossSite ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge,
  };
}

export interface VerifiedSession extends AuthUser {
  platform: AuthPlatform;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  if (new TextEncoder().encode(secret).byteLength < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes');
  }

  return new TextEncoder().encode(secret);
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function normalizeAuthPlatform(platform: unknown): AuthPlatform {
  return platform === 'android' || platform === 'ios' ? platform : 'web';
}

export async function createSessionToken(
  user: AuthUser,
  platform: AuthPlatform = 'web',
): Promise<{
  token: string;
  tokenHash: string;
  expiresAt: Date;
}> {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    platform,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuer('tindog-api')
    .setAudience('tindog-clients')
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());

  return {
    token,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
  };
}

export async function verifySessionToken(token: string): Promise<VerifiedSession> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: 'tindog-api',
    audience: 'tindog-clients',
    algorithms: ['HS256'],
  });

  if (!payload.sub || typeof payload.email !== 'string') {
    throw new Error('Invalid session token');
  }

  return {
    id: payload.sub,
    name: typeof payload.name === 'string' ? payload.name : payload.email,
    email: payload.email,
    avatar: typeof payload.avatar === 'string' ? payload.avatar : undefined,
    platform: normalizeAuthPlatform(payload.platform),
  };
}
