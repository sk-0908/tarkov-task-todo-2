import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supportedLanguages, t, getLanguagePath } from "@/lib/i18n";

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  
  if (!supportedLanguages.includes(lang)) {
    return <div>Language not supported</div>;
  }

  return (
    <>
      <Header lang={lang} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* ヒーローセクション */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {t(lang, 'home.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t(lang, 'home.description')}
            </p>
          </div>

          {/* 機能カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href={getLanguagePath(lang, 'items')} className="group">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t(lang, 'home.features.items.title')}
                </h3>
                <p className="text-gray-600">
                  {t(lang, 'home.features.items.description')}
                </p>
              </div>
            </Link>

            <Link href={getLanguagePath(lang, 'traders')} className="group">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t(lang, 'home.features.traders.title')}
                </h3>
                <p className="text-gray-600">
                  {t(lang, 'home.features.traders.description')}
                </p>
              </div>
            </Link>

            <Link href={getLanguagePath(lang, 'maps')} className="group">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t(lang, 'home.features.maps.title')}
                </h3>
                <p className="text-gray-600">
                  {t(lang, 'home.features.maps.description')}
                </p>
              </div>
            </Link>

            <Link href={getLanguagePath(lang, 'tasks')} className="group">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t(lang, 'home.features.tasks.title')}
                </h3>
                <p className="text-gray-600">
                  {t(lang, 'home.features.tasks.description')}
                </p>
              </div>
            </Link>
          </div>

          {/* 統計情報 */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              {t(lang, 'home.stats.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {t(lang, 'home.stats.multilang.title')}
                </div>
                <p className="text-gray-600">
                  {t(lang, 'home.stats.multilang.description')}
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {t(lang, 'home.stats.realtime.title')}
                </div>
                <p className="text-gray-600">
                  {t(lang, 'home.stats.realtime.description')}
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-500 mb-2">
                  {t(lang, 'home.stats.search.title')}
                </div>
                <p className="text-gray-600">
                  {t(lang, 'home.stats.search.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


