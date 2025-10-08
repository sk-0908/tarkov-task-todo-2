import React from 'react';
// Root layout should not redirect; redirect logic lives in page.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ルートアクセス時はデフォルト言語にリダイレクト
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}




