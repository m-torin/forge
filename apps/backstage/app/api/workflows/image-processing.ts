/**
 * Image Processing Workflow
 * Resize, optimize, and distribute product images across CDN
 */

import {
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepRetry,
  withStepTimeout,
  withStepCircuitBreaker,
  compose,
} from '@repo/orchestration';
import { z } from 'zod';

// Input schemas
const ImageProcessingInput = z.object({
  imageUrl: z.string().url(),
  productId: z.string(),
  variants: z.array(z.object({
    name: z.string(),
    width: z.number(),
    height: z.number(),
    format: z.enum(['webp', 'jpg', 'png', 'avif']),
    quality: z.number().min(1).max(100).default(85),
  })).default([
    { name: 'thumbnail', width: 150, height: 150, format: 'webp', quality: 85 },
    { name: 'product', width: 600, height: 600, format: 'webp', quality: 90 },
    { name: 'hero', width: 1200, height: 800, format: 'webp', quality: 95 },
    { name: 'mobile', width: 400, height: 400, format: 'webp', quality: 85 },
  ]),
  metadata: z.object({
    alt: z.string(),
    title: z.string(),
    copyright: z.string().optional(),
  }),
});

// Step 1: Download original image
export const downloadImageStep = compose(
  createStepWithValidation(
    'download-image',
    async (input: z.infer<typeof ImageProcessingInput>) => {
      // Simulate downloading image
      const response = await fetch(input.imageUrl);
      
      // In real implementation, would save to temp storage
      return {
        ...input,
        originalImage: {
          url: input.imageUrl,
          size: 2048576, // 2MB simulated
          format: 'jpg',
          dimensions: {
            width: 2000,
            height: 2000,
          },
          downloadedAt: new Date().toISOString(),
        },
      };
    },
    (input) => !!input.imageUrl,
    (output) => !!output.originalImage
  ),
  (step) => withStepTimeout(step, { execution: 30000 }),
  (step) => withStepRetry(step, { 
    maxAttempts: 3,
    backoff: 'exponential',
  })
);

// Step 2: Analyze image
export const analyzeImageStep = createStep(
  'analyze-image',
  async (data: any) => {
    const { originalImage } = data;
    
    // Simulate image analysis
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      ...data,
      analysis: {
        format: originalImage.format,
        colorSpace: 'sRGB',
        hasTransparency: false,
        dominantColors: ['#FFFFFF', '#000000', '#FF0000'],
        faces: 0, // Face detection for smart cropping
        textAreas: [], // Text detection for overlay placement
        quality: 'high',
        recommendations: {
          formats: ['webp', 'avif'], // Recommended modern formats
          compressionLevel: 85,
          needsColorCorrection: false,
        },
      },
    };
  }
);

// Step 3: Generate image variants
export const generateVariantsStep = compose(
  createStep('generate-variants', async (data: any) => {
    const { variants, originalImage, analysis } = data;
    const processedVariants = [];

    for (const variant of variants) {
      // Simulate image processing with progress
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const aspectRatio = variant.width / variant.height;
      const originalAspectRatio = originalImage.dimensions.width / originalImage.dimensions.height;
      
      // Determine crop strategy
      const cropStrategy = Math.abs(aspectRatio - originalAspectRatio) > 0.1 
        ? 'smart' // Use AI-based smart cropping
        : 'center'; // Simple center crop
      
      // Calculate output size
      const outputSize = variant.width * variant.height * 
        (variant.format === 'webp' ? 0.7 : variant.format === 'avif' ? 0.6 : 1) *
        (variant.quality / 100);
      
      processedVariants.push({
        ...variant,
        url: `https://cdn.example.com/images/${data.productId}/${variant.name}.${variant.format}`,
        size: Math.floor(outputSize / 1000), // KB
        cropStrategy,
        processingTime: Math.random() * 1000 + 200, // ms
        cdnPath: `/images/${data.productId}/${variant.name}.${variant.format}`,
      });
    }

    return {
      ...data,
      processedVariants,
      totalVariants: processedVariants.length,
      totalSize: processedVariants.reduce((sum, v) => sum + v.size, 0),
    };
  }),
  (step) => withStepCircuitBreaker(step, {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  })
);

