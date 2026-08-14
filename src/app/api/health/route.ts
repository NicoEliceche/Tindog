import { NextResponse } from 'next/server';
import { securityReadiness } from '@core/security/readiness';

// El deploy a GitHub Pages usa `output: 'export'`, donde no hay servidor que
// responda en runtime: la ruta se materializa como un JSON estático. Next
// exige que `dynamic` sea un literal (no puede depender de una variable), y
// bajo export tampoco admite status dinámico. Por eso el readiness viaja en
// el body como `ok`/`securityReady` en vez de en el código HTTP, y quien
// consuma el health-check debe mirar el body.
export const dynamic = 'force-static';

export async function GET() {
  const security = securityReadiness();
  return NextResponse.json({
    ok: security.ready,
    service: 'tindog-api',
    securityReady: security.ready,
    // Momento del build en export estático; del arranque en modo server.
    timestamp: new Date().toISOString(),
  });
}
