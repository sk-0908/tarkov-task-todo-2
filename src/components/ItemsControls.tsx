"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getTypeLabel, TYPE_GROUPS, GROUP_LABELS } from "@/lib/type-labels";

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

  // Use new category params; keep legacy types for backward compatibility
  const selectedCategories = searchParams.getAll("category");
  const legacyTypesSelected = searchParams.getAll("types");
  const selectedMode = (searchParams.get("categoryMode") || searchParams.get("typesMode") || "or") as "and" | "or";

  const [allCats, setAllCats] = React.useState<string[]>([]);
  const [cats, setCats] = React.useState<string[]>(selectedCategories.length ? selectedCategories : legacyTypesSelected);
  const [mode, setMode] = React.useState<"and" | "or">(selectedMode);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/cache/items/categories?lang=${lang}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((json) => setAllCats(json.categories || []))
      .catch(() => {});
    return () => controller.abort();
  }, [lang]);

  React.useEffect(() => {
    const nextSel = selectedCategories.length ? selectedCategories : legacyTypesSelected;
    setCats(nextSel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const pushParams = (params: URLSearchParams) => router.push(`${pathname}?${params.toString()}`);

  const update = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, String(v));
    });
    if (patch.q !== undefined || patch.sort !== undefined || patch.order !== undefined || patch.pageSize !== undefined) {
      params.set("page", "1");
    }
    pushParams(params);
  };

  const updateCategories = (next: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("types"); // legacy cleanup
    for (const t of next) params.append("category", t);
    params.set("categoryMode", mode);
    params.set("page", "1");
    pushParams(params);
  };

  const updateMode = (m: "and" | "or") => {
    setMode(m);
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoryMode", m);
    params.set("page", "1");
    pushParams(params);
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
        <button onClick={() => update({ q: "" })} className="text-sm text-gray-600 hover:text-gray-900">
          Clear
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Category multi-select with grouping and AND/OR */}
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">{lang === "ja" ? "カテゴリ" : "Category"}</label>
            <select value={mode} onChange={(e) => updateMode(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="or">{lang === "ja" ? "いずれか含む(OR)" : "Any match (OR)"}</option>
              <option value="and">{lang === "ja" ? "すべて含む(AND)" : "All match (AND)"}</option>
            </select>
          </div>
          <div className="max-h-40 overflow-auto border rounded p-2 bg-white min-w-[260px]">
            {allCats.length === 0 && (
              <div className="text-xs text-gray-500">{lang === "ja" ? "読み込み中…" : "Loading…"}</div>
            )}
            {(() => {
              // Build groups by TYPE_GROUPS
              const groups: Record<string, string[]> = {};
              for (const t of allCats) {
                const g = TYPE_GROUPS[(t || "").toLowerCase()] || "other";
                (groups[g] ||= []).push(t);
              }
              const orderList = ["ammo", "weapon", "armor", "container", "medical", "grenade", "key", "mod", "barter", "other"];
              return orderList
                .filter((g) => groups[g]?.length)
                .map((g) => {
                  const glabel = GROUP_LABELS[g]?.[lang as any] || g;
                  const items = groups[g].sort((a, b) => a.localeCompare(b));
                  return (
                    <div key={g} className="mb-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-700 text-sm">{glabel}</div>
                        <div className="space-x-2 text-xs">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => {
                              const next = Array.from(new Set([...cats, ...items]));
                              setCats(next);
                              updateCategories(next);
                            }}
                          >
                            {lang === "ja" ? "全選択" : "Select all"}
                          </button>
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => {
                              const next = cats.filter((t) => !items.includes(t));
                              setCats(next);
                              updateCategories(next);
                            }}
                          >
                            {lang === "ja" ? "解除" : "Clear"}
                          </button>
                        </div>
                      </div>
                      {items.map((t) => {
                        const checked = cats.includes(t);
                        const label = getTypeLabel(t, lang as any);
                        return (
                          <label key={t} className="block text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked ? Array.from(new Set([...cats, t])) : cats.filter((x) => x !== t);
                                setCats(next);
                                updateCategories(next);
                              }}
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  );
                });
            })()}
          </div>
          <button className="text-xs text-gray-600 hover:text-gray-900 mt-1" onClick={() => { setCats([]); updateCategories([]); }}>
            {lang === "ja" ? "クリア" : "Clear"}
          </button>
        </div>

        <label className="text-sm text-gray-600">{lang === "ja" ? "並び替え" : "Sort"}</label>
        <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="border rounded px-2 py-1">
          <option value="name">{lang === "ja" ? "名前" : "Name"}</option>
          <option value="baseprice">{lang === "ja" ? "基礎価格" : "Base Price"}</option>
          <option value="avg24hprice">{lang === "ja" ? "24時間平均価格" : "Avg 24h"}</option>
          <option value="weight">{lang === "ja" ? "重量" : "Weight"}</option>
          <option value="size">{lang === "ja" ? "サイズ" : "Size"}</option>
          <option value="category">{lang === "ja" ? "カテゴリ" : "Category"}</option>
        </select>
        <select value={order} onChange={(e) => update({ order: e.target.value })} className="border rounded px-2 py-1">
          <option value="asc">{lang === "ja" ? "昇順" : "Asc"}</option>
          <option value="desc">{lang === "ja" ? "降順" : "Desc"}</option>
        </select>
        <label className="ml-3 text-sm text-gray-600">{lang === "ja" ? "件数/ページ" : "Page size"}</label>
        <select value={String(pageSize)} onChange={(e) => update({ pageSize: parseInt(e.target.value, 10) })} className="border rounded px-2 py-1">
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </div>
    </div>
  );
}
