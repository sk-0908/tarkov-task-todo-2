import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { supportedLanguages, t, getLanguagePath } from "@/lib/i18n";

interface ItemDetail {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  basePrice?: number;
  fleaMarketFee?: number;
  iconLink?: string;
  gridImageLink?: string;
  baseImageLink?: string;
  types?: string[];
  weight?: number;
  width?: number;
  height?: number;
  sellFor?: Array<{
    price: number;
    currency: string;
    vendor: {
      name: string;
    };
  }>;
  buyFor?: Array<{
    price: number;
    currency: string;
    vendor: {
      name: string;
    };
  }>;
  containsItems?: Array<{
    item: {
      id: string;
      name: string;
      iconLink?: string;
    };
    count: number;
  }>;
  usedInTasks?: Array<{
    id: string;
    name: string;
    trader: {
      name: string;
    };
  }>;
}

async function fetchItem(id: string, language: string): Promise<ItemDetail | null> {
  const baseUrl = process.env.APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/cache/item/${id}?lang=${language}`, {
      next: { 
        revalidate: 600,
        tags: [`item:${id}:${language}`] 
      }
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch item:', error);
    return null;
  }
}

function ItemDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
        <div className="flex items-start space-x-8">
          <div className="w-32 h-32 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ItemDetail({ itemId, lang }: { itemId: string; lang: string }) {
  const item = await fetchItem(itemId, lang);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* アイテム基本情報 */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-start space-x-8">
          {item.iconLink && (
            <img 
              src={item.iconLink} 
              alt={item.name}
              className="w-32 h-32 object-contain rounded"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{item.shortName}</p>
            
            {item.description && (
              <p className="text-gray-600 mb-6">{item.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {item.basePrice && (
                <div>
                  <div className="text-sm text-gray-500">{t(lang, 'items.basePrice')}</div>
                  <div className="font-semibold">{item.basePrice.toLocaleString()}₽</div>
                </div>
              )}
              {item.weight && (
                <div>
                  <div className="text-sm text-gray-500">{t(lang, 'items.weight')}</div>
                  <div className="font-semibold">{item.weight}kg</div>
                </div>
              )}
              {item.width && item.height && (
                <div>
                  <div className="text-sm text-gray-500">{t(lang, 'items.size')}</div>
                  <div className="font-semibold">{item.width}×{item.height}</div>
                </div>
              )}
              {item.types && (
                <div>
                  <div className="text-sm text-gray-500">{t(lang, 'items.types')}</div>
                  <div className="font-semibold">{item.types.join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 売買情報 */}
      {(item.sellFor || item.buyFor) && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t(lang, 'items.sellPrice')} / {t(lang, 'items.buyPrice')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 売却価格 */}
            {item.sellFor && item.sellFor.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">{t(lang, 'items.sellPrice')}</h3>
                <div className="space-y-2">
                  {item.sellFor.map((sell, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                      <span className="font-medium">{sell.vendor.name}</span>
                      <span className="text-green-600 font-semibold">
                        {sell.price.toLocaleString()} {sell.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 購入価格 */}
            {item.buyFor && item.buyFor.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">{t(lang, 'items.buyPrice')}</h3>
                <div className="space-y-2">
                  {item.buyFor.map((buy, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                      <span className="font-medium">{buy.vendor.name}</span>
                      <span className="text-blue-600 font-semibold">
                        {buy.price.toLocaleString()} {buy.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 含まれるアイテム */}
      {item.containsItems && item.containsItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t(lang, 'items.containsItems')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {item.containsItems.map((contained, index) => (
              <Link 
                key={index}
                href={getLanguagePath(lang, `items/${contained.item.id}`)}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                {contained.item.iconLink && (
                  <img src={contained.item.iconLink} alt={contained.item.name} className="w-8 h-8" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">{contained.item.name}</div>
                  <div className="text-xs text-gray-500">x{contained.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 使用されるタスク */}
      {item.usedInTasks && item.usedInTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t(lang, 'items.usedInTasks')}
          </h2>
          <div className="space-y-3">
            {item.usedInTasks.map((task) => (
              <Link 
                key={task.id}
                href={getLanguagePath(lang, `tasks/${task.id}`)}
                className="block p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">{task.name}</div>
                <div className="text-sm text-gray-500">{task.trader.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ItemDetailPageProps {
  params: { lang: string; id: string };
}

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
  const lang = params.lang as any;
  
  if (!supportedLanguages.includes(lang)) {
    return <div>Language not supported</div>;
  }

  return (
    <>
      <Header lang={lang} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link 
              href={getLanguagePath(lang, 'items')} 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t(lang, 'common.back')}
            </Link>
          </div>

          <Suspense fallback={<ItemDetailSkeleton />}>
            <ItemDetail itemId={params.id} lang={lang} />
          </Suspense>
        </div>
      </main>
    </>
  );
}




