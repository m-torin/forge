import 'server-only';
import { Database } from './database';
import { DatabaseProvider, DatabaseResponse } from './types';

// Export the database instance using the configured provider
export const database = Database.getInstance(
  (process.env.DATABASE_PROVIDER as DatabaseProvider) || 'prisma'
);

// Export types
export * from './types';

// Allow direct re-export of the Prisma client types for backward compatibility
export * from './generated/client';

// Export database response type
export type { DatabaseResponse };
