import { imageProcessingWorkflow, type ImageProcessingPayload } from '@repo/orchestration';

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
    tags: ['images', 'media-processing', 'optimization', 'filters'],
    icon: '🖼️',
    color: '#10B981', // green
    estimatedDuration: '15-30 seconds',
    features: [
      'Multi-resolution processing',
      'Filter effects',
      'Format conversion',
      'Quality optimization',
      'Thumbnail generation',
      'CDN integration'
    ],
    limitations: [
      'Demo workflow - simulates processing',
      'Does not actually process real images',
      'URLs are examples only'
    ]
  },
  
  // Default payload for testing/examples
  defaultPayload: {
    imageId: `img-${Date.now()}`,
    userId: 'demo-user-123',
    imageUrl: 'https://example.com/sample-image.jpg',
    options: {
      resolutions: [320, 640, 960, 1200],
      filters: ['grayscale', 'sepia', 'blur', 'sharpen'],
      outputFormat: 'webp' as const,
      quality: 85
    }
  } satisfies ImageProcessingPayload,
  
  // Configuration for the workflow runtime
  config: {
    retries: 3,
    timeout: 180, // 3 minutes
    queueConcurrency: 5,
    enableDeduplication: true
  },
  
  // Preset configurations for common use cases
  presets: {
    thumbnails: {
      name: 'Thumbnails Only',
      description: 'Generate small thumbnails for preview',
      payload: {
        options: {
          resolutions: [150, 300],
          filters: [],
          outputFormat: 'jpeg' as const,
          quality: 80
        }
      }
    },
    webOptimized: {
      name: 'Web Optimized',
      description: 'Optimize images for web delivery',
      payload: {
        options: {
          resolutions: [640, 1200, 1920],
          filters: [],
          outputFormat: 'webp' as const,
          quality: 85
        }
      }
    },
    socialMedia: {
      name: 'Social Media Pack',
      description: 'Generate sizes for various social platforms',
      payload: {
        options: {
          resolutions: [400, 800, 1200, 1600],
          filters: ['sharpen'],
          outputFormat: 'jpeg' as const,
          quality: 90
        }
      }
    },
    artisticEffects: {
      name: 'Artistic Effects',
      description: 'Apply various artistic filters',
      payload: {
        options: {
          resolutions: [960],
          filters: ['grayscale', 'sepia', 'blur', 'sharpen'],
          outputFormat: 'png' as const,
          quality: 95
        }
      }
    }
  },
  
  // Input validation schema (for UI forms)
  inputSchema: {
    type: 'object',
    properties: {
      imageId: {
        type: 'string',
        description: 'Unique identifier for the image',
        pattern: '^[a-zA-Z0-9-_]+$'
      },
      userId: {
        type: 'string',
        description: 'User who owns the image',
        pattern: '^[a-zA-Z0-9-_]+$'
      },
      imageUrl: {
        type: 'string',
        format: 'uri',
        description: 'Optional direct URL to the image',
        pattern: '^https?://'
      },
      options: {
        type: 'object',
        properties: {
          resolutions: {
            type: 'array',
            description: 'Target resolutions in pixels',
            items: {
              type: 'number',
              minimum: 50,
              maximum: 4096
            },
            default: [320, 640, 960, 1200]
          },
          filters: {
            type: 'array',
            description: 'Filters to apply',
            items: {
              type: 'string',
              enum: ['grayscale', 'sepia', 'blur', 'sharpen', 'contrast', 'brightness']
            },
            default: ['grayscale', 'sepia', 'blur', 'sharpen']
          },
          outputFormat: {
            type: 'string',
            enum: ['jpeg', 'png', 'webp'],
            description: 'Output image format',
            default: 'webp'
          },
          quality: {
            type: 'number',
            description: 'Output quality (1-100)',
            minimum: 1,
            maximum: 100,
            default: 85
          }
        }
      },
      dedupId: {
        type: 'string',
        description: 'Optional deduplication ID to prevent duplicate processing'
      }
    },
    required: ['imageId', 'userId']
  },
  
  // Output schema (what the workflow returns)
  outputSchema: {
    type: 'object',
    properties: {
      imageId: { type: 'string' },
      userId: { type: 'string' },
      original: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          format: { type: 'string' }
        }
      },
      processed: {
        type: 'object',
        properties: {
          resolutions: { type: 'array', items: { type: 'number' } },
          filters: { type: 'array', items: { type: 'string' } },
          outputFormat: { type: 'string' },
          quality: { type: 'number' }
        }
      },
      results: {
        type: 'object',
        properties: {
          totalImages: { type: 'number' },
          thumbnails: { type: 'number' },
          totalSizeMB: { type: 'string' }
        }
      },
      urls: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            resolution: { type: 'number' },
            filter: { type: 'string' },
            size: { type: 'number' },
            bytes: { type: 'number' }
          }
        }
      }
    }
  }
};

// Export the type for use in other parts of the app
export type ImageProcessingWorkflowDefinition = typeof workflowDefinition;