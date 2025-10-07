import { NextRequest, NextResponse } from 'next/server'
import { getSessionByToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      )
    }

    const session = await getSessionByToken(token)

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'セッションが無効です' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
