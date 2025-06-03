import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  mockFirestore,
  mockFirestoreAdapter,
  resetMockFirestoreStorage,
  seedMockFirestoreData,
  DatabaseTestHelper,
  testDatabaseOperations,
  testDatabaseErrors,
  createTestUser,
  createTestUsers,
} from '@repo/testing/database';

// Mock the Firestore module
vi.mock('firebase-admin', async () => {
  const { mockFirebaseAdmin } = await import('@repo/testing/database');
  return mockFirebaseAdmin;
});

describe('Firestore Adapter', () => {
  let helper: DatabaseTestHelper;

  beforeEach(async () => {
    resetMockFirestoreStorage();
    helper = new DatabaseTestHelper(mockFirestoreAdapter, {
      provider: 'firestore',
      seed: false,
    });
    await helper.setup();
  });

  afterEach(async () => {
    resetMockFirestoreStorage();
    await helper.cleanup();
  });

  describe('Basic CRUD Operations', () => {
    it('should perform complete CRUD operations', async () => {
      await testDatabaseOperations(helper, 'users');
    });

    it('should create a document', async () => {
      const testData = createTestUser();
      const result = await mockFirestoreAdapter.create('users', testData);

      expect(result).toMatchObject(testData);
      expect(result).toHaveProperty('id');
    });

    it('should find a unique document by id', async () => {
      const testData = createTestUser();
      await mockFirestoreAdapter.create('users', testData);

      const found = await mockFirestoreAdapter.findUnique('users', { id: testData.id });
      expect(found).toMatchObject(testData);
    });

    it('should find a unique document by where clause', async () => {
      const testData = createTestUser({ email: 'unique@example.com' });
      await mockFirestoreAdapter.create('users', testData);

      const found = await mockFirestoreAdapter.findUnique('users', {
        where: { email: 'unique@example.com' },
      });
      expect(found).toMatchObject(testData);
    });

    it('should update a document', async () => {
      const testData = createTestUser();
      await mockFirestoreAdapter.create('users', testData);

      const updateData = { name: 'Updated Name' };
      const updated = await mockFirestoreAdapter.update('users', testData.id, updateData);

      expect(updated).toMatchObject({ ...testData, ...updateData });
    });

    it('should delete a document', async () => {
      const testData = createTestUser();
      await mockFirestoreAdapter.create('users', testData);

      const deleted = await mockFirestoreAdapter.delete('users', testData.id);
      expect(deleted).toMatchObject(testData);

      const found = await mockFirestoreAdapter.findUnique('users', { id: testData.id });
      expect(found).toBeNull();
    });

    it('should find many documents', async () => {
      const users = createTestUsers(3);

      for (const user of users) {
        await mockFirestoreAdapter.create('users', user);
      }

      const found = await mockFirestoreAdapter.findMany('users');
      expect(found).toHaveLength(3);

      // Check that all users are found
      const foundIds = found.map((u: any) => u.id);
      const expectedIds = users.map((u) => u.id);
      expect(foundIds).toEqual(expect.arrayContaining(expectedIds));
    });

    it('should count documents', async () => {
      const users = createTestUsers(5);

      for (const user of users) {
        await mockFirestoreAdapter.create('users', user);
      }

      const count = await mockFirestoreAdapter.count('users');
      expect(count).toBe(5);
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Seed test data
      const users = [
        createTestUser({ name: 'Alice', active: true, age: 25 }),
        createTestUser({ name: 'Bob', active: false, age: 30 }),
        createTestUser({ name: 'Charlie', active: true, age: 35 }),
      ];

      for (const user of users) {
        await mockFirestoreAdapter.create('users', user);
      }
    });

    it('should find documents with where clause', async () => {
      const activeUsers = await mockFirestoreAdapter.findMany('users', {
        where: { active: true },
      });

      expect(activeUsers).toHaveLength(2);
      activeUsers.forEach((user: any) => {
        expect(user.active).toBe(true);
      });
    });

    it('should find documents with ordering', async () => {
      const orderedUsers = await mockFirestoreAdapter.findMany('users', {
        orderBy: { field: 'age', direction: 'asc' },
      });

      expect(orderedUsers).toHaveLength(3);
      expect((orderedUsers[0] as any).age).toBe(25);
      expect((orderedUsers[1] as any).age).toBe(30);
      expect((orderedUsers[2] as any).age).toBe(35);
    });

    it('should find documents with limit', async () => {
      const limitedUsers = await mockFirestoreAdapter.findMany('users', {
        limit: 2,
      });

      expect(limitedUsers).toHaveLength(2);
    });

    it('should find documents with combined query options', async () => {
      const results = await mockFirestoreAdapter.findMany('users', {
        where: { active: true },
        orderBy: { field: 'age', direction: 'desc' },
        limit: 1,
      });

      expect(results).toHaveLength(1);
      expect((results[0] as any).active).toBe(true);
      expect((results[0] as any).age).toBe(35); // Charlie, oldest active user
    });

    it('should count documents with where clause', async () => {
      const activeCount = await mockFirestoreAdapter.count('users', {
        where: { active: true },
      });

      expect(activeCount).toBe(2);
    });
  });

  describe('Direct Firestore Client Operations', () => {
    it('should create document using direct client', async () => {
      const testData = createTestUser();

      const docRef = await mockFirestore.collection('users').add(testData);
      expect(docRef.id).toBeDefined();

      const snapshot = await docRef.get();
      expect(snapshot.exists).toBe(true);
      expect(snapshot.data()).toMatchObject(testData);
    });

    it('should query collection using direct client', async () => {
      const users = createTestUsers(3, { active: true });

      for (const user of users) {
        await mockFirestore.collection('users').add(user);
      }

      const querySnapshot = await mockFirestore
        .collection('users')
        .where('active', '==', true)
        .get();

      expect(querySnapshot.size).toBe(3);
      expect(querySnapshot.empty).toBe(false);

      const docs: any[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      expect(docs).toHaveLength(3);
      docs.forEach((doc) => {
        expect(doc.active).toBe(true);
      });
    });

    it('should handle batch operations', async () => {
      const batch = mockFirestore.batch();
      const users = createTestUsers(3);

      // Add batch operations
      users.forEach((user) => {
        const docRef = mockFirestore.collection('users').doc(user.id);
        batch.set(docRef, user);
      });

      // Commit batch
      const results = await batch.commit();
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.writeTime).toBeInstanceOf(Date);
      });

      // Verify documents were created
      for (const user of users) {
        const doc = await mockFirestore.collection('users').doc(user.id).get();
        expect(doc.exists).toBe(true);
        expect(doc.data()).toMatchObject(user);
      }
    });

    it('should handle transactions', async () => {
      const user = createTestUser();
      const docRef = mockFirestore.collection('users').doc(user.id);

      await mockFirestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        expect(doc.exists).toBe(false);

        transaction.set(docRef, user);
      });

      // Verify document was created
      const doc = await docRef.get();
      expect(doc.exists).toBe(true);
      expect(doc.data()).toMatchObject(user);
    });
  });

  describe('Error Handling', () => {
    it('should handle common error scenarios', async () => {
      await testDatabaseErrors(helper, 'users');
    });

    it('should return null for non-existent document', async () => {
      const found = await mockFirestoreAdapter.findUnique('users', {
        id: 'non-existent',
      });
      expect(found).toBeNull();
    });

    it('should return empty array for empty collection', async () => {
      const results = await mockFirestoreAdapter.findMany('empty-collection');
      expect(results).toEqual([]);
    });

    it('should return 0 count for empty collection', async () => {
      const count = await mockFirestoreAdapter.count('empty-collection');
      expect(count).toBe(0);
    });
  });

  describe('Raw Operations', () => {
    it('should execute raw batch operation', async () => {
      const batch = await mockFirestoreAdapter.raw('batch', null);
      expect(batch).toBeDefined();
      expect(typeof batch.set).toBe('function');
      expect(typeof batch.commit).toBe('function');
    });

    it('should execute raw transaction', async () => {
      const user = createTestUser();

      const result = await mockFirestoreAdapter.raw('runTransaction', async (transaction: any) => {
        const docRef = mockFirestore.collection('users').doc(user.id);
        transaction.set(docRef, user);
        return user;
      });

      expect(result).toMatchObject(user);
    });

    it('should throw error for unsupported raw operation', async () => {
      await expect(mockFirestoreAdapter.raw('unsupported', null)).rejects.toThrow('not supported');
    });
  });

  describe('Adapter Interface Compliance', () => {
    it('should implement all required DatabaseAdapter methods', () => {
      const adapter = mockFirestoreAdapter;

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

    it('should initialize and disconnect without errors', async () => {
      await expect(mockFirestoreAdapter.initialize()).resolves.not.toThrow();
      await expect(mockFirestoreAdapter.disconnect()).resolves.not.toThrow();
    });

    it('should return the client instance', () => {
      const client = mockFirestoreAdapter.getClient();
      expect(client).toBeDefined();
      expect(typeof client.collection).toBe('function');
    });
  });

  describe('Data Seeding', () => {
    it('should seed mock data correctly', () => {
      const testDocuments = [
        { id: 'doc1', data: createTestUser({ name: 'Seeded User 1' }) },
        { id: 'doc2', data: createTestUser({ name: 'Seeded User 2' }) },
      ];

      seedMockFirestoreData('users', testDocuments);

      // Verify seeded data is accessible
      testDocuments.forEach(async ({ id, data }) => {
        const found = await mockFirestoreAdapter.findUnique('users', { id });
        expect(found).toMatchObject(data);
      });
    });
  });
});

// Integration test with the actual Firestore adapter class
describe('FirestoreAdapter Integration', () => {
  it('should be importable and instantiable', async () => {
    // This tests that the actual adapter can be imported
    // and doesn't have syntax or import errors
    const { FirestoreAdapter } = await import('../firestore/adapter');
    expect(FirestoreAdapter).toBeDefined();
    expect(typeof FirestoreAdapter).toBe('function');
  });
});
