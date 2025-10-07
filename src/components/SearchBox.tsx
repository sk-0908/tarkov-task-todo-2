"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { t, getLanguagePath } from "@/lib/i18n";

interface SearchResult {
  docId: string;
  kind: string;
  name: string;
  altNames?: string[];
  trader?: string;
  map?: string;
  rank?: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  took: number;
  language: string;
}

interface SearchBoxProps {
  lang: string;
}

export default function SearchBox({ lang }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 検索実行
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&lang=${lang}&limit=10`
      );
      
      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // デバウンス付き検索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, lang]);

  // クリック外しで結果を非表示
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // 結果クリック処理
  const handleResultClick = (result: SearchResult) => {
    switch (result.kind) {
      case 'item':
        router.push(getLanguagePath(lang, `items/${result.docId}`));
        break;
      case 'task':
        router.push(getLanguagePath(lang, `tasks/${result.docId}`));
        break;
      case 'trader':
        router.push(getLanguagePath(lang, `traders/${result.docId}`));
        break;
      case 'map':
        router.push(getLanguagePath(lang, `maps/${result.docId}`));
        break;
    }
    
    setShowResults(false);
    setSelectedIndex(-1);
    setQuery("");
  };

  // 検索結果の種類に応じたアイコン
  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'item':
        return '🎒';
      case 'task':
        return '📋';
      case 'trader':
        return '👤';
      case 'map':
        return '🗺️';
      default:
        return '🔍';
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowResults(true)}
          placeholder={t(lang, 'search.placeholder')}
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* 検索結果ドロップダウン */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={`${result.docId}-${result.kind}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getKindIcon(result.kind)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {result.name}
                      </div>
                      {result.altNames && result.altNames.length > 0 && (
                        <div className="text-sm text-gray-500 truncate">
                          {result.altNames.join(', ')}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {result.kind === 'task' && result.trader && `トレーダー: ${result.trader}`}
                        {result.kind === 'task' && result.map && `マップ: ${result.map}`}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              {t(lang, 'search.noResults')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}