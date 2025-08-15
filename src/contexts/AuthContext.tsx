import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  emailConfirmationSent: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, role: 'artist' | 'admin', additionalData: any) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  isInitialized: boolean;
  clearEmailConfirmation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const { toast } = useToast();

  const clearError = () => setError(null);
  const clearEmailConfirmation = () => setEmailConfirmationSent(false);
  const clearEmailConfirmation = () => setEmailConfirmationSent(false);

  const loadProfile = async (userId: string): Promise<any | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Profile load failed:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    
    try {
      const profileData = await loadProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error("Profile refresh failed:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('[AuthContext] Auth state changed:', event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Create user object from session
          const userData: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            role: 'artist' // Default, will be updated from profile
          };
          
          setUser(userData);
          
          // Load profile asynchronously
          setTimeout(async () => {
            if (!mounted) return;
            
            const profileData = await loadProfile(currentSession.user.id);
            if (mounted && profileData) {
              setProfile(profileData);
              // Update user with correct role from profile
              setUser(prev => prev ? { ...prev, role: profileData.role } : null);
            }
            
            if (mounted) {
              setIsLoading(false);
              setIsInitialized(true);
            }
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
          if (mounted) {
            setIsLoading(false);
            setIsInitialized(true);
          }
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("Session initialization error:", error);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        if (existingSession?.user) {
          const userData: User = {
            id: existingSession.user.id,
            email: existingSession.user.email || '',
            role: 'artist'
          };
          
          setUser(userData);
          setSession(existingSession);
          
          // Load profile
          const profileData = await loadProfile(existingSession.user.id);
          if (mounted && profileData) {
            setProfile(profileData);
            setUser(prev => prev ? { ...prev, role: profileData.role } : null);
          }
        }
        
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        const errorMessage = error.message === "Invalid login credentials" 
          ? "неверный email или пароль" 
          : error.message;
        
        setError(errorMessage);
        setIsLoading(false);
        return { error: errorMessage };
      }
      
      // Success will be handled by onAuthStateChange
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      const errorMessage = "произошла непредвиденная ошибка при входе";
      setError(errorMessage);
      setIsLoading(false);
      return { error: errorMessage };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: 'artist' | 'admin', 
    additionalData: any
  ) => {
    setIsLoading(true);
    clearError();
    
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

      if (error) {
        console.error("Signup error:", error);
        setError(error.message);
        setIsLoading(false);
        return { error: error.message };
      }

      // Показываем сообщение о подтверждении email и останавливаем загрузку
      setEmailConfirmationSent(true);
      setIsLoading(false);
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      const errorMessage = "произошла непредвиденная ошибка при регистрации";
      setError(errorMessage);
      setIsLoading(false);
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      clearError();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        return { error: error.message };
      }

      // Clear state immediately
      setUser(null);
      setProfile(null);
      setSession(null);

      return { error: null };
    } catch (error: any) {
      console.error("Unexpected logout error:", error);
      return { error: "произошла ошибка при выходе" };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    emailConfirmationSent,
    emailConfirmationSent,
    signIn,
    signUp,
    signOut,
    isLoading,
    error,
    clearError,
    refreshProfile,
    isInitialized,
    clearEmailConfirmation,
    clearEmailConfirmation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}