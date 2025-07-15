/**
 * Document Processing Types
 * Types for document handling and processing in RAG systems
 */

import type { VectorRecord } from '../vector/types';

/**
 * Base document interface
 */
export interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document metadata structure
 */
export interface DocumentMetadata {
  title?: string;
  source?: string;
  url?: string;
  author?: string;
  type?: DocumentType;
  language?: string;
  tags?: string[];
  summary?: string;
  wordCount?: number;
  pageCount?: number;
  [key: string]: any;
}

/**
 * Supported document types
 */
export type DocumentType =
  | 'text'
  | 'markdown'
  | 'html'
  | 'pdf'
  | 'docx'
  | 'rtf'
  | 'csv'
  | 'json'
  | 'xml'
  | 'code'
  | 'email'
  | 'chat'
  | 'unknown';

/**
 * Document chunk for processing
 */
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  metadata: ChunkMetadata;
  embedding?: number[];
}

/**
 * Chunk metadata
 */
export interface ChunkMetadata extends DocumentMetadata {
  chunkIndex: number;
  startOffset?: number;
  endOffset?: number;
  tokens?: number;
  sentences?: number;
  paragraphs?: number;
  overlap?: number;
}

/**
 * Document processing configuration
 */
export interface DocumentProcessingConfig {
  chunkSize?: number;
  chunkOverlap?: number;
  chunkingStrategy?: ChunkingStrategy;
  preserveStructure?: boolean;
  includeMetadata?: boolean;
  generateSummary?: boolean;
  extractKeywords?: boolean;
  minChunkSize?: number;
  maxChunkSize?: number;
}

/**
 * Chunking strategies
 */
export type ChunkingStrategy =
  | 'sentence'
  | 'paragraph'
  | 'fixed_size'
  | 'semantic'
  | 'recursive'
  | 'markdown'
  | 'code';

/**
 * Document processor interface
 */
export interface DocumentProcessor {
  process(document: Document, config?: DocumentProcessingConfig): Promise<DocumentChunk[]>;
  chunk(content: string, config?: DocumentProcessingConfig): Promise<DocumentChunk[]>;
  extractMetadata(content: string, type?: DocumentType): Promise<DocumentMetadata>;
  generateSummary(content: string): Promise<string>;
  extractKeywords(content: string): Promise<string[]>;
}

/**
 * Document loader interface
 */
export interface DocumentLoader {
  load(source: string | File | Buffer): Promise<Document>;
  supports(source: string | File): boolean;
  getMetadata(source: string | File): Promise<DocumentMetadata>;
}

/**
 * Document store interface
 */
export interface DocumentStore {
  store(document: Document): Promise<void>;
  retrieve(id: string): Promise<Document | null>;
  search(query: string, options?: DocumentSearchOptions): Promise<Document[]>;
  delete(id: string): Promise<void>;
  list(options?: DocumentListOptions): Promise<Document[]>;
  update(id: string, updates: Partial<Document>): Promise<void>;
}

/**
 * Document search options
 */
