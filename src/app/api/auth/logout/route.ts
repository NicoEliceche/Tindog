import { NextRequest, NextResponse } from 'next/server';
import prisma from '@core/data/client/PrismaClient';
import { SESSION_COOKIE_NAME, hashSessionToken } from '@core/auth/session';
import { isAllowedAuthOrigin, withAuthCors } from '../cors';

function bearerToken(request: NextRequest): string | undefined {
  const authorization = request.headers.get('authorization');
  return authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : undefined;
}

export async function OPTIONS(request: NextRequest) {
  return withAuthCors(new NextResponse(null, { status: 204 }), request);
}

export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) {
    return withAuthCors(NextResponse.json({ error: 'Authentication request is not allowed' }, { status: 403 }), request);
  }
  const token = bearerToken(request) || request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) await prisma.authSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return withAuthCors(response, request);
}
