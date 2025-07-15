import { vi } from 'vitest';

// Define types locally to avoid circular dependency
type MockDocumentData = Record<string, any>;

interface MockDocumentSnapshot {
  data: () => MockDocumentData | undefined;
  exists: boolean;
  get: (field: string) => any;
  id: string;
}

interface MockQuerySnapshot {
  docs: MockDocumentSnapshot[];
  empty: boolean;
  forEach: (callback: (doc: MockDocumentSnapshot) => void) => void;
  size: number;
}

interface MockWriteResult {
  writeTime: Date;
}

interface MockBatchResult {
  writeTime: Date;
}

interface MockWhereClause {
  field: string;
  operator: string;
  value: any;
}

interface MockOrderByClause {
  direction: 'asc' | 'desc';
  field: string;
}

// In-memory storage for mock Firestore
class MockFirestoreStorage {
  private collections = new Map<string, Map<string, MockDocumentData>>();

  getCollection(path: string): Map<string, MockDocumentData> {
    if (!this.collections.has(path)) {
      this.collections.set(path, new Map());
    }
    return this.collections.get(path)!;
  }

  setDocument(
    collectionPath: string,
    docId: string,
    data: MockDocumentData,
    merge = false,
  ): MockWriteResult {
    const collection = this.getCollection(collectionPath);

    if (merge && collection.has(docId)) {
      const existing = collection.get(docId)!;
      collection.set(docId, { ...existing, ...data });
    } else {
      collection.set(docId, { ...data });
    }

    return { writeTime: new Date() };
  }

  getDocument(collectionPath: string, docId: string): MockDocumentSnapshot {
    const collection = this.getCollection(collectionPath);
    const data = collection.get(docId);

    return {
      id: docId,
      data: () => data,
      exists: !!data,
      get: (field: string) => data?.[field],
    };
  }

  deleteDocument(collectionPath: string, docId: string): MockWriteResult {
    const collection = this.getCollection(collectionPath);
    collection.delete(docId);
    return { writeTime: new Date() };
  }

