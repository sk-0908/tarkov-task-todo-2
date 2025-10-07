import React from 'react';
import { redirect } from 'next/navigation';
import { defaultLanguage } from '@/lib/i18n';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ルートアクセス時はデフォルト言語にリダイレクト
  redirect(`/${defaultLanguage}`);
}




