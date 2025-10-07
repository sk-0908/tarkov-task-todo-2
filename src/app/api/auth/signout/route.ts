import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value

    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json(
      { message: 'ログアウトしました' },
      { status: 200 }
    )

    // クッキーを削除
    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    })

    return response
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
