import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  mockFirestoreAdapter,
  mockUpstashVectorAdapter,
  mockUpstashRedisAdapter,
  resetMockFirestoreStorage,
  resetMockVectorStorage,
  resetMockRedisStorage,
  DatabaseTestHelper,
  VectorDatabaseTestHelper,
  RedisDatabaseTestHelper,
  testDatabaseOperations,
  testDatabasePerformance,
  createTestUser,
  createTestVector,
  createTestUsers,
} from '@repo/testing/database';

// Mock all database modules
vi.mock('firebase-admin', async () => {
  const { mockFirebaseAdmin } = await import('@repo/testing/database');
  return mockFirebaseAdmin;
});

vi.mock('@upstash/vector', async () => {
  const { mockUpstashVector } = await import('@repo/testing/database');
  return mockUpstashVector;
});

vi.mock('@upstash/redis', async () => {
  const { mockUpstashRedis } = await import('@repo/testing/database');
  return mockUpstashRedis;
});

describe('Database Integration Tests', () => {
  let firestoreHelper: DatabaseTestHelper;
  let vectorHelper: VectorDatabaseTestHelper;
  let redisHelper: RedisDatabaseTestHelper;

  beforeEach(async () => {
    // Reset all storages
    resetMockFirestoreStorage();
    resetMockVectorStorage();
    resetMockRedisStorage();

    // Setup helpers
    firestoreHelper = new DatabaseTestHelper(mockFirestoreAdapter, {
      provider: 'firestore',
    });
    vectorHelper = new VectorDatabaseTestHelper(mockUpstashVectorAdapter as any);
    redisHelper = new RedisDatabaseTestHelper(mockUpstashRedisAdapter as any);

    await firestoreHelper.setup();
    await vectorHelper.setup();
    await redisHelper.setup();
  });

  afterEach(async () => {
    await firestoreHelper.cleanup();
    await vectorHelper.cleanup();
    await redisHelper.cleanup();

    resetMockFirestoreStorage();
    resetMockVectorStorage();
    resetMockRedisStorage();
  });

  describe('Multi-Database Operations', () => {
    it('should store related data across different databases', async () => {
      // Create a user in Firestore
      const user = createTestUser({ name: 'John Doe', email: 'john@example.com' });
      const firestoreUser = await firestoreHelper.getAdapter().create('users', user);

      // Store user session in Redis
      const sessionData = {
        userId: user.id,
        loginTime: Date.now(),
        isActive: true,
      };
      await redisHelper.getAdapter().setWithExpiration('sessions', user.id, sessionData, 3600);

      // Store user preferences as vector embeddings
      const preferencesVector = createTestVector({
        id: `preferences-${user.id}`,
        metadata: {
          userId: user.id,
          preferences: ['tech', 'programming', 'javascript'],
        },
      });
      await vectorHelper.getAdapter().create('preferences', preferencesVector);

      // Verify data consistency across databases
      expect(firestoreUser).toMatchObject(user);

      const redisSession = await redisHelper.getAdapter().findUnique('sessions', { id: user.id });
      expect(redisSession).toMatchObject(sessionData);

      const vectorPrefs = await vectorHelper.getAdapter().findUnique('preferences', {
        id: `preferences-${user.id}`,
      });
      expect((vectorPrefs as any)?.metadata.userId).toBe(user.id);
    });

    it('should handle complex workflow across databases', async () => {
      // Scenario: E-commerce user journey

      // 1. User registers (Firestore)
      const user = createTestUser({
        name: 'Alice Smith',
        email: 'alice@example.com',
        preferences: ['electronics', 'books'],
      });
      await firestoreHelper.getAdapter().create('users', user);

      // 2. Cache user session (Redis)
      await redisHelper
        .getAdapter()
        .setWithExpiration('sessions', user.id, { userId: user.id, cart: [] }, 1800);

      // 3. Store user behavior vector (Vector DB)
      const behaviorVector = createTestVector({
        id: `behavior-${user.id}`,
        metadata: {
          userId: user.id,
          categories: ['electronics', 'books'],
          lastActivity: Date.now(),
        },
      });
      await vectorHelper.getAdapter().create('behaviors', behaviorVector);

      // 4. Add items to cart (Redis)
      await redisHelper
        .getAdapter()
        .listPush(
          'cart',
          user.id,
          { productId: 'prod-1', name: 'Laptop', price: 999 },
          { productId: 'prod-2', name: 'Book', price: 25 },
        );

      // 5. Get personalized recommendations (Vector similarity search)
      const similarBehaviors = await vectorHelper.getAdapter().query(
        {
          vector: behaviorVector.vector,
          topK: 5,
          includeMetadata: true,
        },
        { namespace: 'behaviors' },
      );

      // 6. Update user activity count (Redis counter)
      await redisHelper.getAdapter().increment('activity', user.id);

      // Verify the complete workflow
      const cartItems = await redisHelper.getAdapter().listRange('cart', user.id, 0, -1);
      expect(cartItems).toHaveLength(2);

      const activityCount = await redisHelper
        .getAdapter()
        .increment('activity', user.id, undefined, 0);
      expect(activityCount).toBe(1);

      expect(similarBehaviors).toHaveLength(1); // Only one behavior vector stored
    });
  });

  describe('Cross-Database Data Consistency', () => {
    it('should maintain referential integrity across databases', async () => {
      const userId = 'user-123';

      // Create related records with same user ID across databases
      const user = createTestUser({ id: userId, name: 'Test User' });
      const userVector = createTestVector({
        id: `profile-${userId}`,
        metadata: { userId, type: 'profile' },
      });

      await firestoreHelper.getAdapter().create('users', user);
      await vectorHelper.getAdapter().create('profiles', userVector);
      await redisHelper.getAdapter().create('cache', { id: userId, lastSeen: Date.now() });

      // Verify all records exist with same user ID
      const firestoreUser = await firestoreHelper.getAdapter().findUnique('users', { id: userId });
      const vectorProfile = await vectorHelper.getAdapter().findUnique('profiles', {
        id: `profile-${userId}`,
      });
      const redisCache = await redisHelper.getAdapter().findUnique('cache', { id: userId });

      expect((firestoreUser as any)?.id).toBe(userId);
      expect((vectorProfile as any)?.metadata.userId).toBe(userId);
      expect((redisCache as any)?.id).toBe(userId);
    });
  });

  describe('Performance Comparison', () => {
    it('should compare performance across database types', async () => {
      const operationCount = 50;

      // Test Firestore performance
      const firestorePerf = await testDatabasePerformance(firestoreHelper, 'users', operationCount);

      // Test Redis performance
      const redisPerf = await testDatabasePerformance(redisHelper, 'users', operationCount);

      // Redis should generally be faster for simple operations
      expect(redisPerf.avgCreateTime).toBeLessThan(firestorePerf.avgCreateTime * 2);
      expect(redisPerf.avgReadTime).toBeLessThan(firestorePerf.avgReadTime * 2);

      console.log('Performance Results:', {
        firestore: {
          avgCreate: firestorePerf.avgCreateTime,
          avgRead: firestorePerf.avgReadTime,
        },
        redis: {
          avgCreate: redisPerf.avgCreateTime,
          avgRead: redisPerf.avgReadTime,
        },
      });
    });
  });

  describe('Database-Specific Features', () => {
    it('should utilize unique features of each database', async () => {
      // Firestore: Complex queries with filtering and ordering
      const users = createTestUsers(5).map((user, index) => ({
        ...user,
        age: 20 + index * 5,
        active: index % 2 === 0,
      }));

      for (const user of users) {
        await firestoreHelper.getAdapter().create('users', user);
      }

      const activeUsers = await mockFirestoreAdapter.findMany('users', {
        where: { active: true },
        orderBy: { field: 'age', direction: 'desc' },
        limit: 2,
      });

      expect(activeUsers).toHaveLength(2);
      expect((activeUsers[0] as any).age).toBeGreaterThan((activeUsers[1] as any).age);

      // Redis: Multiple data structures
      const postId = 'post-123';

      // Use Redis sets for tags
      await redisHelper.getAdapter().setAdd('tags', postId, 'javascript', 'tutorial', 'beginner');

      // Use Redis sorted set for comments (with timestamps as scores)
      await redisHelper
        .getAdapter()
        .sortedSetAdd(
          'comments',
          postId,
          { score: Date.now() - 1000, member: { text: 'Great post!', author: 'user1' } },
          { score: Date.now(), member: { text: 'Very helpful', author: 'user2' } },
        );

      // Use Redis hash for post metadata
      await redisHelper.getAdapter().hashSet('posts', postId, 'title', 'JS Tutorial');
      await redisHelper.getAdapter().hashSet('posts', postId, 'views', '100');

      const tags = await redisHelper.getAdapter().setMembers('tags', postId);
      expect(tags).toContain('javascript');

      const comments = await redisHelper
        .getAdapter()
        .sortedSetRange('comments', postId, 0, -1, true);
      expect(comments).toHaveLength(2);

      const title = await redisHelper.getAdapter().hashGet('posts', postId, 'title');
      expect(title).toBe('JS Tutorial');

      // Vector DB: Similarity search with metadata filtering
      const techVectors = [
        createTestVector({
          id: 'article-1',
          metadata: { category: 'tech', language: 'javascript' },
        }),
        createTestVector({
          id: 'article-2',
          metadata: { category: 'tech', language: 'python' },
        }),
        createTestVector({
          id: 'article-3',
          metadata: { category: 'science', language: 'english' },
        }),
      ];

      await vectorHelper.seedVectorData('articles', techVectors);

      const similarArticles = await vectorHelper.getAdapter().query(
        {
          vector: techVectors[0].vector,
          topK: 3,
          includeMetadata: true,
        },
        { namespace: 'articles' },
      );

      expect(similarArticles).toHaveLength(3);
      expect((similarArticles[0] as any).metadata.category).toBeDefined();
    });
  });

  describe('Error Handling Across Databases', () => {
    it('should handle errors consistently across database types', async () => {
      // Test non-existent record queries
      const firestoreResult = await firestoreHelper.getAdapter().findUnique('users', {
        id: 'non-existent',
      });
      const redisResult = await redisHelper.getAdapter().findUnique('users', {
        id: 'non-existent',
      });
      const vectorResult = await vectorHelper.getAdapter().findUnique('users', {
        id: 'non-existent',
      });

      expect(firestoreResult).toBeNull();
      expect(redisResult).toBeNull();
      expect(vectorResult).toBeNull();

      // Test empty collection counts
      const firestoreCount = await firestoreHelper.getAdapter().count('empty');
      const redisCount = await redisHelper.getAdapter().count('empty');
      const vectorCount = await vectorHelper.getAdapter().count('empty');

      expect(firestoreCount).toBe(0);
      expect(redisCount).toBe(0);
      expect(vectorCount).toBe(0);
    });
  });

  describe('Adapter Interface Consistency', () => {
    it('should implement consistent interfaces across all adapters', () => {
      const adapters = [mockFirestoreAdapter, mockUpstashVectorAdapter, mockUpstashRedisAdapter];

      adapters.forEach((adapter) => {
        // All adapters should implement base DatabaseAdapter interface
        expect(typeof adapter.initialize).toBe('function');
        expect(typeof adapter.disconnect).toBe('function');
        expect(typeof adapter.getClient).toBe('function');
        expect(typeof adapter.create).toBe('function');
        expect(typeof adapter.update).toBe('function');
        expect(typeof adapter.delete).toBe('function');
        expect(typeof adapter.findUnique).toBe('function');
        expect(typeof adapter.findMany).toBe('function');
        expect(typeof adapter.count).toBe('function');
        expect(typeof adapter.raw).toBe('function');
      });
    });

    it('should handle initialization and cleanup consistently', async () => {
      const adapters = [mockFirestoreAdapter, mockUpstashVectorAdapter, mockUpstashRedisAdapter];

      // All adapters should initialize without errors
      for (const adapter of adapters) {
        await expect(adapter.initialize()).resolves.not.toThrow();
      }

      // All adapters should disconnect without errors
      for (const adapter of adapters) {
        await expect(adapter.disconnect()).resolves.not.toThrow();
      }
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle user authentication and session management', async () => {
      // 1. User signs up
      const user = createTestUser({
        email: 'user@example.com',
        hashedPassword: 'hashed-password-123',
      });
      await firestoreHelper.getAdapter().create('users', user);

      // 2. Create session in Redis
      const sessionId = 'session-abc123';
      const sessionData = {
        id: sessionId,
        userId: user.id,
        expiresAt: Date.now() + 3600000, // 1 hour
      };
      await redisHelper.getAdapter().setWithExpiration('sessions', sessionId, sessionData, 3600);

      // 3. Store user activity vector
      const activityVector = createTestVector({
        id: `activity-${user.id}`,
        metadata: {
          userId: user.id,
          sessionId,
          actions: ['login', 'view_dashboard'],
        },
      });
      await vectorHelper.getAdapter().create('activities', activityVector);

      // 4. Verify complete authentication flow
      const storedUser = await firestoreHelper.getAdapter().findUnique('users', { id: user.id });
      expect((storedUser as any)?.email).toBe(user.email);

      const session = await redisHelper.getAdapter().findUnique('sessions', { id: sessionId });
      expect((session as any)?.userId).toBe(user.id);

      const activity = await vectorHelper.getAdapter().findUnique('activities', {
        id: `activity-${user.id}`,
      });
      expect((activity as any)?.metadata.sessionId).toBe(sessionId);
    });

    it('should handle content recommendation system', async () => {
      // 1. Store user preferences in Firestore
      const user = createTestUser({
        preferences: ['technology', 'programming', 'javascript'],
        topics: ['web-development', 'databases'],
      });
      await firestoreHelper.getAdapter().create('users', user);

      // 2. Cache recent views in Redis
      await redisHelper
        .getAdapter()
        .listPush(
          'recent_views',
          user.id,
          { contentId: 'article-1', viewedAt: Date.now() - 1000 },
          { contentId: 'article-2', viewedAt: Date.now() },
        );

      // 3. Store content embeddings in Vector DB
      const contentVectors = [
        createTestVector({
          id: 'article-1',
          metadata: { title: 'JavaScript Fundamentals', tags: ['javascript', 'programming'] },
        }),
        createTestVector({
          id: 'article-2',
          metadata: { title: 'Database Design', tags: ['database', 'sql'] },
        }),
        createTestVector({
          id: 'article-3',
          metadata: { title: 'React Tutorial', tags: ['react', 'javascript'] },
        }),
      ];

      for (const vector of contentVectors) {
        await vectorHelper.getAdapter().create('content', vector);
      }

      // 4. Generate user profile vector based on preferences
      const userProfileVector = createTestVector({
        id: `profile-${user.id}`,
        metadata: {
          userId: user.id,
          preferences: (user as any).preferences,
        },
      });
      await vectorHelper.getAdapter().create('profiles', userProfileVector);

      // 5. Find similar content
      const recommendations = await vectorHelper.getAdapter().query(
        {
          vector: userProfileVector.vector,
          topK: 3,
          includeMetadata: true,
        },
        { namespace: 'content' },
      );

      // 6. Update recommendation cache
      await redisHelper
        .getAdapter()
        .setWithExpiration('recommendations', user.id, recommendations, 1800);

      // Verify recommendation system
      expect(recommendations).toHaveLength(3);

      const cachedRecs = await redisHelper.getAdapter().findUnique('recommendations', {
        id: user.id,
      });
      expect(cachedRecs).toHaveLength(3);

      const recentViews = await redisHelper.getAdapter().listRange('recent_views', user.id, 0, -1);
      expect(recentViews).toHaveLength(2);
    });
  });
});
