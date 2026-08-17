import { NextRequest, NextResponse } from 'next/server';
import { securityReadiness } from '@core/security/readiness';
import { assertAdminNetworkAuthorization } from '@core/security/workerAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Detalle de qué variables de entorno faltan para que el despliegue quede
 * listo para producción.
 *
 * Vive aparte de /api/health porque esa ruta es estática en el export a
 * GitHub Pages y no puede leer cabeceras. Y va detrás de la clave de
 * administración porque la lista es un mapa de la configuración del
 * servidor: decir públicamente qué falta le ahorra trabajo a un atacante.
 *
 *   curl -H "x-admin-access-key: <clave>" https://<host>/api/admin/readiness
 */
export async function GET(request: NextRequest) {
  try {
    assertAdminNetworkAuthorization(request);
  } catch {
    return NextResponse.json({ error: 'Administrator network authorization failed' }, { status: 401 });
  }

  const security = securityReadiness();
  return NextResponse.json({
    ready: security.ready,
    missingCount: security.missing.length,
    missing: security.missing,
    checkedAt: new Date().toISOString(),
  });
}
