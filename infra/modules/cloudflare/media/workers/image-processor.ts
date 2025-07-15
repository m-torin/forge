/**
 * Enhanced Image Processor Worker (TypeScript)
 * Handles image upload, processing, metadata management, and AI classification
 * Migrated and enhanced from legacy implementation
 */

interface Env {
  IMAGES: R2Bucket;
  SIGNING_KEY: string;
  IMAGE_METADATA?: KVNamespace;
  AI?: any; // Cloudflare AI binding
  KV_IMAGE_CACHE?: KVNamespace;
  KV_AI_RESULTS?: KVNamespace;
}

interface ImageMetadata {
  id: string;
  originalFilename: string;
  contentType: string;
  size: number;
  uploadedAt: number;
  processedAt?: number;
  classification?: any;
  variants?: { [key: string]: string };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for pre-flight requests
    if (request.method === 'OPTIONS') {
      return handleCors(request);
    }

    // Image upload and processing endpoint
    if (path === '/process' && request.method === 'POST') {
      return handleImageUpload(request, env, ctx);
    }

    // Image processing with parameters (legacy compatibility)
    if (path.startsWith('/process/') && request.method === 'GET') {
      return handleImageProcessing(request, env, ctx);
    }

    // Image metadata management endpoint
    if (path.startsWith('/metadata')) {
      if (request.method === 'GET') {
        return handleMetadataGet(request, env, ctx);
      } else if (request.method === 'PUT') {
        return handleMetadataUpdate(request, env, ctx);
      }
    }

    // Health check endpoint
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: Date.now() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default response
    return new Response('Cloudflare Image Processor: Use /process to upload and process images', {
      headers: corsHeaders,
    });
  },
};

// CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
function handleCors(request: Request): Response {
  return new Response(null, {
    headers: corsHeaders,
  });
}

