import { logInfo } from '@repo/observability';
import { hashPassword } from 'better-auth/crypto';
import { PrismaClient } from '../../../../prisma-generated/client';

const prisma = new PrismaClient();

interface UserToCreate {
  email: string;
  name: string;
  password: string;
  role: string;
}

const defaultUsers: UserToCreate[] = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'admin123',
    role: 'super-admin',
  },
  {
    email: 'user@example.com',
    name: 'Test User',
    password: 'user1234',
    role: 'user',
  },
];

/**
 * Creates users through Better Auth API or directly in database
 */
async function createUsers() {
  if (process.env.SEED_SKIP_USER_CREATION === 'true') {
    logInfo('⏭️  Skipping user creation (SEED_SKIP_USER_CREATION=true)');
    return;
  }

  logInfo('👥 Creating users...');

  for (const userData of defaultUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`ℹ️  User ${userData.email} already exists`);

        // Update role if needed
        if (existingUser.role !== userData.role) {
          await prisma.user.update({
            data: { role: userData.role },
            where: { email: userData.email },
          });

          console.log(`   ✅ Updated role to ${userData.role}`);
        }
        continue;
      }

      // Try to create through Better Auth API if available
      const betterAuthUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3300';
      let userCreated = false;

      if (process.env.BETTER_AUTH_URL || process.env.NODE_ENV !== 'production') {
        try {
          console.log(`   Attempting to create ${userData.email} via Better Auth API...`);

          const response = await fetch(`${betterAuthUrl}/api/auth/sign-up/email`, {
            body: JSON.stringify({
              email: userData.email,
              name: userData.name,
              password: userData.password,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          });

          if (response.ok) {
            userCreated = true;

            console.log(`   ✅ User created via Better Auth API`);

            // Update the user role
            await prisma.user.update({
              data: { role: userData.role },
              where: { email: userData.email },
            });

            console.log(`   ✅ Updated role to ${userData.role}`);
          }
        } catch (_error) {
          // API call failed, will fall back to direct creation

          console.log(`   ⚠️  Better Auth API not available, using direct creation`);
        }
      }

      // Fall back to direct database creation
      if (!userCreated) {
        console.log(`   Creating ${userData.email} directly in database...`);

        // Create user
        const user = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            email: userData.email,
            name: userData.name,
            role: userData.role,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Hash password and create account record
        const hashedPassword = await hashPassword(userData.password);
        await prisma.account.create({
          data: {
            id: crypto.randomUUID(),
            accountId: user.id,
            providerId: 'credential',
            password: hashedPassword,
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        console.log(`   ✅ User created with password`);
      }

      // Add to default organization
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      const defaultOrg = await prisma.organization.findFirst({
        where: { slug: 'default-org' },
      });

      if (user && defaultOrg) {
        const existingMember = await prisma.member.findFirst({
          where: {
            organizationId: defaultOrg.id,
            userId: user.id,
          },
        });

        if (!existingMember) {
          await prisma.member.create({
            data: {
              createdAt: new Date(),
              id: crypto.randomUUID(),
              organizationId: defaultOrg.id,
              role: 'owner',
              userId: user.id,
            },
          });

          console.log(`   ✅ Added to default organization`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Error creating ${userData.email}:`, error.message || error);
    }
  }

  console.log('');
}

/**
 * Creates test API keys for development and testing
 */
async function createTestApiKeys() {
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

    console.log('✅ Created admin API key:', adminApiKey.name);

    console.log('   Key:', adminApiKey.key);
  } else {
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

    console.log('✅ Created user API key:', userApiKey.name);

    console.log('   Key:', userApiKey.key);
  } else {
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

    console.log('✅ Created service API key:', serviceApiKey.name);

    console.log('   Key:', serviceApiKey.key);
  } else {
    console.log('ℹ️  Service API key already exists');
  }

  console.log('');

  console.log('🔑 API Key Summary:');

  console.log('   Admin Key: Full access for admin user');

  console.log('   User Key: Limited access for regular user');

  console.log('   Service Key: Service-to-service authentication');

  console.log('');
}

/**
 * Creates the default organization for development
 */
async function createDefaultOrganization() {
  console.log('🏢 Creating default organization...');

  const existingOrg = await prisma.organization.findFirst({
    where: { slug: 'default-org' },
  });

  if (!existingOrg) {
    const defaultOrg = await prisma.organization.create({
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

    console.log('✅ Created default organization:', defaultOrg.name);
    return defaultOrg;
  } else {
    console.log('ℹ️  Default organization already exists');
    return existingOrg;
  }
}

/**
 * Creates the test organization for API testing
 */
async function createTestOrganization() {
  console.log('🧪 Creating test organization...');

  const existingTestOrg = await prisma.organization.findFirst({
    where: { slug: 'test-org' },
  });

  if (!existingTestOrg) {
    const testOrg = await prisma.organization.create({
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

    console.log('✅ Created test organization:', testOrg.name);
    return testOrg;
  } else {
    console.log('ℹ️  Test organization already exists');
    return existingTestOrg;
  }
}

/**
 * Main auth seeding function
 */
export async function seedAuth() {
  try {
    console.log('🔐 Starting auth seeding...');

    console.log('');

    // Create users first (if needed)
    await createUsers();

    // Create organizations
    await createDefaultOrganization();
    await createTestOrganization();

    // Create test API keys for development
    await createTestApiKeys();

    console.log('🔐 Auth seeding completed!');

    console.log('');
  } catch (error) {
    console.error('❌ Auth seeding failed:', error);
    throw error;
  }
}

// Allow direct execution for testing
async function main() {
  try {
    await seedAuth();
  } catch (error: any) {
    console.error('❌ Auth seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
