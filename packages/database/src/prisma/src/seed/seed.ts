import { PrismaClient } from '../../../../prisma-generated/client';

import { seedAuth } from './seed-auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('');

  console.log('This seed script creates basic auth data structure.');

  console.log('');
  // Run auth seeding (organizations and API keys)
  await seedAuth();

  console.log('');

  console.log('🌱 Seed completed!');
}

void (async () => {
  await main()
    .catch((e: any) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
})();
