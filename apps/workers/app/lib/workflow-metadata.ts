/**
 * Workflow metadata for the UI
 * This is a client-safe file that doesn't depend on server-side code
 */

export interface WorkflowMetadata {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  icon?: string;
  color?: string;
  features: string[];
}

/**
 * Registry of all workflow metadata
 */
export const workflowMetadata: Record<string, WorkflowMetadata> = {
  basic: {
    id: 'basic',
    title: 'Basic Workflow',
    description: 'Enhanced task processing with parallel validation, approval workflows, and deduplication',
    tags: ['demo', 'task-queue', 'validation', 'batch-processing'],
    difficulty: 'beginner',
    estimatedTime: '5-15 seconds',
    color: 'blue',
    features: [
      'Enhanced context with utilities & deduplication',
      'Priority-based task sorting with metadata',
      'Parallel validation checks (resource, quality, security)',
      'Simple approval workflows with waitForEvent',
      'Multi-stage processing with error recovery',
      'Configurable batch processing with delays',
    ],
  },
  'kitchen-sink': {
    id: 'kitchen-sink',
    title: 'Kitchen Sink',
    description: 'Comprehensive workflow demonstrating ALL features: ETL, order processing, orchestration, and patterns',
    tags: ['demo', 'etl', 'order-processing', 'advanced', 'orchestration'],
    difficulty: 'advanced',
    estimatedTime: '30-90 seconds',
    color: 'purple',
    features: [
      'Complete ETL pipeline with approval gates',
      'Order processing with fraud & inventory checks',
      'Workflow orchestration & composition (invoke)',
      'Enhanced context with all utilities',
      'All context methods (run, call, sleep, waitForEvent, notify, cancel)',
      'Multiple processing modes (etl, order, orchestration, full)',
      'External API integrations with retries',
      'Comprehensive error handling & notifications',
    ],
  },
  'image-processing': {
    id: 'image-processing',
    title: 'Image Processing',
    description: 'On-device image processing with Sharp: resizing, filtering, format conversion, and thumbnail generation',
    tags: ['media', 'etl', 'image-processing', 'sharp'],
    difficulty: 'intermediate',
    estimatedTime: '10-30 seconds',
    color: 'green',
    features: [
      'On-device processing with Sharp library',
      'Multiple resolution resizing with smart cropping',
      'Filter effects (grayscale, sepia, blur, sharpen)',
      'Format conversion (JPEG, PNG, WebP)',
      'Automatic thumbnail generation',
      'Quality and size optimization',
      'Batch processing with progress tracking',
      'Metadata preservation and reporting',
    ],
  },
  'data-processing': {
    id: 'data-processing',
    title: 'Data Processing',
    description: 'Large-scale data processing with streaming and batch operations',
    tags: ['etl', 'data-processing', 'analytics', 'batch'],
    difficulty: 'advanced',
    estimatedTime: '1-5 minutes',
    color: 'indigo',
    features: [
      'Stream processing for large datasets',
      'Parallel batch operations',
      'Data validation and transformation',
      'Error recovery and dead letter queue',
      'Progress tracking and notifications',
    ],
  },
  'ai-content': {
    id: 'ai-content',
    title: 'AI Content Pipeline',
    description: 'AI-powered content generation and processing pipeline',
    tags: ['ai', 'content-generation', 'nlp', 'automation'],
    difficulty: 'intermediate',
    estimatedTime: '30-60 seconds',
    color: 'violet',
    features: [
      'AI model integration',
      'Content generation and enhancement',
      'Sentiment analysis',
      'Auto-categorization',
      'Multi-language support',
    ],
  },
  'tenant-operations': {
    id: 'tenant-operations',
    title: 'Tenant Operations',
    description: 'Multi-tenant SaaS operations with isolation and scaling',
    tags: ['saas', 'multi-tenant', 'operations', 'scaling'],
    difficulty: 'advanced',
    estimatedTime: '10-30 seconds',
    color: 'orange',
    features: [
      'Tenant isolation',
      'Resource allocation',
      'Usage tracking',
      'Automated scaling',
      'Billing integration',
    ],
  },
  'chart-sitemaps': {
    id: 'chart-sitemaps',
    title: 'Chart Sitemaps',
    description: 'Process and analyze chart sitemaps for data extraction',
    tags: ['jollyRoger', 'etl'],
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    color: 'cyan',
    features: [
      'Chart sitemap processing',
      'Data extraction',
      'Hello World demonstration',
      'Simple workflow pattern',
    ],
  },
  'chart-pdps': {
    id: 'chart-pdps',
    title: 'Chart PDPs',
    description: 'Process and analyze chart product detail pages',
    tags: ['jollyRoger', 'etl'],
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    color: 'teal',
    features: [
      'Product detail page processing',
      'Chart data extraction',
      'Hello World demonstration',
      'Simple workflow pattern',
    ],
  },
  'map-taxterm': {
    id: 'map-taxterm',
    title: 'Map Taxonomy Terms',
    description: 'Map and organize taxonomy terms for classification',
    tags: ['jollyRoger', 'etl'],
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    color: 'lime',
    features: [
      'Taxonomy term mapping',
      'Classification system',
      'Hello World demonstration',
      'Simple workflow pattern',
    ],
  },
  'gen-copy': {
    id: 'gen-copy',
    title: 'Generate Copy',
    description: 'AI-powered copy generation with SEO optimization',
    tags: ['ai', 'seo', 'etl'],
    difficulty: 'intermediate',
    estimatedTime: '10-20 seconds',
    color: 'pink',
    features: [
      'AI content generation',
      'SEO optimization',
      'Copy writing automation',
      'Hello World demonstration',
    ],
  },
};

/**
 * Get all unique tags from workflow metadata
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  Object.values(workflowMetadata).forEach(workflow => {
    workflow.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Filter workflows by tags
 */
export function filterWorkflows(
  workflows: WorkflowMetadata[],
  selectedTags: string[],
): WorkflowMetadata[] {
  return workflows.filter(workflow => {
    // Tag filter (workflow must have at least one selected tag)
    if (selectedTags.length > 0) {
      return workflow.tags.some(tag => selectedTags.includes(tag));
    }
    
    return true;
  });
}