import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getCacheKey(scope: string, resource: string, params: string, version: string = 'v1'): string {
  return `cache:${scope}:${resource}:${params}:${version}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'ja';
    const cacheKey = getCacheKey('items', 'list', language);

    const cached = await prisma.cache.findFirst({ where: { key: cacheKey } });
    let items: any[] = [];
    if (cached?.value) {
      items = JSON.parse(cached.value) || [];
    }

    const categoriesSet = new Set<string>();
    for (const it of items) {
      if (Array.isArray(it.types)) {
        for (const tp of it.types) categoriesSet.add(String(tp));
      }
    }
    const categories = Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ categories, count: categories.length });
  } catch (e) {
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}

