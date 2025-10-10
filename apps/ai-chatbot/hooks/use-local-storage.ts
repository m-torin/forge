'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseLocalStorageOptions<T> {
  key: string;
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

type UseLocalStorageReturn<T> = [T, (value: T | ((prevState: T) => T)) => void, () => void];

export function useLocalStorage<T>({
  key,
  defaultValue,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}: UseLocalStorageOptions<T>): UseLocalStorageReturn<T> {
  // Initialize state with default value
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(deserialize(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, deserialize]);

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prevState: T) => T)) => {
      try {
        setStoredValue(prevState => {
          const valueToStore = value instanceof Function ? value(prevState) : value;

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, serialize(valueToStore));
          }

          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize],
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(defaultValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}
