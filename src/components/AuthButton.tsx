"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { t, getLanguagePath } from '@/lib/i18n';

interface AuthButtonProps {
  lang: string;
}

export default function AuthButton({ lang }: AuthButtonProps) {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">
          {lang === 'ja' ? `こんにちは、${user.username}さん` : `Hello, ${user.username}`}
        </span>
        <button
          onClick={signOut}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t(lang, 'auth.signout')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href={getLanguagePath(lang, 'auth/signin')}
        className="text-gray-700 hover:text-blue-600 transition-colors"
      >
        {t(lang, 'auth.signin')}
      </Link>
      <Link
        href={getLanguagePath(lang, 'auth/signup')}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {t(lang, 'auth.signup')}
      </Link>
    </div>
  );
}
