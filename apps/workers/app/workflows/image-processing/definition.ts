import { imageProcessingWorkflow } from '@repo/orchestration';
import type { WorkflowDefinition } from '../types';

const definition: WorkflowDefinition = {
  metadata: {
    id: 'image-processing',
    title: 'Image Processing',
    description: 'Multi-resolution image processing with filters and optimizations',
    tags: ['media', 'etl', 'processing'],
    difficulty: 'intermediate',
    estimatedTime: '30-60 seconds',
    color: 'green',
    features: [
      'Multiple resolution generation',
      'Various image filters (grayscale, sepia, blur, sharpen)',
      'Format conversion (webp optimization)',
      'Quality control settings',
      'Parallel processing for efficiency',
      'Progress tracking for each variant',
      'Result viewer UI',
    ],
  },
  
  defaultPayload: {
    imageId: `img-${Date.now()}`,
    imageUrl:
      'https://unsplash.com/photos/m6tAqZvy4RM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzQ4NDU1NTEzfA&force=true&w=2400',
    options: {
      filters: ['grayscale', 'sepia', 'blur', 'sharpen'],
      outputFormat: 'webp',
      quality: 85,
      resolutions: [320, 640, 960, 1200], // Max 1200px
    },
    userId: 'user-123',
  },
  
  workflow: imageProcessingWorkflow,
};

export default definition;