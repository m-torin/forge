import { describe, expect, it } from 'vitest';

import {
  BulkOperationResult,
  DatabaseConnection,
  FirestoreDocument,
  FirestoreQuery,
  QueryOptions,
  RedisOperationResult,
  VectorQuery,
  VectorSearchResult,
} from '#/src/types';

describe('Database Types', () => {
  describe('DatabaseConnection interface', () => {
    it('should have required url property', () => {
      const connection: DatabaseConnection = {
        url: 'https://example.com',
      };

      expect(connection.url).toBe('https://example.com');
    });

    it('should support optional token property', () => {
      const connection: DatabaseConnection = {
        url: 'https://example.com',
        token: 'secret-token',
      };

      expect(connection.url).toBe('https://example.com');
      expect(connection.token).toBe('secret-token');
    });
  });

  describe('VectorSearchResult interface', () => {
    it('should have required properties', () => {
      const result: VectorSearchResult = {
        id: 'vector-1',
        score: 0.95,
      };

      expect(result.id).toBe('vector-1');
      expect(result.score).toBe(0.95);
    });

    it('should support optional metadata and data', () => {
      const result: VectorSearchResult = {
        id: 'vector-1',
        score: 0.95,
        metadata: { category: 'test' },
        data: 'example data',
      };

      expect(result.metadata?.category).toBe('test');
      expect(result.data).toBe('example data');
    });
  });

  describe('VectorQuery interface', () => {
    it('should support vector queries', () => {
      const query: VectorQuery = {
        vector: [0.1, 0.2, 0.3],
        topK: 10,
        includeMetadata: true,
      };

      expect(query.vector).toStrictEqual([0.1, 0.2, 0.3]);
      expect(query.topK).toBe(10);
      expect(query.includeMetadata).toBe(true);
    });

    it('should support text queries', () => {
      const query: VectorQuery = {
        data: 'search query text',
        topK: 5,
        filter: 'category = "test"',
      };

      expect(query.data).toBe('search query text');
      expect(query.topK).toBe(5);
      expect(query.filter).toBe('category = "test"');
    });
  });

  describe('RedisOperationResult interface', () => {
    it('should support successful operations', () => {
      const result: RedisOperationResult = {
        success: true,
        value: 'test-value',
      };

      expect(result.success).toBe(true);
      expect(result.value).toBe('test-value');
    });

    it('should support failed operations', () => {
      const result: RedisOperationResult = {
        success: false,
        error: 'Operation failed',
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe('Operation failed');
    });
  });

  describe('FirestoreDocument interface', () => {
    it('should have required properties', () => {
      const doc: FirestoreDocument = {
        id: 'doc-1',
        data: { name: 'Test Document', value: 42 },
      };

      expect(doc.id).toBe('doc-1');
      expect(doc.data.name).toBe('Test Document');
      expect(doc.data.value).toBe(42);
    });

    it('should support optional timestamps', () => {
      const created = new Date('2023-01-01');
      const updated = new Date('2023-01-02');

      const doc: FirestoreDocument = {
        id: 'doc-1',
        data: { name: 'Test Document' },
        created,
        updated,
      };

      expect(doc.created).toBe(created);
      expect(doc.updated).toBe(updated);
    });
  });

  describe('FirestoreQuery interface', () => {
    it('should support basic queries', () => {
      const query: FirestoreQuery = {
        collection: 'users',
        limit: 10,
      };

      expect(query.collection).toBe('users');
      expect(query.limit).toBe(10);
    });

    it('should support complex queries with where clauses', () => {
      const query: FirestoreQuery = {
        collection: 'users',
        where: [
          { field: 'age', operator: '>=', value: 18 },
          { field: 'status', operator: '==', value: 'active' },
        ],
        orderBy: [{ field: 'name', direction: 'asc' }],
        limit: 50,
      };

      expect(query.where).toHaveLength(2);
      expect(query.where?.[0].field).toBe('age');
      expect(query.where?.[0].operator).toBe('>=');
      expect(query.where?.[0].value).toBe(18);
      expect(query.orderBy).toHaveLength(1);
      expect(query.orderBy?.[0].field).toBe('name');
      expect(query.orderBy?.[0].direction).toBe('asc');
    });
  });

  describe('BulkOperationResult interface', () => {
    it('should track operation results', () => {
      const result: BulkOperationResult = {
        success: true,
        processed: 100,
        errors: [],
      };

      expect(result.success).toBe(true);
      expect(result.processed).toBe(100);
      expect(result.errors).toStrictEqual([]);
    });

    it('should track operation errors', () => {
      const result: BulkOperationResult = {
        success: false,
        processed: 75,
        errors: ['Item 76 failed validation', 'Item 80 network error'],
      };

      expect(result.success).toBe(false);
      expect(result.processed).toBe(75);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('QueryOptions interface', () => {
    it('should support pagination and ordering', () => {
      const options: QueryOptions = {
        limit: 25,
        offset: 50,
        orderBy: 'created_at',
        orderDirection: 'desc',
      };

      expect(options.limit).toBe(25);
      expect(options.offset).toBe(50);
      expect(options.orderBy).toBe('created_at');
      expect(options.orderDirection).toBe('desc');
    });

    it('should support minimal options', () => {
      const options: QueryOptions = {
        limit: 10,
      };

      expect(options.limit).toBe(10);
      expect(options.offset).toBeUndefined();
    });
  });
});
