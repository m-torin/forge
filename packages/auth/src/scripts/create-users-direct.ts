/**
 * Creates users directly through database and Better Auth admin actions
 * This bypasses the need for signup endpoints
 */

import { prisma } from '@repo/database/prisma';
import { logError, logInfo } from '@repo/observability';
import { createUserAction } from '../server/admin-management';

interface UserToCreate {
  email: string;
  name: string;
  password: string;
  role: string;
}

const users: UserToCreate[] = [
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

async function createUsersDirectly() {
  logInfo('📝 Creating users directly through Better Auth admin functions...');

  logInfo('');

  for (const userData of users) {
    try {
      logInfo(`Creating ${userData.email}...`);

      // First, check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        logInfo(`  ℹ️  User already exists`);

        // Update role if needed
        if (existingUser.role !== userData.role) {
          await prisma.user.update({
            data: { role: userData.role },
            where: { email: userData.email },
          });

          logInfo(`  ✅ Updated role to ${userData.role}`);
        }
        continue;
      }

      // Create user through Better Auth admin function
      const result = await createUserAction({
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role,
      });

      if (!result.success) {
        logError(`  ❌ Failed to create user:`, result.error);
        continue;
      }

      logInfo(`  ✅ User created successfully`);

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

          logInfo(`  ✅ Added to default organization`);
        }
      }
    } catch (error: any) {
      logError(`  ❌ Error creating ${userData.email}: `, error.message || error);
    }
  }

  logInfo('');

  logInfo('✅ User creation completed!');

  logInfo('');

  logInfo('You can now sign in with:');

  logInfo('  Admin: admin@example.com / admin123');

  logInfo('  User: user@example.com / user1234');
}

void (async () => {
  try {
    await createUsersDirectly();
  } catch (error: any) {
    logError(error);
  } finally {
    await prisma.$disconnect();
  }
})();
