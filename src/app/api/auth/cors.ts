import { NextRequest, NextResponse } from 'next/server';

export function getAllowedAuthOrigins(): string[] {
  return [
    process.env.CORS_ORIGIN,
    process.env.NEXT_PUBLIC_WEB_ORIGIN,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://nicoeliceche.github.io',
  ]
    .flatMap((value) => value?.split(',') ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
}

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
