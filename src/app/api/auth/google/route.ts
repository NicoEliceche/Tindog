import { NextRequest, NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import prisma from '@core/data/client/PrismaClient';
import { getGoogleClientIds, verifyGoogleIdToken } from '@core/auth/google';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from '@core/auth/session';
import type { AuthPlatform, AuthResponse, AuthUser, GoogleAuthConfigResponse } from '@core/types/auth.types';
import { withAuthCors } from '../cors';
import { enforceRateLimit, RateLimitUnavailableError, requestIp } from '@core/security/rateLimit';
import { ApiAuthError, assertTrustedWriteOrigin } from '@core/auth/requestAuth';
import { writeSecurityAudit } from '@core/security/audit';

export const runtime = 'nodejs';

function parsePlatform(value: unknown): AuthPlatform {
  if (value === 'android' || value === 'ios') {
    return value;
  }

  return 'web';
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
    return withAuthCors(NextResponse.json({ webClientId: '' } satisfies GoogleAuthConfigResponse), request);
  }

  const webClientId = process.env.GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    return withAuthCors(
      NextResponse.json({ error: 'GOOGLE_WEB_CLIENT_ID is not configured' }, { status: 500 }),
      request,
    );
  }

  return withAuthCors(NextResponse.json({ webClientId } satisfies GoogleAuthConfigResponse), request);
}

export async function POST(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) {
    return withAuthCors(NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 }), request);
  }

  try {
    assertTrustedWriteOrigin(request);
    const rateLimit = await enforceRateLimit(`oauth:${requestIp(request)}`, 12, 60_000);
    if (!rateLimit.allowed) {
      const response = NextResponse.json({ error: 'Too many login attempts' }, { status: 429 });
      response.headers.set('Retry-After', String(rateLimit.retryAfterSeconds));
      return withAuthCors(response, request);
    }
    if (getGoogleClientIds().length === 0) {
      return withAuthCors(
        NextResponse.json({ error: 'Google OAuth client IDs are not configured' }, { status: 500 }),
        request,
      );
    }

    const body = await request.json();
    const idToken = typeof body.idToken === 'string' ? body.idToken : '';
    const platform = parsePlatform(body.platform);

    if (!idToken) {
      return withAuthCors(NextResponse.json({ error: 'idToken is required' }, { status: 400 }), request);
    }

    const googleUser = await verifyGoogleIdToken(idToken);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ googleSub: googleUser.sub }, { email: googleUser.email }],
      },
    });

    if (existingUser?.googleSub && existingUser.googleSub !== googleUser.sub) {
      await writeSecurityAudit({ request, actor: { id: existingUser.id }, action: 'auth.account_link_conflict', outcome: 'denied', targetType: 'user', targetId: existingUser.id });
      return withAuthCors(NextResponse.json({ error: 'Google account does not match the linked identity' }, { status: 409 }), request);
    }

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
    const session = await createSessionToken(authUser, platform);

    await prisma.authSession.create({
      data: {
        userId: user.id,
        tokenHash: session.tokenHash,
        platform,
        expiresAt: session.expiresAt,
      },
    });

    await prisma.authSession.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    });

    const response = NextResponse.json({
      token: platform === 'web' ? '' : session.token,
      user: authUser,
      platform,
    } satisfies AuthResponse);

    if (platform === 'web') {
      response.cookies.set(
        SESSION_COOKIE_NAME,
        session.token,
        sessionCookieOptions(request.headers.get('origin'), request.nextUrl.origin),
      );
    }

    await writeSecurityAudit({ request, actor: { id: user.id, sessionId: undefined }, action: 'auth.login', outcome: 'success', targetType: 'session', metadata: { platform } });
    return withAuthCors(response, request);
  } catch (error) {
    await writeSecurityAudit({ request, action: 'auth.login', outcome: 'failure' }).catch(() => undefined);
    const status = error instanceof RateLimitUnavailableError ? 503 : error instanceof ApiAuthError ? error.status : 401;
    const message = status === 503
      ? 'Authentication security service is unavailable'
      : status === 403
        ? 'Authentication request is not allowed'
        : 'Google authentication failed';
    return withAuthCors(NextResponse.json({ error: message }, { status }), request);
  }
}
