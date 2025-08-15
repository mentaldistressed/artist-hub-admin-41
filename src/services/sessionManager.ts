/**
 * Менеджер сессий для надежного управления состоянием аутентификации
 */

import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface SessionData {
  user: User;
  session: Session;
  timestamp: number;
  profileLoaded: boolean;
}

class SessionManager {
  private static instance: SessionManager;
  private sessionData: SessionData | null = null;
  private listeners: Set<(data: SessionData | null) => void> = new Set();
  private isRefreshing = false;
  
  // Константы
  private readonly SESSION_STORAGE_KEY = 'rplus_session_backup';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 минут
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 минут до истечения

  private constructor() {
    this.setupPeriodicRefresh();
    this.restoreSessionFromStorage();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Получить текущую сессию
   */
  getCurrentSession(): SessionData | null {
    // Проверяем актуальность сессии
    if (this.sessionData && this.isSessionExpired(this.sessionData)) {
      console.log('[SessionManager] Session expired, clearing...');
      this.clearSession();
      return null;
    }
    
    return this.sessionData;
  }

  /**
   * Установить сессию
   */
  setSession(user: User, session: Session, profileLoaded = false): void {
    this.sessionData = {
      user,
      session,
      timestamp: Date.now(),
      profileLoaded,
    };
    
    this.saveSessionToStorage();
    this.notifyListeners();
    
    console.log('[SessionManager] Session updated');
  }

  /**
   * Обновить статус загрузки профиля
   */
  setProfileLoaded(loaded: boolean): void {
    if (this.sessionData) {
      this.sessionData.profileLoaded = loaded;
      this.saveSessionToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Очистить сессию
   */
  clearSession(): void {
    this.sessionData = null;
    this.clearSessionFromStorage();
    this.notifyListeners();
    
    console.log('[SessionManager] Session cleared');
  }

  /**
   * Подписаться на изменения сессии
   */
  subscribe(listener: (data: SessionData | null) => void): () => void {
    this.listeners.add(listener);
    
    // Немедленно уведомляем о текущем состоянии
    listener(this.sessionData);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Обновить токен сессии
   */
  async refreshSession(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('[SessionManager] Refresh already in progress');
      return false;
    }

    this.isRefreshing = true;
    
    try {
      console.log('[SessionManager] Refreshing session...');
      
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session) {
        console.error('[SessionManager] Session refresh failed:', error);
        this.clearSession();
        return false;
      }
      
      this.setSession(session.user, session, this.sessionData?.profileLoaded || false);
      console.log('[SessionManager] Session refreshed successfully');
      return true;
      
    } catch (error) {
      console.error('[SessionManager] Session refresh error:', error);
      this.clearSession();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Проверить, нужно ли обновить токен
   */
  shouldRefreshToken(): boolean {
    if (!this.sessionData) return false;
    
    const expiresAt = this.sessionData.session.expires_at;
    if (!expiresAt) return false;
    
    const expirationTime = new Date(expiresAt).getTime();
    const now = Date.now();
    
    return (expirationTime - now) < this.REFRESH_THRESHOLD;
  }

  /**
   * Проверить, истекла ли сессия
   */
  private isSessionExpired(sessionData: SessionData): boolean {
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    
    // Проверяем возраст сессии
    if (sessionAge > this.SESSION_TIMEOUT) {
      return true;
    }
    
    // Проверяем JWT токен
    const expiresAt = sessionData.session.expires_at;
    if (expiresAt) {
      const expirationTime = new Date(expiresAt).getTime();
      return now >= expirationTime;
    }
    
    return false;
  }

  /**
   * Сохранить сессию в localStorage
   */
  private saveSessionToStorage(): void {
    if (!this.sessionData) return;
    
    try {
      const sessionBackup = {
        userId: this.sessionData.user.id,
        email: this.sessionData.user.email,
        timestamp: this.sessionData.timestamp,
        profileLoaded: this.sessionData.profileLoaded,
      };
      
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(sessionBackup));
    } catch (error) {
      console.warn('[SessionManager] Failed to save session to storage:', error);
    }
  }

  /**
   * Восстановить сессию из localStorage
   */
  private restoreSessionFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!stored) return;
      
      const sessionBackup = JSON.parse(stored);
      const age = Date.now() - sessionBackup.timestamp;
      
      // Если сессия слишком старая, удаляем её
      if (age > this.SESSION_TIMEOUT) {
        this.clearSessionFromStorage();
        return;
      }
      
      console.log('[SessionManager] Found session backup in storage');
      
    } catch (error) {
      console.warn('[SessionManager] Failed to restore session from storage:', error);
      this.clearSessionFromStorage();
    }
  }

  /**
   * Очистить сессию из localStorage
   */
  private clearSessionFromStorage(): void {
    try {
      localStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn('[SessionManager] Failed to clear session from storage:', error);
    }
  }

  /**
   * Уведомить всех слушателей
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.sessionData);
      } catch (error) {
        console.error('[SessionManager] Listener error:', error);
      }
    });
  }

  /**
   * Настроить периодическое обновление токенов
   */
  private setupPeriodicRefresh(): void {
    setInterval(() => {
      if (this.shouldRefreshToken() && !this.isRefreshing) {
        console.log('[SessionManager] Auto-refreshing token...');
        this.refreshSession();
      }
    }, 60000); // Проверяем каждую минуту
  }
}

export const sessionManager = SessionManager.getInstance();