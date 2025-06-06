'use client';

import { useEffect, useState } from 'react';

/**
 * React hook for using feature flags in client components
 * Note: For server components, use the flag directly
 *
 * @param flagFunction - The flag function that returns a promise
 * @param initialValue - Optional initial value while loading
 */
export function useFlag<T>(flagFunction: () => Promise<T>, initialValue?: T): T | undefined {
  const [value, setValue] = useState<T | undefined>(initialValue);

  useEffect(() => {
    // Evaluate flag on client side
    flagFunction().then(setValue).catch(console.error);
  }, [flagFunction]);

  return value;
}
