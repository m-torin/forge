import { defineConfig } from 'drizzle-kit';
import { env } from './env';

// Use placeholder for static analysis tools like knip
const databaseUrl = env.DATABASE_URL || 'postgresql://localhost:5432/placeholder';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
