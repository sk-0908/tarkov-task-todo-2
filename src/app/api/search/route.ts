import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface SearchResult {
  docId: string;
  kind: string;
  name: string;
  altNames?: string;
  trader?: string;
  map?: string;
  content?: string;
  language: string;
  metadata?: string;
  rank?: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  took: number;
  language: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = searchParams.get('lang') || 'ja';
    const kind = searchParams.get('kind'); // 'item' | 'task' | 'trader' | 'map'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Supabase(Postgres) 環境では ILIKE ベースの簡易検索で早期リターン
    if ((process.env.DATABASE_URL || '').startsWith('postgres') && query && query.trim().length > 0) {
      const sanitizedQuery = query.trim();
      const like = `%${sanitizedQuery}%`;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT 
          docId,
          kind,
          language,
          name,
          altNames,
          trader,
          map,
          content,
          0::int as rank
        FROM search_index
        WHERE language = ${language}
        ${kind ? Prisma.sql`AND kind = ${kind}` : Prisma.empty}
          AND (
            name ILIKE ${like} OR
            altNames ILIKE ${like} OR
            content ILIKE ${like}
          )
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const countRows = await prisma.$queryRaw<{ total: number }[]>`
        SELECT COUNT(*)::int AS total
        FROM search_index
        WHERE language = ${language}
        ${kind ? Prisma.sql`AND kind = ${kind}` : Prisma.empty}
          AND (
            name ILIKE ${like} OR
            altNames ILIKE ${like} OR
            content ILIKE ${like}
          )
      `;

      const results = rows as any as SearchResult[];
      const total = countRows?.[0]?.total || 0;
      const formattedResults = results.map(result => ({
        ...result,
        altNames: result.altNames ? JSON.parse(result.altNames) : null,
        metadata: result.metadata ? JSON.parse(result.metadata) : null,
        rank: result.rank || 0
      }));

      return NextResponse.json({
        query: sanitizedQuery,
        results: formattedResults,
        total,
        took: Date.now() - startTime,
        language,
        kind: kind || 'all'
      } as SearchResponse);
    }

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        query: '',
        results: [],
        total: 0,
        took: Date.now() - startTime,
        language,
        error: '検索クエリが必要です'
      });
    }

    // 検索クエリのサニタイズ
    const sanitizedQuery = query.trim().replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ' ');

    // FTS5クエリの構築
    let ftsQuery = `"${sanitizedQuery}"* OR ${sanitizedQuery}*`;
    
    // 日本語の場合、ひらがな・カタカナ変換を考慮
    if (language === 'ja') {
      const hiraganaQuery = sanitizedQuery.replace(/[ァ-ヴ]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0x60)
      );
      const katakanaQuery = sanitizedQuery.replace(/[あ-ん]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) + 0x60)
      );
      
      if (hiraganaQuery !== sanitizedQuery) {
        ftsQuery += ` OR "${hiraganaQuery}"* OR ${hiraganaQuery}*`;
      }
      if (katakanaQuery !== sanitizedQuery) {
        ftsQuery += ` OR "${katakanaQuery}"* OR ${katakanaQuery}*`;
      }
    }

    // FTS5検索の実行
    const ftsQuerySQL = `
      SELECT 
        docId,
        kind,
        language,
        name,
        altNames,
        trader,
        map,
        content,
        rank
      FROM search_fts 
      WHERE search_fts MATCH ? 
        AND language = ?
        ${kind ? 'AND kind = ?' : ''}
      ORDER BY rank
      LIMIT ? OFFSET ?
    `;

    const params = [ftsQuery, language, ...(kind ? [kind] : []), limit, offset];
    
    // Prismaでraw SQLを実行
    const results = await prisma.$queryRawUnsafe<SearchResult[]>(ftsQuerySQL, ...params);

    // 総件数取得
    const countSQL = `
      SELECT COUNT(*) as total
      FROM search_fts 
      WHERE search_fts MATCH ? 
        AND language = ?
        ${kind ? 'AND kind = ?' : ''}
    `;
    
    const countParams = [ftsQuery, language, ...(kind ? [kind] : [])];
    const countResult = await prisma.$queryRawUnsafe<[{ total: bigint }]>(countSQL, ...countParams);
    const total = Number(countResult[0].total);

    // 結果の整形
    const formattedResults = results.map(result => ({
      ...result,
      altNames: result.altNames ? JSON.parse(result.altNames) : null,
      metadata: result.metadata ? JSON.parse(result.metadata) : null,
      rank: result.rank || 0
    }));

    return NextResponse.json({
      query: sanitizedQuery,
      results: formattedResults,
      total,
      took: Date.now() - startTime,
      language,
      kind: kind || 'all'
    } as SearchResponse);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: '検索に失敗しました',
        code: 'SEARCH_ERROR',
        message: 'サーバーエラーが発生しました',
        query: '',
        results: [],
        total: 0,
        took: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

// 検索インデックスの更新（管理者用）
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    if (action === 'index_items') {
      const { items, language } = data;
      
      // アイテムデータを検索インデックスに登録
      for (const item of items) {
        await prisma.searchIndex.upsert({
          where: {
            docId_kind_language: {
              docId: item.id,
              kind: 'item',
              language: language
            }
          },
          update: {
            name: item.name,
            altNames: JSON.stringify([item.shortName]),
            content: `${item.name} ${item.shortName} ${item.types?.join(' ')}`,
            metadata: JSON.stringify({
              basePrice: item.basePrice,
              fleaMarketFee: item.fleaMarketFee,
              iconLink: item.iconLink,
              types: item.types,
              wikiLink: item.wikiLink
            })
          },
          create: {
            docId: item.id,
            kind: 'item',
            name: item.name,
            altNames: JSON.stringify([item.shortName]),
            content: `${item.name} ${item.shortName} ${item.types?.join(' ')}`,
            language: language,
            metadata: JSON.stringify({
              basePrice: item.basePrice,
              fleaMarketFee: item.fleaMarketFee,
              iconLink: item.iconLink,
              types: item.types,
              wikiLink: item.wikiLink
            })
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: `${items.length}件のアイテムを検索インデックスに登録しました`,
        indexed: items.length
      });
    }

    return NextResponse.json(
      { error: '無効なアクションです' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Search index update error:', error);
    return NextResponse.json(
      { 
        error: '検索インデックスの更新に失敗しました',
        code: 'INDEX_UPDATE_ERROR'
      },
      { status: 500 }
    );
  }
}
