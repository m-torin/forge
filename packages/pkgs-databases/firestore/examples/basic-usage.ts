/**
 * Basic Firestore usage examples
 */

import { createFirestoreOperations } from '../src/operations';
import { createServerClient } from '../src/server';
import type { FirestoreConfig } from '../src/types';

// Configuration
const config: FirestoreConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
  keyFilename: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './service-account-key.json',
};

// Create client
const firestore = createServerClient(config);

// Create operations helpers
const operations = createFirestoreOperations(firestore);

/**
 * Basic CRUD Operations
 */
export async function basicCrudExample() {
  console.log('🔥 Basic Firestore CRUD Example');

  try {
    // Create a user
    console.log('\n1. Creating user...');
    const userResult = await operations.users.createUser({
      email: 'john.doe@example.com',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      metadata: {
        signupSource: 'web',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      },
    });

    if (!userResult.success) {
      throw new Error(`Failed to create user: ${userResult.error}`);
    }

    console.log('✅ User created:', userResult.data);
    const userId = userResult.data.id;

    // Read the user
    console.log('\n2. Reading user...');
    const user = await firestore.doc(`users/${userId}`).get();

    if (user.exists()) {
      console.log('✅ User found:', { id: user.id, ...user.data() });
    } else {
      console.log('❌ User not found');
    }

    // Update the user
    console.log('\n3. Updating user...');
    const updateResult = await operations.users.updateUserProfile(userId, {
      name: 'John Smith',
      metadata: {
        lastLogin: new Date(),
      },
    });

    if (updateResult.success) {
      console.log('✅ User updated successfully');
    } else {
      console.log('❌ Failed to update user:', updateResult.error);
    }

    // Query users
    console.log('\n4. Querying active users...');
    const activeUsersSnapshot = await firestore
      .collection('users')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    console.log(`✅ Found ${activeUsersSnapshot.size} active users`);
    activeUsersSnapshot.docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.data().name} (${doc.id})`);
    });

    // Delete the user (soft delete)
    console.log('\n5. Deactivating user...');
    const deactivateResult = await operations.users.deactivateUser(userId);

    if (deactivateResult.success) {
      console.log('✅ User deactivated successfully');
    } else {
      console.log('❌ Failed to deactivate user:', deactivateResult.error);
    }
  } catch (error) {
    console.error('❌ Error in basic CRUD example:', error);
  }
}

/**
 * Content Management Example
 */
export async function contentManagementExample() {
  console.log('\n📝 Content Management Example');

  try {
    // Create content
    console.log('\n1. Creating blog post...');
    const contentResult = await operations.content.createContent({
      title: 'Getting Started with Firestore',
      body: "Firestore is a NoSQL document database built for automatic scaling, high performance, and ease of application development. In this post, we'll explore how to use Firestore effectively in your applications.",
      type: 'post',
      authorId: 'user-123',
      tags: ['firestore', 'database', 'tutorial'],
      published: true,
    });

    if (!contentResult.success) {
      throw new Error(`Failed to create content: ${contentResult.error}`);
    }

    console.log('✅ Content created:', contentResult.data);

    // Search content
    console.log('\n2. Searching for content...');
    const searchResult = await operations.content.searchContent('firestore', {
      type: 'post',
      limit: 5,
    });

    if (searchResult.success) {
      console.log(`✅ Found ${searchResult.data.length} matching posts`);
      searchResult.data.forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.title} (${post.wordCount} words)`);
      });
    } else {
      console.log('❌ Search failed:', searchResult.error);
    }

    // Get published content with pagination
    console.log('\n3. Getting published content...');
    const publishedResult = await operations.content.getPublishedContent({
      type: 'post',
      limit: 5,
    });

    if (publishedResult.success) {
      console.log(`✅ Found ${publishedResult.data.docs.length} published posts`);
      console.log(`   Has more: ${publishedResult.data.hasMore}`);

      publishedResult.data.docs.forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.title} (${post.readingTime} min read)`);
      });
    } else {
      console.log('❌ Failed to get published content:', publishedResult.error);
    }
  } catch (error) {
    console.error('❌ Error in content management example:', error);
  }
}

/**
 * Analytics Tracking Example
 */
export async function analyticsExample() {
  console.log('\n📊 Analytics Tracking Example');

  try {
    // Track page view
    console.log('\n1. Tracking page view...');
    const pageViewResult = await operations.analytics.trackPageView({
      path: '/blog/getting-started-with-firestore',
      userId: 'user-123',
      sessionId: 'session-456',
      userAgent: 'Mozilla/5.0...',
      referrer: 'https://google.com',
    });

    if (pageViewResult.success) {
      console.log('✅ Page view tracked');
    } else {
      console.log('❌ Failed to track page view:', pageViewResult.error);
    }

    // Track custom event
    console.log('\n2. Tracking custom event...');
    const eventResult = await operations.analytics.trackEvent({
      event: 'button_click',
      category: 'engagement',
      label: 'subscribe_newsletter',
      value: 1,
      userId: 'user-123',
      sessionId: 'session-456',
      metadata: {
        buttonPosition: 'header',
        pageUrl: '/blog/getting-started-with-firestore',
      },
    });

    if (eventResult.success) {
      console.log('✅ Event tracked');
    } else {
      console.log('❌ Failed to track event:', eventResult.error);
    }

    // Get analytics data
    console.log('\n3. Retrieving analytics data...');
    const analyticsResult = await operations.analytics.getAnalytics({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      metric: 'pageviews',
    });

    if (analyticsResult.success) {
      console.log(`✅ Retrieved ${analyticsResult.data.length} analytics records`);
      analyticsResult.data.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.date}: ${record.count} views`);
      });
    } else {
      console.log('❌ Failed to get analytics:', analyticsResult.error);
    }
  } catch (error) {
    console.error('❌ Error in analytics example:', error);
  }
}

