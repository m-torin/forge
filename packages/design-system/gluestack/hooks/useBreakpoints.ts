import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof typeof breakpoints;

export interface UseBreakpointsReturn {
  width: number;
  height: number;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isExtraLargeScreen: boolean;
  is2ExtraLargeScreen: boolean;
  currentBreakpoint: Breakpoint | 'xs';
}

export function useBreakpoints(): UseBreakpointsReturn {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  const isSmallScreen = width >= breakpoints.sm;
  const isMediumScreen = width >= breakpoints.md;
  const isLargeScreen = width >= breakpoints.lg;
  const isExtraLargeScreen = width >= breakpoints.xl;
  const is2ExtraLargeScreen = width >= breakpoints['2xl'];

  const getCurrentBreakpoint = (): Breakpoint | 'xs' => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  return {
    width,
    height,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isExtraLargeScreen,
    is2ExtraLargeScreen,
    currentBreakpoint: getCurrentBreakpoint(),
  };
}