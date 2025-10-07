import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()

    // バリデーション
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'メールアドレス、ユーザー名、パスワードは必須です' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // ユーザー名の重複チェック
    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています' },
        { status: 400 }
      )
    }

    // ユーザー作成
    const user = await createUser(email, username, password)

    return NextResponse.json(
      { 
        message: 'アカウントが正常に作成されました',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
