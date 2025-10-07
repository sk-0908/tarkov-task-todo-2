"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { t, defaultLanguage } from '@/lib/i18n';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, lang?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, username: string, password: string, lang?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, lang: string = defaultLanguage) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.data?.user || data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || data.error || t(lang, 'auth.networkError') };
      }
    } catch (error) {
      return { success: false, error: t(lang, 'auth.networkError') };
    }
  };

  const signUp = async (email: string, username: string, password: string, lang: string = defaultLanguage) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || data.error || t(lang, 'auth.networkError') };
      }
    } catch (error) {
      return { success: false, error: t(lang, 'auth.networkError') };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Signout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
