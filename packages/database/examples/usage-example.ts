/**
 * This example demonstrates how to use both Prisma and Firestore in the same application.
 *
 * Note: This is for demonstration purposes only and is not meant to be executed directly.
 */

import { database } from '@repo/database';
import { Database } from '@repo/database/database';
import { prisma } from '@repo/database/prisma';
import { firestore } from '@repo/database/firestore';
import { DatabaseProvider } from '@repo/database/types';

// Example: Using the abstraction layer
async function usingAbstractionLayer() {
  // Create a user using the current provider (determined by DATABASE_PROVIDER env var)
  const user = await database.create('user', {
    name: 'John Doe',
    email: 'john@example.com',
  });

  // Find users with the abstraction layer
  const users = await database.findMany('user', {
    where: {
      active: true,
    },
    take: 10,
  });

  console.log('Users:', users);
}

// Example: Using Prisma directly
async function usingPrismaDirectly() {
  // Use Prisma client directly for Prisma-specific features
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
      members: {
        include: {
          organization: true,
        },
      },
    },
    where: {
      active: true,
    },
    take: 10,
  });

  console.log('Users with Prisma:', users);
}

// Example: Using Firestore directly
async function usingFirestoreDirectly() {
  // Use Firestore client directly for Firestore-specific features
  const usersRef = firestore.collection('users');
  const snapshot = await usersRef.where('active', '==', true).limit(10).get();

  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log('Users with Firestore:', users);
}

// Example: Switching providers at runtime
async function switchingProviders() {
  // Cast to Database type to access provider methods
  const db = database as Database;

  // Get current provider
  const currentProvider = db.getProvider();
  console.log('Current provider:', currentProvider);

  // Use current provider
  const usersWithCurrentProvider = await db.findMany('user', { take: 5 });
  console.log(`Users with ${currentProvider}:`, usersWithCurrentProvider);

  // Switch to the other provider
  const newProvider: DatabaseProvider = currentProvider === 'prisma' ? 'firestore' : 'prisma';
  await db.setProvider(newProvider);
  console.log(`Switched to ${newProvider}`);

  // Use new provider
  const usersWithNewProvider = await db.findMany('user', { take: 5 });
  console.log(`Users with ${newProvider}:`, usersWithNewProvider);

  // Switch back to original provider
  await db.setProvider(currentProvider);
}

// Example: Conditional logic based on provider
async function conditionalLogic() {
  // Cast to Database type to access provider methods
  const db = database as Database;
  const provider = db.getProvider();

  if (provider === 'prisma') {
    // Prisma-specific logic
    await usingPrismaDirectly();
  } else {
    // Firestore-specific logic
    await usingFirestoreDirectly();
  }
}

// Example: Error handling
async function errorHandling() {
  try {
    const user = await database.findUnique('user', {
      where: { id: 'non-existent-id' },
    });

    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

// Main function to demonstrate all examples
async function main() {
  console.log('=== Using Abstraction Layer ===');
  await usingAbstractionLayer();

  console.log('\n=== Using Prisma Directly ===');
  await usingPrismaDirectly();

  console.log('\n=== Using Firestore Directly ===');
  await usingFirestoreDirectly();

  console.log('\n=== Switching Providers ===');
  await switchingProviders();

  console.log('\n=== Conditional Logic ===');
  await conditionalLogic();

  console.log('\n=== Error Handling ===');
  await errorHandling();
}

// This would execute the examples if this were a real script
// main().catch(console.error);
