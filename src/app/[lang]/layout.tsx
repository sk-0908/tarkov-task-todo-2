import React from 'react';
import { supportedLanguages, type SupportedLanguage } from '@/lib/i18n';
import Providers from '@/app/providers';

// 静的パラメータ生成
export function generateStaticParams() {
  return supportedLanguages.map((lang) => ({
    lang,
  }));
}

// 動的パラメータの検証


export default function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;
  
  // サポートされていない言語の場合は404
  if (!supportedLanguages.includes(lang as SupportedLanguage)) {
    return (
      <html lang="ja">
        <body>
          <div>Language not supported</div>
        </body>
      </html>
    );
  }

  return (
    <html lang={lang} dir="ltr">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
