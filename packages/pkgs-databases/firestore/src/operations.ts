/**
 * Domain-specific Firestore operations
 * Higher-level abstractions for common patterns
 */

import type { FirestoreClient, FirestoreResult } from './types';

/**
 * User management operations
 */
export class UserOperations {
  constructor(private client: FirestoreClient) {}

  /**
   * Create user with validation and normalization
   */
  async createUser(userData: {
    email: string;
    name: string;
    avatar?: string;
    metadata?: Record<string, any>;
  }): Promise<FirestoreResult<{ id: string; path: string }>> {
    try {
      const normalizedData = {
        ...userData,
        email: userData.email.toLowerCase().trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };

      const result = await this.client.collection('users').add(normalizedData);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<FirestoreResult<any>> {
    try {
      const querySnapshot = await this.client
        .collection('users')
        .where('email', '==', email.toLowerCase().trim())
        .get();

      if (querySnapshot.docs.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const doc = querySnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          ...doc.data(),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<{
      name: string;
      avatar: string;
      metadata: Record<string, any>;
    }>,
  ): Promise<FirestoreResult<void>> {
    try {
      await this.client.doc(`users/${userId}`).update({
        ...updates,
        updatedAt: new Date(),
      });

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Soft delete user
   */
  async deactivateUser(userId: string): Promise<FirestoreResult<void>> {
    try {
      await this.client.doc(`users/${userId}`).update({
        status: 'inactive',
        deactivatedAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

/**
 * Content management operations
 */
export class ContentOperations {
  constructor(private client: FirestoreClient) {}

  /**
   * Create content with automatic metadata
   */
  async createContent(contentData: {
    title: string;
    body: string;
    type: 'post' | 'page' | 'article';
    authorId: string;
    tags?: string[];
    published?: boolean;
  }): Promise<FirestoreResult<{ id: string; path: string }>> {
    try {
      const slug = this.generateSlug(contentData.title);
      const now = new Date();

      const normalizedData = {
        ...contentData,
        slug,
        createdAt: now,
        updatedAt: now,
        published: contentData.published ?? false,
        publishedAt: contentData.published ? now : null,
        tags: contentData.tags || [],
        wordCount: this.countWords(contentData.body),
        readingTime: this.calculateReadingTime(contentData.body),
      };

      const result = await this.client.collection('content').add(normalizedData);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get published content with pagination
   */
  async getPublishedContent(
    options: {
      type?: string;
      tags?: string[];
      limit?: number;
      startAfter?: any;
    } = {},
  ): Promise<FirestoreResult<{ docs: any[]; hasMore: boolean }>> {
    try {
      let query = this.client.collection('content').where('published', '==', true);

      if (options.type) {
        query = query.where('type', '==', options.type);
      }

      if (options.tags?.length) {
        query = query.where('tags', 'array-contains-any', options.tags);
      }

      query = query.orderBy('publishedAt', 'desc');

      if (options.limit) {
        query = query.limit(options.limit + 1); // +1 to check if there are more
      }

      if (options.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      const snapshot = await query.get();
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const hasMore = options.limit ? docs.length > options.limit : false;
      if (hasMore) {
        docs.pop(); // Remove the extra document used for pagination
      }

      return { success: true, data: { docs, hasMore } };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Search content by title and body
   */
  async searchContent(
    searchTerm: string,
    options: {
      type?: string;
      limit?: number;
    } = {},
  ): Promise<FirestoreResult<any[]>> {
    try {
      // Note: This is a basic implementation. For production, consider using
      // Algolia, Elasticsearch, or Firestore's full-text search extensions

      let query = this.client.collection('content');

      if (options.type) {
        query = query.where('type', '==', options.type);
      }

      query = query.where('published', '==', true);

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(
          doc =>
            doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.body?.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      return { success: true, data: docs };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  /**
   * Calculate reading time (average 200 words per minute)
   */
  private calculateReadingTime(text: string): number {
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / 200);
  }
}

/**
 * Analytics operations
 */
export class AnalyticsOperations {
  constructor(private client: FirestoreClient) {}

  /**
   * Track page view
   */
  async trackPageView(data: {
    path: string;
    userId?: string;
    sessionId: string;
    userAgent?: string;
    referrer?: string;
  }): Promise<FirestoreResult<void>> {
    try {
      const now = new Date();
      const trackingData = {
        ...data,
        timestamp: now,
        date: now.toISOString().split('T')[0], // YYYY-MM-DD
        hour: now.getHours(),
      };

      await this.client.collection('analytics/pageviews/events').add(trackingData);

      // Update daily aggregates
      await this.updateDailyStats('pageviews', trackingData.date, data.path);

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(data: {
    event: string;
    category: string;
    label?: string;
    value?: number;
    userId?: string;
    sessionId: string;
    metadata?: Record<string, any>;
  }): Promise<FirestoreResult<void>> {
    try {
      const now = new Date();
      const eventData = {
        ...data,
        timestamp: now,
        date: now.toISOString().split('T')[0],
        hour: now.getHours(),
      };

      await this.client.collection('analytics/events/data').add(eventData);

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get analytics data for date range
   */
  async getAnalytics(options: {
    startDate: string;
    endDate: string;
    metric: 'pageviews' | 'events';
    groupBy?: 'hour' | 'day';
  }): Promise<FirestoreResult<any[]>> {
    try {
      const collection =
        options.metric === 'pageviews' ? 'analytics/pageviews/daily' : 'analytics/events/daily';

      const query = this.client
        .collection(collection)
        .where('date', '>=', options.startDate)
        .where('date', '<=', options.endDate)
        .orderBy('date');

      const snapshot = await query.get();
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Update daily statistics
   */
  private async updateDailyStats(metric: string, date: string, path?: string): Promise<void> {
    const docRef = this.client.doc(`analytics/${metric}/daily/${date}`);

    // Use Firestore transaction for atomic increment
    await this.client.runTransaction(async transaction => {
      const doc = await transaction.get(docRef);

      if (doc.exists()) {
        const data = doc.data();
        transaction.update(docRef, {
          count: (data.count || 0) + 1,
          updatedAt: new Date(),
        });
      } else {
        transaction.set(docRef, {
          date,
          count: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
  }
}

/**
 * Session management operations
 */
export class SessionOperations {
  constructor(private client: FirestoreClient) {}

  /**
   * Create user session
   */
  async createSession(data: {
    userId: string;
    deviceInfo?: {
      userAgent: string;
      ip: string;
      location?: string;
    };
    expiresAt?: Date;
  }): Promise<FirestoreResult<{ id: string; token: string }>> {
    try {
      const sessionToken = this.generateSessionToken();
      const now = new Date();
      const expiresAt = data.expiresAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const sessionData = {
        userId: data.userId,
        token: sessionToken,
        deviceInfo: data.deviceInfo,
        createdAt: now,
        updatedAt: now,
        expiresAt,
        isActive: true,
      };

      const result = await this.client.collection('sessions').add(sessionData);

      return {
        success: true,
        data: {
          id: result.id,
          token: sessionToken,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Validate session token
   */
  async validateSession(token: string): Promise<FirestoreResult<any>> {
    try {
      const querySnapshot = await this.client
        .collection('sessions')
        .where('token', '==', token)
        .where('isActive', '==', true)
        .get();

      if (querySnapshot.docs.length === 0) {
        return { success: false, error: 'Session not found' };
      }

      const session = querySnapshot.docs[0].data();

      // Check if session is expired
      if (session.expiresAt.toDate() < new Date()) {
        await this.invalidateSession(token);
        return { success: false, error: 'Session expired' };
      }

      // Update last accessed time
      await querySnapshot.docs[0].ref.update({
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, data: session };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(token: string): Promise<FirestoreResult<void>> {
    try {
      const querySnapshot = await this.client
        .collection('sessions')
        .where('token', '==', token)
        .get();

      if (querySnapshot.docs.length === 0) {
        return { success: false, error: 'Session not found' };
      }

      await querySnapshot.docs[0].ref.update({
        isActive: false,
        updatedAt: new Date(),
      });

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Audit log operations
 */
export class AuditOperations {
  constructor(private client: FirestoreClient) {}

  /**
   * Log user action
   */
  async logAction(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    metadata?: Record<string, any>;
    ip?: string;
    userAgent?: string;
  }): Promise<FirestoreResult<void>> {
    try {
      const logData = {
        ...data,
        timestamp: new Date(),
        date: new Date().toISOString().split('T')[0],
      };

      await this.client.collection('audit_logs').add(logData);

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get audit logs for user or resource
   */
  async getAuditLogs(options: {
    userId?: string;
    resource?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<FirestoreResult<any[]>> {
    try {
      let query = this.client.collection('audit_logs');

      if (options.userId) {
        query = query.where('userId', '==', options.userId);
      }

      if (options.resource) {
        query = query.where('resource', '==', options.resource);
      }

      if (options.resourceId) {
        query = query.where('resourceId', '==', options.resourceId);
      }

      if (options.startDate) {
        query = query.where('date', '>=', options.startDate);
      }

      if (options.endDate) {
        query = query.where('date', '<=', options.endDate);
      }

      query = query.orderBy('timestamp', 'desc');

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: logs };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

/**
 * Combined operations factory
 */
export function createFirestoreOperations(client: FirestoreClient) {
  return {
    users: new UserOperations(client),
    content: new ContentOperations(client),
    analytics: new AnalyticsOperations(client),
    sessions: new SessionOperations(client),
    audit: new AuditOperations(client),
  };
}

/**
 * Helper for batch operations
 */
export async function batchOperation<T>(
  client: FirestoreClient,
  operations: Array<() => Promise<T>>,
): Promise<FirestoreResult<T[]>> {
  try {
    const batch = client.batch();
    const results = await Promise.all(operations.map(op => op()));

    return { success: true, data: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
