// TypeScript types for SEO Content Generation Workflow
// Enhanced with AI integration and strategy-based processing

export type SeoStrategy = 'conversion' | 'awareness' | 'discovery';
export type SeoPriority = 'high' | 'medium' | 'low';
export type TriggerType = 'manual' | 'scheduled' | 'child';

/**
 * Main workflow payload interface
 */
export interface SeoWorkflowPayload {
  trigger: TriggerType;
  productIds?: string[];
  limit?: number;
  onlyMissing?: boolean;
  regenerate?: boolean;
  parentRunId?: string;
  batchIndex?: number;
  priorityBatch?: boolean;
  progressWebhook?: string;
  categoryFilter?: string;
  brandFilter?: string;
  seoStrategy?: SeoStrategy;
}

/**
 * Mock Product interface for development (will replace with actual Product model)
 */
export interface ProductWithSeo {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  url: string;
  sku: string | null;
  inStock: boolean;
  rating: number | null;
  reviewCount: number | null;

  // SEO fields
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[] | null;
  seoH1: string | null;
  seoCanonicalUrl: string | null;
  seoStructuredData: Record<string, any> | null;
  seoGeneratedAt: Date | null;
  seoGenerationMetadata: Record<string, any> | null;
  seoPriority: SeoPriority;
  seoStrategy: SeoStrategy;
  avgCategoryPrice: number | null;

  // Relations (mocked)
  category: {
    id: string;
    name: string;
    path?: string;
  } | null;
  brand: {
    id: string;
    name: string;
  } | null;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }>;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  reviews?: Array<{
    rating: number;
    comment: string | null;
    verified: boolean;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Core SEO content structure
 */
export interface SeoContent {
  title: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  canonicalUrl: string;
  structuredData: Record<string, any>;
}

/**
 * LMStudio response interface (commented for development)
 */
export interface LMStudioResponse {
  variation: number;
  strategy: SeoStrategy;
  content: SeoContent;
  model: string;
  timestamp: string;
  tokensUsed: number;
}

/**
 * SEO generation result for a single product
 */
export interface SeoGenerationResult {
  productId: string;
  success: boolean;
  seoContent?: SeoContent;
  // lmstudioResponses?: LMStudioResponse[]; // Commented for development
  // claudeAnalysis?: string; // Commented for development
  // claudeImprovements?: string[]; // Commented for development
  errors?: string[];
  processingTime: number;
  strategy?: SeoStrategy;
  confidence?: number;
  tokensUsed?: number;
  skipped?: boolean;
  skipReason?: string;
}

/**
 * Workflow execution statistics
 */
export interface WorkflowStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  averageProcessingTime: number;
  totalTokensUsed: number;
  averageConfidence: number;
  processingTimeMs: number;
  childWorkflowIds?: string[];
  priorityProductsProcessed: number;
}

/**
 * Overall SEO processing statistics
 */
export interface SeoProcessingStats {
  totalProducts: number;
  productsWithSeo: number;
  productsWithoutSeo: number;
  highPriorityProducts: number;
  recentlyGenerated: number;
  totalTokensUsed: number;
  totalProcessingTime: number;
  averageConfidence: number;
  successRate: number;
  lastUpdated: string;
}

/**
 * Processing rules per category/product type
 */
export interface ProcessingRules {
  strategy: SeoStrategy;
  variations: number;
  keywordDensity: number;
  titleStyle: string;
  descriptionStyle: string;
  timeout: number;
}

/**
 * Error tracking interface
 */
export interface ErrorDetail {
  productId: string;
  error: string;
  timestamp: string;
  stage: 'fetch' | 'lmstudio' | 'claude' | 'update';
}

/**
 * Product validation result
 */
export interface ProductValidation {
  valid: boolean;
  reason?: string;
}

/**
 * Skip generation check result
 */
export interface SkipGenerationCheck {
  skip: boolean;
  reason?: string;
}
