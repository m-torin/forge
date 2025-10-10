import type { DocumentMetadata, DocumentStorageAdapter } from '../types';

/**
 * In-memory document store adapter
 *
 * Stores documents in memory (data is lost on page reload)
 * Useful for testing and development
 *
 * @example
 * ```ts
 * const store = createMemoryStore();
 * const doc = await store.load('doc-1');
 * await store.save({ ...doc, title: 'Updated' });
 * ```
 */
export function createMemoryStore(): DocumentStorageAdapter {
  const documents = new Map<string, DocumentMetadata>();

  return {
    async load(id: string): Promise<DocumentMetadata> {
      const doc = documents.get(id);
      if (!doc) {
        throw new Error(`Document not found: ${id}`);
      }
      return doc;
    },

    async save(document: DocumentMetadata): Promise<void> {
      documents.set(document.id, {
        ...document,
        updatedAt: new Date(),
      });
    },

    async delete(id: string): Promise<void> {
      if (!documents.has(id)) {
        throw new Error(`Document not found: ${id}`);
      }
      documents.delete(id);
    },

    async list(): Promise<DocumentMetadata[]> {
      return Array.from(documents.values()).sort(
        (a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0),
      );
    },
  };
}

/**
 * LocalStorage document store adapter
 *
 * Stores documents in browser localStorage
 * Data persists across page reloads but is limited in size (~5MB)
 *
 * @example
 * ```ts
 * const store = createLocalStorageStore('my-app-docs');
 * await store.save(document);
 * const docs = await store.list();
 * ```
 */
export function createLocalStorageStore(prefix: string = 'editor-docs'): DocumentStorageAdapter {
  const getKey = (id: string) => `${prefix}:${id}`;
  const getIndexKey = () => `${prefix}:index`;

  const getIndex = (): string[] => {
    try {
      const index = localStorage.getItem(getIndexKey());
      return index ? JSON.parse(index) : [];
    } catch {
      return [];
    }
  };

  const setIndex = (ids: string[]) => {
    localStorage.setItem(getIndexKey(), JSON.stringify(ids));
  };

  const addToIndex = (id: string) => {
    const index = getIndex();
    if (!index.includes(id)) {
      index.push(id);
      setIndex(index);
    }
  };

  const removeFromIndex = (id: string) => {
    const index = getIndex();
    setIndex(index.filter(existingId => existingId !== id));
  };

  return {
    async load(id: string): Promise<DocumentMetadata> {
      const item = localStorage.getItem(getKey(id));
      if (!item) {
        throw new Error(`Document not found: ${id}`);
      }

      const doc = JSON.parse(item);
      // Parse dates
      if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
      if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);

      return doc;
    },

    async save(document: DocumentMetadata): Promise<void> {
      const doc = {
        ...document,
        updatedAt: new Date(),
      };

      localStorage.setItem(getKey(document.id), JSON.stringify(doc));
      addToIndex(document.id);
    },

    async delete(id: string): Promise<void> {
      const key = getKey(id);
      if (!localStorage.getItem(key)) {
        throw new Error(`Document not found: ${id}`);
      }

      localStorage.removeItem(key);
      removeFromIndex(id);
    },

    async list(): Promise<DocumentMetadata[]> {
      const ids = getIndex();
      const documents: DocumentMetadata[] = [];

      for (const id of ids) {
        try {
          const doc = await this.load(id);
          documents.push(doc);
        } catch {
          // Skip documents that can't be loaded
          removeFromIndex(id);
        }
      }

      return documents.sort(
        (a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0),
      );
    },
  };
}

/**
 * Create a document store adapter for remote API
 *
 * Communicates with a backend API for document storage
 *
 * @param baseUrl - Base URL of the API
 * @param options - Fetch options
 * @returns Document storage adapter
 *
 * @example
 * ```ts
 * const store = createApiStore('https://api.example.com/documents', {
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 * await store.save(document);
 * ```
 */
export function createApiStore(baseUrl: string, options: RequestInit = {}): DocumentStorageAdapter {
  const fetchWithOptions = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, {
      ...options,
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response;
  };

  return {
    async load(id: string): Promise<DocumentMetadata> {
      const response = await fetchWithOptions(`${baseUrl}/${id}`);
      const doc = await response.json();

      // Parse dates
      if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
      if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);

      return doc;
    },

    async save(document: DocumentMetadata): Promise<void> {
      await fetchWithOptions(`${baseUrl}/${document.id}`, {
        method: 'PUT',
        body: JSON.stringify(document),
      });
    },

    async delete(id: string): Promise<void> {
      await fetchWithOptions(`${baseUrl}/${id}`, {
        method: 'DELETE',
      });
    },

    async list(): Promise<DocumentMetadata[]> {
      const response = await fetchWithOptions(baseUrl);
      const documents = await response.json();

      // Parse dates
      return documents.map((doc: any) => ({
        ...doc,
        createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
      }));
    },
  };
}

/**
 * Create a new document with default metadata
 *
 * @param overrides - Optional property overrides
 * @returns New document metadata
 *
 * @example
 * ```ts
 * const doc = createDocument({ title: 'My Document' });
 * await store.save(doc);
 * ```
 */
export function createDocument(overrides: Partial<DocumentMetadata> = {}): DocumentMetadata {
  const now = new Date();

  return {
    id: overrides.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: overrides.title || 'Untitled Document',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    content: overrides.content,
    meta: overrides.meta,
  };
}
