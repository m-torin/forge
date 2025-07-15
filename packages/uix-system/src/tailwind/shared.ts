/**
 * Shared Tailwind utilities and types
 */

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const TAILWIND_SCREENS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type TailwindScreen = keyof typeof TAILWIND_SCREENS;

export function createTailwindMediaQuery(screen: TailwindScreen): string {
  return `@media (min-width: ${TAILWIND_SCREENS[screen]})`;
}

export function validateTailwindScreen(value: unknown): value is TailwindScreen {
  return typeof value === 'string' && value in TAILWIND_SCREENS;
}
