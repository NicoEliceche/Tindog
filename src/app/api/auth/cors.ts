import { NextRequest, NextResponse } from 'next/server';

export { getAllowedAuthOrigins } from '@core/auth/allowedOrigins';
import { getAllowedAuthOrigins } from '@core/auth/allowedOrigins';

export function withAuthCors(
  response: NextResponse,
  request: NextRequest,
  methods = 'GET, POST, OPTIONS',
): NextResponse {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedAuthOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Methods', methods);

  return response;
}
