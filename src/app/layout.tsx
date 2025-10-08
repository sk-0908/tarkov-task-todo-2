import React from "react";
import "./globals.css";
// Root layout should not redirect; redirect logic lives in page.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" dir="ltr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
