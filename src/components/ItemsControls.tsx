"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getTypeLabel } from "@/lib/type-labels";

interface Props {
  lang: string;
}

export default function ItemsControls({ lang }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";
  const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const selectedTypes = searchParams.getAll("types");

  const [allTypes, setAllTypes] = React.useState<string[]>([]);
  const [types, setTypes] = React.useState<string[]>(selectedTypes);

  React.useEffect(() => {
    // fetch available types from cache
    const controller = new AbortController();
    fetch(`/api/cache/items/types?lang=${lang}`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : { types: [] })
      .then((json) => setAllTypes(json.types || []))
      .catch(() => {});
    return () => controller.abort();
  }, [lang]);

  React.useEffect(() => {
    setTypes(selectedTypes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const update = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, String(v));
    });
    // リスト操作時は最初のページへ
    if (patch.q !== undefined || patch.sort !== undefined || patch.order !== undefined || patch.pageSize !== undefined) {
      params.set("page", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateTypes = (next: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    // remove old
    params.delete('types');
    for (const t of next) params.append('types', t);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <input
          defaultValue={q}
          placeholder="Search items..."
          className="border rounded px-3 py-2 w-64"
          onKeyDown={(e) => {
            if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value });
          }}
        />
        <button
          onClick={() => update({ q: "" })}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Types multi-select */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{lang === 'ja' ? '種別' : 'Types'}</label>
          <div className="max-h-28 overflow-auto border rounded p-2 bg-white min-w-[200px]">
            {allTypes.length === 0 && (
              <div className="text-xs text-gray-500">Loading…</div>
            )}
            {allTypes.map((t) => {
              const checked = types.includes(t);
              const label = getTypeLabel(t, lang as any);
              return (
                <label key={t} className="block text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked ? Array.from(new Set([...types, t])) : types.filter((x) => x !== t);
                      setTypes(next);
                      updateTypes(next);
                    }}
                  />
                  {label}
                </label>
              );
            })}
          </div>
          <button className="text-xs text-gray-600 hover:text-gray-900" onClick={() => { setTypes([]); updateTypes([]); }}>{lang === 'ja' ? 'クリア' : 'Clear'}</button>
        </div>

        <label className="text-sm text-gray-600">{lang === 'ja' ? '並び替え' : 'Sort'}</label>
        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="name">{lang === 'ja' ? '名前' : 'Name'}</option>
          <option value="baseprice">{lang === 'ja' ? '基礎価格' : 'Base Price'}</option>
          <option value="avg24hprice">{lang === 'ja' ? '24時間平均価格' : 'Avg 24h'}</option>
          <option value="weight">{lang === 'ja' ? '重量' : 'Weight'}</option>
          <option value="size">{lang === 'ja' ? 'サイズ' : 'Size'}</option>
          <option value="types">{lang === 'ja' ? '種別' : 'Types'}</option>
        </select>
        <select
          value={order}
          onChange={(e) => update({ order: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="asc">{lang === 'ja' ? '昇順' : 'Asc'}</option>
          <option value="desc">{lang === 'ja' ? '降順' : 'Desc'}</option>
        </select>
        <label className="ml-3 text-sm text-gray-600">{lang === 'ja' ? '件数/ページ' : 'Page size'}</label>
        <select
          value={String(pageSize)}
          onChange={(e) => update({ pageSize: parseInt(e.target.value, 10) })}
          className="border rounded px-2 py-1"
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </div>
    </div>
  );
}
