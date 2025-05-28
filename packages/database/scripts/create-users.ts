/**
 * Creates users through Better Auth API
 * This ensures passwords are hashed correctly
 *
 * Run with: pnpm tsx scripts/create-users.ts
 * Make sure backstage app is running first!
 */

import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

interface UserToCreate {
  email: string;
  name: string;
  password: string;
  role: string;
}

const users: UserToCreate[] = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'super-admin',
  },
  {
    name: 'Test User',
    email: 'user@example.com',
    password: 'user1234',
    role: 'user',
  },
];

async function createUsersThroughAuth() {
  console.log('📝 Creating users through Better Auth...');
  console.log('Make sure backstage is running on http://localhost:3350');
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

      // Create user through Better Auth sign-up
      const response = await fetch('http://localhost:3350/api/auth/sign-up/email', {
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`  ❌ Failed to create user:`, result);
        continue;
      }

      console.log(`  ✅ User created successfully`);

      // Update the user role
      await prisma.user.update({
        data: { role: userData.role },
        where: { email: userData.email },
      });
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
              id: crypto.randomUUID(),
              createdAt: new Date(),
              organizationId: defaultOrg.id,
              role: 'owner',
              userId: user.id,
            },
          });
          console.log(`  ✅ Added to default organization`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error creating ${userData.email}:`, error);
    }
  }

  console.log('');
  console.log('✅ User creation completed!');
  console.log('');
  console.log('You can now sign in with:');
  console.log('  Admin: admin@example.com / admin123');
  console.log('  User: user@example.com / user123');
}

void createUsersThroughAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
