interface WikiLinksProps {
  wikiLink?: string;
  taskName?: string;
  traderName?: string;
  itemName?: string;
  className?: string;
}

// タスク名から日本語WikiのURLを生成
function generateJapaneseWikiUrl(taskName?: string, traderName?: string, itemName?: string): string {
  const baseUrl = "https://wikiwiki.jp/eft/";
  
  if (taskName && traderName) {
    // タスクの場合: /TraderName/TaskName
    const encodedTaskName = encodeURIComponent(taskName);
    const encodedTraderName = encodeURIComponent(traderName);
    return `${baseUrl}${encodedTraderName}/${encodedTaskName}`;
  } else if (traderName) {
    // トレーダーの場合: /TraderName
    const encodedTraderName = encodeURIComponent(traderName);
    return `${baseUrl}${encodedTraderName}`;
  } else if (itemName) {
    // アイテムの場合: /ItemName
    const encodedItemName = encodeURIComponent(itemName);
    return `${baseUrl}${encodedItemName}`;
  }
  
  // デフォルトはホームページ
  return baseUrl;
}

export default function WikiLinks({ wikiLink, taskName, traderName, itemName, className = "" }: WikiLinksProps) {
  const japaneseWikiUrl = generateJapaneseWikiUrl(taskName, traderName, itemName);
  
  return (
    <div className={`flex gap-2 ${className}`}>
      {/* 英語Wikiリンク */}
      {wikiLink && (
        <a 
          href={wikiLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          EN Wiki
        </a>
      )}
      
      {/* 日本語Wikiリンク */}
      <a 
        href={japaneseWikiUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        JP Wiki
      </a>
    </div>
  );
}
