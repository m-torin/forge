import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL is not defined');
  }

  const connection = postgres(dbUrl, { max: 1 });
  const db = drizzle(connection);

  // Running migrations...

  const _start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const _end = Date.now();

  // Migrations completed
  process.exit(0);
};

runMigrate().catch(_err => {
  // Migration failed
  process.exit(1);
});
