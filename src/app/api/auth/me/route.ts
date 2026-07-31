import { NextRequest, NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import { SESSION_COOKIE_NAME, hashSessionToken, verifySessionToken } from '@core/auth/session';
import prisma from '@core/data/client/PrismaClient';
import { withAuthCors } from '../cors';

export const runtime = 'nodejs';

function bearerToken(request: NextRequest): string | undefined {
  const authorization = request.headers.get('authorization');
  return authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : undefined;
}

export async function OPTIONS(request: NextRequest) {
  return withAuthCors(new NextResponse(null, { status: 204 }), request);
}

export async function GET(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);
  try {
    const token = bearerToken(request) || request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);

    const session = await prisma.authSession.findUnique({ where: { tokenHash: hashSessionToken(token) } });
    if (!session || session.expiresAt < new Date()) {
      return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);
    }
    const verified = await verifySessionToken(token);
    if (verified.platform !== session.platform) {
      return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);
    }
    await prisma.authSession.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
    return withAuthCors(NextResponse.json({ user: verified.user, platform: verified.platform }), request);
  } catch {
    return withAuthCors(NextResponse.json({ user: null }, { status: 401 }), request);
  }
}
