import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'ja';
    
    // キャッシュからデータを取得
    const cachedData = await prisma.cache.findFirst({
      where: {
        key: `tasks_${language}`,
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
          tasks(lang: ${language}) { 
            id
            name
            description
            trader {
              id
              name
            }
            map {
              id
              name
            }
            experience
            taskImageLink
            wikiLink
            taskRequirements {
              task {
                name
              }
            }
            traderRequirements {
              trader {
                name
              }
              level
              standing
            }
            objectives {
              type
              description
              map {
                name
              }
            }
            startRewards {
              items {
                item {
                  id
                  name
                  shortName
                  iconLink
                }
                count
                quantity
              }
              traderStanding {
                trader {
                  name
                }
                standing
              }
              offerUnlock {
                trader {
                  name
                }
                level
              }
            }
            finishRewards {
              items {
                item {
                  id
                  name
                  shortName
                  iconLink
                }
                count
                quantity
              }
              traderStanding {
                trader {
                  name
                }
                standing
              }
              offerUnlock {
                trader {
                  name
                }
                level
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

    const tasks = json?.data?.tasks || [];

    // データをキャッシュに保存（1時間有効）
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1時間後
    
    await prisma.cache.upsert({
      where: {
        key: `tasks_${language}`
      },
      update: {
        value: JSON.stringify(tasks),
        expiresAt,
        updatedAt: new Date()
      },
      create: {
        key: `tasks_${language}`,
        value: JSON.stringify(tasks),
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      data: tasks,
      cached: false,
      cachedAt: new Date()
    });

  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
