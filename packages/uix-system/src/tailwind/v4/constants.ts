/**
 * Tailwind CSS v4 design system constants
 */

export const TAILWIND_V4_SPACING = {
  0: 'var(--spacing-0, 0px)',
  1: 'var(--spacing-1, 0.25rem)',
  2: 'var(--spacing-2, 0.5rem)',
  3: 'var(--spacing-3, 0.75rem)',
  4: 'var(--spacing-4, 1rem)',
  5: 'var(--spacing-5, 1.25rem)',
  6: 'var(--spacing-6, 1.5rem)',
  8: 'var(--spacing-8, 2rem)',
  10: 'var(--spacing-10, 2.5rem)',
  12: 'var(--spacing-12, 3rem)',
  16: 'var(--spacing-16, 4rem)',
  20: 'var(--spacing-20, 5rem)',
  24: 'var(--spacing-24, 6rem)',
  32: 'var(--spacing-32, 8rem)',
} as const;

export const TAILWIND_V4_COLORS = {
  slate: {
    50: 'var(--color-slate-50, #f8fafc)',
    100: 'var(--color-slate-100, #f1f5f9)',
    500: 'var(--color-slate-500, #64748b)',
    900: 'var(--color-slate-900, #0f172a)',
  },
  gray: {
    50: 'var(--color-gray-50, #f9fafb)',
    100: 'var(--color-gray-100, #f3f4f6)',
    500: 'var(--color-gray-500, #6b7280)',
    900: 'var(--color-gray-900, #111827)',
  },
  blue: {
    50: 'var(--color-blue-50, #eff6ff)',
    100: 'var(--color-blue-100, #dbeafe)',
    500: 'var(--color-blue-500, #3b82f6)',
    900: 'var(--color-blue-900, #1e3a8a)',
  },
  red: {
    50: 'var(--color-red-50, #fef2f2)',
    100: 'var(--color-red-100, #fee2e2)',
    500: 'var(--color-red-500, #ef4444)',
    900: 'var(--color-red-900, #7f1d1d)',
  },
} as const;

export const TAILWIND_V4_BORDER_RADIUS = {
  none: 'var(--radius-none, 0px)',
  sm: 'var(--radius-sm, 0.125rem)',
  DEFAULT: 'var(--radius, 0.25rem)',
  md: 'var(--radius-md, 0.375rem)',
  lg: 'var(--radius-lg, 0.5rem)',
  xl: 'var(--radius-xl, 0.75rem)',
  '2xl': 'var(--radius-2xl, 1rem)',
  '3xl': 'var(--radius-3xl, 1.5rem)',
  full: 'var(--radius-full, 9999px)',
} as const;

export const TAILWIND_V4_BREAKPOINTS = {
  sm: 'var(--breakpoint-sm, 640px)',
  md: 'var(--breakpoint-md, 768px)',
  lg: 'var(--breakpoint-lg, 1024px)',
  xl: 'var(--breakpoint-xl, 1280px)',
  '2xl': 'var(--breakpoint-2xl, 1536px)',
} as const;