/**
 * Session Management Example
 */
export async function sessionManagementExample() {
  console.log('\n🔐 Session Management Example');

  try {
    // Create session
    console.log('\n1. Creating user session...');
    const sessionResult = await operations.sessions.createSession({
      userId: 'user-123',
      deviceInfo: {
        userAgent: 'Mozilla/5.0...',
        ip: '192.168.1.1',
        location: 'San Francisco, CA',
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    if (!sessionResult.success) {
      throw new Error(`Failed to create session: ${sessionResult.error}`);
    }

    console.log('✅ Session created:', sessionResult.data);
    const sessionToken = sessionResult.data.token;

    // Validate session
    console.log('\n2. Validating session...');
    const validationResult = await operations.sessions.validateSession(sessionToken);

    if (validationResult.success) {
      console.log('✅ Session is valid');
      console.log('   User ID:', validationResult.data.userId);
      console.log('   Created:', validationResult.data.createdAt);
      console.log('   Expires:', validationResult.data.expiresAt);
    } else {
      console.log('❌ Session validation failed:', validationResult.error);
    }

    // Invalidate session
    console.log('\n3. Invalidating session...');
    const invalidationResult = await operations.sessions.invalidateSession(sessionToken);

    if (invalidationResult.success) {
      console.log('✅ Session invalidated');
    } else {
      console.log('❌ Failed to invalidate session:', invalidationResult.error);
    }

    // Try to validate invalidated session
    console.log('\n4. Validating invalidated session...');
    const revalidationResult = await operations.sessions.validateSession(sessionToken);

    if (revalidationResult.success) {
      console.log('❌ Session should be invalid but validation passed');
    } else {
      console.log('✅ Session correctly invalidated:', revalidationResult.error);
    }
  } catch (error) {
    console.error('❌ Error in session management example:', error);
  }
}

/**
 * Batch Operations Example
 */
export async function batchOperationsExample() {
  console.log('\n📦 Batch Operations Example');

  try {
    // Batch write operations
    console.log('\n1. Performing batch writes...');
    const batch = firestore.batch();

    // Create multiple users in a batch
    const users = [
      { name: 'Alice Johnson', email: 'alice@example.com' },
      { name: 'Bob Wilson', email: 'bob@example.com' },
      { name: 'Carol Davis', email: 'carol@example.com' },
    ];

    const userRefs = users.map(() => firestore.collection('users').doc());

    users.forEach((userData, index) => {
      batch.set(userRefs[index], {
        ...userData,
        createdAt: new Date(),
        status: 'active',
      });
    });

    await batch.commit();
    console.log('✅ Batch write completed for', users.length, 'users');

    // Batch read operations
    console.log('\n2. Performing batch reads...');
    const docs = await firestore.getAll(...userRefs);

    console.log(`✅ Read ${docs.length} documents:`);
    docs.forEach((doc, index) => {
      if (doc.exists) {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data?.name} (${doc.id})`);
      }
    });

    // Transaction example
    console.log('\n3. Performing transaction...');
    const counterResult = await firestore.runTransaction(async transaction => {
      const counterRef = firestore.doc('counters/users');
      const counterDoc = await transaction.get(counterRef);

      const currentCount = counterDoc.exists ? counterDoc.data()?.count || 0 : 0;
      const newCount = currentCount + users.length;

      transaction.set(counterRef, { count: newCount, updatedAt: new Date() });

      return newCount;
    });

    console.log('✅ Transaction completed. User count:', counterResult);

    // Cleanup - delete test users
    console.log('\n4. Cleaning up test data...');
    const cleanupBatch = firestore.batch();
    userRefs.forEach(ref => {
      cleanupBatch.delete(ref);
    });
    await cleanupBatch.commit();

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Error in batch operations example:', error);
  }
}

/**
 * Real-time Listeners Example
 */
export async function realtimeListenersExample() {
  console.log('\n🔔 Real-time Listeners Example');

  try {
    // Document listener
    console.log('\n1. Setting up document listener...');
    const userRef = firestore.doc('users/demo-user');

    const unsubscribeDoc = userRef.onSnapshot(
      snapshot => {
        if (snapshot.exists) {
          console.log('📄 Document updated:', {
            id: snapshot.id,
            data: snapshot.data(),
          });
        } else {
          console.log('📄 Document deleted');
        }
      },
      error => {
        console.error('❌ Document listener error:', error);
      },
    );

    // Collection listener
    console.log('\n2. Setting up collection listener...');
    const usersQuery = firestore
      .collection('users')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(5);

    const unsubscribeCollection = usersQuery.onSnapshot(
      snapshot => {
        console.log(`📚 Collection updated: ${snapshot.size} documents`);

        snapshot.docChanges().forEach(change => {
          const doc = change.doc;
          switch (change.type) {
            case 'added':
              console.log('  ➕ Added:', doc.data().name);
              break;
            case 'modified':
              console.log('  ✏️ Modified:', doc.data().name);
              break;
            case 'removed':
              console.log('  ➖ Removed:', doc.data().name);
              break;
          }
        });
      },
      error => {
        console.error('❌ Collection listener error:', error);
      },
    );

    // Simulate some changes
    console.log('\n3. Simulating document changes...');

    // Create user
    await userRef.set({
      name: 'Demo User',
      status: 'active',
      createdAt: new Date(),
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update user
    await userRef.update({
      name: 'Updated Demo User',
      updatedAt: new Date(),
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Delete user
    await userRef.delete();

    // Wait for final updates
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Cleanup listeners
    console.log('\n4. Cleaning up listeners...');
    unsubscribeDoc();
    unsubscribeCollection();

    console.log('✅ Listeners cleaned up');
  } catch (error) {
    console.error('❌ Error in real-time listeners example:', error);
  }
}

/**
 * Advanced Query Example
 */
export async function advancedQueryExample() {
  console.log('\n🔍 Advanced Query Example');

  try {
    // Compound queries
    console.log('\n1. Compound query example...');
    const compoundQuery = await firestore
      .collection('users')
      .where('status', '==', 'active')
      .where('age', '>=', 18)
      .where('interests', 'array-contains', 'technology')
      .orderBy('age')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    console.log(`✅ Compound query returned ${compoundQuery.size} results`);

    // Array queries
    console.log('\n2. Array query example...');
    const arrayQuery = await firestore
      .collection('posts')
      .where('tags', 'array-contains-any', ['javascript', 'typescript', 'node.js'])
      .orderBy('publishedAt', 'desc')
      .limit(5)
      .get();

    console.log(`✅ Array query returned ${arrayQuery.size} results`);

    // Range queries
    console.log('\n3. Range query example...');
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    const rangeQuery = await firestore
      .collection('analytics')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .where('pageViews', '>', 100)
      .orderBy('pageViews', 'desc')
      .limit(10)
      .get();

    console.log(`✅ Range query returned ${rangeQuery.size} results`);

    // Pagination example
    console.log('\n4. Pagination example...');
    let lastDoc = null;
    const pageSize = 3;
    let pageNumber = 1;

    do {
      let query = firestore
        .collection('users')
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(pageSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const pageSnapshot = await query.get();

      if (pageSnapshot.empty) {
        console.log('✅ No more pages');
        break;
      }

      console.log(`📄 Page ${pageNumber} (${pageSnapshot.size} items):`);
      pageSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.name} - ${data.createdAt?.toDate().toISOString()}`);
      });

      lastDoc = pageSnapshot.docs[pageSnapshot.docs.length - 1];
      pageNumber++;

      // Limit to prevent infinite loop in demo
      if (pageNumber > 3) {
        console.log('📄 Demo limited to 3 pages');
        break;
      }
    } while (true);

    console.log('✅ Pagination example completed');
  } catch (error) {
    console.error('❌ Error in advanced query example:', error);
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running Firestore Examples');
  console.log('================================');

  try {
    await basicCrudExample();
    await contentManagementExample();
    await analyticsExample();
    await sessionManagementExample();
    await batchOperationsExample();
    await realtimeListenersExample();
    await advancedQueryExample();

    console.log('\n🎉 All examples completed successfully!');
  } catch (error) {
    console.error('💥 Error running examples:', error);
  } finally {
    // Cleanup connection
    console.log('\n🔌 Terminating Firestore connection...');
    await firestore.terminate();
    console.log('✅ Connection terminated');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
