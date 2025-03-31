import { useCallback } from 'react';

export function useLocalStorage() {
  const getItem = useCallback((key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  }, []);

  const setItem = useCallback((key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  }, []);

  return { getItem, setItem };
} 