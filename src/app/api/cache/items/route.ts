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
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
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
      return NextResponse.json({
        data: JSON.parse(cachedData.value),
        cached: true,
        cachedAt: cachedData.createdAt,
        cacheSource: 'database'
      });
    }

    // キャッシュが無効または存在しない場合、新しいデータを取得
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
    });

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
      cached: false,
      cachedAt: new Date(),
      cacheSource: 'external'
    });

  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch items',
        code: 'FETCH_ERROR',
        message: 'アイテムデータの取得に失敗しました',
        retryAfter: 60
      },
      { status: 500 }
    );
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
