import jaTranslations from '@/locales/ja.json';
import enTranslations from '@/locales/en.json';

// サポートする言語
export const supportedLanguages = ['ja', 'en'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];
export const defaultLanguage: SupportedLanguage = 'ja';

// 翻訳データの型定義
export type Translations = typeof jaTranslations;

// 翻訳データ
const translations: Record<SupportedLanguage, Translations> = {
  ja: jaTranslations,
  en: enTranslations,
};

// 翻訳関数
export function t(lang: SupportedLanguage, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  // キーが存在しない場合はデフォルト言語を試す
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // フォールバック: デフォルト言語を使用
      value = translations[defaultLanguage];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // 翻訳が見つからない場合はキーをそのまま返す
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // パラメータ置換
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
}

// 言語検出関数
export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (supportedLanguages.includes(firstSegment as SupportedLanguage)) {
    return firstSegment as SupportedLanguage;
  }
  
  return defaultLanguage;
}

// 言語パス生成関数
export function getLanguagePath(lang: SupportedLanguage, path: string = ''): string {
  if (lang === defaultLanguage) {
    return path ? `/${path}` : '/';
  }
  return `/${lang}${path ? `/${path}` : ''}`;
}

// メタデータ生成用の言語別設定
export function getLanguageMetadata(lang: SupportedLanguage) {
  const isJapanese = lang === 'ja';
  
  return {
    title: t(lang, 'home.title'),
    description: t(lang, 'home.description'),
    locale: isJapanese ? 'ja_JP' : 'en_US',
    alternateLocale: isJapanese ? 'en_US' : 'ja_JP',
    canonical: lang === defaultLanguage ? '/' : `/${lang}`,
    alternateCanonical: lang === defaultLanguage ? '/en' : '/',
  };
}

// 言語切り替え用のリンク生成
export function getLanguageSwitchLinks(currentPath: string, currentLang: SupportedLanguage) {
  return supportedLanguages.map(lang => ({
    lang,
    href: getLanguagePath(lang, currentPath.replace(`/${currentLang}`, '')),
    label: lang === 'ja' ? '日本語' : 'English',
  }));
}




