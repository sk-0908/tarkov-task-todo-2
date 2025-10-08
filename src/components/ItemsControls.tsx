"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Sort</label>
        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="name">Name</option>
          <option value="baseprice">Base Price</option>
          <option value="avg24hprice">Avg 24h</option>
          <option value="weight">Weight</option>
          <option value="size">Size</option>
          <option value="types">Types</option>
        </select>
        <select
          value={order}
          onChange={(e) => update({ order: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <label className="ml-3 text-sm text-gray-600">Page size</label>
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
