import React, { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supportedLanguages, t, getLanguagePath } from "@/lib/i18n";

// RSCでのfetchキャッシュ設定
export const revalidate = 600; // 10分間のRSCキャッシュ

interface Item {
  id: string;
  name: string;
  basePrice: number;
  fleaMarketFee: number;
  iconLink: string;
  types: string[];
  wikiLink: string;
}

async function fetchItems(language: string): Promise<Item[]> {
  const baseUrl = process.env.APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  
  const res = await fetch(`${baseUrl}/api/cache/items?lang=${language}`, {
    next: { 
      revalidate: 600, // 10分間のRSCキャッシュ
      tags: [`items:${language}`] 
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch items: ${res.status}`);
  }

  const data = await res.json();
  return data.data || [];
}

function ItemCard({ item, lang }: { item: Item; lang: string }) {
  return (
    <Link href={getLanguagePath(lang, `items/${item.id}`)} className="group">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
        <div className="flex items-center space-x-4">
          {item.iconLink && (
            <img 
              src={item.iconLink} 
              alt={item.name}
              className="w-12 h-12 object-contain"
              loading="lazy"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {item.name}
            </h3>
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {t(lang, 'items.basePrice')}: {item.basePrice?.toLocaleString()}₽
              </span>
              {item.fleaMarketFee && (
                <span className="ml-2">
                  {t(lang, 'items.fleaMarketFee')}: {item.fleaMarketFee.toLocaleString()}₽
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {item.types?.join(', ')}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ItemListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ItemList({ lang }: { lang: string }) {
  const items = await fetchItems(lang);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t(lang, 'items.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} lang={lang} />
      ))}
    </div>
  );
}

interface ItemsPageProps {
  params: { lang: string };
}

export default function ItemsPage({ params }: ItemsPageProps) {
  const lang = params.lang as any;
  
  if (!supportedLanguages.includes(lang)) {
    return <div>Language not supported</div>;
  }

  return (
    <>
      <Header lang={lang} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t(lang, 'items.title')}
            </h1>
            <p className="text-gray-600">
              {t(lang, 'items.description')}
            </p>
          </div>

          <Suspense fallback={<ItemListSkeleton />}>
            <ItemList lang={lang} />
          </Suspense>
        </div>
      </main>
    </>
  );
}




