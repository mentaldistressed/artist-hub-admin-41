import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  retryCount: number;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, role: 'artist' | 'admin', additionalData: any) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  clearError: () => void;
  retry: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const MAX_RETRY_ATTEMPTS = 3;
const INITIALIZATION_TIMEOUT = 10000; // 10 seconds
const PROFILE_FETCH_TIMEOUT = 5000; // 5 seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isInitialized: false,
    error: null,
    retryCount: 0,
  });

  const mountedRef = useRef(true);
  const initializationRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safe state update function
  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
  }, []);

  // Fetch user profile with timeout
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    return new Promise((resolve) => {
      let resolved = false;

      // Set timeout for profile fetch
      profileTimeoutRef.current = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('[AuthProvider] Profile fetch timeout');
          resolve(null);
        }
      }, PROFILE_FETCH_TIMEOUT);

      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
        .then(({ data, error }) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(profileTimeoutRef.current!);
            
            if (error) {
              console.error('[AuthProvider] Profile fetch error:', error);
              resolve(null);
            } else {
              resolve(data as Profile);
            }
          }
        })
        .catch((error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(profileTimeoutRef.current!);
            console.error('[AuthProvider] Profile fetch failed:', error);
            resolve(null);
          }
        });
    });
  }, []);

  // Initialize authentication
  const initializeAuth = useCallback(async (): Promise<void> => {
    if (initializationRef.current || !mountedRef.current) {
      return;
    }

    initializationRef.current = true;
    console.log('[AuthProvider] Starting authentication initialization...');

    try {
      // Set initialization timeout
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && !state.isInitialized) {
          console.warn('[AuthProvider] Initialization timeout reached');
          updateState({
            isLoading: false,
            isInitialized: true,
            error: 'Authentication initialization timeout. Please try again.',
            retryCount: state.retryCount + 1,
          });
        }
      }, INITIALIZATION_TIMEOUT);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      if (sessionError) {
        console.error('[AuthProvider] Session error:', sessionError);
        // Clear potentially corrupted session
        await supabase.auth.signOut();
        updateState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isInitialized: true,
          error: null,
          retryCount: 0,
        });
        return;
      }

      if (!session?.user) {
        console.log('[AuthProvider] No active session found');
        updateState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isInitialized: true,
          error: null,
          retryCount: 0,
        });
        return;
      }

      console.log('[AuthProvider] Active session found, loading profile...');

      // Fetch user profile
      const profile = await fetchProfile(session.user.id);

      if (!mountedRef.current) return;

      if (!profile) {
        console.warn('[AuthProvider] Profile not found or failed to load');
        updateState({
          user: session.user,
          profile: null,
          session: session,
          isLoading: false,
          isInitialized: true,
          error: 'Failed to load user profile. Please try again.',
          retryCount: state.retryCount + 1,
        });
        return;
      }

      console.log('[AuthProvider] Initialization completed successfully');
      updateState({
        user: session.user,
        profile: profile,
        session: session,
        isLoading: false,
        isInitialized: true,
        error: null,
        retryCount: 0,
      });

    } catch (error) {
      console.error('[AuthProvider] Initialization failed:', error);
      if (mountedRef.current) {
        updateState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isInitialized: true,
          error: 'Authentication failed. Please try again.',
          retryCount: state.retryCount + 1,
        });
      }
    } finally {
      clearTimeouts();
      initializationRef.current = false;
    }
  }, [updateState, fetchProfile, state.retryCount, state.isInitialized]);

  // Retry function
  const retry = useCallback(async (): Promise<void> => {
    if (state.retryCount >= MAX_RETRY_ATTEMPTS) {
      updateState({
        error: 'Maximum retry attempts reached. Please refresh the page.',
      });
      return;
    }

    console.log(`[AuthProvider] Retrying authentication (attempt ${state.retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
    
    updateState({
      isLoading: true,
      error: null,
      retryCount: state.retryCount + 1,
    });

    // Reset initialization flag to allow retry
    initializationRef.current = false;
    await initializeAuth();
  }, [state.retryCount, updateState, initializeAuth]);

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<void> => {
    console.log('[AuthProvider] Refreshing authentication...');
    
    updateState({
      isLoading: true,
      error: null,
    });

    initializationRef.current = false;
    await initializeAuth();
  }, [updateState, initializeAuth]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();

    return () => {
      clearTimeouts();
    };
  }, [initializeAuth, clearTimeouts]);

  // Set up auth state change listener
  useEffect(() => {
    console.log('[AuthProvider] Setting up auth state change listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event);

        if (!mountedRef.current) return;

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await fetchProfile(session.user.id);
            updateState({
              user: session.user,
              profile,
              session: session,
              error: profile ? null : 'Failed to load user profile',
            });
          } else if (event === 'SIGNED_OUT') {
            updateState({
              user: null,
              profile: null,
              session: null,
              error: null,
              retryCount: 0,
            });
          } else if (event === 'TOKEN_REFRESHED' && session) {
            updateState({
              user: session.user,
              session: session,
            });
          }
        } catch (error) {
          console.error('[AuthProvider] Error handling auth state change:', error);
          updateState({
            error: 'Authentication state update failed',
          });
        }
      }
    );

    return () => {
      console.log('[AuthProvider] Cleaning up auth state change listener...');
      subscription.unsubscribe();
    };
  }, [updateState, fetchProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimeouts();
    };
  }, [clearTimeouts]);

  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    updateState({ error: null });
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'Sign in failed. Please try again.' };
    }
  }, [updateState]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    role: 'artist' | 'admin', 
    additionalData: any
  ) => {
    updateState({ error: null });
    
    try {
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
      return { error: 'Sign up failed. Please try again.' };
    }
  }, [updateState]);

  const signOut = useCallback(async () => {
    updateState({ error: null });
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }

      updateState({
        user: null,
        profile: null,
        session: null,
        retryCount: 0,
      });

      return { error: null };
    } catch (error) {
      return { error: 'Sign out failed. Please try again.' };
    }
  }, [updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    clearError,
    retry,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};