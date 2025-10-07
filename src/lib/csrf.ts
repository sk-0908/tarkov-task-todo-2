import { randomBytes, createHmac } from 'crypto';

// CSRFトークンの生成
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// CSRFトークンの検証
export function verifyCSRFToken(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  
  // トークンが32バイト（64文字）の16進数かチェック
  if (!/^[a-f0-9]{64}$/i.test(token)) return false;
  
  return true;
}

// セッション用のCSRFシークレット生成
export function generateCSRFSecret(): string {
  return randomBytes(32).toString('hex');
}

// CSRFトークンとシークレットのペア生成
export function generateCSRFPair(): { token: string; secret: string } {
  const secret = generateCSRFSecret();
  const token = generateCSRFToken();
  
  return { token, secret };
}

// ヘッダーからCSRFトークンを取得
export function getCSRFTokenFromHeaders(headers: Headers): string | null {
  return headers.get('x-csrf-token') || headers.get('csrf-token');
}

// クッキーからCSRFシークレットを取得
export function getCSRFSecretFromCookies(cookies: string): string | null {
  const cookieMap = new Map();
  cookies.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    cookieMap.set(key, value);
  });
  
  return cookieMap.get('csrf-secret') || null;
}
