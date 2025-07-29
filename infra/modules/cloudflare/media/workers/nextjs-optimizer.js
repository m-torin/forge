/**
 * Next.js Image Optimizer Worker
 * Compatible with Next.js Image component optimization API
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);
    
    // Extract Next.js image parameters
    const imageUrl = params.get('url');
    const width = parseInt(params.get('w'), 10);
    const quality = parseInt(params.get('q') || '${optimization_quality}', 10);
    
    if (!imageUrl || !width) {
      return new Response('Missing required parameters', { status: 400 });
    }
    
    // Security check - ensure URL is allowed
    if (!isAllowedDomain(imageUrl)) {
      return new Response('Invalid image source', { status: 403 });
    }
    
    try {
      // Check cache first
      const cacheKey = `nextjs:${imageUrl}:${width}:${quality}`;
      
      if (env.KV_IMAGE_CACHE) {
        const cached = await env.KV_IMAGE_CACHE.get(cacheKey, 'arrayBuffer');
        if (cached) {
          return new Response(cached, {
            headers: {
              'Content-Type': 'image/webp',
              'Cache-Control': 'public, max-age=31536000',
              'X-Nextjs-Cache': 'HIT'
            }
          });
        }
      }
      
      // Fetch the original image
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Next.js Image Optimizer'
        }
      });
      
      if (!imageResponse.ok) {
        return new Response('Failed to fetch image', { status: imageResponse.status });
      }
      
      const contentType = imageResponse.headers.get('Content-Type');
      const supportedFormats = ${jsonencode(supported_formats)};
      
      // Check if format is supported
      const format = getFormatFromContentType(contentType);
      if (!supportedFormats.includes(format)) {
        return new Response('Unsupported image format', { status: 415 });
      }
      
      // Apply Next.js compatible transformations
      const optimizedResponse = await fetch(imageUrl, {
        cf: {
          image: {
            width: width,
            quality: quality,
            format: 'webp', // Next.js prefers WebP
            fit: 'scale-down'
          },
          cacheEverything: true
        }
      });
      
      const optimizedImage = await optimizedResponse.arrayBuffer();
      
      // Cache the result
      if (env.KV_IMAGE_CACHE) {
        ctx.waitUntil(
          env.KV_IMAGE_CACHE.put(cacheKey, optimizedImage, {
            expirationTtl: 86400 // 24 hours
          })
        );
      }
      
      // Return optimized image with Next.js compatible headers
      return new Response(optimizedImage, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Nextjs-Cache': 'MISS',
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
          'X-Content-Type-Options': 'nosniff'
        }
      });
      
    } catch (error) {
      console.error('Next.js image optimization error:', error);
      
      // Fallback to original image on error
      try {
        const fallbackResponse = await fetch(imageUrl);
        return new Response(fallbackResponse.body, {
          headers: {
            'Content-Type': fallbackResponse.headers.get('Content-Type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=60',
            'X-Nextjs-Cache': 'ERROR'
          }
        });
      } catch (fallbackError) {
        return new Response('Failed to process image', { status: 500 });
      }
    }
  }
};

function isAllowedDomain(url) {
  try {
    const parsed = new URL(url);
    
    // Allow same origin
    if (parsed.origin === self.location.origin) {
      return true;
    }
    
    // Add your allowed domains here
    const allowedDomains = [
      'example.com',
      'cdn.example.com',
      'images.example.com',
      'localhost'
    ];
    
    return allowedDomains.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

function getFormatFromContentType(contentType) {
  if (!contentType) return 'unknown';
  
  const typeMap = {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/svg+xml': 'svg'
  };
  
  return typeMap[contentType.toLowerCase()] || 'unknown';
}

// Next.js specific optimization hints
function getOptimizationHints(width, devicePixelRatio = 1) {
  const actualWidth = width * devicePixelRatio;
  
  // Common Next.js breakpoints
  const breakpoints = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
  
  // Find the closest breakpoint
  const targetWidth = breakpoints.find(bp => bp >= actualWidth) || actualWidth;
  
  return {
    targetWidth,
    quality: actualWidth > 1920 ? 85 : 75,
    format: 'webp' // Always prefer WebP for Next.js
  };
}