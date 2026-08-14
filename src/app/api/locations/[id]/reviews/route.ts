import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../../../auth/cors';
import { writeSecurityAudit } from '@core/security/audit';
import { createModerationCase, moderateText } from '@core/security/moderation';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'GET, POST, OPTIONS'); }

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAuthenticatedUser(request);
    const reviews = await prisma.safeLocationReview.findMany({ where: { locationId: id }, orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, rating: true, comment: true, verifiedAttendance: true, createdAt: true, user: { select: { name: true, avatarUrl: true } } } });
    return withAuthCors(NextResponse.json(reviews), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to load reviews' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    assertTrustedWriteOrigin(request);
    const user = await requireAuthenticatedUser(request);
    const body = await request.json() as { appointmentId?: unknown; rating?: unknown; comment?: unknown };
    const appointmentId = typeof body.appointmentId === 'string' ? body.appointmentId : '';
    const rating = Number(body.rating);
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
    if (!appointmentId || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10 || comment.length > 1000) return withAuthCors(NextResponse.json({ error: 'Invalid review' }, { status: 400 }), request);
    const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, locationId: id, status: 'completed', participants: { some: { userId: user.id } }, safetyCheckIns: { some: { userId: user.id, checkedInAt: { not: null } } } }, select: { id: true } });
    if (!appointment) throw new ApiAuthError(403, 'Verified attendance is required');
    const decision = await moderateText(comment);
    if (!decision.allowed) { const moderationCase = await createModerationCase({ subjectUserId: user.id, targetType: 'location_review_attempt', targetId: id, source: 'location_review', content: comment, decision }); return withAuthCors(NextResponse.json({ error: 'Review violates safety rules', caseId: moderationCase.id }, { status: 422 }), request); }
    const review = await prisma.safeLocationReview.create({ data: { appointmentId, locationId: id, userId: user.id, rating, comment, verifiedAttendance: true }, select: { id: true, rating: true, comment: true, createdAt: true } });
    if (decision.labels.length) await createModerationCase({ subjectUserId: user.id, targetType: 'location_review', targetId: review.id, source: 'location_review', content: comment, decision });
    await writeSecurityAudit({ request, actor: user, action: 'location.review_created', outcome: 'success', targetType: 'safe_location_review', targetId: review.id, metadata: { appointmentId, rating } });
    return withAuthCors(NextResponse.json(review, { status: 201 }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    if (!(error instanceof ApiAuthError)) console.error('Review create failed', error);
    return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to publish review' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}
