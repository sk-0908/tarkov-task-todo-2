import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Test API called');
    
    // データベース接続テスト
    const cacheCount = await prisma.cache.count();
    console.log('Cache count:', cacheCount);
    
    return NextResponse.json({
      success: true,
      message: 'API is working',
      cacheCount
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    );
  }
}
