import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { securityReadiness } from '@core/security/readiness';

// `force-static` era necesario para que el export a GitHub Pages compilara,
// pero congelaba la respuesta en el momento del build: en un servidor real
// el health-check informaba el estado de entonces y no el actual, que es
// justo lo contrario de lo que sirve un health-check.
//
// `force-dynamic` no puede usarse porque rompe el export. `auto` deja que
// Next decida: prerenderiza donde no hay servidor y evalúa por petición
// donde sí lo hay. Leer una cabecera basta para que no lo prerenderice.
export const dynamic = 'auto';
export const revalidate = 0;

export async function GET() {
  // Tocar las cabeceras marca la ruta como dinámica donde hay servidor, sin
  // impedir que el export estático la prerenderice.
  await headers();

  const security = securityReadiness();
  return NextResponse.json({
    ok: security.ready,
    service: 'tindog-api',
    securityReady: security.ready,
    // Cuántas faltan, sin decir cuáles: el detalle vive en
    // /api/admin/readiness, detrás de la clave de administración.
    missingCount: security.missing.length,
    // Momento del build en export estático; del arranque en modo server.
    timestamp: new Date().toISOString(),
  });
}
