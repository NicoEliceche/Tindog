/**
 * Lo que hace falta para que el servidor funcione de forma segura, aun sin
 * usuarios reales: sesiones, auditoría, límite de peticiones, identidad y
 * almacenamiento de archivos.
 */
const coreProductionVariables = [
  'JWT_SECRET',
  'AUDIT_HASH_SECRET',
  'WORKER_SECRET',
  'ADMIN_API_ACCESS_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'GOOGLE_WEB_CLIENT_ID',
  'GOOGLE_ANDROID_CLIENT_ID',
  'GOOGLE_IOS_CLIENT_ID',
  'OBJECT_STORAGE_REGION',
  'OBJECT_STORAGE_ACCESS_KEY_ID',
  'OBJECT_STORAGE_SECRET_ACCESS_KEY',
  'OBJECT_STORAGE_QUARANTINE_BUCKET',
  'OBJECT_STORAGE_PROCESSED_BUCKET',
  'OBJECT_STORAGE_EXPORT_BUCKET',
  'MEDIA_PUBLIC_BASE_URL',
] as const;

/**
 * Lo que sólo hace falta cuando hay gente subiendo contenido: análisis de
 * archivos, moderación, y el circuito de registro y alerta de incidentes.
 *
 * Se exige recién cuando `TINDOG_PUBLIC_LAUNCH` está activo. Antes de eso
 * pedirlo trabaría el despliegue sin proteger a nadie, porque no hay
 * usuarios todavía. Con la variable activa vuelve a ser obligatorio, así
 * que no se puede abrir al público por accidente sin estos servicios.
 */
const publicLaunchVariables = [
  // Places exige una cuenta de facturación en Google Cloud, y sólo la usa
  // la búsqueda de lugares seguros. Pedir una tarjeta antes de que exista
  // el primer usuario traba el despliegue por una pantalla que todavía no
  // se usa.
  'GOOGLE_PLACES_API_KEY',
  'MALWARE_SCANNER_URL',
  'MALWARE_SCANNER_TOKEN',
  'MODERATION_API_URL',
  'MODERATION_API_TOKEN',
  'MODERATION_EVIDENCE_KEY',
  'SECURITY_LOG_SINK_URL',
  'SECURITY_LOG_SINK_TOKEN',
  'SECURITY_ALERT_WEBHOOK_URL',
  'SECURITY_ALERT_WEBHOOK_TOKEN',
] as const;

/** ¿El despliegue acepta usuarios reales? */
export function isPublicLaunch(): boolean {
  return process.env.TINDOG_PUBLIC_LAUNCH === 'true';
}

export interface SecurityReadiness {
  ready: boolean;
  missing: string[];
  /** Qué exigencia se aplicó: sólo el núcleo, o también el lanzamiento. */
  scope: 'core' | 'public-launch';
}

export function securityReadiness(): SecurityReadiness {
  const scope = isPublicLaunch() ? 'public-launch' as const : 'core' as const;
  if (process.env.NODE_ENV !== 'production') return { ready: true, missing: [], scope };

  const required = isPublicLaunch()
    ? [...coreProductionVariables, ...publicLaunchVariables]
    : [...coreProductionVariables];
  const missing = required.filter((name) => !process.env[name]);
  const shortSecrets = ['JWT_SECRET', 'AUDIT_HASH_SECRET', 'WORKER_SECRET', 'ADMIN_API_ACCESS_KEY'].filter((name) => {
    const value = process.env[name];
    return Boolean(value && Buffer.byteLength(value) < 32);
  });
  // Si está cargada se valida el formato, esté o no en la lista exigida:
  // una clave mal formada es peor que una ausente, porque falla al usarla.
  const evidenceKey = process.env.MODERATION_EVIDENCE_KEY;
  const invalidEvidenceKey = Boolean(evidenceKey && Buffer.from(evidenceKey, 'base64').byteLength !== 32);
  return {
    ready: missing.length === 0 && shortSecrets.length === 0 && !invalidEvidenceKey,
    missing: [
      ...missing,
      ...shortSecrets.map((name) => `${name}_TOO_SHORT`),
      ...(invalidEvidenceKey ? ['MODERATION_EVIDENCE_KEY_INVALID'] : []),
    ],
    scope,
  };
}

export function assertSecurityReady(): void {
  const readiness = securityReadiness();
  if (!readiness.ready) throw new Error('Production security dependencies are not ready');
}
