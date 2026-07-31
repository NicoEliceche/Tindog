import { NextRequest, NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import prisma from '@core/data/client/PrismaClient';
import { getGoogleClientIds, verifyGoogleIdToken } from '@core/auth/google';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@core/auth/session';
import type { AuthPlatform, AuthResponse, AuthUser, GoogleAuthConfigResponse } from '@core/types/auth.types';
import { isAllowedAuthOrigin, withAuthCors } from '../cors';

export const runtime = 'nodejs';

interface LoginBucket { count: number; resetsAt: number }
const loginBuckets = new Map<string, LoginBucket>();

function parsePlatform(value: unknown): AuthPlatform {
  return value === 'android' || value === 'ios' ? value : 'web';
}

function requestIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function loginAllowed(request: NextRequest): boolean {
  const key = requestIp(request);
  const now = Date.now();
  const bucket = loginBuckets.get(key);
  if (!bucket || bucket.resetsAt <= now) {
    loginBuckets.set(key, { count: 1, resetsAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= 15) return false;
  bucket.count += 1;
  return true;
}

function toAuthUser(user: { id: string; email: string; name: string | null; avatarUrl: string | null }): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email.split('@')[0],
    avatar: user.avatarUrl ?? undefined,
  };
}

function sessionCookie(request: NextRequest) {
  const origin = request.headers.get('origin');
  const crossSite = Boolean(origin && origin !== request.nextUrl.origin);
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || crossSite,
    sameSite: crossSite ? 'none' as const : 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function OPTIONS(request: NextRequest) {
  return withAuthCors(new NextResponse(null, { status: 204 }), request);
}

export async function GET(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) {
    return withAuthCors(NextResponse.json({ webClientId: '' } satisfies GoogleAuthConfigResponse), request);
  }
  const webClientId = process.env.GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    return withAuthCors(NextResponse.json({ error: 'GOOGLE_WEB_CLIENT_ID is not configured' }, { status: 500 }), request);
  }
  return withAuthCors(NextResponse.json({ webClientId } satisfies GoogleAuthConfigResponse), request);
}

export async function POST(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) {
    return withAuthCors(NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 }), request);
  }
  if (!isAllowedAuthOrigin(request)) {
    return withAuthCors(NextResponse.json({ error: 'Authentication request is not allowed' }, { status: 403 }), request);
  }
  if (!loginAllowed(request)) {
    return withAuthCors(NextResponse.json({ error: 'Too many login attempts' }, { status: 429 }), request);
  }

  try {
    if (getGoogleClientIds().length === 0) {
      return withAuthCors(NextResponse.json({ error: 'Google OAuth client IDs are not configured' }, { status: 500 }), request);
    }
    const body = await request.json();
    const idToken = typeof body.idToken === 'string' ? body.idToken : '';
    const platform = parsePlatform(body.platform);
    if (!idToken) {
      return withAuthCors(NextResponse.json({ error: 'idToken is required' }, { status: 400 }), request);
    }

    const googleUser = await verifyGoogleIdToken(idToken);
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ googleSub: googleUser.sub }, { email: googleUser.email }] },
    });
    if (existingUser?.googleSub && existingUser.googleSub !== googleUser.sub) {
      return withAuthCors(NextResponse.json({ error: 'Google account does not match the linked identity' }, { status: 409 }), request);
    }

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: { email: googleUser.email, name: googleUser.name, avatarUrl: googleUser.picture, googleSub: googleUser.sub },
        })
      : await prisma.user.create({
          data: { email: googleUser.email, name: googleUser.name, avatarUrl: googleUser.picture, googleSub: googleUser.sub },
        });

    await prisma.authAccount.upsert({
      where: { provider_providerAccountId: { provider: 'google', providerAccountId: googleUser.sub } },
      create: { provider: 'google', providerAccountId: googleUser.sub, userId: user.id },
      update: { userId: user.id },
    });

    const authUser = toAuthUser(user);
    const session = await createSessionToken(authUser, platform);
    await prisma.authSession.create({
      data: { userId: user.id, tokenHash: session.tokenHash, platform, expiresAt: session.expiresAt },
    });
    await prisma.authSession.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });

    const response = NextResponse.json({
      token: platform === 'web' ? '' : session.token,
      user: authUser,
      platform,
    } satisfies AuthResponse);
    if (platform === 'web') response.cookies.set(SESSION_COOKIE_NAME, session.token, sessionCookie(request));
    return withAuthCors(response, request);
  } catch (error) {
    console.error('Google authentication failed', error instanceof Error ? error.message : 'Unknown error');
    return withAuthCors(NextResponse.json({ error: 'Google authentication failed' }, { status: 401 }), request);
  }
}
