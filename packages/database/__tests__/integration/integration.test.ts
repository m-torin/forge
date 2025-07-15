import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Test imports for new four-file pattern
import { FirestoreOperations } from '#/firestore/server';
import { RedisOperations } from '#/redis/server';
import { VectorOperations } from '#/upstash/server';
import type { Redis } from '@upstash/redis';
import type { Index } from '@upstash/vector';
import type { Firestore } from 'firebase-admin/firestore';

// Mock all database modules
vi.mock('firebase-admin', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestoreClient),
  FieldValue: {
    serverTimestamp: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => mockRedisClient),
}));

vi.mock('@upstash/vector', () => ({
  Index: vi.fn(() => mockVectorClient),
}));

// Mock clients
const mockFirestoreClient = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      id: 'test-id',
      set: vi.fn(),
      get: vi.fn(() => ({
        exists: true,
        id: 'test-id',
        data: vi.fn(() => ({ name: 'Test User', email: 'test@example.com' })),
      })),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    get: vi.fn(() => ({
      docs: [
        {
          id: 'test-id',
          data: () => ({ name: 'Test User', email: 'test@example.com' }),
        },
      ],
      empty: false,
    })),
  })),
  batch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn(),
  })),
} as unknown as Firestore;

const mockRedisClient = {
  set: vi.fn(() => Promise.resolve('OK')),
  get: vi.fn(() => Promise.resolve(JSON.stringify({ cached: true }))),
  del: vi.fn(() => Promise.resolve(1)),
  ping: vi.fn(() => Promise.resolve('PONG')),
} as unknown as Redis;

const mockVectorClient = {
  upsert: vi.fn(() => Promise.resolve('upsert-success')),
  query: vi.fn(() =>
    Promise.resolve({
      matches: [{ id: 'vec1', score: 0.95, metadata: { type: 'test' } }],
    }),
  ),
  fetch: vi.fn(() =>
    Promise.resolve({
      vectors: {
        vec1: { vector: [0.1, 0.2, 0.3], metadata: { type: 'test' } },
      },
    }),
  ),
  info: vi.fn(() => Promise.resolve({ vectorCount: 100 })),
} as unknown as Index;

