import { NextResponse } from 'next/server';
import { securityReadiness } from '@core/security/readiness';

export async function GET() {
  const security = securityReadiness();
  return NextResponse.json({
    ok: security.ready,
    service: 'tindog-api',
    securityReady: security.ready,
    timestamp: new Date().toISOString(),
  }, { status: security.ready ? 200 : 503 });
}
