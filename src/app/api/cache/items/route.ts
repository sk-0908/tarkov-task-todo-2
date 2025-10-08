import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'

interface CachedItem {
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
  language: string;
  cachedAt: Date;
}

// キャッシュキーの正規化
function getCacheKey(scope: string, resource: string, params: string, version: string = 'v1'): string {
  return `cache:${scope}:${resource}:${params}:${version}`;
}

export const revalidate = 0; // このAPIは都度計算。DBを正とする

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'ja';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const q = (searchParams.get('q') || '').trim();
    // category params (preferred) and legacy types params (backward compatible)
    const catParams = searchParams.getAll('category');
    const catCsv = searchParams.get('category');
    const legacyTypesParams = searchParams.getAll('types');
    const legacyTypesCsv = searchParams.get('types');
    const categoriesFilter = (
      (catParams.length > 0 ? catParams : (catCsv ? catCsv.split(',') : []))
        .concat(legacyTypesParams.length > 0 ? legacyTypesParams : (legacyTypesCsv ? legacyTypesCsv.split(',') : []))
    ).map((s) => s.trim().toLowerCase()).filter(Boolean);
    const sort = (searchParams.get('sort') || 'name').toLowerCase();
    const order = (searchParams.get('order') || 'asc').toLowerCase();
    const categoryMode = ((searchParams.get('categoryMode') || searchParams.get('typesMode') || 'or').toLowerCase() === 'and') ? 'and' : 'or';
    const typesMode = ((searchParams.get('typesMode') || 'or').toLowerCase() === 'and') ? 'and' : 'or';
    const cacheKey = getCacheKey('items', 'list', language);
    
    // DBキャッシュからデータを取得（源泉キャッシュ）
    const cachedData = await prisma.cache.findFirst({
      where: {
        key: cacheKey,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (cachedData) {
      let items: any[] = JSON.parse(cachedData.value) || [];

      // Search filter (simple contains, case-insensitive)
      if (q) {
        const qLower = q.toLowerCase();
        items = items.filter((it) => {
          const hay = [
            it.name,
            it.shortName,
            Array.isArray(it.types) ? it.types.join(' ') : '',
            it.wikiLink,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return hay.includes(qLower);
        });
      }

      // Category filter (OR/AND)
      if (categoriesFilter.length > 0) {
        items = items.filter((it) => {
          const its = Array.isArray(it.types) ? it.types.map((s: any) => String(s).toLowerCase()) : [];
          return categoryMode === 'and'
            ? categoriesFilter.every((f) => its.includes(f))
            : categoriesFilter.some((f) => its.includes(f));
        });
      }

      // Sorting
      const cmp = (a: any, b: any) => {
        const dir = order === 'desc' ? -1 : 1;
        const pick = (x: any) => {
          switch (sort) {
            case 'baseprice':
              return x.basePrice ?? 0;
            case 'avg24hprice':
              return x.avg24hPrice ?? 0;
            case 'weight':
              return x.weight ?? 0;
            case 'size':
              return (x.width ?? 0) * (x.height ?? 0);
            case 'types': // legacy
            case 'category':
              return (Array.isArray(x.types) ? x.types.join(' ') : '').toLowerCase();
            case 'name':
            default:
              return (x.name || '').toString().toLowerCase();
          }
        };
        const va = pick(a);
        const vb = pick(b);
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      };
      items.sort(cmp);

      const total = items.length;
      const slice = limit > 0 ? items.slice(offset, offset + limit) : items;

      return NextResponse.json({
        data: slice,
        total,
        limit,
        offset,
        sort,
        order,
        query: q,
        categories: categoriesFilter,
        categoryMode,
        cached: true,
        cachedAt: cachedData.createdAt,
        cacheSource: 'database',
      });
    }

    // キャッシュが無効または存在しない場合、新しいデータを取得
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch("https://api.tarkov.dev/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: `{ 
          items(lang: ${language}) { 
            id 
            name 
            shortName
            basePrice 
            avg24hPrice
            fleaMarketFee
            iconLink
            types 
            wikiLink 
            weight
            width
            height
          } 
        }` 
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const json = await response.json();
    
    if (json?.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    const items = json?.data?.items || [];

    // DBキャッシュに保存（2時間有効 - 長めの源泉キャッシュ）
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2時間後
    
    await prisma.cache.upsert({
      where: {
        key: cacheKey
      },
      update: {
        value: JSON.stringify(items),
        expiresAt,
        updatedAt: new Date()
      },
      create: {
        key: cacheKey,
        value: JSON.stringify(items),
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const sliced = limit > 0 ? items.slice(offset, offset + limit) : items;

    return NextResponse.json({
      data: sliced,
      total: items.length,
      limit,
      offset,
      sort,
      order,
      query: q,
      categories: categoriesFilter,
      categoryMode,
      cached: false,
      cachedAt: new Date(),
      cacheSource: 'external'
    });

  } catch (error) {
    console.error('Cache API error:', error);
    // stale fallback: return latest cached even if expired
    try {
      const { searchParams } = new URL(request.url);
      const language = searchParams.get('lang') || 'ja';
      const cacheKey = getCacheKey('items', 'list', language);
      const stale = await prisma.cache.findFirst({ where: { key: cacheKey }, orderBy: { updatedAt: 'desc' } });
      if (stale) {
        const items: any[] = JSON.parse(stale.value) || [];
        return NextResponse.json({
          data: items,
          total: items.length,
          cached: true,
          stale: true,
          cachedAt: stale.updatedAt,
          cacheSource: 'database'
        });
      }
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// キャッシュ無効化エンドポイント
export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json();
    const tag = `items:${language}`;
    
    // RSCキャッシュを無効化
    revalidateTag(tag);
    
    return NextResponse.json({
      success: true,
      message: `Cache invalidated for ${tag}`,
      invalidatedTag: tag
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to invalidate cache',
        code: 'INVALIDATION_ERROR'
      },
      { status: 500 }
    );
  }
}
