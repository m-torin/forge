import { type ImageProcessingPayload, imageProcessingWorkflow } from '@repo/orchestration';

/**
 * Image Processing Workflow Definition
 *
 * This local definition wraps the image processing workflow from @repo/orchestration
 * and provides app-specific metadata and default payload configuration.
 *
 * Features:
 * - Multiple resolution resizing (320px, 640px, 960px, 1200px)
 * - Filter application (grayscale, sepia, blur, sharpen)
 * - Format conversion (JPEG, PNG, WebP)
 * - Quality optimization
 * - Thumbnail generation
 * - External service integration simulation
 *
 * Note: This is a demo workflow that simulates image processing.
 * In production, you would integrate with an actual image processing service.
 */

export const workflowDefinition = {
  id: 'image-processing-workflow',
  name: 'Image Processing Pipeline',
  description: 'Process images with multiple resolutions, filters, and optimizations',
  version: '1.0.0',

  // Import the workflow function from @repo/orchestration
  handler: imageProcessingWorkflow,

  // Metadata for UI/documentation
  metadata: {
    category: 'media',
    color: '#10B981', // green
    estimatedDuration: '15-30 seconds',
    features: [
      'Multi-resolution processing',
      'Filter effects',
      'Format conversion',
      'Quality optimization',
      'Thumbnail generation',
      'CDN integration',
    ],
    icon: '🖼️',
    limitations: [
      'Demo workflow - simulates processing',
      'Does not actually process real images',
      'URLs are examples only',
    ],
    tags: ['images', 'media-processing', 'optimization', 'filters'],
  },

  // Default payload for testing/examples
  defaultPayload: {
    imageId: `img-${Date.now()}`,
    imageUrl: 'https://example.com/sample-image.jpg',
    options: {
      filters: ['grayscale', 'sepia', 'blur', 'sharpen'],
      outputFormat: 'webp' as const,
      quality: 85,
      resolutions: [320, 640, 960, 1200],
    },
    userId: 'demo-user-123',
  } satisfies ImageProcessingPayload,

  // Configuration for the workflow runtime
  config: {
    enableDeduplication: true,
    queueConcurrency: 5,
    retries: 3,
    timeout: 180, // 3 minutes
  },

  // Preset configurations for common use cases
  presets: {
    artisticEffects: {
      name: 'Artistic Effects',
      description: 'Apply various artistic filters',
      payload: {
        options: {
          filters: ['grayscale', 'sepia', 'blur', 'sharpen'],
          outputFormat: 'png' as const,
          quality: 95,
          resolutions: [960],
        },
      },
    },
    socialMedia: {
      name: 'Social Media Pack',
      description: 'Generate sizes for various social platforms',
      payload: {
        options: {
          filters: ['sharpen'],
          outputFormat: 'jpeg' as const,
          quality: 90,
          resolutions: [400, 800, 1200, 1600],
        },
      },
    },
    thumbnails: {
      name: 'Thumbnails Only',
      description: 'Generate small thumbnails for preview',
      payload: {
        options: {
          filters: [],
          outputFormat: 'jpeg' as const,
          quality: 80,
          resolutions: [150, 300],
        },
      },
    },
    webOptimized: {
      name: 'Web Optimized',
      description: 'Optimize images for web delivery',
      payload: {
        options: {
          filters: [],
          outputFormat: 'webp' as const,
          quality: 85,
          resolutions: [640, 1200, 1920],
        },
      },
    },
  },

  // Input validation schema (for UI forms)
  inputSchema: {
    type: 'object',
    properties: {
      dedupId: {
        type: 'string',
        description: 'Optional deduplication ID to prevent duplicate processing',
      },
      imageId: {
        type: 'string',
        description: 'Unique identifier for the image',
        pattern: '^[a-zA-Z0-9-_]+$',
      },
      imageUrl: {
        type: 'string',
        description: 'Optional direct URL to the image',
        format: 'uri',
        pattern: '^https?://',
      },
      options: {
        type: 'object',
        properties: {
          filters: {
            type: 'array',
            default: ['grayscale', 'sepia', 'blur', 'sharpen'],
            description: 'Filters to apply',
            items: {
              type: 'string',
              enum: ['grayscale', 'sepia', 'blur', 'sharpen', 'contrast', 'brightness'],
            },
          },
          outputFormat: {
            type: 'string',
            default: 'webp',
            description: 'Output image format',
            enum: ['jpeg', 'png', 'webp'],
          },
          quality: {
            type: 'number',
            default: 85,
            description: 'Output quality (1-100)',
            maximum: 100,
            minimum: 1,
          },
          resolutions: {
            type: 'array',
            default: [320, 640, 960, 1200],
            description: 'Target resolutions in pixels',
            items: {
              type: 'number',
              maximum: 4096,
              minimum: 50,
            },
          },
        },
      },
      userId: {
        type: 'string',
        description: 'User who owns the image',
        pattern: '^[a-zA-Z0-9-_]+$',
      },
    },
    required: ['imageId', 'userId'],
  },

  // Output schema (what the workflow returns)
  outputSchema: {
    type: 'object',
    properties: {
      urls: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            bytes: { type: 'number' },
            filter: { type: 'string' },
            resolution: { type: 'number' },
            size: { type: 'number' },
          },
        },
      },
      imageId: { type: 'string' },
      original: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          format: { type: 'string' },
        },
      },
      processed: {
        type: 'object',
        properties: {
          filters: { type: 'array', items: { type: 'string' } },
          outputFormat: { type: 'string' },
          quality: { type: 'number' },
          resolutions: { type: 'array', items: { type: 'number' } },
        },
      },
      results: {
        type: 'object',
        properties: {
          thumbnails: { type: 'number' },
          totalImages: { type: 'number' },
          totalSizeMB: { type: 'string' },
        },
      },
      userId: { type: 'string' },
    },
  },
};

// Export the type for use in other parts of the app
export type ImageProcessingWorkflowDefinition = typeof workflowDefinition;
