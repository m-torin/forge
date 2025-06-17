import { PrismaClient } from '../../prisma-generated/client';

import { seedEcommerce } from './seed-ecommerce';
import { seedProducts } from './seed-products';

const prisma = new PrismaClient();

/**
 * Creates test API keys for development and testing
 */
async function createTestApiKeys() {
  // eslint-disable-next-line no-console
  console.log('🔑 Creating test API keys...');

  // Find the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  // Find the test user
  const testUser = await prisma.user.findUnique({
    where: { email: 'user@example.com' },
  });

  // Find the test organization
  const testOrg = await prisma.organization.findFirst({
    where: { slug: 'test-org' },
  });

  if (!adminUser || !testUser || !testOrg) {
    // eslint-disable-next-line no-console
    console.log('⚠️  Skipping API key creation - missing required users or organization');
    return;
  }

  // Create admin API key
  const existingAdminKey = await prisma.apiKey.findFirst({
    where: {
      userId: adminUser.id,
      name: 'Test Admin Key',
    },
  });

  if (!existingAdminKey) {
    const adminApiKey = await prisma.apiKey.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test Admin Key',
        start: 'forge',
        prefix: 'adm',
        key: 'forge_adm_test_admin_key_' + crypto.randomUUID().replace(/-/g, ''),
        keyHash: 'test_hash_admin', // In production, this would be properly hashed
        userId: adminUser.id,
        organizationId: testOrg.id,
        enabled: true,
        rateLimitEnabled: true,
        rateLimitTimeWindow: 60, // 1 minute
        rateLimitMax: 100, // 100 requests per minute
        requestCount: 0,
        remaining: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: JSON.stringify(['admin:*', 'api:*', 'users:*', 'organizations:*']),
        metadata: {
          type: 'admin',
          environment: 'development',
          purpose: 'testing',
          createdBy: 'seed-script',
        },
      },
    });
    // eslint-disable-next-line no-console
    console.log('✅ Created admin API key:', adminApiKey.name);
    // eslint-disable-next-line no-console
    console.log('   Key:', adminApiKey.key);
  } else {
    // eslint-disable-next-line no-console
    console.log('ℹ️  Admin API key already exists');
  }

  // Create user API key
  const existingUserKey = await prisma.apiKey.findFirst({
    where: {
      userId: testUser.id,
      name: 'Test User Key',
    },
  });

  if (!existingUserKey) {
    const userApiKey = await prisma.apiKey.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test User Key',
        start: 'forge',
        prefix: 'usr',
        key: 'forge_usr_test_user_key_' + crypto.randomUUID().replace(/-/g, ''),
        keyHash: 'test_hash_user', // In production, this would be properly hashed
        userId: testUser.id,
        organizationId: testOrg.id,
        enabled: true,
        rateLimitEnabled: true,
        rateLimitTimeWindow: 60, // 1 minute
        rateLimitMax: 50, // 50 requests per minute
        requestCount: 0,
        remaining: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: JSON.stringify(['read:*', 'user:profile']),
        metadata: {
          type: 'user',
          environment: 'development',
          purpose: 'testing',
          createdBy: 'seed-script',
        },
      },
    });
    // eslint-disable-next-line no-console
    console.log('✅ Created user API key:', userApiKey.name);
    // eslint-disable-next-line no-console
    console.log('   Key:', userApiKey.key);
  } else {
    // eslint-disable-next-line no-console
    console.log('ℹ️  User API key already exists');
  }

  // Create service API key for testing service-to-service auth
  const existingServiceKey = await prisma.apiKey.findFirst({
    where: {
      userId: adminUser.id,
      name: 'Test Service Key',
    },
  });

  if (!existingServiceKey) {
    const serviceApiKey = await prisma.apiKey.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test Service Key',
        start: 'forge',
        prefix: 'svc',
        key: 'forge_svc_test_service_key_' + crypto.randomUUID().replace(/-/g, ''),
        keyHash: 'test_hash_service', // In production, this would be properly hashed
        userId: adminUser.id,
        organizationId: testOrg.id,
        enabled: true,
        rateLimitEnabled: true,
        rateLimitTimeWindow: 60, // 1 minute
        rateLimitMax: 1000, // 1000 requests per minute for service
        requestCount: 0,
        remaining: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: JSON.stringify(['service:*', 'api:*']),
        metadata: {
          type: 'service',
          serviceId: 'test-service',
          environment: 'development',
          purpose: 'service-to-service-testing',
          createdBy: 'seed-script',
        },
      },
    });
    // eslint-disable-next-line no-console
    console.log('✅ Created service API key:', serviceApiKey.name);
    // eslint-disable-next-line no-console
    console.log('   Key:', serviceApiKey.key);
  } else {
    // eslint-disable-next-line no-console
    console.log('ℹ️  Service API key already exists');
  }

  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('🔑 API Key Summary:');
  // eslint-disable-next-line no-console
  console.log('   Admin Key: Full access for admin user');
  // eslint-disable-next-line no-console
  console.log('   User Key: Limited access for regular user');
  // eslint-disable-next-line no-console
  console.log('   Service Key: Service-to-service authentication');
  // eslint-disable-next-line no-console
  console.log('');
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('🌱 Starting database seed...');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('This seed script creates basic data structure.');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('To create users, you have two options:');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('Option 1: Use Better Auth sign-up (RECOMMENDED)');
  // eslint-disable-next-line no-console
  console.log('1. Make sure backstage is running: pnpm dev --filter=backstage');
  // eslint-disable-next-line no-console
  console.log('2. Go to http://localhost:3350/sign-up');
  // eslint-disable-next-line no-console
  console.log('3. Create account with email: admin@example.com, password: admin123');
  // eslint-disable-next-line no-console
  console.log(
    "4. Update user role in database: UPDATE \"user\" SET role = 'super-admin' WHERE email = 'admin@example.com';",
  );
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('Option 2: Run the create-users script after backstage is running');
  // eslint-disable-next-line no-console
  console.log('pnpm --filter @repo/database create-users');
  // eslint-disable-next-line no-console
  console.log('');

  // Create a default organization that can be used later
  const existingOrg = await prisma.organization.findFirst({
    where: { slug: 'default-org' },
  });

  let defaultOrg = existingOrg;

  if (!existingOrg) {
    defaultOrg = await prisma.organization.create({
      data: {
        createdAt: new Date(),
        id: crypto.randomUUID(),
        name: 'Default Organization',
        slug: 'default-org',
        description: 'Default organization for testing and development',
        metadata: {
          environment: 'development',
          seedData: true,
        },
      },
    });
    // eslint-disable-next-line no-console
    console.log('✅ Created default organization: ', defaultOrg.name);
  } else {
    // eslint-disable-next-line no-console
    console.log('ℹ️  Default organization already exists');
  }

  // Create a test organization for API testing
  const existingTestOrg = await prisma.organization.findFirst({
    where: { slug: 'test-org' },
  });

  let testOrg = existingTestOrg;

  if (!existingTestOrg) {
    testOrg = await prisma.organization.create({
      data: {
        createdAt: new Date(),
        id: crypto.randomUUID(),
        name: 'Test Organization',
        slug: 'test-org',
        description: 'Organization for API testing and development',
        metadata: {
          environment: 'test',
          seedData: true,
          purpose: 'api-testing',
        },
      },
    });
    // eslint-disable-next-line no-console
    console.log('✅ Created test organization: ', testOrg.name);
  } else {
    // eslint-disable-next-line no-console
    console.log('ℹ️  Test organization already exists');
  }

  // Check if we have users to determine what to seed
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('⚠️  No users found. Please create users first before running additional seeds.');
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('After creating users, you can run:');
    // eslint-disable-next-line no-console
    console.log('- pnpm --filter @repo/database seed:products   # Basic product data');
    // eslint-disable-next-line no-console
    console.log('- pnpm --filter @repo/database seed:ecommerce  # Full e-commerce data');
  } else {
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log(`📊 Found ${userCount} users in the database.`);

    // Create test API keys for development
    await createTestApiKeys();

    // eslint-disable-next-line no-console
    console.log('Additional seeding options:');
    // eslint-disable-next-line no-console
    console.log('- pnpm --filter @repo/database seed:products   # Basic product data');
    // eslint-disable-next-line no-console
    console.log('- pnpm --filter @repo/database seed:ecommerce  # Full e-commerce data');

    // Check if we should run product seeding
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      // eslint-disable-next-line no-console
      console.log('');
      // eslint-disable-next-line no-console
      console.log('📦 No products found. Running basic product seeding...');
      await seedProducts();
    }

    // Check if this is a full seed run (SEED_ALL environment variable)
    if (process.env.SEED_ALL === 'true') {
      // eslint-disable-next-line no-console
      console.log('');
      // eslint-disable-next-line no-console
      console.log('🛍️ Running full e-commerce seeding...');
      await seedEcommerce();
    }
  }

  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('🌱 Seed completed!');
}

void (async () => {
  await main()
    .catch((e: any) => {
      // eslint-disable-next-line no-console
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
})();
