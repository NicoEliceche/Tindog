import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export function assertWorkerAuthorization(request: NextRequest): void {
  const expected = process.env.WORKER_SECRET;
  const received = request.headers.get('x-worker-secret');
  if (!expected || !received || Buffer.byteLength(expected) < 32) throw new Error('Worker authorization failed');
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) throw new Error('Worker authorization failed');
}

export function assertAdminNetworkAuthorization(request: NextRequest): void {
  const expected = process.env.ADMIN_API_ACCESS_KEY;
  const received = request.headers.get('x-admin-access-key');
  if (!expected || !received || Buffer.byteLength(expected) < 32) throw new Error('Administrator network authorization failed');
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) throw new Error('Administrator network authorization failed');
}
