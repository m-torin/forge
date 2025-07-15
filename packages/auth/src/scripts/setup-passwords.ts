/**
 * Sets up passwords for existing users through Better Auth
 * This ensures passwords are properly hashed for authentication
 */

import { prisma } from '@repo/database/prisma';
import { hashPassword } from 'better-auth/crypto';

interface UserWithPassword {
  email: string;
  password: string;
}

const users: UserWithPassword[] = [
  {
    email: 'admin@example.com',
    password: 'admin123',
  },
  {
    email: 'user@example.com',
    password: 'user1234',
  },
];

async function setupPasswords() {
  console.log('🔑 Setting up passwords for existing users...');
  console.log('');

  for (const userData of users) {
    try {
      console.log(`Setting password for ${userData.email}...`);

      // Find the user in the database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!user) {
        console.log(`  ❌ User not found: ${userData.email}`);
        continue;
      }

      // Hash the password
      const hashedPassword = await hashPassword(userData.password);

      // Check if user already has an account (password record)
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      });

      if (existingAccount) {
        // Update existing password
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { password: hashedPassword },
        });
        console.log(`  ✅ Password updated`);
      } else {
        // Create new password account
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
        console.log(`  ✅ Password created`);
      }

      // Update user to be email verified
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      console.log(`  ✅ Email verified`);
    } catch (error: any) {
      console.error(`  ❌ Error setting password for ${userData.email}:`, error.message || error);
    }
  }

  console.log('');
  console.log('✅ Password setup completed!');
  console.log('');
  console.log('You can now login with:');
  console.log('  Admin: admin@example.com / admin123');
  console.log('  User: user@example.com / user1234');
}

void (async () => {
  try {
    await setupPasswords();
  } catch (error: any) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
