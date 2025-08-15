import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { authService } from '@/services/authService';
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout';
import type { AuthContextType, AuthState, User, Profile } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null,
  });

  const mountedRef = useRef(true);
  const initializationRef = useRef(false);

  // Prevent infinite loading with timeout
  const { clearLoadingTimeout } = useLoadingTimeout({
    timeout: 15000,
    enabled: state.isLoading && !state.isInitialized,
    onTimeout: () => {
      console.warn('[AuthProvider] Loading timeout - forcing initialization complete');
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
          error: 'Authentication timeout - please refresh the page'
        }));
      }
    }
  });

  // Safe state update function
  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  // Initialize authentication
  useEffect(() => {
    let isCancelled = false;

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (initializationRef.current) {
        return;
      }
      
      initializationRef.current = true;
      console.log('[AuthProvider] Starting authentication initialization...');

      try {
        const result = await authService.initialize();
        
        if (isCancelled || !mountedRef.current) {
          return;
        }

        const isAuthenticated = !!(result.user && result.profile);

        updateState({
          user: result.user,
          profile: result.profile,
          isAuthenticated,
          isLoading: false,
          isInitialized: true,
          error: result.error,
        });

        clearLoadingTimeout();
        console.log('[AuthProvider] Authentication initialization completed');
      } catch (error) {
        console.error('[AuthProvider] Authentication initialization failed:', error);
        
        if (!isCancelled && mountedRef.current) {
          updateState({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: 'Authentication initialization failed',
          });
          clearLoadingTimeout();
        }
      }
    };

    initializeAuth();

    return () => {
      isCancelled = true;
    };
  }, [clearLoadingTimeout]);

  // Set up auth state change listener
  useEffect(() => {
    console.log('[AuthProvider] Setting up auth state change listener...');
    
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event);

        if (!mountedRef.current) {
          return;
        }

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await authService.getUserProfile(session.user.id);
            
            updateState({
              user: session.user as User,
              profile,
              isAuthenticated: !!(session.user && profile),
              error: null,
            });
          } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
            updateState({
              user: null,
              profile: null,
              isAuthenticated: false,
              error: null,
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
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    updateState({ error: null });
    return authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string, role: 'artist' | 'admin', additionalData: any) => {
    updateState({ error: null });
    return authService.signUp(email, password, role, additionalData);
  };

  const signOut = async () => {
    updateState({ error: null });
    const result = await authService.signOut();
    
    if (!result.error) {
      updateState({
        user: null,
        profile: null,
        isAuthenticated: false,
      });
    }
    
    return result;
  };

  const clearError = () => {
    updateState({ error: null });
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    
    try {
      const profile = await authService.getUserProfile(state.user.id);
      updateState({ profile });
    } catch (error) {
      console.error('[AuthProvider] Failed to refresh profile:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};