import React, { createContext, useContext } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { supabase } from '@/integrations/supabase/client';
import { sessionManager } from '@/services/sessionManager';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  role: 'artist' | 'admin';
  pseudonym?: string;
  telegram_contact?: string;
  name?: string;
  balance_rub: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, role: 'artist' | 'admin', additionalData: any) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    profile,
    session,
    isLoading,
    error,
    refreshProfile,
    clearError,
  } = useAuthSession();

  // Методы аутентификации
  const signIn = async (email: string, password: string) => {
    try {
      clearError();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthProvider] Sign in error:', error);
      return { error: 'Ошибка входа. Попробуйте еще раз.' };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: 'artist' | 'admin', 
    additionalData: any
  ) => {
    try {
      clearError();
      
      const metadata: any = { role };
      
      if (role === 'artist') {
        metadata.pseudonym = additionalData.pseudonym;
        metadata.telegram_contact = additionalData.telegram_contact;
      } else {
        metadata.name = additionalData.name;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthProvider] Sign up error:', error);
      return { error: 'Ошибка регистрации. Попробуйте еще раз.' };
    }
  };

  const signOut = async () => {
    try {
      clearError();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }

      // Очищаем сессию в менеджере
      sessionManager.clearSession();

      return { error: null };
    } catch (error) {
      console.error('[AuthProvider] Sign out error:', error);
      return { error: 'Ошибка выхода. Попробуйте еще раз.' };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};