  queryCollection(
    collectionPath: string,
    whereClauses: MockWhereClause[] = [],
    orderBy: MockOrderByClause[] = [],
    limit?: number,
  ): MockQuerySnapshot {
    const collection = this.getCollection(collectionPath);
    let docs = Array.from(collection.entries()).map(([id, data]) => ({
      id,
      data: () => data,
      exists: true,
      get: (field: string) => data[field],
    }));

    // Apply where clauses
    docs = docs.filter(doc => {
      return whereClauses.every(clause => {
        const fieldValue = doc.get(clause.field);

        switch (clause.operator) {
          case '==':
            return fieldValue === clause.value;
          case '!=':
            return fieldValue !== clause.value;
          case '<':
            return fieldValue < clause.value;
          case '<=':
            return fieldValue <= clause.value;
          case '>':
            return fieldValue > clause.value;
          case '>=':
            return fieldValue >= clause.value;
          case 'array-contains':
            return Array.isArray(fieldValue) && fieldValue.includes(clause.value);
          case 'in':
            return Array.isArray(clause.value) && clause.value.includes(fieldValue);
          case 'array-contains-any':
            if (!Array.isArray(fieldValue)) return false;
            return (
              Array.isArray(clause.value) && clause.value.some(val => fieldValue.includes(val))
            );
          default:
            return true;
        }
      });
    });

    // Apply ordering
    if (orderBy.length > 0) {
      docs.sort((a, b) => {
        for (const order of orderBy) {
          const aVal = a.get(order.field);
          const bVal = b.get(order.field);

          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          else if (aVal > bVal) comparison = 1;

          if (comparison !== 0) {
            return order.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    // Apply limit
    if (limit) {
      docs = docs.slice(0, limit);
    }

    return {
      docs,
      empty: docs.length === 0,
      forEach: callback => docs.forEach(callback),
      size: docs.length,
    };
  }

  clear(): void {
    this.collections.clear();
  }
}

// Global mock storage instance
const mockStorage = new MockFirestoreStorage();

// Mock DocumentReference class
class MockDocumentReference {
  constructor(
    private collectionPath: string,
    private docId: string,
  ) {}

  async get(): Promise<MockDocumentSnapshot> {
    return mockStorage.getDocument(this.collectionPath, this.docId);
  }

  async set(data: MockDocumentData, options?: { merge?: boolean }): Promise<MockWriteResult> {
    return mockStorage.setDocument(this.collectionPath, this.docId, data, options?.merge);
  }

  async update(data: Partial<MockDocumentData>): Promise<MockWriteResult> {
    return mockStorage.setDocument(this.collectionPath, this.docId, data, true);
  }

  async delete(): Promise<MockWriteResult> {
    return mockStorage.deleteDocument(this.collectionPath, this.docId);
  }

  collection(collectionPath: string): MockCollectionReference {
    return new MockCollectionReference(`${this.collectionPath}/${this.docId}/${collectionPath}`);
  }

  get id(): string {
    return this.docId;
  }

  get path(): string {
    return `${this.collectionPath}/${this.docId}`;
  }
}

// Mock Query class
class MockQuery {
  protected whereClauses: MockWhereClause[] = [];
  protected orderByClauses: MockOrderByClause[] = [];
  protected limitCount?: number;

  constructor(protected collectionPath: string) {}

  where(field: string, operator: string, value: any): MockQuery {
    const newQuery = new MockQuery(this.collectionPath);
    newQuery.whereClauses = [...this.whereClauses, { field, operator, value }];
    newQuery.orderByClauses = [...this.orderByClauses];
    newQuery.limitCount = this.limitCount;
    return newQuery;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): MockQuery {
    const newQuery = new MockQuery(this.collectionPath);
    newQuery.whereClauses = [...this.whereClauses];
    newQuery.orderByClauses = [...this.orderByClauses, { direction, field }];
    newQuery.limitCount = this.limitCount;
    return newQuery;
  }

  limit(count: number): MockQuery {
    const newQuery = new MockQuery(this.collectionPath);
    newQuery.whereClauses = [...this.whereClauses];
    newQuery.orderByClauses = [...this.orderByClauses];
    newQuery.limitCount = count;
    return newQuery;
  }

  async get(): Promise<MockQuerySnapshot> {
    return mockStorage.queryCollection(
      this.collectionPath,
      this.whereClauses,
      this.orderByClauses,
      this.limitCount,
    );
  }
}

// Mock CollectionReference class
class MockCollectionReference extends MockQuery {
  constructor(collectionPath: string) {
    super(collectionPath);
  }

  doc(docId?: string): MockDocumentReference {
    const id = docId || this.generateId();
    return new MockDocumentReference(this.collectionPath, id);
  }

  async add(data: MockDocumentData): Promise<MockDocumentReference> {
    const docId = this.generateId();
    const docRef = new MockDocumentReference(this.collectionPath, docId);
    await docRef.set(data);
    return docRef;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 20);
  }

  get id(): string {
    return this.collectionPath.split('/').pop() || '';
  }

  get path(): string {
    return this.collectionPath;
  }
}

// Mock WriteBatch class
class MockWriteBatch {
  private operations: (() => Promise<MockWriteResult>)[] = [];

  set(
    documentRef: MockDocumentReference,
    data: MockDocumentData,
    options?: { merge?: boolean },
  ): MockWriteBatch {
    this.operations.push(() => documentRef.set(data, options));
    return this;
  }

  update(documentRef: MockDocumentReference, data: Partial<MockDocumentData>): MockWriteBatch {
    this.operations.push(() => documentRef.update(data));
    return this;
  }

  delete(documentRef: MockDocumentReference): MockWriteBatch {
    this.operations.push(() => documentRef.delete());
    return this;
  }

  async commit(): Promise<MockBatchResult[]> {
    const results = await Promise.all(this.operations.map(op => op()));
    this.operations = []; // Clear operations after commit
    return results.map(result => ({ writeTime: result.writeTime }));
  }
}

// Mock Transaction class
class MockTransaction {
  private reads = new Map<string, MockDocumentSnapshot>();
  private writes: (() => Promise<MockWriteResult>)[] = [];

  async get(documentRef: MockDocumentReference): Promise<MockDocumentSnapshot> {
    const snapshot = await documentRef.get();
    this.reads.set(documentRef.path, snapshot);
    return snapshot;
  }

  set(
    documentRef: MockDocumentReference,
    data: MockDocumentData,
    options?: { merge?: boolean },
  ): MockTransaction {
    this.writes.push(() => documentRef.set(data, options));
    return this;
  }

  update(documentRef: MockDocumentReference, data: Partial<MockDocumentData>): MockTransaction {
    this.writes.push(() => documentRef.update(data));
    return this;
  }

  delete(documentRef: MockDocumentReference): MockTransaction {
    this.writes.push(() => documentRef.delete());
    return this;
  }

  async commit(): Promise<void> {
    await Promise.all(this.writes.map(write => write()));
    this.reads.clear();
    this.writes = [];
  }
}

// Mock Firestore class
class MockFirestore {
  collection(collectionPath: string): MockCollectionReference {
    return new MockCollectionReference(collectionPath);
  }

  doc(documentPath: string): MockDocumentReference {
    const segments = documentPath.split('/');
    if (segments.length % 2 === 0) {
      throw new Error('Document path must have an odd number of segments');
    }

    const docId = segments.pop()!;
    const collectionPath = segments.join('/');
    return new MockDocumentReference(collectionPath, docId);
  }

  batch(): MockWriteBatch {
    return new MockWriteBatch();
  }

  async runTransaction<T>(
    updateFunction: (transaction: MockTransaction) => Promise<T>,
  ): Promise<T> {
    const transaction = new MockTransaction();
    const result = await updateFunction(transaction);
    await transaction.commit();
    return result;
  }

  async terminate(): Promise<void> {
    // Mock termination
  }
}

// Mock Firebase Admin SDK
export const mockFirestore = new MockFirestore();

// Mock Firestore adapter
export const mockFirestoreAdapter = {
  client: mockFirestore,

  async initialize(): Promise<void> {
    // Mock initialization
  },

  async disconnect(): Promise<void> {
    // Mock disconnection
  },

  getClient() {
    return mockFirestore;
  },

  async create<T>(collection: string, data: any): Promise<T> {
    const docRef = await mockFirestore.collection(collection).add(data);
    const snapshot = await docRef.get();
    return { id: docRef.id, ...snapshot.data() } as T;
  },

  async update<T>(collection: string, id: string, data: any): Promise<T> {
    const docRef = mockFirestore.collection(collection).doc(id);
    await docRef.update(data);
    const snapshot = await docRef.get();
    return { id: docRef.id, ...snapshot.data() } as T;
  },

  async delete<T>(collection: string, id: string): Promise<T> {
    const docRef = mockFirestore.collection(collection).doc(id);
    const snapshot = await docRef.get();
    await docRef.delete();
    return { id: docRef.id, ...snapshot.data() } as T;
  },

  async findUnique<T>(collection: string, query: { id?: string; where?: any }): Promise<T | null> {
    if (query.id) {
      const docRef = mockFirestore.collection(collection).doc(query.id);
      const snapshot = await docRef.get();
      return snapshot.exists ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
    }

    // Handle where clauses
    let queryRef = mockFirestore.collection(collection) as any;
    if (query.where) {
      Object.entries(query.where).forEach(([field, value]) => {
        queryRef = queryRef.where(field, '==', value);
      });
    }

    const querySnapshot = await queryRef.limit(1).get();
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  },

  async findMany<T>(
    collection: string,
    query?: {
      where?: any;
      orderBy?: { field: string; direction?: 'asc' | 'desc' };
      limit?: number;
    },
  ): Promise<T[]> {
    let queryRef = mockFirestore.collection(collection) as any;

    if (query?.where) {
      Object.entries(query.where).forEach(([field, value]) => {
        queryRef = queryRef.where(field, '==', value);
      });
    }

    if (query?.orderBy) {
      queryRef = queryRef.orderBy(query.orderBy.field, query.orderBy.direction || 'asc');
    }

    if (query?.limit) {
      queryRef = queryRef.limit(query.limit);
    }

    const querySnapshot = await queryRef.get();
    return querySnapshot.docs.map((doc: MockDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  },

  async count(collection: string, query?: { where?: any }): Promise<number> {
    let queryRef = mockFirestore.collection(collection) as any;

    if (query?.where) {
      Object.entries(query.where).forEach(([field, value]) => {
        queryRef = queryRef.where(field, '==', value);
      });
    }

    const querySnapshot = await queryRef.get();
    return querySnapshot.size;
  },

  async raw<T = any>(operation: string, params: any): Promise<T> {
    // Mock raw operations
    if (operation === 'batch') {
      return mockFirestore.batch() as T;
    }
    if (operation === 'runTransaction') {
      return mockFirestore.runTransaction(params) as T;
    }
    throw new Error(`Operation '${operation}' not supported on mock Firestore client`);
  },
};

// Mock factory functions
export const createMockDocumentData = (
  overrides?: Partial<MockDocumentData>,
): MockDocumentData => ({
  name: 'Test Document',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockDocumentSnapshot = (
  id: string,
  data?: MockDocumentData,
  exists = true,
): MockDocumentSnapshot => ({
  id,
  data: () => (exists ? data || createMockDocumentData() : undefined),
  exists,
  get: (field: string) => (exists ? (data || createMockDocumentData())[field] : undefined),
});

export const createMockQuerySnapshot = (docs: MockDocumentSnapshot[] = []): MockQuerySnapshot => ({
  docs,
  empty: docs.length === 0,
  forEach: callback => docs.forEach(callback),
  size: docs.length,
});

// Vitest mocks
export const mockFirebaseAdmin = {
  credential: {
    cert: vi.fn(),
  },
  firestore: vi.fn().mockReturnValue(mockFirestore),
  initializeApp: vi.fn(),
};

// Helper functions
export const resetMockFirestoreStorage = (): void => {
  mockStorage.clear();
};

export const seedMockFirestoreData = (
  collectionPath: string,
  documents: { id: string; data: MockDocumentData }[],
): void => {
  documents.forEach(({ id, data }) => {
    mockStorage.setDocument(collectionPath, id, data);
  });
};

export const getMockFirestoreState = (collectionPath: string): Record<string, MockDocumentData> => {
  const collection = mockStorage.getCollection(collectionPath);
  const state: Record<string, MockDocumentData> = {};

  collection.forEach((data, id) => {
    state[id] = data;
  });

  return state;
};

export const setupMockFirestoreEnvironment = (): void => {
  process.env.FIREBASE_PROJECT_ID = 'mock-project';
  process.env.FIREBASE_CLIENT_EMAIL = 'mock@example.com';
  process.env.FIREBASE_PRIVATE_KEY = 'mock-private-key';
};

export const cleanupMockFirestoreEnvironment = (): void => {
  delete process.env.FIREBASE_PROJECT_ID;
  delete process.env.FIREBASE_CLIENT_EMAIL;
  delete process.env.FIREBASE_PRIVATE_KEY;
  resetMockFirestoreStorage();
};

// Mock Firestore types for testing
export interface MockFirestoreTypes {
  CollectionReference: MockCollectionReference;
  DocumentData: MockDocumentData;
  DocumentReference: MockDocumentReference;
  DocumentSnapshot: MockDocumentSnapshot;
  Query: MockQuery;
  QuerySnapshot: MockQuerySnapshot;
  Transaction: MockTransaction;
  WriteBatch: MockWriteBatch;
  WriteResult: MockWriteResult;
}