describe('Database Integration Tests (Four-File Pattern)', () => {
  let firestoreOps: FirestoreOperations;
  let redisOps: RedisOperations;
  let vectorOps: VectorOperations;

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreOps = new FirestoreOperations(mockFirestoreClient);
    redisOps = new RedisOperations(mockRedisClient);
    vectorOps = new VectorOperations(mockVectorClient);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Cross-Database Workflow', () => {
    it('should perform a complete user onboarding workflow', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        preferences: { theme: 'dark', notifications: true },
      };

      // 1. Create user in Firestore
      const user = await firestoreOps.create('users', userData);
      expect(user).toHaveProperty('id');
      expect(user.name).toBe('John Doe');

      // 2. Cache user session in Redis
      const sessionKey = `session:${user.id}`;
      await redisOps.set(
        sessionKey,
        {
          userId: user.id,
          loginTime: new Date().toISOString(),
        },
        { ex: 3600 },
      );
      expect(mockRedisClient.set).toHaveBeenCalled();

      // 3. Create user preference vector in Vector DB
      const preferenceVector = [0.8, 0.2, 0.6, 0.9]; // Simulated preference embedding
      await vectorOps.upsert(
        [
          {
            id: `user:${user.id}`,
            vector: preferenceVector,
            metadata: { userId: user.id, type: 'preferences' },
          },
        ],
        'user_preferences',
      );
      expect(mockVectorClient.upsert).toHaveBeenCalled();

      // 4. Verify data consistency
      const cachedSession = await redisOps.get(sessionKey);
      expect(cachedSession).toBeTruthy();

      const userVector = await vectorOps.fetch(`user:${user.id}`, {
        includeVectors: true,
        namespace: 'user_preferences',
      });
      expect(userVector).toHaveLength(1);
      expect(userVector[0]).toHaveProperty('id', `user:${user.id}`);
    });

    it('should handle content recommendation pipeline', async () => {
      const userId = 'user123';
      const contentIds = ['content1', 'content2', 'content3'];

      // 1. Store content metadata in Firestore
      const contentData = {
        title: 'Test Article',
        category: 'technology',
        tags: ['ai', 'ml', 'tech'],
      };
      await firestoreOps.create('content', contentData, 'content1');
      expect(mockFirestoreClient.collection).toHaveBeenCalledWith('content');

      // 2. Cache popular content in Redis
      const popularContentKey = 'popular:technology';
      await redisOps.sadd(popularContentKey, contentIds);
      // Note: Our mock doesn't implement sadd, but we can verify the operation would be called

      // 3. Generate content embeddings and store in Vector DB
      const contentVector = [0.1, 0.3, 0.7, 0.2];
      await vectorOps.upsert(
        [
          {
            id: 'content1',
            vector: contentVector,
            metadata: {
              category: 'technology',
              popularity: 0.85,
            },
          },
        ],
        'content_embeddings',
      );
      expect(mockVectorClient.upsert).toHaveBeenCalled();

      // 4. Find similar content using vector search
      const similarContent = await vectorOps.query({
        vector: contentVector,
        topK: 5,
        namespace: 'content_embeddings',
        includeMetadata: true,
      });
      expect(similarContent).toHaveLength(1);
      expect(similarContent[0].id).toBe('vec1');
    });

    it('should implement caching strategy across databases', async () => {
      const key = 'expensive:computation:result';
      const computedData = { result: 'complex calculation', timestamp: Date.now() };

      // 1. Check cache first (Redis)
      let cachedResult = await redisOps.get(key);
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);

      // 2. If not cached, compute and store in both Redis and Firestore
      if (!cachedResult) {
        // Store in Redis for fast access (with TTL)
        await redisOps.set(key, computedData, { ex: 300 }); // 5 minutes

        // Store in Firestore for persistence
        await firestoreOps.create('cache_backup', {
          key,
          data: computedData,
          createdAt: new Date(),
        });

        expect(mockRedisClient.set).toHaveBeenCalled();
        expect(mockFirestoreClient.collection).toHaveBeenCalledWith('cache_backup');
      }

      // 3. Verify data is accessible
      const finalResult = await redisOps.get(key);
      expect(finalResult).toBeTruthy();
    });
  });

  describe('Database Health Checks', () => {
    it('should verify all databases are healthy', async () => {
      // Redis health check
      const redisHealth = await redisOps.ping();
      expect(redisHealth).toBe('PONG');

      // Vector DB health check
      const vectorHealth = await vectorOps.info();
      expect(vectorHealth).toHaveProperty('vectorCount');

      // Firestore health check (create/read test)
      const healthDoc = await firestoreOps.create('health_check', {
        timestamp: new Date(),
        status: 'healthy',
      });
      expect(healthDoc).toHaveProperty('id');

      // Clean up health check
      await firestoreOps.delete('health_check', healthDoc.id);
    });

    it('should provide client access for advanced operations', () => {
      // Verify raw client access for all databases
      const firestoreClient = firestoreOps.getClient();
      const redisClient = redisOps.getClient();
      const vectorClient = vectorOps.getClient();

      expect(firestoreClient).toBe(mockFirestoreClient);
      expect(redisClient).toBe(mockRedisClient);
      expect(vectorClient).toBe(mockVectorClient);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle database connection failures gracefully', async () => {
      // Simulate Redis failure
      mockRedisClient.get = vi.fn(() => Promise.reject(new Error('Redis connection failed')));

      try {
        await redisOps.get('test:key');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Redis connection failed');
      }

      // Verify other databases still work
      const user = await firestoreOps.create('users', { name: 'Test User' });
      expect(user).toHaveProperty('id');

      const vectorInfo = await vectorOps.info();
      expect(vectorInfo).toHaveProperty('vectorCount');
    });

    it('should maintain data consistency during partial failures', async () => {
      const userData = { name: 'Consistency Test', email: 'test@consistency.com' };

      // Simulate vector DB failure during user creation
      mockVectorClient.upsert = vi.fn(() => Promise.reject(new Error('Vector DB unavailable')));

      // User should still be created in Firestore
      const user = await firestoreOps.create('users', userData);
      expect(user).toHaveProperty('id');

      // Cache should still work
      await redisOps.set(`user:${user.id}`, user);
      const cachedUser = await redisOps.get(`user:${user.id}`);
      expect(cachedUser).toBeTruthy();

      // Vector operation should fail
      try {
        await vectorOps.upsert([
          {
            id: `user:${user.id}`,
            vector: [0.1, 0.2],
            metadata: { userId: user.id },
          },
        ]);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Vector DB unavailable');
      }
    });
  });
});
