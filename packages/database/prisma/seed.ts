import { PrismaClient } from './generated/client';

import { seedEcommerce } from './seed-ecommerce';
import { seedProducts } from './seed-products';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('');
  console.log('This seed script creates basic data structure.');
  console.log('');
  console.log('To create users, you have two options:');
  console.log('');
  console.log('Option 1: Use Better Auth sign-up (RECOMMENDED)');
  console.log('1. Make sure backstage is running: pnpm dev --filter=backstage');
  console.log('2. Go to http://localhost:3350/sign-up');
  console.log('3. Create account with email: admin@example.com, password: admin123');
  console.log(
    "4. Update user role in database: UPDATE \"user\" SET role = 'super-admin' WHERE email = 'admin@example.com';",
  );
  console.log('');
  console.log('Option 2: Run the create-users script after backstage is running');
  console.log('pnpm --filter @repo/database create-users');
  console.log('');

  // Create a default organization that can be used later
  const existingOrg = await prisma.organization.findFirst({
    where: { slug: 'default-org' },
  });

  if (!existingOrg) {
    const org = await prisma.organization.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Default Organization',
        createdAt: new Date(),
        slug: 'default-org',
      },
    });
    console.log('✅ Created default organization:', org.name);
  } else {
    console.log('ℹ️  Default organization already exists');
  }

  // Check if we have users to determine what to seed
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    console.log('');
    console.log('⚠️  No users found. Please create users first before running additional seeds.');
    console.log('');
    console.log('After creating users, you can run:');
    console.log('- pnpm --filter @repo/database seed:products   # Basic product data');
    console.log('- pnpm --filter @repo/database seed:ecommerce  # Full e-commerce data');
  } else {
    console.log('');
    console.log(`📊 Found ${userCount} users in the database.`);
    console.log('');
    console.log('Additional seeding options:');
    console.log('- pnpm --filter @repo/database seed:products   # Basic product data');
    console.log('- pnpm --filter @repo/database seed:ecommerce  # Full e-commerce data');

    // Check if we should run product seeding
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      console.log('');
      console.log('📦 No products found. Running basic product seeding...');
      await seedProducts();
    }

    // Check if this is a full seed run (SEED_ALL environment variable)
    if (process.env.SEED_ALL === 'true') {
      console.log('');
      console.log('🛍️ Running full e-commerce seeding...');
      await seedEcommerce();
    }
  }

  console.log('');
  console.log('🌱 Seed completed!');
}

void (async () => {
  await main()
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
})();
