import { useEffect, useRef } from 'react';

interface UseLoadingTimeoutOptions {
  timeout?: number;
  onTimeout?: () => void;
  enabled?: boolean;
}

/**
 * Hook to prevent infinite loading states by setting a maximum timeout
 */
export function useLoadingTimeout({
  timeout = 15000, // 15 seconds default
  onTimeout,
  enabled = true
}: UseLoadingTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.warn('[LoadingTimeout] Loading timeout reached');
      onTimeout?.();
    }, timeout);

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [timeout, onTimeout, enabled]);

  // Manual cleanup function
  const clearLoadingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return { clearLoadingTimeout };
}