/**
 * Document metadata
 */
export interface DocumentMetadata {
  /** Document ID */
  id: string;
  /** Document title */
  title: string;
  /** Document slug */
  slug?: string;
  /** Author info */
  author?: {
    id: string;
    name: string;
    email?: string;
  };
  /** Created timestamp */
  createdAt: Date;
  /** Updated timestamp */
  updatedAt: Date;
  /** Published timestamp */
  publishedAt?: Date;
  /** Document status */
  status?: 'draft' | 'published' | 'archived';
  /** Tags */
  tags?: string[];
  /** Categories */
  categories?: string[];
  /** Custom metadata */
  meta?: Record<string, any>;
  /** Optional document content */
  content?: DocumentContent;
}

/**
 * Document content
 */
export interface DocumentContent {
  /** HTML content */
  html?: string;
  /** JSON content (TipTap format) */
  json?: any;
  /** Markdown content */
  markdown?: string;
  /** Plain text content */
  text?: string;
}

/**
 * Full document structure
 */
export interface Document extends DocumentMetadata {
  /** Document content */
  content: DocumentContent;
}

/**
 * Document creation input
 */
export interface CreateDocumentInput {
  /** Document title */
  title: string;
  /** Initial content */
  content?: DocumentContent;
  /** Document status */
  status?: 'draft' | 'published';
  /** Tags */
  tags?: string[];
  /** Categories */
  categories?: string[];
  /** Custom metadata */
  meta?: Record<string, any>;
}

/**
 * Document update input
 */
export interface UpdateDocumentInput {
  /** Document ID */
  id: string;
  /** Updated title */
  title?: string;
  /** Updated content */
  content?: DocumentContent;
  /** Updated status */
  status?: 'draft' | 'published' | 'archived';
  /** Updated tags */
  tags?: string[];
  /** Updated categories */
  categories?: string[];
  /** Updated custom metadata */
  meta?: Record<string, any>;
}

/**
 * Document search filters
 */
export interface DocumentSearchFilters {
  /** Search query */
  query?: string;
  /** Filter by status */
  status?: 'draft' | 'published' | 'archived' | 'all';
  /** Filter by author ID */
  authorId?: string;
  /** Filter by tags */
  tags?: string[];
  /** Filter by categories */
  categories?: string[];
  /** Date range filter */
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  /** Sort field */
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'publishedAt';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Pagination */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Document search result
 */
export interface DocumentSearchResult {
  /** Documents */
  documents: Document[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Document storage adapter interface
 */
export interface DocumentStorageAdapter {
  /** Load a document by ID */
  load: (id: string) => Promise<DocumentMetadata>;
  /** Persist a document */
  save: (document: DocumentMetadata) => Promise<void>;
  /** Remove a document by ID */
  delete: (id: string) => Promise<void>;
  /** List available documents */
  list: () => Promise<DocumentMetadata[]>;
  /** Optional legacy APIs for richer backends */
  getDocument?: (id: string) => Promise<Document | null>;
  createDocument?: (input: CreateDocumentInput) => Promise<Document>;
  updateDocument?: (input: UpdateDocumentInput) => Promise<Document>;
  deleteDocument?: (id: string) => Promise<void>;
  searchDocuments?: (filters: DocumentSearchFilters) => Promise<DocumentSearchResult>;
  listDocuments?: (page?: number, limit?: number) => Promise<DocumentSearchResult>;
}