// Step 4: Optimize images
export const optimizeImagesStep = createStep(
  'optimize-images',
  async (data: any) => {
    const { processedVariants } = data;
    const optimizedVariants = [];

    for (const variant of processedVariants) {
      // Apply optimization techniques
      const optimizations = {
        stripMetadata: true,
        progressive: variant.format === 'jpg',
        mozjpeg: variant.format === 'jpg',
        oxipng: variant.format === 'png',
        webpLossless: variant.format === 'webp' && variant.quality === 100,
      };
      
      // Simulate optimization
      const sizeSavings = Math.random() * 0.3 + 0.1; // 10-40% savings
      const optimizedSize = variant.size * (1 - sizeSavings);
      
      optimizedVariants.push({
        ...variant,
        optimizations,
        originalSize: variant.size,
        optimizedSize: Math.floor(optimizedSize),
        savings: `${(sizeSavings * 100).toFixed(1)}%`,
      });
    }

    return {
      ...data,
      processedVariants: optimizedVariants,
      optimization: {
        totalOriginalSize: optimizedVariants.reduce((sum, v) => sum + v.originalSize, 0),
        totalOptimizedSize: optimizedVariants.reduce((sum, v) => sum + v.optimizedSize, 0),
        averageSavings: optimizedVariants.reduce((sum, v) => 
          sum + parseFloat(v.savings), 0) / optimizedVariants.length,
      },
    };
  }
);

// Step 5: Upload to CDN
export const uploadToCDNStep = compose(
  createStep('upload-cdn', async (data: any) => {
    const { processedVariants, productId } = data;
    const cdnResults = [];

    // Simulate parallel uploads
    const uploadPromises = processedVariants.map(async (variant: any) => {
      // Simulate upload with variable time
      await new Promise(resolve => setTimeout(resolve, variant.optimizedSize * 0.5));
      
      return {
        variantName: variant.name,
        cdnUrl: variant.url,
        uploadTime: variant.optimizedSize * 0.5,
        etag: `"${Date.now()}-${variant.name}"`,
        cacheControl: 'public, max-age=31536000, immutable',
        contentType: `image/${variant.format}`,
      };
    });

    const results = await Promise.all(uploadPromises);
    
    return {
      ...data,
      cdnUploads: results,
      cdnBaseUrl: 'https://cdn.example.com',
      uploadedAt: new Date().toISOString(),
    };
  }),
  (step) => withStepRetry(step, {
    maxAttempts: 5,
    backoff: 'exponential',
    retryIf: (error) => error.message.includes('CDN') || error.message.includes('timeout'),
  })
);

// Step 6: Invalidate CDN cache
export const invalidateCacheStep = StepTemplates.http(
  'invalidate-cache',
  'Invalidate old image versions in CDN',
  {
    defaultConfig: {
      method: 'POST',
      baseUrl: 'https://cdn-api.example.com',
      baseHeaders: {
        'X-CDN-Key': 'cdn-secret-key',
      },
    },
  }
);

// Step 7: Update database
export const updateDatabaseStep = StepTemplates.database(
  'update-image-metadata',
  'Store processed image URLs and metadata'
);

// Step 8: Generate image sitemap
export const generateSitemapStep = createStep(
  'generate-sitemap',
  async (data: any) => {
    const { processedVariants, productId, metadata } = data;
    
    const sitemapEntries = processedVariants.map((variant: any) => ({
      loc: variant.url,
      image: {
        loc: variant.url,
        title: metadata.title,
        caption: `${metadata.alt} - ${variant.name}`,
        license: metadata.copyright || 'https://example.com/license',
      },
      lastmod: new Date().toISOString(),
    }));

    return {
      ...data,
      sitemap: {
        entries: sitemapEntries,
        url: `https://example.com/sitemaps/images/${productId}.xml`,
      },
    };
  }
);

// Step 9: Send webhook notification
export const sendWebhookStep = StepTemplates.http(
  'webhook-notification',
  'Notify external systems about new images',
  {
    defaultConfig: {
      method: 'POST',
      retryConfig: {
        maxAttempts: 3,
        backoff: 'fixed',
        delay: 1000,
      },
    },
  }
);

// Main workflow definition
export const imageProcessingWorkflow = {
  id: 'image-processing',
  name: 'Image Processing',
  description: 'Resize, optimize, and distribute product images across CDN',
  version: '1.0.0',
  steps: [
    downloadImageStep,
    analyzeImageStep,
    generateVariantsStep,
    optimizeImagesStep,
    uploadToCDNStep,
    invalidateCacheStep,
    updateDatabaseStep,
    generateSitemapStep,
    sendWebhookStep,
  ],
  config: {
    maxDuration: 300000, // 5 minutes
    concurrency: {
      max: 10, // Process up to 10 images in parallel
    },
    rateLimiting: {
      maxRequests: 50,
      windowMs: 60000, // 50 images per minute
    },
  },
};