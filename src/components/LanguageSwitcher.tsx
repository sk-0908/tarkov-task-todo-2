"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        言語:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="ru">Русский</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
        <option value="pt">Português</option>
        <option value="ko">한국어</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
}
