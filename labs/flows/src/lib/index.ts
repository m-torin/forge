// index.ts

// Domain actions removed - no longer needed

// Explicitly import and re-export functions from encryption
import { encrypt, decrypt } from './encryption';

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Domain exports removed - no longer needed

export { encrypt, decrypt };

// Keep the existing exports
// Domain exports removed - no longer needed
export * from './pathContext';
export * from './utils';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sanitizeFormName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9-]/g, '');
};
