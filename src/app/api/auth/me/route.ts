import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, hashSessionToken, verifySessionToken } from '@core/auth/session';
import prisma from '@core/data/client/PrismaClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const tokenHash = hashSessionToken(token);
    const session = await prisma.authSession.findUnique({
      where: { tokenHash },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await verifySessionToken(token);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
