import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { securityReadiness } from './readiness';

/** Variables del núcleo, con valores que pasan la validación de formato. */
const CORE: Record<string, string> = {
  JWT_SECRET: 'x'.repeat(48),
  AUDIT_HASH_SECRET: 'x'.repeat(48),
  WORKER_SECRET: 'x'.repeat(48),
  ADMIN_API_ACCESS_KEY: 'x'.repeat(48),
  UPSTASH_REDIS_REST_URL: 'https://ejemplo.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'token',
  GOOGLE_WEB_CLIENT_ID: 'web.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID: 'android.apps.googleusercontent.com',
  GOOGLE_IOS_CLIENT_ID: 'ios.apps.googleusercontent.com',
  GOOGLE_PLACES_API_KEY: 'places',
  OBJECT_STORAGE_REGION: 'auto',
  OBJECT_STORAGE_ACCESS_KEY_ID: 'id',
  OBJECT_STORAGE_SECRET_ACCESS_KEY: 'secreto',
  OBJECT_STORAGE_QUARANTINE_BUCKET: 'cuarentena',
  OBJECT_STORAGE_PROCESSED_BUCKET: 'procesados',
  OBJECT_STORAGE_EXPORT_BUCKET: 'exportes',
  MEDIA_PUBLIC_BASE_URL: 'https://media.ejemplo.com',
};

const LAUNCH: Record<string, string> = {
  MALWARE_SCANNER_URL: 'https://scanner.ejemplo.com',
  MALWARE_SCANNER_TOKEN: 'token',
  MODERATION_API_URL: 'https://moderacion.ejemplo.com',
  MODERATION_API_TOKEN: 'token',
  MODERATION_EVIDENCE_KEY: Buffer.alloc(32, 7).toString('base64'),
  SECURITY_LOG_SINK_URL: 'https://logs.ejemplo.com',
  SECURITY_LOG_SINK_TOKEN: 'token',
  SECURITY_ALERT_WEBHOOK_URL: 'https://alertas.ejemplo.com',
  SECURITY_ALERT_WEBHOOK_TOKEN: 'token',
};

const original = { ...process.env };

beforeEach(() => {
  // Se parte de un entorno limpio para que el .env de quien corra las
  // pruebas no cambie el resultado.
  for (const key of [...Object.keys(CORE), ...Object.keys(LAUNCH), 'TINDOG_PUBLIC_LAUNCH']) {
    delete process.env[key];
  }
  (process.env as Record<string, string>).NODE_ENV = 'production';
});

afterEach(() => {
  process.env = { ...original };
});

const load = (vars: Record<string, string>) => Object.assign(process.env, vars);

describe('securityReadiness', () => {
  it('fuera de producción no exige nada', () => {
    (process.env as Record<string, string>).NODE_ENV = 'development';
    expect(securityReadiness().ready).toBe(true);
  });

  it('con el núcleo completo queda listo, sin exigir los servicios de lanzamiento', () => {
    load(CORE);
    const result = securityReadiness();
    expect(result.ready).toBe(true);
    expect(result.scope).toBe('core');
    expect(result.missing).toEqual([]);
  });

  it('informa exactamente qué falta del núcleo', () => {
    const { JWT_SECRET, ...resto } = CORE;
    load(resto);
    const result = securityReadiness();
    expect(result.ready).toBe(false);
    expect(result.missing).toContain('JWT_SECRET');
  });

  it('al abrir al público vuelve a exigir moderación y análisis', () => {
    load(CORE);
    process.env.TINDOG_PUBLIC_LAUNCH = 'true';
    const result = securityReadiness();
    expect(result.ready).toBe(false);
    expect(result.scope).toBe('public-launch');
    expect(result.missing).toContain('MODERATION_API_URL');
    expect(result.missing).toContain('MALWARE_SCANNER_URL');
  });

  it('con todo cargado y abierto al público queda listo', () => {
    load({ ...CORE, ...LAUNCH });
    process.env.TINDOG_PUBLIC_LAUNCH = 'true';
    expect(securityReadiness().ready).toBe(true);
  });

  it('rechaza un secreto demasiado corto aunque esté presente', () => {
    load({ ...CORE, JWT_SECRET: 'corto' });
    const result = securityReadiness();
    expect(result.ready).toBe(false);
    expect(result.missing).toContain('JWT_SECRET_TOO_SHORT');
  });

  it('valida el formato de la clave de evidencia aunque no se exija todavía', () => {
    // Sin lanzamiento público no está en la lista, pero si alguien la carga
    // mal conviene avisar ahora y no cuando se intente usar.
    load({ ...CORE, MODERATION_EVIDENCE_KEY: Buffer.alloc(16, 1).toString('base64') });
    const result = securityReadiness();
    expect(result.ready).toBe(false);
    expect(result.missing).toContain('MODERATION_EVIDENCE_KEY_INVALID');
  });
});
