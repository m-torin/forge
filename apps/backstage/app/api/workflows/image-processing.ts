/**
 * Image Processing Workflow
 * Resize, optimize, and distribute product images across CDN
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepCircuitBreaker,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const ImageProcessingInput = z.object({
  imageUrl: z.string().url(),
  metadata: z.object({
    alt: z.string(),
    copyright: z.string().optional(),
    title: z.string(),
  }),
  productId: z.string(),
  variants: z
    .array(
      z.object({
        width: z.number(),
        name: z.string(),
        format: z.enum(['webp', 'jpg', 'png', 'avif']),
        height: z.number(),
        quality: z.number().min(1).max(100).default(85),
      }),
    )
    .default([
      { width: 150, name: 'thumbnail', format: 'webp', height: 150, quality: 85 },
      { width: 600, name: 'product', format: 'webp', height: 600, quality: 90 },
      { width: 1200, name: 'hero', format: 'webp', height: 800, quality: 95 },
      { width: 400, name: 'mobile', format: 'webp', height: 400, quality: 85 },
    ]),
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
          dimensions: {
            width: 2000,
            height: 2000,
          },
          downloadedAt: new Date().toISOString(),
          format: 'jpg',
          size: 2048576, // 2MB simulated
        },
      };
    },
    (input) => !!input.imageUrl,
    (output) => !!output.originalImage,
  ),
  (step) => withStepTimeout(step, { execution: 30000 }),
  (step) =>
    withStepRetry(step, {
      backoff: 'exponential',
      maxAttempts: 3,
    }),
);

// Step 2: Analyze image
export const analyzeImageStep = createStep('analyze-image', async (data: any) => {
  const { originalImage } = data;

  // Simulate image analysis
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    ...data,
    analysis: {
      colorSpace: 'sRGB',
      dominantColors: ['#FFFFFF', '#000000', '#FF0000'],
      faces: 0, // Face detection for smart cropping
      format: originalImage.format,
      hasTransparency: false,
      quality: 'high',
      recommendations: {
        compressionLevel: 85,
        formats: ['webp', 'avif'], // Recommended modern formats
        needsColorCorrection: false,
      },
      textAreas: [], // Text detection for overlay placement
    },
  };
});

// Step 3: Generate image variants
export const generateVariantsStep = compose(
  createStep('generate-variants', async (data: any) => {
    const { analysis, originalImage, variants } = data;
    const processedVariants = [];

    for (const variant of variants) {
      // Simulate image processing with progress
      await new Promise((resolve) => setTimeout(resolve, 200));

      const aspectRatio = variant.width / variant.height;
      const originalAspectRatio = originalImage.dimensions.width / originalImage.dimensions.height;

      // Determine crop strategy
      const cropStrategy =
        Math.abs(aspectRatio - originalAspectRatio) > 0.1
          ? 'smart' // Use AI-based smart cropping
          : 'center'; // Simple center crop

      // Calculate output size
      const outputSize =
        variant.width *
        variant.height *
        (variant.format === 'webp' ? 0.7 : variant.format === 'avif' ? 0.6 : 1) *
        (variant.quality / 100);

      processedVariants.push({
        ...variant,
        url: `https://cdn.example.com/images/${data.productId}/${variant.name}.${variant.format}`,
        cdnPath: `/images/${data.productId}/${variant.name}.${variant.format}`,
        cropStrategy,
        processingTime: Math.random() * 1000 + 200, // ms
        size: Math.floor(outputSize / 1000), // KB
      });
    }

    return {
      ...data,
      processedVariants,
      totalSize: processedVariants.reduce((sum, v) => sum + v.size, 0),
      totalVariants: processedVariants.length,
    };
  }),
  (step) =>
    withStepCircuitBreaker(step, {
      resetTimeout: 30000,
      threshold: 0.5,
      timeout: 5000,
    }),
);

// Step 4: Optimize images
export const optimizeImagesStep = createStep('optimize-images', async (data: any) => {
  const { processedVariants } = data;
  const optimizedVariants = [];

  for (const variant of processedVariants) {
    // Apply optimization techniques
    const optimizations = {
      mozjpeg: variant.format === 'jpg',
      oxipng: variant.format === 'png',
      progressive: variant.format === 'jpg',
      stripMetadata: true,
      webpLossless: variant.format === 'webp' && variant.quality === 100,
    };

    // Simulate optimization
    const sizeSavings = Math.random() * 0.3 + 0.1; // 10-40% savings
    const optimizedSize = variant.size * (1 - sizeSavings);

    optimizedVariants.push({
      ...variant,
      optimizations,
      optimizedSize: Math.floor(optimizedSize),
      originalSize: variant.size,
      savings: `${(sizeSavings * 100).toFixed(1)}%`,
    });
  }

  return {
    ...data,
    optimization: {
      averageSavings:
        optimizedVariants.reduce((sum, v) => sum + parseFloat(v.savings), 0) /
        optimizedVariants.length,
      totalOptimizedSize: optimizedVariants.reduce((sum, v) => sum + v.optimizedSize, 0),
      totalOriginalSize: optimizedVariants.reduce((sum, v) => sum + v.originalSize, 0),
    },
    processedVariants: optimizedVariants,
  };
});

// Step 5: Upload to CDN
export const uploadToCDNStep = compose(
  createStep('upload-cdn', async (data: any) => {
    const { processedVariants, productId } = data;
    const cdnResults = [];

    // Simulate parallel uploads
    const uploadPromises = processedVariants.map(async (variant: any) => {
      // Simulate upload with variable time
      await new Promise((resolve) => setTimeout(resolve, variant.optimizedSize * 0.5));

      return {
        cacheControl: 'public, max-age=31536000, immutable',
        cdnUrl: variant.url,
        contentType: `image/${variant.format}`,
        etag: `"${Date.now()}-${variant.name}"`,
        uploadTime: variant.optimizedSize * 0.5,
        variantName: variant.name,
      };
    });

    const results = await Promise.all(uploadPromises);

    return {
      ...data,
      cdnBaseUrl: 'https://cdn.example.com',
      cdnUploads: results,
      uploadedAt: new Date().toISOString(),
    };
  }),
  (step) =>
    withStepRetry(step, {
      backoff: 'exponential',
      maxAttempts: 5,
    }),
);

// Step 6: Invalidate CDN cache
export const invalidateCacheStep = StepTemplates.http(
  'invalidate-cache',
  'Invalidate old image versions in CDN',
  {
    httpConfig: {
      baseHeaders: {
        'X-CDN-Key': 'cdn-secret-key',
      },
      baseUrl: 'https://cdn-api.example.com',
      method: 'POST',
    },
  },
);

// Step 7: Update database
export const updateDatabaseStep = StepTemplates.database(
  'update-image-metadata',
  'Store processed image URLs and metadata',
);

// Step 8: Generate image sitemap
export const generateSitemapStep = createStep('generate-sitemap', async (data: any) => {
  const { metadata, processedVariants, productId } = data;

  const sitemapEntries = processedVariants.map((variant: any) => ({
    image: {
      caption: `${metadata.alt} - ${variant.name}`,
      license: metadata.copyright || 'https://example.com/license',
      loc: variant.url,
      title: metadata.title,
    },
    lastmod: new Date().toISOString(),
    loc: variant.url,
  }));

  return {
    ...data,
    sitemap: {
      url: `https://example.com/sitemaps/images/${productId}.xml`,
      entries: sitemapEntries,
    },
  };
});

// Step 9: Send webhook notification
export const sendWebhookStep = StepTemplates.http(
  'webhook-notification',
  'Notify external systems about new images',
  {
    httpConfig: {
      method: 'POST',
      retryConfig: {
        backoff: 'fixed',
        delay: 1000,
        maxAttempts: 3,
      },
    },
  },
);

// Main workflow definition
export const imageProcessingWorkflow = {
  id: 'image-processing',
  name: 'Image Processing',
  config: {
    concurrency: {
      max: 10, // Process up to 10 images in parallel
    },
    maxDuration: 300000, // 5 minutes
    rateLimiting: {
      maxRequests: 50,
      windowMs: 60000, // 50 images per minute
    },
  },
  description: 'Resize, optimize, and distribute product images across CDN',
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
  version: '1.0.0',
};
