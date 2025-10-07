import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supportedLanguages, t, getLanguagePath } from "@/lib/i18n";
import SignInForm from "@/components/SignInForm";

interface SignInPageProps {
  params: { lang: string };
}

export default function SignInPage({ params }: SignInPageProps) {
  const lang = params.lang as any;
  
  if (!supportedLanguages.includes(lang)) {
    return <div>Language not supported</div>;
  }

  return (
    <>
      <Header lang={lang} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t(lang, 'auth.signin')}
            </h1>
            <p className="text-gray-600">
              {lang === 'ja' ? 'アカウントにログインしてください' : 'Sign in to your account'}
            </p>
          </div>

          <SignInForm lang={lang} />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {lang === 'ja' ? 'アカウントをお持ちでない場合は ' : "Don't have an account? "}
              <Link 
                href={getLanguagePath(lang, 'auth/signup')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t(lang, 'auth.signup')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export const metadata = {
  title: 'ログイン - Tarkov Wiki',
  description: 'Tarkov Wikiにログインしてください。',
};




