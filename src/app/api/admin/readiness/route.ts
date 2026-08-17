import { NextRequest, NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import { securityReadiness } from '@core/security/readiness';
import { assertAdminNetworkAuthorization } from '@core/security/workerAuth';

export const runtime = 'nodejs';
// El export estático exige `force-static`, que congelaría la respuesta en el
// momento del build y volvería inútil un diagnóstico. Como en un sitio sin
// servidor esta ruta no tiene sentido, se declara estática para que el
// export compile y devuelve un aviso en vez del estado real.
export const dynamic = 'force-static';

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
  if (isGitHubPagesStaticBuild()) {
    return NextResponse.json(
      { error: 'Este diagnóstico sólo funciona en el despliegue con servidor.' },
      { status: 501 },
    );
  }

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
