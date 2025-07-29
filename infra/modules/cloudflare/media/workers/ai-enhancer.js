/**
 * AI Image Enhancer Worker
 * Uses Cloudflare AI to enhance, modify, and analyze images
 */

export default {
  async fetch(request, env, ctx) {
    if (!env.AI) {
      return new Response('AI not available', { status: 503 });
    }
    
    const url = new URL(request.url);
    const operation = url.pathname.split('/')[3]; // /ai/enhance/{operation}/path
    const imagePath = url.pathname.replace(`/ai/enhance/${operation}/`, '');
    
    try {
      // Fetch original image
      const imageResponse = await fetchImage(env, imagePath);
      if (!imageResponse.ok) {
        return new Response('Image not found', { status: 404 });
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageArray = Array.from(new Uint8Array(imageBuffer));
      
      // Check AI results cache
      const cacheKey = `ai:${operation}:${imagePath}`;
      if (env.KV_AI_RESULTS) {
        const cached = await env.KV_AI_RESULTS.get(cacheKey, 'arrayBuffer');
        if (cached) {
          return new Response(cached, {
            headers: {
              'Content-Type': 'image/png',
              'X-AI-Cache': 'HIT'
            }
          });
        }
      }
      
      let result;
      
      switch (operation) {
        case 'enhance':
          result = await enhanceImage(env.AI, imageArray);
          break;
          
        case 'remove-background':
          if (${enable_background_removal}) {
            result = await removeBackground(env.AI, imageArray);
          } else {
            return new Response('Background removal not enabled', { status: 400 });
          }
          break;
          
        case 'remove-object':
          if (${enable_object_removal}) {
            const mask = await generateObjectMask(env.AI, imageArray);
            result = await removeObject(env.AI, imageArray, mask);
          } else {
            return new Response('Object removal not enabled', { status: 400 });
          }
          break;
          
        case 'upscale':
          result = await upscaleImage(env.AI, imageArray);
          break;
          
        case 'style-transfer':
          const style = url.searchParams.get('style') || 'artistic';
          result = await styleTransfer(env.AI, imageArray, style);
          break;
          
        case 'generate-alt':
          // Generate alt text for accessibility
          const altText = await generateAltText(env.AI, imageArray);
          return new Response(JSON.stringify({ alt: altText }), {
            headers: { 'Content-Type': 'application/json' }
          });
          
        case 'detect-objects':
          const objects = await detectObjects(env.AI, imageArray);
          return new Response(JSON.stringify(objects), {
            headers: { 'Content-Type': 'application/json' }
          });
          
        default:
          return new Response('Unknown operation', { status: 400 });
      }
      
      // Convert result to buffer
      const resultBuffer = new Uint8Array(result).buffer;
      
      // Cache the result
      if (env.KV_AI_RESULTS) {
        ctx.waitUntil(
          env.KV_AI_RESULTS.put(cacheKey, resultBuffer, {
            expirationTtl: 604800 // 7 days
          })
        );
      }
      
      return new Response(resultBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=604800',
          'X-AI-Model': '${ai_model}',
          'X-AI-Operation': operation
        }
      });
      
    } catch (error) {
      console.error('AI enhancement error:', error);
      return new Response('AI processing failed', { status: 500 });
    }
  }
};

async function fetchImage(env, path) {
  if (env.R2_IMAGES) {
    const object = await env.R2_IMAGES.get(path);
    if (object) {
      return new Response(object.body, {
        status: 200,
        headers: object.httpMetadata || {}
      });
    }
  }
  
  return fetch(`https://origin.example.com/${path}`);
}

async function enhanceImage(ai, imageArray) {
  // Use AI to enhance image quality
  const response = await ai.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
    prompt: 'enhance quality, sharpen details, improve colors',
    image: imageArray,
    num_steps: 20,
    strength: 0.5
  });
  
  return response.image;
}

async function removeBackground(ai, imageArray) {
  // Use AI model for background removal
  const response = await ai.run('@cf/bytedance/stable-diffusion-xl-lightning', {
    prompt: 'remove background, transparent background, isolated subject',
    image: imageArray,
    num_steps: 4
  });
  
  return response.image;
}

async function generateObjectMask(ai, imageArray) {
  // Generate segmentation mask for object detection
  const response = await ai.run('${ai_model}', {
    image: imageArray,
    task: 'segmentation'
  });
  
  return response.mask;
}

async function removeObject(ai, imageArray, mask) {
  // Use inpainting to remove objects
  const response = await ai.run('@cf/bytedance/stable-diffusion-xl-lightning', {
    prompt: 'remove object, fill background naturally',
    image: imageArray,
    mask: mask,
    num_steps: 4
  });
  
  return response.image;
}

async function upscaleImage(ai, imageArray) {
  // Use AI super-resolution
  const response = await ai.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
    prompt: 'high resolution, 4k quality, sharp details',
    image: imageArray,
    width: 2048,
    height: 2048,
    num_steps: 20
  });
  
  return response.image;
}

async function styleTransfer(ai, imageArray, style) {
  const stylePrompts = {
    artistic: 'oil painting style, artistic, masterpiece',
    cartoon: 'cartoon style, animated, colorful',
    sketch: 'pencil sketch, black and white drawing',
    watercolor: 'watercolor painting, soft colors, artistic'
  };
  
  const response = await ai.run('@cf/bytedance/stable-diffusion-xl-lightning', {
    prompt: stylePrompts[style] || stylePrompts.artistic,
    image: imageArray,
    num_steps: 4,
    strength: 0.7
  });
  
  return response.image;
}

async function generateAltText(ai, imageArray) {
  // Use vision model to generate descriptive alt text
  const response = await ai.run('${ai_model}', {
    image: imageArray,
    task: 'caption'
  });
  
  return response.description || 'Image';
}

async function detectObjects(ai, imageArray) {
  // Use object detection model
  const response = await ai.run('${ai_model}', {
    image: imageArray,
    task: 'object-detection'
  });
  
  return {
    objects: response.objects || [],
    confidence: response.confidence || 0,
    timestamp: new Date().toISOString()
  };
}