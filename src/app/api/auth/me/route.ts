import { NextRequest, NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import { SESSION_COOKIE_NAME, hashSessionToken } from '@core/auth/session';
import prisma from '@core/data/client/PrismaClient';
import { verifySessionToken } from '@core/auth/session';
import type { AuthPlatform, AuthResponse, AuthUser } from '@core/types/auth.types';
import { withAuthCors } from '../cors';

export const runtime = 'nodejs';

function readBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
}

function getRequestSessionToken(request: NextRequest): string | null {
  return readBearerToken(request) ?? request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

function parseStoredPlatform(value: string): AuthPlatform | null {
  return value === 'web' || value === 'android' || value === 'ios' ? value : null;
}

function toAuthUser(user: {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email.split('@')[0],
    avatar: user.avatarUrl ?? undefined,
  };
}

export async function OPTIONS(request: NextRequest) {
  return withAuthCors(new NextResponse(null, { status: 204 }), request);
}

export async function GET(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) {
    return withAuthCors(NextResponse.json({ user: null }), request);
  }

  try {
    const token = getRequestSessionToken(request);

    if (!token) {
      return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);
    }

    const tokenHash = hashSessionToken(token);
    const session = await prisma.authSession.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.authSession.deleteMany({ where: { tokenHash } });
      }

      return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);
    }

    const verifiedSession = await verifySessionToken(token);
    const user = toAuthUser(session.user);
    const sessionPlatform = parseStoredPlatform(session.platform);

    if (!sessionPlatform || verifiedSession.id !== user.id || verifiedSession.platform !== sessionPlatform) {
      await prisma.authSession.deleteMany({ where: { tokenHash } });
      return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);
    }

    await prisma.authSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    const responseBody = {
      user,
      platform: sessionPlatform,
    } satisfies Pick<AuthResponse, 'user' | 'platform'>;

    return withAuthCors(NextResponse.json(responseBody), request);
  } catch {
    return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);
  }
}
