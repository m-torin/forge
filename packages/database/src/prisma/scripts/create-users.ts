/**
 * Creates users through Better Auth API
 * This ensures passwords are hashed correctly
 *
 * Run with: pnpm tsx scripts/create-users.ts
 * Make sure backstage app is running first!
 */

import { PrismaClient } from '../../../prisma-generated/client';

const prisma = new PrismaClient();

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

async function createUsersThroughAuth() {
  // eslint-disable-next-line no-console
  console.log('📝 Creating users through Better Auth...');
  // eslint-disable-next-line no-console
  console.log('Make sure backstage is running on http://localhost:3300');
  // eslint-disable-next-line no-console
  console.log('');

  for (const userData of users) {
    try {
      // eslint-disable-next-line no-console
      console.log(`Creating ${userData.email}...`);

      // First, check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        // eslint-disable-next-line no-console
        console.log(`  ℹ️  User already exists`);

        // Update role if needed
        if (existingUser.role !== userData.role) {
          await prisma.user.update({
            data: { role: userData.role },
            where: { email: userData.email },
          });
          // eslint-disable-next-line no-console
          console.log(`  ✅ Updated role to ${userData.role}`);
        }
        continue;
      }

      // Create user through Better Auth sign-up
      const response = await fetch('http://localhost:3300/api/auth/sign-up/email', {
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

      const result = await response.json();

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error(`  ❌ Failed to create user:`, result);
        continue;
      }

      // eslint-disable-next-line no-console
      console.log(`  ✅ User created successfully`);

      // Update the user role
      await prisma.user.update({
        data: { role: userData.role },
        where: { email: userData.email },
      });
      // eslint-disable-next-line no-console
      console.log(`  ✅ Updated role to ${userData.role}`);

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
          // eslint-disable-next-line no-console
          console.log(`  ✅ Added to default organization`);
        }
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(`  ❌ Error creating ${userData.email}: `, error);
    }
  }

  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('✅ User creation completed!');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('You can now sign in with:');
  // eslint-disable-next-line no-console
  console.log('  Admin: admin@example.com / admin123');
  // eslint-disable-next-line no-console
  console.log('  User: user@example.com / user1234');
}

void (async () => {
  try {
    await createUsersThroughAuth();
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
