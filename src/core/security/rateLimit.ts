import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

interface LocalBucket { count: number; resetsAt: number; }
export interface RateLimitResult { allowed: boolean; retryAfterSeconds: number; remaining: number; }

export class RateLimitUnavailableError extends Error {
  constructor() { super('Distributed rate limiting is unavailable'); }
}

const localBuckets = new Map<string, LocalBucket>();
const distributedLimiters = new Map<string, Ratelimit>();

function redisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

function localLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = localBuckets.get(key);
  if (!current || current.resetsAt <= now) {
    localBuckets.set(key, { count: 1, resetsAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0, remaining: Math.max(0, limit - 1) };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)), remaining: 0 };
  }
  current.count += 1;
  if (localBuckets.size > 5_000) {
    for (const [bucketKey, bucket] of Array.from(localBuckets.entries())) if (bucket.resetsAt <= now) localBuckets.delete(bucketKey);
  }
  return { allowed: true, retryAfterSeconds: 0, remaining: Math.max(0, limit - current.count) };
}

function limiterFor(limit: number, windowMs: number): Ratelimit | null {
  const redis = redisClient();
  if (!redis) return null;
  const cacheKey = `${limit}:${windowMs}`;
  const cached = distributedLimiters.get(cacheKey);
  if (cached) return cached;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    analytics: false,
    prefix: `tindog:ratelimit:${limit}:${windowMs}`,
  });
  distributedLimiters.set(cacheKey, limiter);
  return limiter;
}

export function requestIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function enforceRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const limiter = limiterFor(limit, windowMs);
  if (!limiter) {
    if (process.env.NODE_ENV === 'production') throw new RateLimitUnavailableError();
    return localLimit(key, limit, windowMs);
  }
  try {
    const result = await limiter.limit(key);
    return {
      allowed: result.success,
      retryAfterSeconds: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      remaining: Math.max(0, result.remaining),
    };
  } catch {
    if (process.env.NODE_ENV === 'production') throw new RateLimitUnavailableError();
    return localLimit(key, limit, windowMs);
  }
}
