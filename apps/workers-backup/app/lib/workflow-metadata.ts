/**
 * Workflow metadata for the UI
 * This is a client-safe file that doesn't depend on server-side code
 */

export interface WorkflowMetadata {
  color?: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  features: string[];
  icon?: string;
  id: string;
  tags: string[];
  title: string;
}

/**
 * Registry of all workflow metadata
 */
export const workflowMetadata: Record<string, WorkflowMetadata> = {
  'ai-content': {
    id: 'ai-content',
    color: 'violet',
    description: 'AI-powered content generation and processing pipeline',
    difficulty: 'intermediate',
    estimatedTime: '30-60 seconds',
    features: [
      'AI model integration',
      'Content generation and enhancement',
      'Sentiment analysis',
      'Auto-categorization',
      'Multi-language support',
    ],
    tags: ['ai', 'content-generation', 'nlp', 'automation'],
    title: 'AI Content Pipeline',
  },
  basic: {
    id: 'basic',
    color: 'blue',
    description:
      'Enhanced task processing with parallel validation, approval workflows, and deduplication',
    difficulty: 'beginner',
    estimatedTime: '5-15 seconds',
    features: [
      'Enhanced context with utilities & deduplication',
      'Priority-based task sorting with metadata',
      'Parallel validation checks (resource, quality, security)',
      'Simple approval workflows with waitForEvent',
      'Multi-stage processing with error recovery',
      'Configurable batch processing with delays',
    ],
    tags: ['demo', 'task-queue', 'validation', 'batch-processing'],
    title: 'Basic Workflow',
  },
  'chart-pdps': {
    id: 'chart-pdps',
    color: 'teal',
    description: 'Process and analyze chart product detail pages',
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    features: [
      'Product detail page processing',
      'Chart data extraction',
      'Hello World demonstration',
      'Simple workflow pattern',
    ],
    tags: ['jollyRoger', 'etl'],
    title: 'Chart PDPs',
  },
  'chart-sitemaps': {
    id: 'chart-sitemaps',
    color: 'cyan',
    description: 'Process and analyze chart sitemaps for data extraction',
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    features: [
      'Chart sitemap processing',
      'Data extraction',
      'Hello World demonstration',
      'Simple workflow pattern',
    ],
    tags: ['jollyRoger', 'etl'],
    title: 'Chart Sitemaps',
  },
  'data-processing': {
    id: 'data-processing',
    color: 'indigo',
    description: 'Large-scale data processing with streaming and batch operations',
    difficulty: 'advanced',
    estimatedTime: '1-5 minutes',
    features: [
      'Stream processing for large datasets',
      'Parallel batch operations',
      'Data validation and transformation',
      'Error recovery and dead letter queue',
      'Progress tracking and notifications',
    ],
    tags: ['etl', 'data-processing', 'analytics', 'batch'],
    title: 'Data Processing',
  },
  'gen-copy': {
    id: 'gen-copy',
    color: 'pink',
    description: 'AI-powered copy generation with SEO optimization',
    difficulty: 'intermediate',
    estimatedTime: '10-20 seconds',
    features: [
      'AI content generation',
      'SEO optimization',
      'Copy writing automation',
      'Hello World demonstration',
    ],
    tags: ['ai', 'seo', 'etl'],
    title: 'Generate Copy',
  },
  'image-processing': {
    id: 'image-processing',
    color: 'green',
    description:
      'On-device image processing with Sharp: resizing, filtering, format conversion, and thumbnail generation',
    difficulty: 'intermediate',
    estimatedTime: '10-30 seconds',
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
    tags: ['media', 'etl', 'image-processing', 'sharp'],
    title: 'Image Processing',
  },
  'kitchen-sink': {
    id: 'kitchen-sink',
    color: 'purple',
    description:
      'Comprehensive workflow demonstrating ALL features: ETL, order processing, orchestration, and patterns',
    difficulty: 'advanced',
    estimatedTime: '30-90 seconds',
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
    tags: ['demo', 'etl', 'order-processing', 'advanced', 'orchestration'],
    title: 'Kitchen Sink',
  },
  'map-taxterm': {
    id: 'map-taxterm',
    color: 'lime',
    description: 'Map and organize taxonomy terms for classification',
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    features: [
      'Taxonomy term mapping',
      'Classification system',
      'Hello World demonstration',
      'Simple workflow pattern',
    ],
    tags: ['jollyRoger', 'etl'],
    title: 'Map Taxonomy Terms',
  },
  'tenant-operations': {
    id: 'tenant-operations',
    color: 'orange',
    description: 'Multi-tenant SaaS operations with isolation and scaling',
    difficulty: 'advanced',
    estimatedTime: '10-30 seconds',
    features: [
      'Tenant isolation',
      'Resource allocation',
      'Usage tracking',
      'Automated scaling',
      'Billing integration',
    ],
    tags: ['saas', 'multi-tenant', 'operations', 'scaling'],
    title: 'Tenant Operations',
  },
};

/**
 * Get all unique tags from workflow metadata
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  Object.values(workflowMetadata).forEach((workflow) => {
    workflow.tags.forEach((tag) => tagSet.add(tag));
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
  return workflows.filter((workflow) => {
    // Tag filter (workflow must have at least one selected tag)
    if (selectedTags.length > 0) {
      return workflow.tags.some((tag) => selectedTags.includes(tag));
    }

    return true;
  });
}
