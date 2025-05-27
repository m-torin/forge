/**
 * Script to create initial admin user using Better Auth
 * Run with: pnpm tsx scripts/create-admin.ts
 */

async function createAdminUser() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';

  try {
    // Use Better Auth's sign-up endpoint
    const response = await fetch('http://localhost:3350/api/auth/sign-up/email', {
      body: JSON.stringify({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to create admin user:', data);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

    // Now update the user role to super-admin
    // This would need to be done directly in the database
    // or through an admin API endpoint
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Note: This script requires the backstage app to be running
console.log('Make sure the backstage app is running on port 3350...');
setTimeout(createAdminUser, 2000);
