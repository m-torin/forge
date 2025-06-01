/**
 * Mock Firestore implementation for development
 * TODO: Replace with actual Firestore when configured
 */

export const Timestamp = {
  fromDate: (date: Date) => ({
    nanoseconds: 0,
    seconds: Math.floor(date.getTime() / 1000),
    toDate: () => date,
  }),
  now: () => ({
    nanoseconds: 0,
    seconds: Math.floor(Date.now() / 1000),
    toDate: () => new Date(),
  }),
};

export const serverTimestamp = () => new Date();

// Mock collections storage
const mockCollections: Record<string, Map<string, any>> = {
  workflow_analytics: new Map(),
  workflow_logs: new Map(),
  workflow_runs: new Map(),
};

// Mock Firestore types
export type QueryConstraint = any;
export type DocumentData = Record<string, any>;

// Mock Firestore functions
export const collection = (db: any, name: string) => ({
  name,
  _type: 'collection',
  path: name,
});

export const doc = (coll: any, id?: string) => ({
  id: id || `doc-${Date.now()}`,
  _type: 'doc',
  collection: typeof coll === 'string' ? coll : coll.name,
  path: `${typeof coll === 'string' ? coll : coll.name}/${id || `doc-${Date.now()}`}`,
});

export const addDoc = async (coll: any, data: any) => {
  const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const collName = coll.name || coll;
  if (!mockCollections[collName]) {
    mockCollections[collName] = new Map();
  }
  mockCollections[collName].set(id, { ...data, id });
  return { id, path: `${collName}/${id}` };
};

export const getDoc = async (docRef: any) => {
  const collName = docRef.collection;
  const data = mockCollections[collName]?.get(docRef.id);
  return {
    id: docRef.id,
    data: () => data,
    exists: () => !!data,
  };
};

export const getDocs = async (q: any) => {
  const collName = q.collection || q.name || q._collection;
  const docs = Array.from(mockCollections[collName]?.values() || []);

  return {
    docs: docs.map((data) => {
      const id = data.id || 'mock-id';
      return {
        id,
        data: () => data,
        exists: () => true,
        ref: { id, collection: collName },
      };
    }),
    empty: docs.length === 0,
    size: docs.length,
  };
};

export const updateDoc = async (docRef: any, data: any) => {
  const collName = docRef.collection;
  const existing = mockCollections[collName]?.get(docRef.id) || {};
  if (!mockCollections[collName]) {
    mockCollections[collName] = new Map();
  }
  mockCollections[collName].set(docRef.id, {
    ...existing,
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const query = (coll: any, ...constraints: any[]) => ({
  _type: 'query',
  _collection: coll.name || coll,
  collection: coll.name || coll,
  constraints,
});

export const where = (field: string, op: string, value: any): QueryConstraint => ({
  _type: 'where',
  field,
  op,
  value,
});

export const orderBy = (field: string, dir: 'asc' | 'desc' = 'asc'): QueryConstraint => ({
  _type: 'orderBy',
  dir,
  field,
});

export const limit = (n: number): QueryConstraint => ({
  _type: 'limit',
  limit: n,
});

// Mock database instance
export const db = {
  _type: 'firestore',
  app: { name: 'mock-app' },
};
