import { assertTrustedWriteOrigin, ApiAuthError, requireAuthenticatedUser } from '@core/auth/requestAuth';
import { verifyGoogleIdToken } from '@core/auth/google';
import prisma from '@core/data/client/PrismaClient';
import { enforceRateLimit } from '@core/security/rateLimit';
import { writeSecurityAudit } from '@core/security/audit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../cors';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'POST, OPTIONS'); }

export async function POST(request: NextRequest) {
  let actor: Awaited<ReturnType<typeof requireAuthenticatedUser>> | undefined;
  try {
    assertTrustedWriteOrigin(request);
    actor = await requireAuthenticatedUser(request);
    const rate = await enforceRateLimit(`step-up:${actor.id}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) return withAuthCors(NextResponse.json({ error: 'Too many reauthentication attempts' }, { status: 429 }), request);
    const body = await request.json() as { idToken?: unknown };
    const idToken = typeof body.idToken === 'string' ? body.idToken : '';
    if (!idToken || idToken.length > 10_000) return withAuthCors(NextResponse.json({ error: 'idToken is required' }, { status: 400 }), request);
    const identity = await verifyGoogleIdToken(idToken);
    const account = await prisma.authAccount.findFirst({ where: { userId: actor.id, provider: 'google', providerAccountId: identity.sub }, select: { id: true } });
    if (!account || identity.email.toLowerCase() !== actor.email.toLowerCase()) throw new ApiAuthError(403, 'Google identity does not match this account');
    const verifiedAt = new Date();
    await prisma.authSession.update({ where: { id: actor.sessionId }, data: { stepUpVerifiedAt: verifiedAt } });
    await writeSecurityAudit({ request, actor, action: 'auth.step_up', outcome: 'success', targetType: 'session', targetId: actor.sessionId });
    return withAuthCors(NextResponse.json({ verifiedAt, expiresAt: new Date(verifiedAt.getTime() + 10 * 60 * 1000) }), request);
  } catch (error) {
    if (actor) await writeSecurityAudit({ request, actor, action: 'auth.step_up', outcome: 'denied', targetType: 'session', targetId: actor.sessionId });
    const status = error instanceof ApiAuthError ? error.status : 401;
    return withAuthCors(NextResponse.json({ error: status === 401 ? 'Reauthentication failed' : error instanceof Error ? error.message : 'Forbidden' }, { status }), request);
  }
}
