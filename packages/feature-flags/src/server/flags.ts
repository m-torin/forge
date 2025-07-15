import { parseOverrides } from '../shared/context-extraction';

// Re-export getProviderData from Vercel SDK
export { getProviderData } from 'flags/next';

/**
 * Get the current flag context from Next.js headers/cookies
 */
export async function getFlagContext() {
  // Dynamically import to avoid bundling in client
  const { cookies, headers } = await import('next/headers');
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);

  return {
    overrides: parseOverrides(cookieStore),
    cookies: cookieStore,
    headers: headerStore,
  };
}

/**
 * Evaluate multiple flags in parallel
 */
export async function evaluateFlags<T extends Record<string, () => Promise<unknown>>>(
  flags: T,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const entries = await Promise.all(
    Object.entries(flags).map(async ([key, flag]) => [key, await flag()]),
  );

  return Object.fromEntries(entries) as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}
