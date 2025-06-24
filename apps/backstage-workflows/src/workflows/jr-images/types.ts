export type ProcessingPriority = 'high' | 'medium' | 'low';
export type ImageType = 'hero' | 'gallery' | 'thumbnail' | 'variant';
export type TriggerType = 'manual' | 'scheduled' | 'child';

export interface JrImagesWorkflowPayload {
  trigger: TriggerType;
  batchSize?: number;
  compressionQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
  parentRunId?: string;
  batchIndex?: number;
  documentIds?: string[];
  priorityBatch?: boolean;
  progressWebhook?: string;
}

export interface FirestoreDocument {
  id: string;
  wasMapped: boolean;
  pdpImgs: string[];
  productUrl: string;
  productTitle: string;
  priority: ProcessingPriority;
  imageTypes?: ImageType[];
  scrapedAt: any;
  r2Images?: ProcessedImage[];
  mappingErrors?: string[];
  mappingAttempts?: number;
  partialSuccess?: boolean;
  failedImages?: FailedImage[];
  processingTime?: number;
}

export interface ProcessedImage {
  originalUrl: string;
  r2Url: string;
  r2Key: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

export interface FailedImage {
  index: number;
  originalUrl: string;
  error: string;
  timestamp: string;
}

export interface JrImagesProcessingResult {
  documentId: string;
  success: boolean;
  processedImages?: ProcessedImage[];
  failedImages?: FailedImage[];
  errors?: string[];
  processingTime: number;
  mappingAttempts?: number;
  partialSuccess?: boolean;
}

export interface JrImagesWorkflowStats {
  totalProcessed: number;
  successfulDocuments: number;
  failedDocuments: number;
  partialSuccessDocuments: number;
  totalImages: number;
  totalImagesProcessed: number;
  totalImagesFailed: number;
  totalBytesProcessed: number;
  averageCompressionRatio: number;
  processingTimeMs: number;
  childWorkflowIds?: string[];
  priorityDocumentsProcessed: number;
}

export interface JrImagesProcessingStats {
  totalDocuments: number;
  mappedDocuments: number;
  unmappedDocuments: number;
  failedDocuments: number;
  partialSuccessDocuments: number;
  totalImagesProcessed: number;
  totalBytesProcessed: number;
  averageCompressionRatio: number;
  processingTimeMs: number;
  lastUpdated: string;
}

export interface ProcessingRules {
  priority: ProcessingPriority;
  maxWidth: number;
  maxHeight: number;
  quality: number;
  skipFormats?: string[];
  timeout?: number;
}

export interface JrImagesErrorDetail {
  documentId: string;
  imageIndex?: number;
  error: string;
  timestamp: string;
}

/**
 * JR-Images workflow execution status
 */
export type JrImagesWorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Individual JR-Images workflow step
 */
export interface JrImagesWorkflowStep {
  id: string;
  name: string;
  status: JrImagesWorkflowStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  output?: unknown;
  documentId?: string;
  imagesProcessed?: number;
  isPriority?: boolean;
}

/**
 * JR-Images workflow execution result
 */
export interface JrImagesWorkflowExecution {
  workflowRunId: string;
  status: JrImagesWorkflowStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  steps: JrImagesWorkflowStep[];
  stats?: {
    totalDocuments: number;
    totalImages: number;
    priorityDocuments: number;
    childWorkflows: number;
  };
}

/**
 * JR-Images workflow list response
 */
export interface JrImagesWorkflowListResponse {
  workflows: JrImagesWorkflowExecution[];
  total: number;
  hasMore: boolean;
}

/**
 * JR-Images workflow input for triggering
 */
export interface JrImagesWorkflowInput {
  batchSize?: number;
  compressionQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
  progressWebhook?: string;
}

/**
 * JR-Images workflow trigger options
 */
export interface JrImagesTriggerWorkflowInput {
  workflowRunId?: string;
  retries?: number;
  delay?: string | number;
}

/**
 * Get the base URL for JR-Images workflow endpoints
 */
export function getJrImagesWorkflowBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for server-side
  return 'http://localhost:3303';
}
