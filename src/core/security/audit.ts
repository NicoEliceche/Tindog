import crypto from 'crypto';
import prisma from '@core/data/client/PrismaClient';
import { requestIp } from '@core/security/rateLimit';
import type { NextRequest } from 'next/server';

type AuditOutcome = 'success' | 'denied' | 'failure';

interface AuditActor { id: string; sessionId?: string; }
interface AuditInput {
  request?: NextRequest;
  actor?: AuditActor;
  action: string;
  outcome: AuditOutcome;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

const sensitiveKey = /(token|secret|password|email|message|text|detail|comment|latitude|longitude|\blat\b|\blng\b|coordinate|address)/i;

function auditSecret(): string {
  const value = process.env.AUDIT_HASH_SECRET ?? (process.env.NODE_ENV !== 'production' ? process.env.JWT_SECRET : undefined);
  if (!value || Buffer.byteLength(value) < 32) throw new Error('AUDIT_HASH_SECRET must contain at least 32 bytes');
  return value;
}

function digest(value: string): string {
  return crypto.createHmac('sha256', auditSecret()).update(value).digest('hex');
}

export function sanitizeAuditMetadata(input?: Record<string, unknown>): Record<string, string | number | boolean | null> | undefined {
  if (!input) return undefined;
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(input).slice(0, 30)) {
    if (sensitiveKey.test(key)) continue;
    if (value === null || typeof value === 'boolean' || typeof value === 'number') clean[key] = value;
    else if (typeof value === 'string') clean[key] = value.slice(0, 160).replace(/[\r\n\t]/g, ' ');
  }
  return Object.keys(clean).length ? clean : undefined;
}

async function copyToSecuritySink(event: Record<string, unknown>): Promise<void> {
  const url = process.env.SECURITY_LOG_SINK_URL;
  const token = process.env.SECURITY_LOG_SINK_TOKEN;
  if (!url || !token) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  try {
    await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
  } catch {
    // The immutable database copy remains authoritative; sink delivery is monitored by readiness/alerts.
  } finally {
    clearTimeout(timeout);
  }
}

export async function writeSecurityAudit(input: AuditInput): Promise<void> {
  const occurredAt = new Date();
  const requestId = input.request?.headers.get('x-request-id') ?? crypto.randomUUID();
  const ip = input.request ? requestIp(input.request) : undefined;
  const userAgent = input.request?.headers.get('user-agent') ?? undefined;
  const metadata = sanitizeAuditMetadata(input.metadata);
  const eventHash = digest(JSON.stringify({
    nonce: crypto.randomUUID(),
    occurredAt: occurredAt.toISOString(),
    actorUserId: input.actor?.id,
    action: input.action,
    outcome: input.outcome,
    targetType: input.targetType,
    targetId: input.targetId,
    requestId,
    metadata,
  }));
  const event = await prisma.securityAuditEvent.create({
    data: {
      occurredAt,
      actorUserId: input.actor?.id,
      sessionId: input.actor?.sessionId,
      action: input.action,
      outcome: input.outcome,
      targetType: input.targetType,
      targetId: input.targetId,
      requestId,
      ipHash: ip ? digest(ip) : undefined,
      userAgentHash: userAgent ? digest(userAgent) : undefined,
      metadata,
      eventHash,
    },
  });
  await copyToSecuritySink({ ...event, metadata });
}
