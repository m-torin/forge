export interface ImageProcessingPayload {
  imageId: string;
  imageUrl: string;
  options: {
    filters: string[];
    outputFormat: 'jpeg' | 'png' | 'webp';
    quality: number;
    resolutions: number[];
  };
  userId: string;
}

interface WorkflowDefinition {
  defaultPayload: ImageProcessingPayload;
  metadata: {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    features: string[];
    tags: string[];
    color: string;
  };
  workflow: (context: any) => Promise<any>;
}

const imageProcessingDefinition: WorkflowDefinition = {
  defaultPayload: {
    imageId: `img-${Date.now()}`,
    imageUrl: 'https://images.unsplash.com/photo-sample.jpg',
    options: {
      filters: ['grayscale', 'sepia', 'blur', 'sharpen'],
      outputFormat: 'webp',
      quality: 85,
      resolutions: [320, 640, 960, 1200],
    },
    userId: 'user-123',
  },
  metadata: {
    id: 'image-processing',
    color: 'green',
    description: 'Multi-resolution image processing with filters and optimizations',
    difficulty: 'intermediate',
    estimatedTime: '30-60 seconds',
    features: [
      'Multiple resolution generation',
      'Various image filters (grayscale, sepia, blur, sharpen)',
      'Format conversion (webp optimization)',
      'Quality control settings',
      'Parallel processing for efficiency',
      'Progress tracking for each variant',
      'Result viewer UI',
    ],
    tags: ['media', 'etl', 'processing'],
    title: 'Image Processing',
  },
  workflow: async (context: any) => {
    // Import the actual workflow function and delegate to it
    const { imageProcessingWorkflow } = await import('@repo/orchestration');
    return imageProcessingWorkflow(context);
  },
};

export default imageProcessingDefinition;
