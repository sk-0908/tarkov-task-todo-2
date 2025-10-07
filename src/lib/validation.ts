import { z } from 'zod';

// ユーザー登録バリデーション
export const signupSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .min(5, 'メールアドレスは5文字以上である必要があります')
    .max(255, 'メールアドレスは255文字以下である必要があります'),
  username: z.string()
    .min(3, 'ユーザー名は3文字以上である必要があります')
    .max(50, 'ユーザー名は50文字以下である必要があります')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です'),
  password: z.string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .max(128, 'パスワードは128文字以下である必要があります')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは大文字、小文字、数字を含む必要があります'),
});

// ログインバリデーション
export const signinSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(1, 'パスワードは必須です'),
});

// 検索クエリバリデーション
export const searchSchema = z.object({
  q: z.string()
    .min(1, '検索クエリは必須です')
    .max(100, '検索クエリは100文字以下である必要があります')
    .regex(/^[^\x00-\x1F\x7F]*$/, '無効な文字が含まれています'),
  lang: z.enum(['ja', 'en']).default('ja'),
  kind: z.enum(['item', 'task', 'trader', 'map']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// CSRFトークンバリデーション
export const csrfSchema = z.object({
  'x-csrf-token': z.string()
    .regex(/^[a-f0-9]{64}$/i, '無効なCSRFトークンです'),
});

// API レスポンスの統一フォーマット
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    retryAfter?: number;
  };
}

// バリデーションエラーのフォーマット
export function formatValidationError(error: z.ZodError): APIResponse {
  const issues = error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'バリデーションエラーが発生しました',
      details: issues,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

// 成功レスポンスのフォーマット
export function formatSuccessResponse<T>(data: T, meta?: any): APIResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

// エラーレスポンスのフォーマット
export function formatErrorResponse(
  code: string,
  message: string,
  details?: any,
  retryAfter?: number
): APIResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(retryAfter && { retryAfter }),
    },
  };
}
