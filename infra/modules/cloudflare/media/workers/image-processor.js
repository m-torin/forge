/**
 * Image Processor Worker
 * Handles image processing operations including optimization, watermarking, and AI classification
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Parse image processing parameters from URL
    const params = new URLSearchParams(url.search);
    const operation = params.get('op') || 'optimize';
    const format = params.get('format') || 'auto';
    const quality = parseInt(params.get('quality') || '${optimization_quality}', 10);
    
    // Get image from R2 or fetch from origin
    const imagePath = url.pathname.replace('/process/', '');
    
    try {
      // Fetch the original image
      const imageResponse = await fetchImage(env, imagePath);
      if (!imageResponse.ok) {
        return new Response('Image not found', { status: 404 });
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Process based on operation
      let processedImage = imageBuffer;
      
      switch (operation) {
        case 'optimize':
          processedImage = await optimizeImage(imageBuffer, format, quality);
          break;
          
        case 'watermark':
          if (${enable_watermarking}) {
            processedImage = await addWatermark(imageBuffer, {
              text: '${watermark_text}',
              position: '${watermark_position}',
              opacity: ${watermark_opacity}
            });
          }
          break;
          
        case 'classify':
          if (${enable_ai_classification} && env.AI) {
            const classification = await classifyImage(env.AI, imageBuffer);
            
            // Store results in KV if available
            if (env.KV_AI_RESULTS) {
              await env.KV_AI_RESULTS.put(
                `classification:${imagePath}`,
                JSON.stringify(classification),
                { expirationTtl: 604800 } // 7 days
              );
            }
            
            return new Response(JSON.stringify(classification), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          break;
          
        case 'compress':
          processedImage = await compressImage(imageBuffer, '${compression_level}');
          break;
      }
      
      // Cache the processed image if KV is available
      if (env.KV_IMAGE_CACHE) {
        const cacheKey = `processed:${imagePath}:${operation}:${format}:${quality}`;
        await env.KV_IMAGE_CACHE.put(cacheKey, processedImage, {
          expirationTtl: 3600 // 1 hour
        });
      }
      
      // Return the processed image
      return new Response(processedImage, {
        headers: {
          'Content-Type': getContentType(format),
          'Cache-Control': 'public, max-age=31536000',
          'X-Processed-By': 'image-processor'
        }
      });
      
    } catch (error) {
      console.error('Image processing error:', error);
      return new Response('Error processing image', { status: 500 });
    }
  }
};

async function fetchImage(env, path) {
  // Try R2 first
  if (env.R2_IMAGES) {
    const object = await env.R2_IMAGES.get(path);
    if (object) {
      return new Response(object.body, {
        headers: object.httpMetadata || {}
      });
    }
  }
  
  // Fallback to origin
  return fetch(`https://origin.example.com/${path}`);
}

async function optimizeImage(buffer, format, quality) {
  // Use Cloudflare Image Resizing API
  const response = await fetch('https://api.cloudflare.com/client/v4/image/optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: buffer,
    cf: {
      image: {
        format: format === 'auto' ? undefined : format,
        quality: quality
      }
    }
  });
  
  return response.arrayBuffer();
}

async function addWatermark(buffer, options) {
  // Watermarking implementation
  // This would use a library or API to add watermarks
  return buffer; // Placeholder
}

async function classifyImage(ai, buffer) {
  const response = await ai.run('${ai_model}', {
    image: Array.from(new Uint8Array(buffer))
  });
  
  return {
    labels: response.labels || [],
    confidence: response.confidence || 0,
    timestamp: new Date().toISOString()
  };
}

async function compressImage(buffer, level) {
  const compressionQuality = {
    low: 95,
    balanced: 85,
    high: 70
  };
  
  return optimizeImage(buffer, 'auto', compressionQuality[level] || 85);
}

function getContentType(format) {
  const types = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif'
  };
  
  return types[format] || 'image/jpeg';
}