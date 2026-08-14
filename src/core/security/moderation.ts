import crypto from 'crypto';
import prisma from '@core/data/client/PrismaClient';

export interface ModerationDecision {
  allowed: boolean;
  labels: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  provider: string;
  providerVersion?: string;
  urgentAnimalWelfare: boolean;
}

function evidenceKey(): Buffer {
  const configured = process.env.MODERATION_EVIDENCE_KEY;
  if (!configured) {
    if (process.env.NODE_ENV === 'production') throw new Error('MODERATION_EVIDENCE_KEY is not configured');
    return crypto.createHash('sha256').update(process.env.JWT_SECRET || 'tindog-development-evidence-key').digest();
  }
  const key = Buffer.from(configured, 'base64');
  if (key.byteLength !== 32) throw new Error('MODERATION_EVIDENCE_KEY must be a base64-encoded 32-byte key');
  return key;
}

function encryptEvidence(content: string): Record<string, string> {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', evidenceKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]);
  return { version: 'aes-256-gcm-v1', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') };
}

function developmentTextDecision(text: string): ModerationDecision {
  const normalized = text.normalize('NFKC').toLowerCase();
  const urgent = /(matar|lastimar|envenenar|pelear).{0,30}(perro|animal|mascota)|(abuso|maltrato).{0,30}(animal|perro)/i.test(normalized);
  const abusive = urgent || /(amenaza|acosar|estafa|spam masivo)/i.test(normalized);
  return { allowed: !abusive, labels: urgent ? ['animal_welfare', 'violence'] : abusive ? ['abuse'] : [], severity: urgent ? 'critical' : abusive ? 'high' : 'low', provider: 'development-heuristic', urgentAnimalWelfare: urgent };
}

async function externalDecision(kind: 'text' | 'image', content: string): Promise<ModerationDecision> {
  const url = process.env.MODERATION_API_URL;
  const token = process.env.MODERATION_API_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') throw new Error('Moderation provider is unavailable');
    return kind === 'text' ? developmentTextDecision(content) : { allowed: true, labels: [], severity: 'low', provider: 'development-image-pass', urgentAnimalWelfare: false };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ kind, content }), signal: controller.signal });
    if (!response.ok) throw new Error('Moderation provider rejected the request');
    const result = await response.json() as Partial<ModerationDecision>;
    const severity = result.severity;
    if (typeof result.allowed !== 'boolean' || !Array.isArray(result.labels) || !['low', 'medium', 'high', 'critical'].includes(String(severity))) throw new Error('Invalid moderation response');
    return { allowed: result.allowed, labels: result.labels.filter((label): label is string => typeof label === 'string').slice(0, 20), severity: severity as ModerationDecision['severity'], provider: result.provider || 'external', providerVersion: result.providerVersion, urgentAnimalWelfare: Boolean(result.urgentAnimalWelfare) };
  } finally {
    clearTimeout(timeout);
  }
}

export const moderateText = (text: string) => externalDecision('text', text);
export const moderateImage = (base64Image: string) => externalDecision('image', base64Image);

export async function createModerationCase(input: {
  subjectUserId?: string;
  reportId?: string;
  targetType: string;
  targetId?: string;
  source: string;
  content?: string;
  decision: ModerationDecision;
}) {
  const moderationCase = await prisma.moderationCase.create({
    data: {
      subjectUserId: input.subjectUserId,
      reportId: input.reportId,
      targetType: input.targetType,
      targetId: input.targetId,
      source: input.source,
      severity: input.decision.severity,
      categories: input.decision.labels,
      evidence: input.content ? encryptEvidence(input.content) : undefined,
      provider: input.decision.provider,
      providerVersion: input.decision.providerVersion,
      automatedDecision: input.decision.allowed ? 'allow' : 'block',
      legalHoldUntil: input.decision.severity === 'critical' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined,
    },
  });
  if (input.decision.urgentAnimalWelfare) await sendUrgentSecurityAlert({ caseId: moderationCase.id, category: 'animal_welfare', severity: input.decision.severity });
  return moderationCase;
}

export async function sendUrgentSecurityAlert(payload: Record<string, string>): Promise<void> {
  const url = process.env.SECURITY_ALERT_WEBHOOK_URL;
  const token = process.env.SECURITY_ALERT_WEBHOOK_TOKEN;
  if (!url || !token) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ service: 'tindog', occurredAt: new Date().toISOString(), ...payload }), signal: controller.signal });
  } catch {
    // Alert delivery is retried by the external sink; the moderation case is already durable.
  } finally {
    clearTimeout(timeout);
  }
}
