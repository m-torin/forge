import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { PrismaClient } from '../../../../prisma-generated/client';

import { logError, logInfo, logWarn } from '@repo/observability';
import { seedAuth } from './seed-auth';

// Load environment variables - prioritize .env.local, fallback to .env
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config({ path: '.env' });
}

// Check if this is a dry run
const isDryRun = process.argv.includes('--dry-run');

// Only create prisma client if not in dry run or if DATABASE_URL is available
const prisma = new PrismaClient();

async function main() {
  if (isDryRun) {
    logInfo('🔍 DRY RUN: Analyzing what would be seeded...');
    logInfo('');

    // Try to show current database state if DATABASE_URL is available
    let userCount = 0;
    let organizationCount = 0;

    try {
      userCount = await prisma.user.count();
      organizationCount = await prisma.organization.count();

      logInfo('📊 Current Database State:');
      logInfo(`   Users: ${userCount}`);
      logInfo(`   Organizations: ${organizationCount}`);

      const databaseUrl = process.env.DATABASE_URL;
      if (databaseUrl) {
        // Mask the database URL for security
        const maskedUrl = databaseUrl.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
        logInfo(`   Database: ${maskedUrl}`);
      }
    } catch (error) {
      logInfo('📊 Current Database State:');

      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        logWarn('   ⚠️  No DATABASE_URL found in environment variables');
        logWarn('   ⚠️  Add DATABASE_URL to .env.local or .env file');
      } else {
        logWarn('   ⚠️  Cannot connect to database');
        logWarn(`   ⚠️  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      logWarn('   ⚠️  Assuming empty database for dry-run analysis');
    }

    logInfo('');

    logInfo('🎯 What would be seeded:');
    logInfo('   ✓ Auth data (users, organizations, API keys)');

    logInfo('');
    logInfo('💡 To actually seed: pnpm prisma:seed');
    logInfo('💡 To reset first: pnpm prisma:migrate:reset');
    return;
  }

  logInfo('🌱 Starting database seed...');

  logInfo('');

  logInfo('This seed script creates basic auth data structure.');

  logInfo('');
  // Run auth seeding (organizations and API keys)
  await seedAuth();

  logInfo('');

  logInfo('🌱 Seed completed!');
}

export { main };

void (async () => {
  await main()
    .catch((e: any) => {
      logError('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
})();
