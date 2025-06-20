/**
 * Script to create a default admin user for backstage access
 * Run from backstage app directory: pnpm tsx scripts/create-default-user.ts
 */

import { createUserAction } from '@repo/auth/server/next';

async function createDefaultUser() {
  console.log('Creating default admin user...');

  const defaultUser = {
    email: 'admin@localhost',
    name: 'Admin User',
    password: 'admin123',
    role: 'super-admin' as const,
  };

  try {
    const result = await createUserAction(defaultUser);

    if (result.success) {
      console.log('✅ Default admin user created successfully!');
      console.log('📧 Email:', defaultUser.email);
      console.log('🔑 Password:', defaultUser.password);
      console.log('👤 Role:', defaultUser.role);
      console.log('\n🚀 You can now log into backstage with these credentials');
    } else {
      console.error('❌ Failed to create default user:', result.error);
      if (result.error?.includes('already exists') || result.error?.includes('duplicate')) {
        console.log('ℹ️  User might already exist. Try logging in with:');
        console.log('📧 Email:', defaultUser.email);
        console.log('🔑 Password:', defaultUser.password);
      }
    }
  } catch (error) {
    console.error('❌ Error creating default user:', error);
    process.exit(1);
  }
}

// Run the script
createDefaultUser()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
