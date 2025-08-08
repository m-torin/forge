'use client';

import { useMediaQuery, useOs, useReducedMotion } from '@mantine/hooks';
import { useEffect, useState } from 'react';

interface BrowserCapabilities {
  hasViewTransitions: boolean;
  hasContainerQueries: boolean;
  hasBackdropFilter: boolean;
  hasSubgrid: boolean;
  hasColorMix: boolean;
  hasIntersectionObserver: boolean;
  hasResizeObserver: boolean;
  hasWebShare: boolean;
  hasFileSystemAccess: boolean;
  hasPaintWorklet: boolean;
  prefersDarkMode: boolean;
  prefersReducedMotion: boolean;
  connectionType: string;
  isHighBandwidth: boolean;
  operatingSystem: string;
}

export function useProgressiveEnhancement(): BrowserCapabilities {
  // Use Mantine hooks for common capabilities
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = useReducedMotion();
  const operatingSystem = useOs();

  const [capabilities, setCapabilities] = useState<BrowserCapabilities>({
    hasViewTransitions: false,
    hasContainerQueries: false,
    hasBackdropFilter: false,
    hasSubgrid: false,
    hasColorMix: false,
    hasIntersectionObserver: false,
    hasResizeObserver: false,
    hasWebShare: false,
    hasFileSystemAccess: false,
    hasPaintWorklet: false,
    prefersDarkMode: false,
    prefersReducedMotion: false,
    connectionType: 'unknown',
    isHighBandwidth: true,
    operatingSystem: 'undetermined',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectCapabilities = () => {
      setCapabilities(prev => ({
        ...prev,
        // Modern APIs
        hasViewTransitions: 'startViewTransition' in document,
        hasContainerQueries: CSS.supports('container-type: inline-size'),
        hasBackdropFilter: CSS.supports('backdrop-filter: blur(10px)'),
        hasSubgrid: CSS.supports('grid-template-rows: subgrid'),
        hasColorMix: CSS.supports('color: color-mix(in srgb, red, blue)'),

        // Observer APIs
        hasIntersectionObserver: 'IntersectionObserver' in window,
        hasResizeObserver: 'ResizeObserver' in window,

        // Modern web APIs
        hasWebShare: 'share' in navigator,
        hasFileSystemAccess: 'showOpenFilePicker' in window,
        hasPaintWorklet: 'paintWorklet' in CSS,

        // Use Mantine hook values
        prefersDarkMode,
        prefersReducedMotion,
        operatingSystem,

        // Network information (keep custom as it's specialized)
        connectionType:
          'connection' in navigator
            ? (navigator as any).connection?.effectiveType || 'unknown'
            : 'unknown',
        isHighBandwidth:
          'connection' in navigator
            ? !['slow-2g', '2g'].includes((navigator as any).connection?.effectiveType)
            : true,
      }));
    };

    detectCapabilities();
  }, [prefersDarkMode, prefersReducedMotion, operatingSystem]);

  return capabilities;
}
