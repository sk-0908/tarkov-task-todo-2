import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, generateCSRFSecret } from '@/lib/csrf';
import { formatSuccessResponse } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const token = generateCSRFToken();
    
    // レスポンス作成
    const response = NextResponse.json(
      formatSuccessResponse({
        csrfToken: token
      })
    );

    // CSRFシークレットをクッキーに設定（新規セッションの場合）
    const existingSecret = request.cookies.get('csrf-secret');
    if (!existingSecret) {
      const secret = generateCSRFSecret();
      response.cookies.set('csrf-secret', secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7日間
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'CSRFトークンの生成に失敗しました' },
      { status: 500 }
    );
  }
}
