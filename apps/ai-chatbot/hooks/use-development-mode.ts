'use client';

import { useEffect, useState } from 'react';

export function useDevelopmentMode() {
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Runtime detection of development mode
    const isDev =
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost');

    setIsDevelopment(isDev);
    setIsInitialized(true);
  }, []);

  return { isDevelopment, isInitialized };
}
