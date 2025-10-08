import React, { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ItemsControls from "@/components/ItemsControls";
import { supportedLanguages, t, getLanguagePath } from "@/lib/i18n";
import { headers } from "next/headers";
import { getJapaneseWikiUrlByName } from "@/lib/wiki-map";
import { getTypeLabel } from "@/lib/type-labels";

export const revalidate = 600;

interface Item {
  id: string;
  name: string;
  shortName?: string;
  basePrice: number;
  avg24hPrice?: number;
  fleaMarketFee: number;
  iconLink: string;
  gridImageLink?: string;
  image512pxLink?: string;
  types: string[];
  wikiLink: string;
  weight?: number;
  width?: number;
  height?: number;
}

async function fetchItems(language: string, params: { q?: string; sort?: string; order?: string; page?: number; pageSize?: number; types?: string[]; typesMode?: 'and'|'or' }): Promise<{ data: Item[]; total: number; limit: number; offset: number; }> {
  // Derive base URL from request headers to avoid env drift/timeouts
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || (process.env.VERCEL ? 'https' : 'http');
  const baseUrl = `${proto}://${host}`;
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 50;
  const offset = (page - 1) * pageSize;
  const qs = new URLSearchParams({
    lang: language,
    limit: String(pageSize),
    offset: String(offset),
    ...(params.q ? { q: params.q } : {}),
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.order ? { order: params.order } : {}),
    ...(params.typesMode ? { typesMode: params.typesMode } : {}),
  }).toString();
  const url = new URL(`${baseUrl}/api/cache/items?${qs}`);
  if (params.types && params.types.length > 0) {
    for (const tp of params.types) url.searchParams.append('types', tp);
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: 600, tags: [`items:${language}`] },
  });
  if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
  const json = await res.json();
  return { data: json.data || [], total: json.total || 0, limit: json.limit || pageSize, offset: json.offset || offset };
}

function ItemListSkeleton() {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="p-4 animate-pulse text-gray-500">Loading items…</div>
    </div>
  );
}

function ItemRow({ item, lang }: { item: Item; lang: string }) {
  const size = item.width && item.height ? `${item.width}×${item.height}` : "-";
  const wiki = item.wikiLink || '';
  // 日本語Wikiは wikiwiki.jp/eft の対応ページを辞書で引き、未登録ならトップへ
  const jaWiki: string | null = lang === 'ja' ? (getJapaneseWikiUrlByName(item.name) || 'https://wikiwiki.jp/eft/') : null;
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2">
        {item.iconLink && (
          <img src={item.iconLink} alt={item.name} className="w-10 h-10 object-contain" loading="lazy" />
        )}
      </td>
      <td className="p-2">
        <div className="flex flex-col">
          <Link href={getLanguagePath(lang, `items/${item.id}`)} className="font-medium text-blue-600 hover:underline">
            {item.name}
          </Link>
          <span className="text-xs text-gray-500">{item.shortName || "-"}</span>
        </div>
      </td>
      <td className="p-2 text-right tabular-nums">{item.basePrice?.toLocaleString?.() ?? "-"}</td>
      <td className="p-2 text-right tabular-nums">{item.avg24hPrice ? item.avg24hPrice.toLocaleString() : "-"}</td>
      <td className="p-2 text-right tabular-nums">{item.fleaMarketFee ? item.fleaMarketFee.toLocaleString() : "-"}</td>
      <td className="p-2">{Array.isArray(item.types) ? item.types.map((tp) => getTypeLabel(tp, lang as any)).join(', ') : '-'}</td>
      <td className="p-2 text-right">{item.weight ?? "-"}</td>
      <td className="p-2 text-center">{size}</td>
      <td className="p-2 text-center">
        {wiki ? (
          <div className="flex items-center justify-center gap-2">
            <a href={wiki} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Wiki</a>
            {jaWiki && (
              <a href={jaWiki} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">日本語</a>
            )}
          </div>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
}

async function ItemTable({ lang, q, sort, order, page, pageSize, types, typesMode }: { lang: string; q?: string; sort?: string; order?: string; page?: number; pageSize?: number; types?: string[]; typesMode?: 'and'|'or' }) {
  const { data: items, total, limit, offset } = await fetchItems(lang, { q, sort, order, page, pageSize, types, typesMode });
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t(lang, "items.notFound")}</p>
      </div>
    );
  }
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-2 text-left w-12">Icon</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-right">Base</th>
            <th className="p-2 text-right">Avg24h</th>
            <th className="p-2 text-right">FleaFee</th>
            <th className="p-2 text-left">Types</th>
            <th className="p-2 text-right">Weight</th>
            <th className="p-2 text-center">Size</th>
            <th className="p-2 text-center">Wiki</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: Item) => (
            <ItemRow key={item.id} item={item} lang={lang} />
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between p-3 text-sm text-gray-600">
        <div>
          Page {currentPage} / {totalPages} • Total {total.toLocaleString()} items
        </div>
        <div className="flex gap-2">
          <PaginationLink lang={lang} label="Prev" page={Math.max(1, currentPage - 1)} disabled={currentPage <= 1} q={q} sort={sort} order={order} pageSize={limit} types={types} typesMode={typesMode} />
          <PaginationLink lang={lang} label="Next" page={Math.min(totalPages, currentPage + 1)} disabled={currentPage >= totalPages} q={q} sort={sort} order={order} pageSize={limit} types={types} typesMode={typesMode} />
        </div>
      </div>
    </div>
  );
}

function PaginationLink({ lang, label, page, disabled, q, sort, order, pageSize, types, typesMode }: { lang: string; label: string; page: number; disabled?: boolean; q?: string; sort?: string; order?: string; pageSize?: number; types?: string[]; typesMode?: 'and'|'or' }) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (sort) params.set('sort', sort);
  if (order) params.set('order', order);
  if (pageSize) params.set('pageSize', String(pageSize));
  if (typesMode) params.set('typesMode', typesMode);
  if (types && types.length) {
    for (const tp of types) params.append('types', tp);
  }
  params.set('page', String(page));
  const href = getLanguagePath(lang, 'items') + `?${params.toString()}`;
  if (disabled) return <span className="px-3 py-1 rounded bg-gray-100 text-gray-400 cursor-not-allowed">{label}</span>;
  return <Link href={href} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">{label}</Link>;
}

interface ItemsPageProps { params: { lang: string }, searchParams: { [key: string]: string | string[] | undefined } }

export default function ItemsPage({ params, searchParams }: ItemsPageProps) {
  const lang = params.lang as any;
  if (!supportedLanguages.includes(lang)) return <div>Language not supported</div>;
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : undefined;
  const order = typeof searchParams.order === 'string' ? searchParams.order : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : undefined;
  const pageSize = typeof searchParams.pageSize === 'string' ? parseInt(searchParams.pageSize, 10) : undefined;
  const types = Array.isArray(searchParams.types)
    ? (searchParams.types as string[])
    : (typeof searchParams.types === 'string' ? [searchParams.types] : []);
  const typesMode = (typeof searchParams.typesMode === 'string' && searchParams.typesMode.toLowerCase() === 'and') ? 'and' : 'or';

  return (
    <>
      <Header lang={lang} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t(lang, "items.title")}</h1>
            <p className="text-gray-600">{t(lang, "items.description")}</p>
          </div>
          <ItemsControls lang={lang} />
          <Suspense fallback={<ItemListSkeleton />}>
            <ItemTable lang={lang} q={q} sort={sort} order={order} page={page} pageSize={pageSize} types={types} typesMode={typesMode} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
