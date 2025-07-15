/**
 * Thumbnail Generator Worker
 * Generates optimized thumbnails with smart cropping and caching
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const imagePath = url.pathname.replace('/thumbnails/', '');

    // Parse thumbnail parameters
    const params = new URLSearchParams(url.search);
    const size = params.get('size') || env.DEFAULT_SIZE || '300x300';
    const [width, height] = size.split('x').map(n => parseInt(n, 10));
    const fit = params.get('fit') || 'cover';
    const position = params.get('position') || 'center';
    const format = params.get('format') || 'auto';

    // Use preset if provided
    const presetName = params.get('preset');
    const preset = presetName ? ${jsonencode(thumbnail_preset)} : null;

    const thumbnailConfig = preset || {
      width,
      height,
      fit,
      quality: parseInt(params.get('quality') || '80', 10),
      format,
    };

    try {
      // Check cache first
      const cacheKey = `thumb:${imagePath}:${size}:${fit}:${format}`;

      if (env.KV_IMAGE_CACHE) {
        const cached = await env.KV_IMAGE_CACHE.get(cacheKey, 'arrayBuffer');
        if (cached) {
          return new Response(cached, {
            headers: {
              'Content-Type': getContentType(format),
              'Cache-Control': 'public, max-age=31536000',
              'X-Thumbnail-Cache': 'HIT',
            },
          });
        }
      }

      // Fetch original image
      const imageResponse = await fetchImage(env, imagePath);
      if (!imageResponse.ok) {
        return new Response('Image not found', { status: 404 });
      }

      // Generate thumbnail with smart cropping
      const thumbnail = await generateThumbnail(imageResponse, thumbnailConfig, position, env);

      // Cache the thumbnail
      if (env.KV_IMAGE_CACHE) {
        ctx.waitUntil(
          env.KV_IMAGE_CACHE.put(cacheKey, thumbnail, {
            expirationTtl: 2592000, // 30 days
          }),
        );
      }

      // Store metadata about the thumbnail
      if (env.KV_IMAGE_METADATA) {
        const metadata = {
          original: imagePath,
          thumbnail: {
            width: thumbnailConfig.width || width,
            height: thumbnailConfig.height || height,
            size: thumbnail.byteLength,
            format: format,
            created: new Date().toISOString(),
          },
        };

        ctx.waitUntil(
          env.KV_IMAGE_METADATA.put(`thumb-meta:${imagePath}:${size}`, JSON.stringify(metadata), {
            expirationTtl: 2592000,
          }),
        );
      }

      return new Response(thumbnail, {
        headers: {
          'Content-Type': getContentType(format),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Thumbnail-Size': `${width}x${height}`,
          'X-Thumbnail-Fit': fit,
          'X-Thumbnail-Cache': 'MISS',
        },
      });
    } catch (error) {
      console.error('Thumbnail generation error:', error);

      // Return a placeholder image on error
      return generatePlaceholder(width, height);
    }
  },
};

async function fetchImage(env, path) {
  // Try R2 first
  if (env.R2_IMAGES) {
    const object = await env.R2_IMAGES.get(path);
    if (object) {
      return new Response(object.body, {
        status: 200,
        headers: object.httpMetadata || {},
        url: `https://r2.example.com/${path}`,
      });
    }
  }

  // Fallback to origin
  const response = await fetch(`https://origin.example.com/${path}`);
  response.url = response.url || `https://origin.example.com/${path}`;
  return response;
}

async function generateThumbnail(imageResponse, config, position, env) {
  const { width, height, fit, quality, format } = config;

  // Use Cloudflare Image Resizing API
  const thumbnailResponse = await fetch(imageResponse.url, {
    cf: {
      image: {
        width: width,
        height: height,
        quality: quality,
        format: format === 'auto' ? undefined : format,
        fit: fit,
        gravity: position === 'smart' ? 'auto' : position,
        sharpen: 1.0, // Slight sharpening for thumbnails
      },
      cacheEverything: true,
      cacheTtl: 2592000, // 30 days
    },
  });

  if (!thumbnailResponse.ok) {
    throw new Error(`Failed to generate thumbnail: ${thumbnailResponse.status}`);
  }

  let thumbnail = await thumbnailResponse.arrayBuffer();

  // Apply smart cropping if requested and AI is available
  if (position === 'smart' && env.AI) {
    thumbnail = await smartCropThumbnail(thumbnail, width, height, env.AI);
  }

  // Apply additional optimizations for very small thumbnails
  if (width <= 150 || height <= 150) {
    thumbnail = await optimizeSmallThumbnail(thumbnail, format);
  }

  return thumbnail;
}

async function smartCropThumbnail(imageBuffer, targetWidth, targetHeight, ai) {
  try {
    // Use AI to detect the most important region
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    const analysis = await ai.run('@cf/microsoft/resnet-50', {
      image: imageArray,
      task: 'object-detection',
    });

    // If objects detected, crop to include them
    if (analysis.objects && analysis.objects.length > 0) {
      // Calculate crop region based on detected objects
      // This is simplified - real implementation would calculate bounding box
      return imageBuffer;
    }
  } catch (error) {
    console.error('Smart crop failed:', error);
  }

  return imageBuffer;
}

async function optimizeSmallThumbnail(buffer, format) {
  // Additional optimization for small thumbnails
  // Could reduce colors, apply specific compression, etc.
  return buffer;
}

function generatePlaceholder(width, height) {
  // Generate SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif" font-size="14">
        ${width}×${height}
      </text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function getContentType(format) {
  const types = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    auto: 'image/webp', // Default to WebP for auto
  };

  return types[format] || 'image/jpeg';
}
