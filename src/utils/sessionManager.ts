// Session management utilities
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly SESSION_KEY = 'app_session_timestamp';
  
  /**
   * Check if session has expired based on timestamp
   */
  static isSessionExpired(): boolean {
    try {
      const timestamp = localStorage.getItem(this.SESSION_KEY);
      if (!timestamp) return false;
      
      const sessionTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      return (now - sessionTime) > this.SESSION_TIMEOUT;
    } catch (error) {
      console.error('Error checking session expiry:', error);
      return true; // Assume expired on error
    }
  }
  
  /**
   * Update session timestamp
   */
  static updateSessionTimestamp(): void {
    try {
      localStorage.setItem(this.SESSION_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error updating session timestamp:', error);
    }
  }
  
  /**
   * Clear all session data
   */
  static clearAllSessionData(): void {
    try {
      // Clear localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth') || key === this.SESSION_KEY)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }
  
  /**
   * Validate localStorage data integrity
   */
  static validateStorageIntegrity(): boolean {
    try {
      // Test localStorage functionality
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (testValue !== 'test') {
        return false;
      }
      
      // Check for corrupted auth data
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      );
      
      for (const key of authKeys) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            JSON.parse(value); // Test if it's valid JSON
          }
        } catch (parseError) {
          console.warn(`Corrupted data found in ${key}:`, parseError);
          localStorage.removeItem(key);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Storage integrity check failed:', error);
      return false;
    }
  }
  
  /**
   * Initialize session with cleanup
   */
  static initializeSession(): void {
    // Check storage integrity
    if (!this.validateStorageIntegrity()) {
      this.clearAllSessionData();
      return;
    }
    
    // Check if session is expired
    if (this.isSessionExpired()) {
      this.clearAllSessionData();
      return;
    }
    
    // Update timestamp for active session
    this.updateSessionTimestamp();
  }
}