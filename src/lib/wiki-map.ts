export const JAPANESE_WIKI_BASE = 'https://wikiwiki.jp/eft/';

// Map of Tarkov item name -> wikiwiki.jp/eft page path (without base URL)
// 例: 'Salewa first aid kit': '%E6%95%91%E6%80%A5%E7%AE%B1' （URLエンコード済みのパス）
export const itemWikiMap: Record<string, string> = {
  // NOTE: 必要に応じてここへエントリを追加してください。
  // 'Item Name': 'Encoded-Path',
};

export function getJapaneseWikiUrlByName(name?: string | null): string | null {
  if (!name) return null;
  const path = itemWikiMap[name] || '';
  if (!path) return JAPANESE_WIKI_BASE;
  return `${JAPANESE_WIKI_BASE}${path}`;
}

