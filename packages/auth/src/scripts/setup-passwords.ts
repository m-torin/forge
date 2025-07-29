/**
 * Sets up passwords for existing users through Better Auth
 * This ensures passwords are properly hashed for authentication
 */

import { prisma } from '@repo/database/prisma';
import { logError, logInfo } from '@repo/observability';
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
  logInfo('🔑 Setting up passwords for existing users...');
  logInfo('');

  for (const userData of users) {
    try {
      logInfo(`Setting password for ${userData.email}...`);

      // Find the user in the database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!user) {
        logInfo(`  ❌ User not found: ${userData.email}`);
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
        logInfo(`  ✅ Password updated`);
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
        logInfo(`  ✅ Password created`);
      }

      // Update user to be email verified
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      logInfo(`  ✅ Email verified`);
    } catch (error: any) {
      logError(`  ❌ Error setting password for ${userData.email}:`, error.message || error);
    }
  }

  logInfo('');
  logInfo('✅ Password setup completed!');
  logInfo('');
  logInfo('You can now login with:');
  logInfo('  Admin: admin@example.com / admin123');
  logInfo('  User: user@example.com / user1234');
}

void (async () => {
  try {
    await setupPasswords();
  } catch (error: any) {
    logError(error);
  } finally {
    await prisma.$disconnect();
  }
})();
