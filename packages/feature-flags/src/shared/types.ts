// Re-export types from Vercel Flags
export type { FlagOverridesType } from '@vercel/flags';

// The ReadonlyRequestCookies type comes from @vercel/flags
// Import it directly in your code:
// import type { ReadonlyRequestCookies } from '@vercel/flags';

// Type for Next.js cookies
export interface CookieStore {
  get(name: string): { value: string } | undefined;
}

// Type for Next.js headers
export interface HeaderStore {
  get(name: string): string | null;
}
