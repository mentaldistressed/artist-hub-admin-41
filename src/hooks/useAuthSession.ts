import { useEffect, useState, useCallback } from 'react';
import { sessionManager } from '@/services/sessionManager';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

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

interface UseAuthSessionReturn {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

/**
 * Хук для управления аутентификацией с использованием SessionManager
 */
export const useAuthSession = (): UseAuthSessionReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка профиля пользователя
  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('[useAuthSession] Loading profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[useAuthSession] Profile load error:', error);
        return null;
      }

      console.log('[useAuthSession] Profile loaded successfully');
      return data as Profile;
    } catch (error) {
      console.error('[useAuthSession] Profile load failed:', error);
      return null;
    }
  }, []);

  // Обновление профиля
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    setError(null);
    
    try {
      const profileData = await loadProfile(user.id);
      setProfile(profileData);
      
      // Обновляем статус в SessionManager
      sessionManager.setProfileLoaded(!!profileData);
      
    } catch (error) {
      console.error('[useAuthSession] Profile refresh failed:', error);
      setError('Не удалось обновить профиль');
    }
  }, [user?.id, loadProfile]);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Инициализация и подписка на изменения сессии
  useEffect(() => {
    console.log('[useAuthSession] Initializing...');
    
    // Подписываемся на изменения в SessionManager
    const unsubscribe = sessionManager.subscribe(async (sessionData) => {
      if (!sessionData) {
        // Нет сессии
        setUser(null);
        setProfile(null);
        setSession(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Есть сессия
      setUser(sessionData.user);
      setSession(sessionData.session);
      
      // Загружаем профиль если он еще не загружен
      if (!sessionData.profileLoaded) {
        const profileData = await loadProfile(sessionData.user.id);
        setProfile(profileData);
        sessionManager.setProfileLoaded(!!profileData);
        
        if (!profileData) {
          setError('Не удалось загрузить профиль пользователя');
        }
      } else {
        // Профиль уже загружен, получаем его из базы
        const profileData = await loadProfile(sessionData.user.id);
        setProfile(profileData);
      }
      
      setIsLoading(false);
    });

    // Инициализируем сессию из Supabase
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[useAuthSession] Session initialization error:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          sessionManager.setSession(session.user, session);
        } else {
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error('[useAuthSession] Session initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeSession();

    return unsubscribe;
  }, [loadProfile]);

  // Слушатель изменений аутентификации Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuthSession] Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          sessionManager.setSession(session.user, session);
        } else if (event === 'SIGNED_OUT') {
          sessionManager.clearSession();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          sessionManager.setSession(session.user, session, sessionManager.getCurrentSession()?.profileLoaded || false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    session,
    isLoading,
    error,
    refreshProfile,
    clearError,
  };
};