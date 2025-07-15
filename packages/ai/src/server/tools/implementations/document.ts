import { logError } from '@repo/observability/server/next';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { createToolFromSpec } from '../specifications';

// In-memory document store for demo purposes
// In production, this would use a database
const documentStore = new Map<
  string,
  {
    id: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    version: number;
    path?: string;
  }
>();

/**
 * Create document tool implementation
 */
export const createDocumentTool = createToolFromSpec('createDocument', {
  execute: async ({ title, content, metadata, path: filePath }) => {
    const id = randomUUID();
    const now = new Date().toISOString();

    const document = {
      id,
      title,
      content,
      metadata,
      createdAt: now,
      updatedAt: now,
      version: 1,
      path: filePath,
    };

    // Store in memory
    documentStore.set(id, document);

    // Optionally save to file if path provided
    if (filePath) {
      try {
        const dir = path.dirname(filePath);
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic directory creation for document storage
        await fs.mkdir(dir, { recursive: true });

        const fileContent = JSON.stringify(
          {
            title,
            content,
            metadata,
            createdAt: now,
          },
          null,
          2,
        );

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file writing for document storage
        await fs.writeFile(filePath, fileContent, 'utf8');
      } catch (error) {
        logError(
          'Failed to save document to file',
          error instanceof Error ? error : new Error(String(error)),
          {
            operation: 'document_tool_save_file',
            documentId: id,
            filePath,
          },
        );
        // Don't fail the operation, just log the error
      }
    }

    return {
      id,
      title,
      createdAt: now,
      path: filePath,
    };
  },

  middleware: [
    // Validation middleware
    async (params, next) => {
      if (!params.title || params.title.trim().length === 0) {
        throw new Error('Document title cannot be empty');
      }
      if (!params.content || params.content.trim().length === 0) {
        throw new Error('Document content cannot be empty');
      }
      return next();
    },

    // Sanitization middleware
    async (params, next) => {
      // Sanitize file path if provided
      if (params.path) {
        // Ensure path is within allowed directory
        const resolvedPath = path.resolve(params.path);
        const allowedDir = path.resolve(process.cwd(), 'documents');

        if (!resolvedPath.startsWith(allowedDir)) {
          throw new Error('Document path must be within the documents directory');
        }
      }
      return next();
    },
  ],
});

/**
 * Update document tool implementation
 */
export const updateDocumentTool = createToolFromSpec('updateDocument', {
  execute: async ({ id, title, content, metadata }) => {
    const document = documentStore.get(id);

    if (!document) {
      throw new Error(`Document with id ${id} not found`);
    }

    const now = new Date().toISOString();

    // Update document
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (metadata !== undefined) {
      document.metadata = { ...document.metadata, ...metadata };
    }

    document.updatedAt = now;
    document.version += 1;

    // Update in store
    documentStore.set(id, document);

    // Update file if it exists
    if (document.path) {
      try {
        const fileContent = JSON.stringify(
          {
            title: document.title,
            content: document.content,
            metadata: document.metadata,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            version: document.version,
          },
          null,
          2,
        );

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file writing for document updates
        await fs.writeFile(document.path, fileContent, 'utf8');
      } catch (error) {
        logError(
          'Failed to update document file',
          error instanceof Error ? error : new Error(String(error)),
          {
            operation: 'document_tool_update_file',
            documentId: id,
            filePath: document.path,
          },
        );
      }
    }

    return {
      id,
      title: document.title,
      updatedAt: now,
      version: document.version,
    };
  },

  middleware: [
    // Validation middleware
    async (params, next) => {
      if (!params.id) {
        throw new Error('Document id is required');
      }

      // At least one field should be updated
      if (!params.title && !params.content && !params.metadata) {
        throw new Error('At least one field must be provided for update');
      }

      return next();
    },
  ],
});

/**
 * Search documents (simple implementation)
 */
export const searchDocumentsTool = createToolFromSpec('searchKnowledge', {
  execute: async ({ query, limit = 10, filters }) => {
    const results: Array<{
      id: string;
      title: string;
      content: string;
      score: number;
      metadata: Record<string, any>;
    }> = [];

    // Simple search implementation
    const queryLower = query.toLowerCase();

    for (const [id, doc] of documentStore) {
      // Calculate relevance score
      let score = 0;

      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 2; // Title matches are weighted higher
      }

      if (doc.content.toLowerCase().includes(queryLower)) {
        score += 1;
      }

      // Apply filters
      if (filters?.category && doc.metadata?.category !== filters.category) {
        continue;
      }

      if (filters?.tags && doc.metadata?.tags) {
        const docTags = Array.isArray(doc.metadata.tags) ? doc.metadata.tags : [];
        const hasMatchingTag = filters.tags.some(tag => docTags.includes(tag));
        if (!hasMatchingTag) continue;
      }

      if (filters?.dateRange) {
        const docDate = new Date(doc.createdAt);
        if (filters.dateRange.start && docDate < new Date(filters.dateRange.start)) continue;
        if (filters.dateRange.end && docDate > new Date(filters.dateRange.end)) continue;
      }

      if (score > 0) {
        results.push({
          id,
          title: doc.title,
          content: doc.content.substring(0, 200) + '...', // Truncate content
          score,
          metadata: doc.metadata || {},
        });
      }
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    const limitedResults = results.slice(0, limit);

    return {
      results: limitedResults,
      totalCount: results.length,
      query,
    };
  },
});
