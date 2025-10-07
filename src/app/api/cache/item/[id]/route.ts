import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Cache API called for item:', params.id);
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'ja';
    const itemId = params.id;
    console.log('Language:', language, 'ItemId:', itemId);
    
    // キャッシュからデータを取得
    console.log('Checking cache for key:', `item_${itemId}_${language}`);
    const cachedData = await prisma.cache.findFirst({
      where: {
        key: `item_${itemId}_${language}`,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    console.log('Cached data found:', !!cachedData);

    if (cachedData) {
      return NextResponse.json({
        data: JSON.parse(cachedData.value),
        cached: true,
        cachedAt: cachedData.createdAt
      });
    }

    // キャッシュが無効または存在しない場合、新しいデータを取得
    console.log('Fetching fresh data from GraphQL API');
    const response = await fetch("https://api.tarkov.dev/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: `{ 
          item(id: "${itemId}", lang: ${language}) { 
            id
            name
            shortName
            description
            basePrice
            fleaMarketFee
            iconLink
            types
            wikiLink
            weight
            width
            height
            sellFor {
              price
              currency
              vendor {
                name
              }
            }
            buyFor {
              price
              currency
              vendor {
                name
              }
            }
            containsItems {
              item {
                id
                name
                shortName
                iconLink
              }
              count
              quantity
            }
            usedInTasks {
              id
              name
              trader {
                name
              }
            }
          } 
        }` 
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const json = await response.json();
    console.log('GraphQL response received');
    
    if (json?.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    const item = json?.data?.item;
    console.log('Item found:', !!item);
    if (!item) {
      throw new Error(`Item with ID "${itemId}" not found`);
    }

    // データをキャッシュに保存（1時間有効）
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1時間後
    console.log('Saving to cache with key:', `item_${itemId}_${language}`);
    
    await prisma.cache.upsert({
      where: {
        key: `item_${itemId}_${language}`
      },
      update: {
        value: JSON.stringify(item),
        expiresAt,
        updatedAt: new Date()
      },
      create: {
        key: `item_${itemId}_${language}`,
        value: JSON.stringify(item),
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('Cache saved successfully');

    return NextResponse.json({
      data: item,
      cached: false,
      cachedAt: new Date()
    });

  } catch (error) {
    console.error('Cache API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch item';
    console.error('Detailed error:', errorMessage);
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}
