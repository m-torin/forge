import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Test imports for new four-file pattern
import { FirestoreOperations } from '@repo/database/firestore/server';
import type { Firestore } from 'firebase-admin/firestore';

// Mock the Firestore module
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
    arrayUnion: vi.fn(),
    arrayRemove: vi.fn(),
  },
}));

// Mock Firestore client
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
    add: vi.fn(),
    where: vi.fn(() => ({
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => ({
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
    get: vi.fn(() => ({
      docs: [
        {
          id: 'test-id',
          data: () => ({ name: 'Test User', email: 'test@example.com' }),
        },
      ],
      empty: false,
    })),
    count: vi.fn(() => ({
      get: vi.fn(() => ({
        data: () => ({ count: 1 }),
      })),
    })),
  })),
  batch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(),
  })),
  runTransaction: vi.fn(callback => callback({})),
  doc: vi.fn(),
  collectionGroup: vi.fn(),
} as unknown as Firestore;

describe('Firestore Four-File Pattern', () => {
  let firestoreOps: FirestoreOperations;

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreOps = new FirestoreOperations(mockFirestoreClient);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic CRUD Operations', () => {
    it('should create a document', async () => {
      const testData = { name: 'Test User', email: 'test@example.com' };
      const result = await firestoreOps.create('users', testData);

      expect(result).toMatchObject(testData);
      expect(result).toHaveProperty('id');
    });

    it('should get a document by id', async () => {
      const result = await firestoreOps.get('users', 'test-id');

      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should update a document', async () => {
      const updateData = { name: 'Updated User' };
      const result = await firestoreOps.update('users', 'test-id', updateData);

      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Updated User',
      });
    });

    it('should delete a document', async () => {
      const result = await firestoreOps.delete('users', 'test-id');

      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should find many documents', async () => {
      const result = await firestoreOps.findMany('users', {
        where: [{ field: 'email', operator: '==', value: 'test@example.com' }],
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should find a unique document', async () => {
      const result = await firestoreOps.findUnique('users', {
        id: 'test-id',
      });

      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should count documents', async () => {
      const result = await firestoreOps.count('users');

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Batch Operations', () => {
    it('should create multiple documents in batch', async () => {
      const documents = [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
      ];

      const result = await firestoreOps.bulkCreate('users', documents);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      result.forEach((doc: any) => {
        expect(doc).toHaveProperty('id');
      });
    });

    it('should support batch operations', () => {
      const batch = firestoreOps.batch();
      expect(batch).toBeDefined();
      expect(typeof batch.commit).toBe('function');
    });

    it('should support transactions', async () => {
      const result = await firestoreOps.transaction(async (transaction: any) => {
        return { success: true };
      });

      expect(result).toStrictEqual({ success: true });
    });
  });

  describe('Collection Operations', () => {
    it('should get collection reference', () => {
      const collection = firestoreOps.collection('users');
      expect(collection).toBeDefined();
    });

    it('should get document reference', () => {
      const doc = firestoreOps.doc('users/test-id');
      expect(doc).toBeDefined();
    });

    it('should get collection group query', () => {
      const query = firestoreOps.collectionGroup('users');
      expect(query).toBeDefined();
    });
  });

  describe('Client Access', () => {
    it('should provide access to raw client', () => {
      const client = firestoreOps.getClient();
      expect(client).toBe(mockFirestoreClient);
    });

    it('should provide FieldValue utilities', () => {
      const fieldValue = firestoreOps.FieldValue;
      expect(fieldValue).toBeDefined();
    });
  });
});
