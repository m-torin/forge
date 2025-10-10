import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '../../env.ts';

const runMigrate = async () => {
  if (!env.DATABASE_URL) {
    console.log('⏭️  Skipping migrations: DATABASE_URL is not defined');
    process.exit(0);
  }

  const connection = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(0);
};

runMigrate().catch(err => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
