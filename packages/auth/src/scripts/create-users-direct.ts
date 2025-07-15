/**
 * Creates users directly through database and Better Auth admin actions
 * This bypasses the need for signup endpoints
 */

import { prisma } from '@repo/database/prisma';
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
  console.log('📝 Creating users directly through Better Auth admin functions...');

  console.log('');

  for (const userData of users) {
    try {
      console.log(`Creating ${userData.email}...`);

      // First, check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`  ℹ️  User already exists`);

        // Update role if needed
        if (existingUser.role !== userData.role) {
          await prisma.user.update({
            data: { role: userData.role },
            where: { email: userData.email },
          });

          console.log(`  ✅ Updated role to ${userData.role}`);
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
        console.error(`  ❌ Failed to create user:`, result.error);
        continue;
      }

      console.log(`  ✅ User created successfully`);

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

          console.log(`  ✅ Added to default organization`);
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Error creating ${userData.email}: `, error.message || error);
    }
  }

  console.log('');

  console.log('✅ User creation completed!');

  console.log('');

  console.log('You can now sign in with:');

  console.log('  Admin: admin@example.com / admin123');

  console.log('  User: user@example.com / user1234');
}

void (async () => {
  try {
    await createUsersDirectly();
  } catch (error: any) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
