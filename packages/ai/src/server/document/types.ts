export interface Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  source?: string;
}

export interface DocumentChunk extends Document {
  chunkIndex: number;
  parentDocumentId: string;
  startPosition?: number;
  endPosition?: number;
}

export interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
  keepSeparator?: boolean;
}

export interface LoaderOptions {
  encoding?: 'utf8' | 'utf-8' | 'base64';
  maxSize?: number;
  allowedExtensions?: string[];
}

export interface DocumentLoader {
  load(source: string, options?: LoaderOptions): Promise<Document[]>;
  supports(source: string): boolean;
}
