/**
 * Image Transformer Worker
 * Handles advanced image transformations including resizing, cropping, and effects
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cache = caches.default;
    
    // Check cache first
    const cacheKey = new Request(url.toString(), request);
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Parse transformation parameters
    const params = parseTransformParams(url.pathname);
    const imagePath = params.path;
    
    try {
      // Fetch original image
      const imageResponse = await fetchImage(env, imagePath);
      if (!imageResponse.ok) {
        return new Response('Image not found', { status: 404 });
      }
      
      // Apply transformations using Cloudflare Image Resizing
      const transformedResponse = await fetch(imageResponse.url, {
        cf: {
          image: {
            width: params.width,
            height: params.height,
            quality: params.quality || ${DEFAULT_QUALITY},
            format: params.format || 'auto',
            fit: params.fit || 'scale-down',
            sharpen: params.sharpen,
            blur: params.blur,
            rotate: params.rotate,
            background: params.background,
            dpr: params.dpr
          },
          cacheEverything: true,
          cacheTtl: ${CACHE_TTL}
        }
      });
      
      // Apply additional effects if requested
      let processedImage = await transformedResponse.arrayBuffer();
      
      if (${enable_smart_cropping} && params.smartCrop) {
        processedImage = await smartCrop(processedImage, env.AI);
      }
      
      if (${enable_color_adjustment} && params.colorAdjust) {
        processedImage = await adjustColors(processedImage, params.colorAdjust);
      }
      
      if (${enable_face_detection} && params.focusFace) {
        processedImage = await focusOnFace(processedImage, env.AI);
      }
      
      // Check if preset is requested
      if (params.preset) {
        const presets = ${jsonencode(presets)};
        const preset = presets[params.preset];
        if (preset) {
          processedImage = await applyPreset(processedImage, preset);
        }
      }
      
      // Build response
      const response = new Response(processedImage, {
        headers: {
          'Content-Type': getContentType(params.format),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Transform-Applied': JSON.stringify(params),
          'Vary': 'Accept'
        }
      });
      
      // Cache the response
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      
      // Store in KV cache if available
      if (env.KV_IMAGE_CACHE) {
        const kvKey = `transform:${url.pathname}`;
        ctx.waitUntil(
          env.KV_IMAGE_CACHE.put(kvKey, processedImage, {
            expirationTtl: ${CACHE_TTL}
          })
        );
      }
      
      return response;
      
    } catch (error) {
      console.error('Transform error:', error);
      return new Response('Error transforming image', { status: 500 });
    }
  }
};

function parseTransformParams(pathname) {
  // Example: /cdn-cgi/image/w=800,h=600,q=85,f=webp/path/to/image.jpg
  const match = pathname.match(/\/cdn-cgi\/image\/([^\/]+)\/(.*)/);
  if (!match) {
    return { path: pathname };
  }
  
  const [, paramString, path] = match;
  const params = { path };
  
  // Parse comma-separated parameters
  paramString.split(',').forEach(param => {
    const [key, value] = param.split('=');
    switch (key) {
      case 'w':
        params.width = parseInt(value, 10);
        break;
      case 'h':
        params.height = parseInt(value, 10);
        break;
      case 'q':
        params.quality = parseInt(value, 10);
        break;
      case 'f':
        params.format = value;
        break;
      case 'fit':
        params.fit = value;
        break;
      case 'sharp':
        params.sharpen = parseFloat(value);
        break;
      case 'blur':
        params.blur = parseInt(value, 10);
        break;
      case 'rot':
        params.rotate = parseInt(value, 10);
        break;
      case 'bg':
        params.background = value;
        break;
      case 'dpr':
        params.dpr = parseFloat(value);
        break;
      case 'smartcrop':
        params.smartCrop = value === '1';
        break;
      case 'color':
        params.colorAdjust = value;
        break;
      case 'face':
        params.focusFace = value === '1';
        break;
      case 'preset':
        params.preset = value;
        break;
    }
  });
  
  return params;
}

async function fetchImage(env, path) {
  // Try KV cache first
  if (env.KV_IMAGE_CACHE) {
    const cached = await env.KV_IMAGE_CACHE.get(`original:${path}`, 'arrayBuffer');
    if (cached) {
      return new Response(cached, { status: 200 });
    }
  }
  
  // Try R2
  if (env.R2_IMAGES) {
    const object = await env.R2_IMAGES.get(path);
    if (object) {
      return new Response(object.body, {
        status: 200,
        headers: object.httpMetadata || {}
      });
    }
  }
  
  // Fallback to origin
  return fetch(`https://origin.example.com/${path}`);
}

async function smartCrop(buffer, ai) {
  // Use AI to detect important regions and crop intelligently
  // This is a placeholder - actual implementation would use AI models
  return buffer;
}

async function adjustColors(buffer, adjustments) {
  // Apply color adjustments like brightness, contrast, saturation
  // This would use image processing libraries
  return buffer;
}

async function focusOnFace(buffer, ai) {
  // Detect faces and crop/zoom to focus on them
  // This would use face detection AI models
  return buffer;
}

async function applyPreset(buffer, preset) {
  // Apply predefined transformation preset
  // This would chain multiple operations based on preset configuration
  return buffer;
}

function getContentType(format) {
  const types = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    svg: 'image/svg+xml'
  };
  
  return types[format] || 'application/octet-stream';
}