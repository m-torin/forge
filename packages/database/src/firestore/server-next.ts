/**
 * Next.js server-side Firestore functionality
 * This provides Next.js-specific Firestore features with server-only imports
 */

import 'server-only';

// Next.js specific server functionality
import type { DocumentData } from 'firebase-admin/firestore';
import { headers } from 'next/headers';
import { cache } from 'react';
import { firestore, firestoreClientSingleton } from './server';

// Re-export all base server functionality
export * from './server';

// Cached Firestore operations for React Server Components
export const getCachedFirestoreDoc = cache(async (collection: string, id: string) => {
  const doc = await firestore.collection(collection).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
});

export const getCachedFirestoreCollection = cache(async (collection: string, limit = 10) => {
  const snapshot = await firestore.collection(collection).limit(limit).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const getCachedFirestoreQuery = cache(
  async (
    collection: string,
    field: string,
    operator: FirebaseFirestore.WhereFilterOp,
    value: any,
    limit = 10,
  ) => {
    const snapshot = await firestore
      .collection(collection)
      .where(field, operator, value)
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
);

export const getCachedFirestoreCount = cache(async (collection: string) => {
  const snapshot = await firestore.collection(collection).count().get();
  return snapshot.data().count;
});

/**
 * Next.js-specific Firestore utilities
 */
export async function getFirestoreWithHeaders() {
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || 'unknown';
  const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

  return {
    firestore: firestoreClientSingleton(),
    headers: {
      userAgent,
      ip,
    },
  };
}

/**
 * User session management utilities for Next.js
 */
export async function getUserSessionFromFirestore(userId: string, sessionId: string) {
  return getCachedFirestoreDoc('user_sessions', `${userId}_${sessionId}`);
}

export async function setUserSessionInFirestore(
  userId: string,
  sessionId: string,
  sessionData: any,
  expirationDate?: Date,
) {
  const docId = `${userId}_${sessionId}`;
  const data = {
    userId,
    sessionId,
    ...sessionData,
    createdAt: new Date(),
    expiresAt: expirationDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    updatedAt: new Date(),
  };

  await firestore.collection('user_sessions').doc(docId).set(data);
  return data;
}

export async function deleteUserSessionFromFirestore(userId: string, sessionId: string) {
  const docId = `${userId}_${sessionId}`;
  await firestore.collection('user_sessions').doc(docId).delete();
}

export async function cleanupExpiredSessions() {
  const now = new Date();
  const expiredSessions = await firestore
    .collection('user_sessions')
    .where('expiresAt', '<', now)
    .get();

  const batch = firestore.batch();
  expiredSessions.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return expiredSessions.size;
}

/**
 * Content caching utilities for Next.js
 */
export async function cachePageContentInFirestore(
  pageKey: string,
  content: any,
  expirationHours = 24,
) {
  const data = {
    pageKey,
    content,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
  };

  await firestore.collection('page_cache').doc(pageKey).set(data);
  return data;
}

export async function getCachedPageContentFromFirestore(pageKey: string) {
  const doc = await getCachedFirestoreDoc('page_cache', pageKey);

  if (!doc) return null;

  // Check if expired
  const docData = doc as any;
  if (docData.expiresAt && new Date(docData.expiresAt.toDate()) < new Date()) {
    // Delete expired cache
    await firestore.collection('page_cache').doc(pageKey).delete();
    return null;
  }

  return docData.content;
}

export async function invalidatePageCacheInFirestore(pageKeyPattern: string) {
  // Firestore doesn't support pattern matching directly, so we need to get all documents
  // and filter them
  const snapshot = await firestore.collection('page_cache').get();
  const batch = firestore.batch();
  let deleteCount = 0;

  snapshot.docs.forEach(doc => {
    if (doc.id.includes(pageKeyPattern)) {
      batch.delete(doc.ref);
      deleteCount++;
    }
  });

  if (deleteCount > 0) {
    await batch.commit();
  }

  return deleteCount;
}

/**
 * User preference management for Next.js
 */
export async function getUserPreferences(userId: string) {
  return getCachedFirestoreDoc('user_preferences', userId);
}

export async function setUserPreference(userId: string, key: string, value: any) {
  const docRef = firestore.collection('user_preferences').doc(userId);
  const doc = await docRef.get();

  const data = doc.exists ? doc.data() || {} : {};
  data[key] = value;
  data.updatedAt = new Date();

  if (!doc.exists) {
    data.createdAt = new Date();
  }

  await docRef.set(data, { merge: true });
  return data;
}

export async function deleteUserPreference(userId: string, key: string) {
  const docRef = firestore.collection('user_preferences').doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) return null;

  const data = doc.data() || {};
  delete data[key];
  data.updatedAt = new Date();

  await docRef.set(data, { merge: true });
  return data;
}

/**
 * Analytics and metrics utilities for Next.js
 */
export async function recordPageView(
  pageUrl: string,
  userId?: string,
  metadata?: Record<string, any>,
) {
  const data = {
    pageUrl,
    userId: userId || null,
    metadata: metadata || {},
    timestamp: new Date(),
    userAgent: (await headers()).get('user-agent') || 'unknown',
    ip: (await headers()).get('x-forwarded-for') || 'unknown',
  };

  await firestore.collection('page_views').add(data);
  return data;
}

export async function getPageViewStats(pageUrl: string, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const snapshot = await firestore
    .collection('page_views')
    .where('pageUrl', '==', pageUrl)
    .where('timestamp', '>=', startDate)
    .get();

  return {
    totalViews: snapshot.size,
    uniqueUsers: new Set(
      snapshot.docs.map(doc => doc.data().userId).filter(userId => userId !== null),
    ).size,
    viewsByDay: snapshot.docs.reduce((acc: Record<string, number>, doc) => {
      const date = doc.data().timestamp.toDate().toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}),
  };
}

export async function recordUserAction(
  action: string,
  userId: string,
  metadata?: Record<string, any>,
) {
  const data = {
    action,
    userId,
    metadata: metadata || {},
    timestamp: new Date(),
  };

  await firestore.collection('user_actions').add(data);
  return data;
}

export async function getUserActionHistory(userId: string, limit = 50) {
  const snapshot = await firestore
    .collection('user_actions')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Search and indexing utilities for Next.js
 */
export async function searchDocuments(
  collection: string,
  searchField: string,
  searchTerm: string,
  limit = 10,
) {
  // Simple text search - for more advanced search, consider using Algolia or similar
  const snapshot = await firestore
    .collection(collection)
    .where(searchField, '>=', searchTerm)
    .where(searchField, '<=', searchTerm + '\uf8ff')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addSearchableDocument(
  collection: string,
  id: string,
  data: any,
  searchableFields: string[],
) {
  // Create search keywords from searchable fields
  const searchKeywords = searchableFields
    .map(field => {
      const value = data[field];
      if (typeof value === 'string') {
        return value.toLowerCase().split(/\s+/);
      }
      return [];
    })
    .flat()
    .filter(Boolean);

  const documentData = {
    ...data,
    searchKeywords: [...new Set(searchKeywords)], // Remove duplicates
    updatedAt: new Date(),
  };

  if (!data.createdAt) {
    documentData.createdAt = new Date();
  }

  await firestore.collection(collection).doc(id).set(documentData, { merge: true });
  return documentData;
}

/**
 * Bulk operations optimized for Next.js
 */
export async function bulkOperationWithProgress<T>(
  operation: () => Promise<T[]>,
  _batchSize = 100,
  onProgress?: (completed: number, total: number) => void,
): Promise<T[]> {
  // This is a wrapper for bulk operations that can report progress
  // Useful for long-running operations in API routes
  const results = await operation();

  if (onProgress) {
    onProgress(results.length, results.length);
  }

  return results;
}

/**
 * Firestore transaction utilities optimized for Next.js
 */
export async function executeFirestoreTransaction<T>(
  operation: (transaction: FirebaseFirestore.Transaction) => Promise<T>,
): Promise<T> {
  return firestore.runTransaction(operation);
}

/**
 * Backup and restore utilities
 */
export async function backupCollection(collection: string): Promise<DocumentData[]> {
  const snapshot = await firestore.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function restoreCollection(
  collection: string,
  documents: Array<{ id: string; [key: string]: any }>,
): Promise<number> {
  const batch = firestore.batch();
  let count = 0;

  documents.forEach(doc => {
    const { id, ...data } = doc;
    const docRef = firestore.collection(collection).doc(id);
    batch.set(docRef, data);
    count++;

    // Firestore batch limit is 500 operations
    if (count % 500 === 0) {
      // For large datasets, you'd need to commit in chunks
      // This is a simplified version
    }
  });

  await batch.commit();
  return count;
}
