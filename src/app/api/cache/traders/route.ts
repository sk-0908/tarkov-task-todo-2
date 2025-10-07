import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'ja';
    
    // キャッシュからデータを取得
    const cachedData = await prisma.cache.findFirst({
      where: {
        key: `traders_${language}`,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (cachedData) {
      return NextResponse.json({
        data: JSON.parse(cachedData.value),
        cached: true,
        cachedAt: cachedData.createdAt
      });
    }

    // キャッシュが無効または存在しない場合、新しいデータを取得
    const response = await fetch("https://api.tarkov.dev/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: `{ 
          traders(lang: ${language}) { 
            id 
            name 
            imageLink 
            currency 
            levels {
              id
              level
              requiredPlayerLevel
              requiredPlayerExperience
              requiredCommerce
              requiredStanding
            }
            barters {
              id
              level
              requiredItems {
                item {
                  id
                  name
                  shortName
                  iconLink
                }
                count
                quantity
              }
              rewardItems {
                item {
                  id
                  name
                  shortName
                  iconLink
                }
                count
                quantity
              }
            }
            cashOffers {
              id
              minTraderLevel
              requiredItems {
                item {
                  id
                  name
                  shortName
                  iconLink
                }
                count
                quantity
              }
              rewardItems {
                item {
                  id
                  name
                  shortName
                  iconLink
                }
                count
                quantity
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
    
    if (json?.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    const traders = json?.data?.traders || [];

    // データをキャッシュに保存（1時間有効）
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1時間後
    
    await prisma.cache.upsert({
      where: {
        key: `traders_${language}`
      },
      update: {
        value: JSON.stringify(traders),
        expiresAt,
        updatedAt: new Date()
      },
      create: {
        key: `traders_${language}`,
        value: JSON.stringify(traders),
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      data: traders,
      cached: false,
      cachedAt: new Date()
    });

  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traders' },
      { status: 500 }
    );
  }
}
