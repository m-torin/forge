/**
 * Layout utility functions and constants
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const PANEL_SIZES = {
  sidebar: {
    default: 280,
    min: 200,
    max: 400,
  },
  inspector: {
    default: 320,
    min: 250,
    max: 500,
  },
} as const;

export function getScreenSize(width: number): 'sm' | 'md' | 'lg' | 'xl' {
  if (width < BREAKPOINTS.sm) return 'sm';
  if (width < BREAKPOINTS.md) return 'md';
  if (width < BREAKPOINTS.lg) return 'lg';
  return 'xl';
}

export function isMobileWidth(width: number): boolean {
  return width < BREAKPOINTS.md;
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
