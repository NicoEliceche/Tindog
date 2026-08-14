import { NextRequest, NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import { SESSION_COOKIE_NAME, hashSessionToken, sessionCookieOptions } from '@core/auth/session';
import prisma from '@core/data/client/PrismaClient';
import { withAuthCors } from '../cors';
import { writeSecurityAudit } from '@core/security/audit';
import { assertTrustedWriteOrigin } from '@core/auth/requestAuth';

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

export async function OPTIONS(request: NextRequest) {
  return withAuthCors(new NextResponse(null, { status: 204 }), request, 'POST, OPTIONS');
}

export async function POST(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) {
    return withAuthCors(NextResponse.json({ ok: true }), request, 'POST, OPTIONS');
  }

  try {
    assertTrustedWriteOrigin(request);
    const token = getRequestSessionToken(request);

    if (token) {
      const session = await prisma.authSession.findUnique({ where: { tokenHash: hashSessionToken(token) }, select: { id: true, userId: true } });
      await prisma.authSession.deleteMany({
        where: { tokenHash: hashSessionToken(token) },
      });
      if (session) await writeSecurityAudit({ request, actor: { id: session.userId, sessionId: session.id }, action: 'auth.logout', outcome: 'success', targetType: 'session', targetId: session.id });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      '',
      sessionCookieOptions(request.headers.get('origin'), request.nextUrl.origin, 0),
    );

    return withAuthCors(response, request, 'POST, OPTIONS');
  } catch {
    return withAuthCors(NextResponse.json({ ok: true }), request, 'POST, OPTIONS');
  }
}
