import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import type { AuthUser } from '@core/types/auth.types';

export const SESSION_COOKIE_NAME = 'tindog_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return new TextEncoder().encode(secret);
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSessionToken(user: AuthUser): Promise<{
  token: string;
  tokenHash: string;
  expiresAt: Date;
}> {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());

  return {
    token,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
  };
}

export async function verifySessionToken(token: string): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (!payload.sub || typeof payload.email !== 'string') {
    throw new Error('Invalid session token');
  }

  return {
    id: payload.sub,
    name: typeof payload.name === 'string' ? payload.name : payload.email,
    email: payload.email,
    avatar: typeof payload.avatar === 'string' ? payload.avatar : undefined,
  };
}
