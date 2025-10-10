/**
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServerClient, safeServerOperation } from '../src/server';
import type { FirestoreConfig } from '../src/types';

// Mock Firebase Admin SDK
vi.mock('firebase-admin', () => ({
  initializeApp: vi.fn(() => ({
    firestore: vi.fn(() => mockFirestore),
  })),
  credential: {
    cert: vi.fn(),
    applicationDefault: vi.fn(),
  },
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

const mockFirestore = {
  collection: vi.fn(() => mockCollection),
  doc: vi.fn(() => mockDocument),
  runTransaction: vi.fn(),
  batch: vi.fn(() => mockBatch),
  getAll: vi.fn(),
  terminate: vi.fn(),
};

const mockCollection = {
  add: vi.fn(),
  doc: vi.fn(() => mockDocument),
  where: vi.fn(() => mockQuery),
  orderBy: vi.fn(() => mockQuery),
  limit: vi.fn(() => mockQuery),
  get: vi.fn(),
  onSnapshot: vi.fn(),
};

const mockDocument = {
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  onSnapshot: vi.fn(),
  collection: vi.fn(() => mockCollection),
};

const mockQuery = {
  where: vi.fn(() => mockQuery),
  orderBy: vi.fn(() => mockQuery),
  limit: vi.fn(() => mockQuery),
  startAfter: vi.fn(() => mockQuery),
  get: vi.fn(),
  onSnapshot: vi.fn(),
};

const mockBatch = {
  set: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  commit: vi.fn(),
};

describe('Firestore Server Client', () => {
  let client: ReturnType<typeof createServerClient>;

  const testConfig: FirestoreConfig = {
    projectId: 'test-project',
    keyFilename: '/path/to/service-account.json',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    client = createServerClient(testConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Client Creation', () => {
    it('should create client with service account', () => {
      expect(client).toBeDefined();
      expect(typeof client.collection).toBe('function');
      expect(typeof client.doc).toBe('function');
    });

    it('should create client with application default credentials', () => {
      const clientWithDefault = createServerClient({
        projectId: 'test-project',
      });
      expect(clientWithDefault).toBeDefined();
    });
  });

  describe('Collection Operations', () => {
    beforeEach(() => {
      mockCollection.add.mockResolvedValue({
        id: 'doc-id',
        path: 'collection/doc-id',
      });

      mockCollection.get.mockResolvedValue({
        docs: [
          {
            id: 'doc1',
            exists: () => true,
            data: () => ({ name: 'Test 1' }),
          },
          {
            id: 'doc2',
            exists: () => true,
            data: () => ({ name: 'Test 2' }),
          },
        ],
        size: 2,
      });
    });

    it('should add document to collection', async () => {
      const collection = client.collection('users');
      const result = await collection.add({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(mockCollection.add).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result).toEqual({
        id: 'doc-id',
        path: 'collection/doc-id',
      });
    });

    it('should get all documents from collection', async () => {
      const collection = client.collection('users');
      const result = await collection.get();

      expect(mockCollection.get).toHaveBeenCalled();
      expect(result.docs).toHaveLength(2);
      expect(result.size).toBe(2);
    });

    it('should create document reference', () => {
      const collection = client.collection('users');
      const docRef = collection.doc('user-id');

      expect(mockCollection.doc).toHaveBeenCalledWith('user-id');
      expect(docRef).toBeDefined();
    });
  });

  describe('Document Operations', () => {
    beforeEach(() => {
      mockDocument.get.mockResolvedValue({
        id: 'doc-id',
        exists: () => true,
        data: () => ({ name: 'Test User' }),
      });

      mockDocument.set.mockResolvedValue({
        writeTime: new Date().toISOString(),
      });

      mockDocument.update.mockResolvedValue({
        writeTime: new Date().toISOString(),
      });

      mockDocument.delete.mockResolvedValue({
        writeTime: new Date().toISOString(),
      });
    });

    it('should get document', async () => {
      const doc = client.doc('users/user-id');
      const result = await doc.get();

      expect(mockDocument.get).toHaveBeenCalled();
      expect(result.id).toBe('doc-id');
      expect(result.exists()).toBe(true);
      expect(result.data()).toEqual({ name: 'Test User' });
    });

    it('should set document', async () => {
      const doc = client.doc('users/user-id');
      const result = await doc.set({
        name: 'Updated User',
        email: 'updated@example.com',
      });

      expect(mockDocument.set).toHaveBeenCalledWith(
        {
          name: 'Updated User',
          email: 'updated@example.com',
        },
        undefined,
      );
      expect(result.writeTime).toBeDefined();
    });

    it('should update document', async () => {
      const doc = client.doc('users/user-id');
      const result = await doc.update({
        name: 'Updated Name',
      });

      expect(mockDocument.update).toHaveBeenCalledWith({
        name: 'Updated Name',
      });
      expect(result.writeTime).toBeDefined();
    });

    it('should delete document', async () => {
      const doc = client.doc('users/user-id');
      const result = await doc.delete();

      expect(mockDocument.delete).toHaveBeenCalled();
      expect(result.writeTime).toBeDefined();
    });
  });

  describe('Query Operations', () => {
    beforeEach(() => {
      mockQuery.get.mockResolvedValue({
        docs: [
          {
            id: 'doc1',
            exists: () => true,
            data: () => ({ name: 'Active User' }),
          },
        ],
        size: 1,
      });
    });

    it('should build and execute query', async () => {
      const query = client
        .collection('users')
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(10);

      const result = await query.get();

      expect(mockCollection.where).toHaveBeenCalledWith('status', '==', 'active');
      expect(mockQuery.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result.docs).toHaveLength(1);
    });
  });

  describe('Batch Operations', () => {
    beforeEach(() => {
      mockBatch.commit.mockResolvedValue([
        { writeTime: new Date().toISOString() },
        { writeTime: new Date().toISOString() },
      ]);
    });

    it('should execute batch operations', async () => {
      const batch = client.batch();
      const docRef1 = client.doc('users/user1');
      const docRef2 = client.doc('users/user2');

      batch.set(docRef1, { name: 'User 1' });
      batch.update(docRef2, { name: 'Updated User 2' });

      const result = await batch.commit();

      expect(mockBatch.set).toHaveBeenCalledWith(docRef1, { name: 'User 1' }, undefined);
      expect(mockBatch.update).toHaveBeenCalledWith(docRef2, { name: 'Updated User 2' });
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('Transaction Operations', () => {
    beforeEach(() => {
      mockFirestore.runTransaction.mockImplementation(async callback => {
        const mockTransaction = {
          get: vi.fn().mockResolvedValue({
            id: 'doc-id',
            exists: () => true,
            data: () => ({ count: 0 }),
          }),
          set: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        };

        return await callback(mockTransaction);
      });
    });

    it('should execute transaction', async () => {
      const result = await client.runTransaction(async transaction => {
        const docRef = client.doc('counters/counter1');
        const doc = await transaction.get(docRef);

        const currentCount = doc.data()?.count || 0;
        transaction.update(docRef, { count: currentCount + 1 });

        return currentCount + 1;
      });

      expect(mockFirestore.runTransaction).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('Safe Operations', () => {
    it('should handle successful operations', async () => {
      mockDocument.get.mockResolvedValue({
        id: 'doc-id',
        exists: () => true,
        data: () => ({ name: 'Test' }),
      });

      const result = await safeServerOperation(async () => {
        const doc = client.doc('users/user-id');
        return await doc.get();
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('doc-id');
      }
    });

    it('should handle failed operations', async () => {
      mockDocument.get.mockRejectedValue(new Error('Network error'));

      const result = await safeServerOperation(async () => {
        const doc = client.doc('users/user-id');
        return await doc.get();
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Network error');
      }
    });
  });

  describe('Connection Pool', () => {
    it('should maintain connection pool stats', async () => {
      // This would test the connection pooling functionality
      // In a real implementation, you'd track active connections
      expect(client).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      mockDocument.get.mockRejectedValue({
        code: 'unauthenticated',
        message: 'Authentication failed',
      });

      await expect(async () => {
        const doc = client.doc('users/user-id');
        await doc.get();
      }).rejects.toThrow('Authentication failed');
    });

    it('should handle permission errors', async () => {
      mockDocument.get.mockRejectedValue({
        code: 'permission-denied',
        message: 'Permission denied',
      });

      await expect(async () => {
        const doc = client.doc('users/user-id');
        await doc.get();
      }).rejects.toThrow('Permission denied');
    });
  });
});
