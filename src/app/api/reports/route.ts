import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { writeSecurityAudit } from '@core/security/audit';
import { createModerationCase, type ModerationDecision } from '@core/security/moderation';
import { enforceRateLimit } from '@core/security/rateLimit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../auth/cors';

export const runtime = 'nodejs';
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'POST, OPTIONS'); }
const categories = ['harassment', 'spam', 'fraud', 'animal_welfare', 'unsafe_meeting', 'impersonation', 'other'];

export async function POST(request: NextRequest) {
  try {
    assertTrustedWriteOrigin(request);
    const user = await requireAuthenticatedUser(request);
    const rate = await enforceRateLimit(`reports:${user.id}`, 10, 24 * 60 * 60 * 1000);
    if (!rate.allowed) return withAuthCors(NextResponse.json({ error: 'Report limit reached' }, { status: 429 }), request);
    const body = await request.json() as { reportedUserId?: unknown; conversationId?: unknown; category?: unknown; detail?: unknown };
    const reportedUserId = typeof body.reportedUserId === 'string' ? body.reportedUserId : null;
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId : null;
    const category = typeof body.category === 'string' ? body.category : '';
    const detail = typeof body.detail === 'string' ? body.detail.trim() : '';
    if (!reportedUserId || reportedUserId === user.id || !categories.includes(category) || detail.length < 1 || detail.length > 2000) return withAuthCors(NextResponse.json({ error: 'Invalid report' }, { status: 400 }), request);
    if (conversationId) {
      const member = await prisma.conversation.findFirst({ where: { id: conversationId, users: { some: { id: user.id } } }, select: { users: { where: { id: reportedUserId }, select: { id: true } } } });
      if (!member?.users.length) throw new ApiAuthError(403, 'Conversation is not available');
    }
    const critical = category === 'animal_welfare' || category === 'unsafe_meeting';
    const report = await prisma.report.create({ data: { reporterId: user.id, reportedUserId, conversationId, category, detail, priority: critical ? 'urgent' : 'normal', legalHoldUntil: critical ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null }, select: { id: true, status: true, priority: true, createdAt: true } });
    const decision: ModerationDecision = { allowed: true, labels: [category], severity: critical ? 'critical' : 'medium', provider: 'user-report', urgentAnimalWelfare: category === 'animal_welfare' };
    await createModerationCase({ subjectUserId: reportedUserId, reportId: report.id, targetType: 'report', targetId: report.id, source: 'user_report', content: detail, decision });
    await writeSecurityAudit({ request, actor: user, action: 'safety.report_created', outcome: 'success', targetType: 'report', targetId: report.id, metadata: { category, priority: report.priority } });
    return withAuthCors(NextResponse.json(report, { status: 201 }), request);
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    return withAuthCors(NextResponse.json({ error: status === 500 ? 'Unable to submit report' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request);
  }
}
