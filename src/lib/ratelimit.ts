import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// When Upstash credentials are not provided, fall back to a safe NO-OP limiter
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

type LimitResult = { success: boolean; limit: number; remaining: number; reset: number };
type Limiter = { limit: (identifier: string) => Promise<LimitResult> };

function createNoopLimiter(limit = 1000, windowMs = 60_000): Limiter {
  return {
    async limit() {
      return {
        success: true,
        limit,
        remaining: limit,
        reset: Date.now() + windowMs,
      };
    },
  };
}

export const rateLimit: Record<'signin'|'signup'|'api'|'search', Limiter> = (() => {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
    return {
      signin: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '10 m'), analytics: true }) as unknown as Limiter,
      signup: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '10 m'), analytics: true }) as unknown as Limiter,
      api:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), analytics: true }) as unknown as Limiter,
      search: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m'), analytics: true }) as unknown as Limiter,
    };
  }

  // Env vars not set: no-op in dev or where Upstash is unavailable
  return {
    signin: createNoopLimiter(5, 10 * 60_000),
    signup: createNoopLimiter(3, 10 * 60_000),
    api:    createNoopLimiter(100, 60_000),
    search: createNoopLimiter(30, 60_000),
  };
})();

// Get client IP from request headers
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  return '127.0.0.1';
}

// Wrapper returning a Date for reset to keep API stable
export async function checkRateLimit(
  identifier: string,
  limitType: keyof typeof rateLimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const { success, limit, remaining, reset } = await rateLimit[limitType].limit(identifier);
  return { success, limit, remaining, reset: new Date(reset) };
}