// Handle image upload, processing, and AI classification
async function handleImageUpload(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const processOptions = formData.get('options') as string | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    const contentType = file.type;
    if (!contentType.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Only image files are allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 10MB' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique ID for the image
    const imageId = crypto.randomUUID();
    const timestamp = Date.now();

    // Create object key with directory structure
    const objectKey = `images/${formatDate(timestamp)}/${imageId}${getExtensionFromMimeType(contentType)}`;

    // Get file buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload original image to R2
    await env.IMAGES.put(objectKey, fileBuffer, {
      httpMetadata: {
        contentType: contentType,
      },
      customMetadata: {
        uploadedAt: timestamp.toString(),
        originalFilename: file.name,
        size: file.size.toString(),
      },
    });

    // Create metadata object
    const metadata: ImageMetadata = {
      id: imageId,
      originalFilename: file.name,
      contentType: contentType,
      size: file.size,
      uploadedAt: timestamp,
    };

    // AI classification if available
    let classification = null;
    if (env.AI) {
      try {
        classification = await classifyImage(env.AI, fileBuffer);
        metadata.classification = classification;

        // Store classification results in KV if available
        if (env.KV_AI_RESULTS) {
          await env.KV_AI_RESULTS.put(
            `classification:${imageId}`,
            JSON.stringify(classification),
            { expirationTtl: 604800 }, // 7 days
          );
        }
      } catch (error) {
        console.error('AI classification failed:', error);
      }
    }

    // Store metadata in KV if available
    if (env.IMAGE_METADATA) {
      await env.IMAGE_METADATA.put(
        `metadata:${imageId}`,
        JSON.stringify(metadata),
        { expirationTtl: 2592000 }, // 30 days
      );
    }

    // Process additional options if provided
    const variants: { [key: string]: string } = {};
    if (processOptions) {
      try {
        const options = JSON.parse(processOptions);
        if (options.variants) {
          for (const [variant, config] of Object.entries(options.variants)) {
            const processedBuffer = await processImage(fileBuffer, config);
            const variantKey = `${objectKey.replace(/\.[^/.]+$/, '')}_${variant}${getExtensionFromMimeType(contentType)}`;

            await env.IMAGES.put(variantKey, processedBuffer, {
              httpMetadata: { contentType: contentType },
              customMetadata: { originalId: imageId, variant: variant },
            });

            variants[variant] = variantKey;
          }
          metadata.variants = variants;
        }
      } catch (error) {
        console.error('Error processing variants:', error);
      }
    }

    // Generate signed URL for access
    const signedUrl = await generateSignedUrl(objectKey, env.SIGNING_KEY);

    // Response
    return new Response(
      JSON.stringify({
        success: true,
        imageId: imageId,
        objectKey: objectKey,
        signedUrl: signedUrl,
        metadata: metadata,
        classification: classification,
        variants: variants,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Handle image processing with URL parameters (legacy compatibility)
async function handleImageProcessing(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);
    const operation = params.get('op') || 'optimize';
    const format = params.get('format') || 'auto';
    const quality = parseInt(params.get('quality') || '80', 10);

    // Get image path from URL
    const imagePath = url.pathname.replace('/process/', '');

    // Check cache first
    const cacheKey = `processed:${imagePath}:${operation}:${format}:${quality}`;
    if (env.KV_IMAGE_CACHE) {
      const cached = await env.KV_IMAGE_CACHE.get(cacheKey, { type: 'arrayBuffer' });
      if (cached) {
        return new Response(cached, {
          headers: {
            'Content-Type': getContentTypeFromFormat(format),
            'Cache-Control': 'public, max-age=31536000',
            'X-Cache': 'HIT',
          },
        });
      }
    }

    // Fetch image from R2
    const imageObject = await env.IMAGES.get(imagePath);
    if (!imageObject) {
      return new Response('Image not found', { status: 404 });
    }

    const imageBuffer = await imageObject.arrayBuffer();
    let processedBuffer = imageBuffer;

    // Process image based on operation
    switch (operation) {
      case 'optimize':
        processedBuffer = await optimizeImage(imageBuffer, format, quality);
        break;
      case 'resize':
        const width = parseInt(params.get('width') || '0', 10);
        const height = parseInt(params.get('height') || '0', 10);
        processedBuffer = await resizeImage(imageBuffer, width, height, format);
        break;
      case 'watermark':
        const watermarkText = params.get('text') || '';
        processedBuffer = await addWatermark(imageBuffer, watermarkText);
        break;
      case 'classify':
        if (env.AI) {
          const classification = await classifyImage(env.AI, imageBuffer);
          return new Response(JSON.stringify(classification), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;
    }

    // Cache the processed image
    if (env.KV_IMAGE_CACHE) {
      ctx.waitUntil(
        env.KV_IMAGE_CACHE.put(cacheKey, processedBuffer, {
          expirationTtl: 3600, // 1 hour
        }),
      );
    }

    return new Response(processedBuffer, {
      headers: {
        'Content-Type': getContentTypeFromFormat(format),
        'Cache-Control': 'public, max-age=31536000',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Image processing error:', error);
    return new Response('Processing failed', { status: 500 });
  }
}

// Handle metadata retrieval
async function handleMetadataGet(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const imageId = url.pathname.replace('/metadata/', '');

    if (!env.IMAGE_METADATA) {
      return new Response(JSON.stringify({ error: 'Metadata storage not available' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const metadata = await env.IMAGE_METADATA.get(`metadata:${imageId}`);
    if (!metadata) {
      return new Response(JSON.stringify({ error: 'Metadata not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(metadata, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Metadata retrieval error:', error);
    return new Response(JSON.stringify({ error: 'Metadata retrieval failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Handle metadata updates
async function handleMetadataUpdate(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const imageId = url.pathname.replace('/metadata/', '');
    const updatedMetadata = await request.json();

    if (!env.IMAGE_METADATA) {
      return new Response(JSON.stringify({ error: 'Metadata storage not available' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get existing metadata
    const existingMetadata = await env.IMAGE_METADATA.get(`metadata:${imageId}`);
    if (!existingMetadata) {
      return new Response(JSON.stringify({ error: 'Metadata not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Merge metadata
    const metadata = { ...JSON.parse(existingMetadata), ...updatedMetadata };
    metadata.processedAt = Date.now();

    // Store updated metadata
    await env.IMAGE_METADATA.put(`metadata:${imageId}`, JSON.stringify(metadata), {
      expirationTtl: 2592000, // 30 days
    });

    return new Response(JSON.stringify({ success: true, metadata }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Metadata update error:', error);
    return new Response(JSON.stringify({ error: 'Metadata update failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Helper functions
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function getExtensionFromMimeType(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/avif': '.avif',
  };
  return extensions[mimeType] || '.jpg';
}

function getContentTypeFromFormat(format: string): string {
  const contentTypes: { [key: string]: string } = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    auto: 'image/jpeg',
  };
  return contentTypes[format] || 'image/jpeg';
}

async function generateSignedUrl(objectKey: string, signingKey: string): Promise<string> {
  // Simple URL signing implementation
  const timestamp = Date.now();
  const expiry = timestamp + 3600 * 1000; // 1 hour
  const message = `${objectKey}:${expiry}`;

  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(signingKey);
  const messageBuffer = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageBuffer);
  const signatureArray = new Uint8Array(signature);
  const signatureHex = Array.from(signatureArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `/${objectKey}?expires=${expiry}&signature=${signatureHex}`;
}

// Image processing functions (simplified implementations)
async function optimizeImage(
  buffer: ArrayBuffer,
  format: string,
  quality: number,
): Promise<ArrayBuffer> {
  // In a real implementation, this would use image processing libraries
  // For now, return the original buffer
  return buffer;
}

async function resizeImage(
  buffer: ArrayBuffer,
  width: number,
  height: number,
  format: string,
): Promise<ArrayBuffer> {
  // In a real implementation, this would resize the image
  return buffer;
}

async function addWatermark(buffer: ArrayBuffer, text: string): Promise<ArrayBuffer> {
  // In a real implementation, this would add watermark
  return buffer;
}

async function processImage(buffer: ArrayBuffer, config: any): Promise<ArrayBuffer> {
  // In a real implementation, this would process based on config
  return buffer;
}

async function classifyImage(ai: any, buffer: ArrayBuffer): Promise<any> {
  try {
    // Use Cloudflare AI to classify the image
    const result = await ai.run('@cf/microsoft/resnet-50', {
      image: Array.from(new Uint8Array(buffer)),
    });

    return {
      labels: result.labels || [],
      confidence: result.confidence || 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('AI classification error:', error);
    return {
      labels: [],
      confidence: 0,
      error: 'Classification failed',
      timestamp: Date.now(),
    };
  }
}
