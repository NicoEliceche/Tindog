import { NextResponse, type NextRequest } from 'next/server';

/**
 * Límite global de peticiones por IP sobre toda la superficie /api.
 *
 * Vive en `proxy.ts`: Next 16 deprecó el nombre `middleware` a favor de
 * `proxy`, con la misma semántica.
 *
 * Varias rutas ya aplican su propio límite, más ajustado y por usuario (los
 * reportes, el login). Esta capa no los reemplaza: es el piso que atrapa lo
 * que se olvide de ponerlo, para que agregar una ruta nueva sin límite no
 * abra un agujero. Un atacante sin sesión válida choca acá antes de llegar
 * a la base de datos.
 *
 * Corre en el edge runtime, así que no puede usar el limitador de Upstash
 * (que necesita Node). Es un contador en memoria por instancia: no es
 * exacto en un despliegue con varias réplicas, pero acota el abuso desde
 * una sola IP, que es el caso que importa para fuerza bruta y scraping.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
/** Techo del mapa para que no crezca sin límite ante IPs rotativas. */
const MAX_TRACKED_IPS = 20_000;

interface Bucket { count: number; resetsAt: number; }
const buckets = new Map<string, Bucket>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function overLimit(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const current = buckets.get(ip);

  if (!current || current.resetsAt <= now) {
    if (buckets.size >= MAX_TRACKED_IPS) {
      for (const [key, bucket] of Array.from(buckets.entries())) {
        if (bucket.resetsAt <= now) buckets.delete(key);
      }
      // Si todos siguen vigentes, se descarta el más viejo para dejar lugar.
      if (buckets.size >= MAX_TRACKED_IPS) {
        const oldest = buckets.keys().next().value;
        if (oldest) buckets.delete(oldest);
      }
    }
    buckets.set(ip, { count: 1, resetsAt: now + WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count > MAX_REQUESTS) {
    return { limited: true, retryAfter: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)) };
  }
  return { limited: false, retryAfter: 0 };
}

export function proxy(request: NextRequest) {
  const { limited, retryAfter } = overLimit(clientIp(request));
  if (!limited) return NextResponse.next();

  const response = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  response.headers.set('Retry-After', String(retryAfter));
  return response;
}

export const config = {
  // Sólo la API: los assets estáticos no necesitan pasar por acá.
  matcher: '/api/:path*',
};
