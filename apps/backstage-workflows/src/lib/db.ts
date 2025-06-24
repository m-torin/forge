import { env } from '../../env';

/**
 * Database connection utilities with graceful fallbacks
 */

export function requireDatabase(): string {
  if (!env.POSTGRES_URL) {
    throw new Error(
      'POSTGRES_URL is required for database operations. ' +
        'Please set this environment variable or check if the database is needed for this operation.',
    );
  }
  return env.POSTGRES_URL;
}

export function isDatabaseAvailable(): boolean {
  return !!env.POSTGRES_URL;
}

export function getDatabaseUrl(): string | null {
  return env.POSTGRES_URL || null;
}

/**
 * Safe database operation wrapper
 */
export async function withDatabase<T>(
  operation: (databaseUrl: string) => Promise<T>,
  fallback?: () => Promise<T> | T,
): Promise<T> {
  if (!isDatabaseAvailable()) {
    if (fallback) {
      console.warn('Database not available, using fallback');
      return await fallback();
    }
    throw new Error('Database operation attempted but POSTGRES_URL not configured');
  }

  return operation(requireDatabase());
}

// Example usage:
// const users = await withDatabase(
//   async (dbUrl) => await db.user.findMany(),
//   () => [] // fallback to empty array
// );
