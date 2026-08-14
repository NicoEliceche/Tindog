const requiredProductionVariables = [
  'JWT_SECRET',
  'AUDIT_HASH_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'GOOGLE_WEB_CLIENT_ID',
  'GOOGLE_ANDROID_CLIENT_ID',
  'GOOGLE_IOS_CLIENT_ID',
  'GOOGLE_PLACES_API_KEY',
  'OBJECT_STORAGE_REGION',
  'OBJECT_STORAGE_ACCESS_KEY_ID',
  'OBJECT_STORAGE_SECRET_ACCESS_KEY',
  'OBJECT_STORAGE_QUARANTINE_BUCKET',
  'OBJECT_STORAGE_PROCESSED_BUCKET',
  'OBJECT_STORAGE_EXPORT_BUCKET',
  'MEDIA_PUBLIC_BASE_URL',
  'MALWARE_SCANNER_URL',
  'MALWARE_SCANNER_TOKEN',
  'MODERATION_API_URL',
  'MODERATION_API_TOKEN',
  'MODERATION_EVIDENCE_KEY',
  'SECURITY_LOG_SINK_URL',
  'SECURITY_LOG_SINK_TOKEN',
  'SECURITY_ALERT_WEBHOOK_URL',
  'SECURITY_ALERT_WEBHOOK_TOKEN',
  'WORKER_SECRET',
  'ADMIN_API_ACCESS_KEY',
] as const;

export interface SecurityReadiness {
  ready: boolean;
  missing: string[];
}

export function securityReadiness(): SecurityReadiness {
  if (process.env.NODE_ENV !== 'production') return { ready: true, missing: [] };
  const missing = requiredProductionVariables.filter((name) => !process.env[name]);
  const shortSecrets = ['JWT_SECRET', 'AUDIT_HASH_SECRET', 'WORKER_SECRET', 'ADMIN_API_ACCESS_KEY'].filter((name) => {
    const value = process.env[name];
    return Boolean(value && Buffer.byteLength(value) < 32);
  });
  const evidenceKey = process.env.MODERATION_EVIDENCE_KEY;
  const invalidEvidenceKey = Boolean(evidenceKey && Buffer.from(evidenceKey, 'base64').byteLength !== 32);
  return {
    ready: missing.length === 0 && shortSecrets.length === 0 && !invalidEvidenceKey,
    missing: [
      ...missing,
      ...shortSecrets.map((name) => `${name}_TOO_SHORT`),
      ...(invalidEvidenceKey ? ['MODERATION_EVIDENCE_KEY_INVALID'] : []),
    ],
  };
}

export function assertSecurityReady(): void {
  const readiness = securityReadiness();
  if (!readiness.ready) throw new Error('Production security dependencies are not ready');
}
