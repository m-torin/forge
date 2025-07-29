import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { PrismaClient } from '../../../../prisma-generated/client';

import { logError, logInfo, logWarn } from '@repo/observability';
import { seedAuth } from './seed-auth';
import { seedEcommerce } from './seed-ecommerce';
import { seedProducts } from './seed-products';

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
    let productCount = 0;
    let organizationCount = 0;
    let categoryCount = 0;
    let collectionCount = 0;

    try {
      userCount = await prisma.user.count();
      productCount = await prisma.product.count();
      organizationCount = await prisma.organization.count();
      categoryCount = await prisma.productCategory.count();
      collectionCount = await prisma.collection.count();

      logInfo('📊 Current Database State:');
      logInfo(`   Users: ${userCount}`);
      logInfo(`   Products: ${productCount}`);
      logInfo(`   Organizations: ${organizationCount}`);
      logInfo(`   Categories: ${categoryCount}`);
      logInfo(`   Collections: ${collectionCount}`);

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

    if (productCount === 0) {
      logInfo('   ✓ Products (sample product data)');
      logInfo('   ✓ E-commerce data (categories, collections)');

      if (process.env.SEED_EXTENDED === 'true') {
        logInfo('   ✓ Extended faker data (additional test data)');
      }
    } else {
      logInfo(`   ⏭️  Products (${productCount} existing - would be skipped)`);
      logInfo('   ⏭️  E-commerce data (would be skipped)');
    }

    logInfo('');
    logInfo('💡 To actually seed: pnpm prisma:seed');
    logInfo('💡 To reset first: pnpm prisma:migrate:reset');
    return;
  }

  logInfo('🌱 Starting database seed...');

  logInfo('');

  logInfo('This seed script creates basic data structure.');

  logInfo('');
  // Run auth seeding (organizations and API keys)
  await seedAuth();

  // Always run full seeding if no products exist
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    logInfo('');

    logInfo('📦 No products found. Running full seeding...');

    // Run products
    await seedProducts();

    // Run e-commerce data

    console.log('');
    await seedEcommerce();

    // Optionally run faker extended data
    if (process.env.SEED_EXTENDED === 'true') {
      logInfo('');

      logInfo('🎲 Running extended faker data generation...');
      const { seedFakerExtended } = await import('./seed-faker-extended');
      await seedFakerExtended();
    }
  } else {
    logInfo('');

    logInfo(`ℹ️  Found ${productCount} existing products. Skipping product seeding.`);

    logInfo('   To re-seed, run: pnpm prisma:migrate:reset');
  }

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
