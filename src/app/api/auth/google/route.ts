import { NextRequest, NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import prisma from '@core/data/client/PrismaClient';
import { getGoogleClientIds, verifyGoogleIdToken } from '@core/auth/google';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@core/auth/session';
import type { AuthResponse, AuthUser, GoogleAuthConfigResponse } from '@core/types/auth.types';

export const runtime = 'nodejs';

function getAllowedOrigins(): string[] {
  return [
    process.env.CORS_ORIGIN,
    process.env.NEXT_PUBLIC_WEB_ORIGIN,
    'http://localhost:3000',
    'https://nicoeliceche.github.io',
  ]
    .flatMap((value) => value?.split(',') ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
}

function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  return response;
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
  return withCors(new NextResponse(null, { status: 204 }), request);
}

export async function GET(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) {
    return withCors(NextResponse.json({ webClientId: '' } satisfies GoogleAuthConfigResponse), request);
  }

  const webClientId = process.env.GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    return withCors(
      NextResponse.json({ error: 'GOOGLE_WEB_CLIENT_ID is not configured' }, { status: 500 }),
      request,
    );
  }

  return withCors(NextResponse.json({ webClientId } satisfies GoogleAuthConfigResponse), request);
}

export async function POST(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) {
    return withCors(NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 }), request);
  }

  try {
    if (getGoogleClientIds().length === 0) {
      return withCors(
        NextResponse.json({ error: 'Google OAuth client IDs are not configured' }, { status: 500 }),
        request,
      );
    }

    const body = await request.json();
    const idToken = typeof body.idToken === 'string' ? body.idToken : '';

    if (!idToken) {
      return withCors(NextResponse.json({ error: 'idToken is required' }, { status: 400 }), request);
    }

    const googleUser = await verifyGoogleIdToken(idToken);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ googleSub: googleUser.sub }, { email: googleUser.email }],
      },
    });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            email: googleUser.email,
            name: googleUser.name,
            avatarUrl: googleUser.picture,
            googleSub: googleUser.sub,
          },
        })
      : await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            avatarUrl: googleUser.picture,
            googleSub: googleUser.sub,
          },
        });

    await prisma.authAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleUser.sub,
        },
      },
      create: {
        provider: 'google',
        providerAccountId: googleUser.sub,
        userId: user.id,
      },
      update: {
        userId: user.id,
      },
    });

    const authUser = toAuthUser(user);
    const session = await createSessionToken(authUser);

    await prisma.authSession.create({
      data: {
        userId: user.id,
        tokenHash: session.tokenHash,
        expiresAt: session.expiresAt,
      },
    });

    const response = NextResponse.json({
      token: session.token,
      user: authUser,
    } satisfies AuthResponse);

    response.cookies.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return withCors(response, request);
  } catch (error) {
    console.error('Google auth failed', error);
    return withCors(NextResponse.json({ error: 'Google authentication failed' }, { status: 401 }), request);
  }
}
