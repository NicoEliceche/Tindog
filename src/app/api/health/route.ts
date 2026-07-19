import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'tindog-api',
    timestamp: new Date().toISOString(),
  });
}
