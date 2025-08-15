import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'artist' | 'admin', additionalData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Инициализация авторизации
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Получаем текущую сессию
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          // Очищаем поврежденную сессию
          await supabase.auth.signOut();
          if (isMounted) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        console.log('Current session:', currentSession ? 'exists' : 'none');

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            console.log('User found, fetching profile...');
            const profileData = await fetchProfile(currentSession.user.id);
            if (isMounted) {
              setProfile(profileData);
            }
          } else {
            console.log('No user found');
            setProfile(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Таймаут для принудительного завершения загрузки
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth initialization timeout - forcing completion');
        setLoading(false);
      }
    }, 8000);

    initializeAuth();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []); // Пустой массив зависимостей - инициализация только один раз

  // Слушатель изменений авторизации
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        // Убеждаемся, что loading выключен после любого изменения состояния
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, role: 'artist' | 'admin', additionalData: any) => {
    setLoading(true);
    
    try {
      const metadata: any = { role };
      
      if (role === 'artist') {
        metadata.pseudonym = additionalData.pseudonym;
        metadata.telegram_contact = additionalData.telegram_contact;
      } else {
        metadata.name = additionalData.name;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};