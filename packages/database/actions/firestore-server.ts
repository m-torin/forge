'use server';

import { firestore } from '../firestore';
import { DatabaseResponse } from '../types';

// Generic type-safe CRUD operations
export async function createDocument<T>(
  collection: string,
  data: any
): Promise<DatabaseResponse<T>> {
  try {
    const docRef = data.id
      ? firestore.collection(collection).doc(data.id)
      : firestore.collection(collection).doc();

    // Auto-generate ID if not provided
    if (!data.id) {
      data.id = docRef.id;
    }

    await docRef.set({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      data: { id: docRef.id, ...data } as T,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getDocument<T>(
  collection: string,
  id: string
): Promise<DatabaseResponse<T>> {
  try {
    const docRef = firestore.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        data: null,
        error: `Document not found in ${collection} with id: ${id}`,
        success: false
      };
    }

    return {
      data: { id: doc.id, ...doc.data() } as T,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getDocuments<T>(
  collection: string,
  query?: {
    where?: [string, string, any][];
    orderBy?: [string, 'asc' | 'desc'][];
    limit?: number;
  }
): Promise<DatabaseResponse<T[]>> {
  try {
    let queryRef = firestore.collection(collection);

    // Apply where clauses
    if (query?.where) {
      query.where.forEach(([field, operator, value]) => {
        queryRef = queryRef.where(field, operator, value);
      });
    }

    // Apply order by
    if (query?.orderBy) {
      query.orderBy.forEach(([field, direction]) => {
        queryRef = queryRef.orderBy(field, direction);
      });
    }

    // Apply limit
    if (query?.limit) {
      queryRef = queryRef.limit(query.limit);
    }

    const snapshot = await queryRef.get();

    return {
      data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[],
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function updateDocument<T>(
  collection: string,
  id: string,
  data: any
): Promise<DatabaseResponse<T>> {
  try {
    const docRef = firestore.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        data: null,
        error: `Document not found in ${collection} with id: ${id}`,
        success: false
      };
    }

    await docRef.update({
      ...data,
      updatedAt: new Date()
    });

    const updatedDoc = await docRef.get();
    return {
      data: { id: updatedDoc.id, ...updatedDoc.data() } as T,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function deleteDocument<T>(
  collection: string,
  id: string
): Promise<DatabaseResponse<T>> {
  try {
    const docRef = firestore.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        data: null,
        error: `Document not found in ${collection} with id: ${id}`,
        success: false
      };
    }

    const data = { id: doc.id, ...doc.data() } as T;
    await docRef.delete();

    return { data, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}
