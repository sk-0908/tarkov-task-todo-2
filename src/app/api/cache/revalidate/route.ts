import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { tag, language } = await request.json();
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      );
    }

    // RSCキャッシュを無効化
    revalidateTag(tag);
    
    // DBキャッシュも削除（オプション）
    if (language) {
      const cacheKey = `cache:${tag.split(':')[0]}:${tag.split(':')[1]}:${language}:v1`;
      await prisma.cache.deleteMany({
        where: {
          key: {
            startsWith: cacheKey.split(':v1')[0]
          }
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Cache invalidated for ${tag}`,
      invalidatedTag: tag,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to invalidate cache',
        code: 'INVALIDATION_ERROR',
        message: 'キャッシュの無効化に失敗しました'
      },
      { status: 500 }
    );
  }
}

// バッチ無効化
export async function PUT(request: NextRequest) {
  try {
    const { tags } = await request.json();
    
    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'Tags array is required' },
        { status: 400 }
      );
    }

    const results = [];
    
    for (const tag of tags) {
      try {
        revalidateTag(tag);
        results.push({ tag, success: true });
      } catch (error) {
        results.push({ tag, success: false, error: error.message });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Batch cache invalidation completed`,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch cache invalidation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to invalidate caches',
        code: 'BATCH_INVALIDATION_ERROR'
      },
      { status: 500 }
    );
  }
}
