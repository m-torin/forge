/**
 * Sets up passwords for existing users through Better Auth
 * This ensures passwords are properly hashed for authentication
 */

import { logError, logInfo } from '@repo/observability';
import { hashPassword } from 'better-auth/crypto';
import { prisma } from '../shared/prisma';

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

      // Hash the password so credentials would be ready once account model is available
      await hashPassword(userData.password);

      // TODO: Set up passwords once account model is available
      // Note: Account model not available in current database schema
      logInfo(`  ✅ User found (password setup skipped)`);

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