export interface DocumentSearchOptions {
  limit?: number;
  offset?: number;
  type?: DocumentType;
  tags?: string[];
  author?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  metadata?: Record<string, any>;
  sortBy?: 'relevance' | 'date' | 'title' | 'author';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Document list options
 */
export interface DocumentListOptions {
  limit?: number;
  offset?: number;
  type?: DocumentType;
  tags?: string[];
  sortBy?: 'date' | 'title' | 'author' | 'type';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Document processing result
 */
export interface DocumentProcessingResult {
  document: Document;
  chunks: DocumentChunk[];
  vectors?: VectorRecord[];
  summary?: string;
  keywords?: string[];
  processingTime: number;
  stats: DocumentProcessingStats;
}

/**
 * Document processing statistics
 */
export interface DocumentProcessingStats {
  originalLength: number;
  chunkCount: number;
  averageChunkSize: number;
  totalTokens?: number;
  processingTime: number;
  embeddingTime?: number;
  errors: number;
}

/**
 * Document validation result
 */
export interface DocumentValidationResult {
  isValid: boolean;
  errors: DocumentValidationError[];
  warnings: DocumentValidationWarning[];
}

/**
 * Document validation error
 */
export interface DocumentValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Document validation warning
 */
export interface DocumentValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Document transformation options
 */
export interface DocumentTransformationOptions {
  normalizeWhitespace?: boolean;
  removeEmptyLines?: boolean;
  convertToMarkdown?: boolean;
  extractLinks?: boolean;
  extractImages?: boolean;
  preserveFormatting?: boolean;
  customTransformers?: DocumentTransformer[];
}

/**
 * Document transformer interface
 */
export interface DocumentTransformer {
  name: string;
  transform(content: string, metadata?: DocumentMetadata): Promise<string>;
  supports(type: DocumentType): boolean;
}

/**
 * Document indexing options
 */
export interface DocumentIndexingOptions {
  generateEmbeddings?: boolean;
  embeddingModel?: string;
  extractEntities?: boolean;
  generateKeywords?: boolean;
  createSummary?: boolean;
  chunkingConfig?: DocumentProcessingConfig;
}

/**
 * Document similarity result
 */
export interface DocumentSimilarityResult {
  document: Document;
  similarity: number;
  matchedChunks: DocumentChunk[];
  explanation?: string;
}

/**
 * Batch document operation result
 */
export interface BatchDocumentResult<T = any> {
  successful: number;
  failed: number;
  results: T[];
  errors: Array<{
    documentId: string;
    error: Error;
  }>;
  totalTime: number;
}

/**
 * Document content types for different formats
 */
export interface TextDocument extends Document {
  type: 'text';
  content: string;
}

export interface MarkdownDocument extends Document {
  type: 'markdown';
  content: string;
  headings?: Array<{
    level: number;
    text: string;
    id?: string;
  }>;
}

export interface HTMLDocument extends Document {
  type: 'html';
  content: string;
  title?: string;
  links?: string[];
  images?: string[];
}

export interface PDFDocument extends Document {
  type: 'pdf';
  content: string;
  pageCount: number;
  pages?: Array<{
    number: number;
    content: string;
  }>;
}

export interface CodeDocument extends Document {
  type: 'code';
  content: string;
  language?: string;
  functions?: string[];
  classes?: string[];
  imports?: string[];
}

/**
 * Document errors
 */
export class DocumentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public documentId?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'DocumentError';
  }
}

export class DocumentNotFoundError extends DocumentError {
  constructor(id: string) {
    super(`Document with id "${id}" not found`, 'DOCUMENT_NOT_FOUND', id);
    this.name = 'DocumentNotFoundError';
  }
}

export class DocumentProcessingError extends DocumentError {
  constructor(message: string, documentId?: string, details?: any) {
    super(message, 'PROCESSING_ERROR', documentId, details);
    this.name = 'DocumentProcessingError';
  }
}

export class UnsupportedDocumentTypeError extends DocumentError {
  constructor(type: string) {
    super(`Unsupported document type: ${type}`, 'UNSUPPORTED_TYPE', undefined, { type });
    this.name = 'UnsupportedDocumentTypeError';
  }
}

/**
 * Type guards
 */
export function isTextDocument(doc: Document): doc is TextDocument {
  return doc.metadata.type === 'text';
}

export function isMarkdownDocument(doc: Document): doc is MarkdownDocument {
  return doc.metadata.type === 'markdown';
}

export function isHTMLDocument(doc: Document): doc is HTMLDocument {
  return doc.metadata.type === 'html';
}

export function isPDFDocument(doc: Document): doc is PDFDocument {
  return doc.metadata.type === 'pdf';
}

export function isCodeDocument(doc: Document): doc is CodeDocument {
  return doc.metadata.type === 'code';
}

/**
 * Utility types
 */
export type DocumentId = string;
export type ChunkId = string;
export type ContentHash = string;
