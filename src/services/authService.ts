import { supabase } from '@/integrations/supabase/client';
import type { User, Profile } from '@/types/auth';

class AuthService {
  private static instance: AuthService;
  private initializationPromise: Promise<void> | null = null;
  private isInitializing = false;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize authentication state
   * This method ensures single initialization and prevents race conditions
   */
  async initialize(): Promise<{ user: User | null; profile: Profile | null; error: string | null }> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing && this.initializationPromise) {
      await this.initializationPromise;
      return this.getCurrentState();
    }

    if (this.isInitializing) {
      return { user: null, profile: null, error: 'Already initializing' };
    }

    this.isInitializing = true;
    
    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
      return this.getCurrentState();
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('[AuthService] Starting initialization...');
      
      // Get current session with timeout
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
        )
      ]);

      if (sessionResult.error) {
        console.warn('[AuthService] Session error:', sessionResult.error.message);
        // Clear potentially corrupted session
        await this.clearSession();
        return;
      }

      if (!sessionResult.data.session?.user) {
        console.log('[AuthService] No active session found');
        return;
      }

      console.log('[AuthService] Active session found, loading profile...');
      
      // Load user profile
      await this.loadUserProfile(sessionResult.data.session.user.id);
      
      console.log('[AuthService] Initialization completed successfully');
    } catch (error) {
      console.error('[AuthService] Initialization failed:', error);
      await this.clearSession();
    }
  }

  private async getCurrentState(): Promise<{ user: User | null; profile: Profile | null; error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { user: null, profile: null, error: null };
      }

      const profile = await this.getUserProfile(session.user.id);
      
      return {
        user: session.user as User,
        profile,
        error: null
      };
    } catch (error) {
      console.error('[AuthService] Error getting current state:', error);
      return { user: null, profile: null, error: 'Failed to get current state' };
    }
  }

  /**
   * Sign in user with email and password
   */
  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    try {
      console.log('[AuthService] Signing in user...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthService] Sign in error:', error.message);
        return { error: error.message };
      }

      console.log('[AuthService] Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('[AuthService] Sign in failed:', error);
      return { error: 'Sign in failed' };
    }
  }

  /**
   * Sign up new user
   */
  async signUp(
    email: string, 
    password: string, 
    role: 'artist' | 'admin', 
    additionalData: any
  ): Promise<{ error: string | null }> {
    try {
      console.log('[AuthService] Signing up user...');
      
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
        console.error('[AuthService] Sign up error:', error.message);
        return { error: error.message };
      }

      console.log('[AuthService] Sign up successful');
      return { error: null };
    } catch (error) {
      console.error('[AuthService] Sign up failed:', error);
      return { error: 'Sign up failed' };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      console.log('[AuthService] Signing out user...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthService] Sign out error:', error.message);
        return { error: error.message };
      }

      console.log('[AuthService] Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('[AuthService] Sign out failed:', error);
      return { error: 'Sign out failed' };
    }
  }

  /**
   * Load user profile from database
   */
  private async loadUserProfile(userId: string): Promise<Profile | null> {
    try {
      const profile = await this.getUserProfile(userId);
      console.log('[AuthService] Profile loaded:', profile?.role);
      return profile;
    } catch (error) {
      console.error('[AuthService] Failed to load profile:', error);
      return null;
    }
  }

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[AuthService] Profile fetch error:', error.message);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('[AuthService] Profile fetch failed:', error);
      return null;
    }
  }

  /**
   * Clear session and local storage
   */
  private async clearSession(): Promise<void> {
    try {
      await supabase.auth.signOut();
      // Clear any additional local storage if needed
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('[AuthService] Error clearing session:', error);
    }
  }

  /**
   * Set up auth state change listener
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = AuthService.getInstance();