import { afterEach, describe, expect, it, vi } from 'vitest';
import { sanitizeAuditMetadata } from './audit';
import { MAX_PHOTO_BYTES } from './mediaLimits';
import { MAX_IMAGE_BYTES, ALLOWED_IMAGE_MIMES } from './mediaPipeline';
import { moderateText } from './moderation';
import { enforceRateLimit } from './rateLimit';
import { securityReadiness } from './readiness';
import { sessionCookieOptions } from '../auth/session';

afterEach(() => vi.unstubAllEnvs());

describe('production security primitives', () => {
  it('redacts sensitive audit metadata and strips log injection characters', () => {
    expect(sanitizeAuditMetadata({ email: 'person@example.com', messageText: 'secret', actionType: 'profile\nupdate', count: 2 })).toEqual({ actionType: 'profile update', count: 2 });
  });

  it('allows only raster image types and caps uploads at 25 MiB', () => {
    expect(ALLOWED_IMAGE_MIMES.has('image/jpeg')).toBe(true);
    // SVG sigue fuera: es texto ejecutable, no un mapa de bits.
    expect(ALLOWED_IMAGE_MIMES.has('image/svg+xml')).toBe(false);
    // HEIC entra porque es lo que sacan los iPhone por defecto.
    expect(ALLOWED_IMAGE_MIMES.has('image/heic')).toBe(true);
    // El tope subio de 6 a 25 MiB: con 6 se rechazaban fotos legitimas de
    // telefonos comunes. Ver mediaLimits.ts.
    expect(MAX_IMAGE_BYTES).toBe(MAX_PHOTO_BYTES);
    expect(MAX_IMAGE_BYTES).toBe(25 * 1024 * 1024);
  });

  it('flags urgent animal-welfare text in development fallback', async () => {
    vi.stubEnv('MODERATION_API_URL', ''); vi.stubEnv('MODERATION_API_TOKEN', ''); vi.stubEnv('NODE_ENV', 'test');
    const result = await moderateText('Voy a lastimar al perro');
    expect(result.allowed).toBe(false);
    expect(result.urgentAnimalWelfare).toBe(true);
    expect(result.severity).toBe('critical');
  });

  it('enforces a local limit outside production', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', ''); vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', ''); vi.stubEnv('NODE_ENV', 'test');
    const key = `test:${Date.now()}`;
    expect((await enforceRateLimit(key, 1, 60_000)).allowed).toBe(true);
    expect((await enforceRateLimit(key, 1, 60_000)).allowed).toBe(false);
  });

  it('fails production readiness when security providers are absent', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    const result = securityReadiness();
    expect(result.ready).toBe(false);
    expect(result.missing).toContain('UPSTASH_REDIS_REST_URL');
  });

  it('uses a secure cross-site cookie only when the web client and API origins differ', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(sessionCookieOptions('http://localhost:3000', 'http://localhost:3000')).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(sessionCookieOptions('http://localhost:3000', 'https://api.example.com')).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  });
});
