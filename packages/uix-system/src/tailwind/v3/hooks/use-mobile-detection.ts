'use client';

import { useEffect, useState } from 'react';

export interface MobileDetectionResult {
  isMobile: boolean;
  isTouchDevice: boolean;
  screenSize: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Hook for detecting mobile devices and touch capabilities
 */
export function useMobileDetection(): MobileDetectionResult {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

      if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else setScreenSize('xl');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTouchDevice, screenSize };
}
