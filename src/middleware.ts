import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supportedLanguages, defaultLanguage } from '@/lib/i18n';

// 言語検出とリダイレクト
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 静的ファイルやAPIルートはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 言語プレフィックスが既にあるかチェック
  const pathnameHasLocale = supportedLanguages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 言語プレフィックスがない場合、デフォルト言語にリダイレクト
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl, { status: 302 });
  }

  return NextResponse.next();
}

// Accept-Languageヘッダーから言語を検出
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');
  
  if (acceptLanguage) {
    // 言語の優先度を解析
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, qValue] = lang.trim().split(';q=');
        const quality = qValue ? parseFloat(qValue) : 1.0;
        return { locale: locale.split('-')[0], quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // サポートする言語から最初にマッチするものを返す
    for (const { locale } of languages) {
      if (supportedLanguages.includes(locale as any)) {
        return locale;
      }
    }
  }

  // クッキーから言語設定を取得
  const cookieLanguage = request.cookies.get('preferred-language')?.value;
  if (cookieLanguage && supportedLanguages.includes(cookieLanguage as any)) {
    return cookieLanguage;
  }

  return defaultLanguage;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
