import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, createSession } from '@/lib/auth'
import { randomBytes } from 'crypto'
import { signinSchema, formatErrorResponse, formatSuccessResponse } from '@/lib/validation'
import { checkRateLimit, getClientIP } from '@/lib/ratelimit'
import { getCSRFTokenFromHeaders, verifyCSRFToken } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(clientIP, 'signin');
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        formatErrorResponse(
          'RATE_LIMIT_EXCEEDED',
          'ログイン試行回数が上限に達しました。しばらく時間をおいてから再度お試しください。',
          undefined,
          600 // 10分
        ),
        { status: 429 }
      );
    }

    // CSRFトークンチェック
    const csrfToken = getCSRFTokenFromHeaders(request.headers);
    if (!csrfToken) {
      return NextResponse.json(
        formatErrorResponse(
          'CSRF_TOKEN_MISSING',
          'CSRFトークンが必要です'
        ),
        { status: 400 }
      );
    }

    // リクエストボディのバリデーション
    const body = await request.json();
    const validationResult = signinSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        formatErrorResponse(
          'VALIDATION_ERROR',
          '入力データが無効です',
          validationResult.error.issues
        ),
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // ユーザー検索
    const user = await getUserByEmail(email);
    if (!user) {
      // セキュリティ上の理由で、ユーザーが存在しない場合も同じエラーメッセージを返す
      return NextResponse.json(
        formatErrorResponse(
          'INVALID_CREDENTIALS',
          'メールアドレスまたはパスワードが正しくありません'
        ),
        { status: 401 }
      );
    }

    // パスワード検証
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        formatErrorResponse(
          'INVALID_CREDENTIALS',
          'メールアドレスまたはパスワードが正しくありません'
        ),
        { status: 401 }
      );
    }

    // セッショントークン生成（より安全な方法）
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7日間

    // セッション作成
    await createSession(user.id, token, expiresAt);

    // レスポンス作成
    const response = NextResponse.json(
      formatSuccessResponse({
        message: 'ログインに成功しました',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        }
      }, {
        rateLimit: {
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset
        }
      }),
      { status: 200 }
    );

    // セキュアなクッキー設定
    response.cookies.set('session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
      // partitioned: true, // Chrome でのサードパーティクッキー対策
    });

    // CSRFシークレットを設定
    const csrfSecret = randomBytes(16).toString('hex');
    response.cookies.set('csrf-secret', csrfSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      formatErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'サーバーエラーが発生しました'
      ),
      { status: 500 }
    );
  }
}
