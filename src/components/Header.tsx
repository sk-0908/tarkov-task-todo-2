"use client";

import React from "react";
import Link from "next/link";
import { supportedLanguages, t, getLanguagePath, getLanguageSwitchLinks } from "@/lib/i18n";
import AuthButton from "./AuthButton";

interface HeaderProps {
  lang: string;
}

export default function Header({ lang }: HeaderProps) {
  if (!supportedLanguages.includes(lang as any)) {
    return null;
  }

  const currentLang = lang as any;
  
  // クライアントサイドでのみパスを取得
  const [currentPath, setCurrentPath] = React.useState('/');
  
  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);
  
  const languageLinks = getLanguageSwitchLinks(currentPath, currentLang);

  return (
    <header className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href={getLanguagePath(currentLang)} className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Tarkov Wiki</h1>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href={getLanguagePath(currentLang, 'items')} 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t(currentLang, 'navigation.items')}
              </Link>
              <Link 
                href={getLanguagePath(currentLang, 'traders')} 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t(currentLang, 'navigation.traders')}
              </Link>
              <Link 
                href={getLanguagePath(currentLang, 'maps')} 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t(currentLang, 'navigation.maps')}
              </Link>
              <Link 
                href={getLanguagePath(currentLang, 'tasks')} 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t(currentLang, 'navigation.tasks')}
              </Link>
              <Link 
                href={getLanguagePath(currentLang, 'hideout')} 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t(currentLang, 'navigation.hideout')}
              </Link>
            </nav>
          </div>

          {/* Language Switcher and Auth */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {languageLinks.map((link) => (
                <Link
                  key={link.lang}
                  href={link.href}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    link.lang === currentLang
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <AuthButton lang={currentLang} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href={getLanguagePath(currentLang, 'items')} 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              {t(currentLang, 'navigation.items')}
            </Link>
            <Link 
              href={getLanguagePath(currentLang, 'traders')} 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              {t(currentLang, 'navigation.traders')}
            </Link>
            <Link 
              href={getLanguagePath(currentLang, 'maps')} 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              {t(currentLang, 'navigation.maps')}
            </Link>
            <Link 
              href={getLanguagePath(currentLang, 'tasks')} 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              {t(currentLang, 'navigation.tasks')}
            </Link>
            <Link 
              href={getLanguagePath(currentLang, 'hideout')} 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              {t(currentLang, 'navigation.hideout')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
