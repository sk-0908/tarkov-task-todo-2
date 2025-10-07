import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Redis設定（本番環境ではUpstash Redisを使用）
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:6379',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// レート制限設定
export const rateLimit = {
  // ログイン試行: 5回/10分
  signin: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
  }),
  
  // サインアップ: 3回/10分
  signup: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, '10 m'),
    analytics: true,
  }),
  
  // 一般API: 100回/分
  api: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
  
  // 検索API: 30回/分
  search: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
  }),
};

// IPアドレス取得
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1';
}

// レート制限チェック
export async function checkRateLimit(
  identifier: string,
  limitType: keyof typeof rateLimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const { success, limit, remaining, reset } = await rateLimit[limitType].limit(identifier);
  
  return {
    success,
    limit,
    remaining,
    reset: new Date(reset)
  };
}
