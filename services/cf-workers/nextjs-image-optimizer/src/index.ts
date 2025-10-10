/**
 * Next.js Image Optimizer Worker
 * Provides compatibility with Next.js Image component
 */

interface Env {
  IMAGES: R2Bucket;
  SIGNING_KEY: string;
  IMAGE_METADATA?: KVNamespace;
}

interface NextImageParams {
  url: string;
  w: number;
  q: number;
  fit?: string;
}

interface TransformOptions {
  width: number;
  quality: number;
  fit: string;
  format: string;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Next.js image API route pattern
    if (url.pathname.startsWith("/api/_next/image")) {
      return handleNextJsImage(request, env, ctx);
    }

    return new Response("Next.js Image Optimizer Service", {
      headers: corsHeaders,
    });
  },
};

// Parse Next.js image parameters
function parseNextImageParams(url: URL): NextImageParams | null {
  const params = url.searchParams;

  const imageUrl = params.get("url");
  const width = params.get("w");
  const quality = params.get("q");

  if (!imageUrl || !width) {
    return null;
  }

  return {
    url: decodeURIComponent(imageUrl),
    w: parseInt(width, 10),
    q: quality ? parseInt(quality, 10) : 75,
    fit: params.get("fit") || "cover",
  };
}

// Convert Next.js parameters to our internal format
function convertToImagePath(nextParams: NextImageParams): {
  path: string;
  transformOptions: TransformOptions;
} {
  // Handle different URL formats:
  // 1. Full URLs to our media domain
  // 2. Relative URLs (/images/...)
  // 3. Image IDs (uuid format)

  let path = "";

  if (nextParams.url.startsWith("http")) {
    // Extract path from full URL
    try {
      const urlObj = new URL(nextParams.url);
      path = urlObj.pathname.substring(1); // Remove leading slash
    } catch (e) {
      console.error("Invalid URL:", nextParams.url);
      path = "";
    }
  } else if (nextParams.url.startsWith("/")) {
    // Relative URL, remove leading slash
    path = nextParams.url.substring(1);
  } else if (
    nextParams.url.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  ) {
    // UUID format - we need to look up the actual path
    // In a real implementation, this would query the KV store for the mapping
    path = `images/${nextParams.url}`;
  } else {
    // Direct path
    path = nextParams.url;
  }

  // If path doesn't start with 'images/', prepend it
  if (!path.startsWith("images/")) {
    path = `images/${path}`;
  }

  // Convert Next.js params to our transform options
  const transformOptions = {
    width: nextParams.w,
    quality: nextParams.q,
    fit: mapNextJsFit(nextParams.fit || "cover"),
    format: "auto",
  };

  return { path, transformOptions };
}

// Map Next.js fit values to our format
function mapNextJsFit(nextFit: string): string {
  const fitMap: Record<string, string> = {
    cover: "cover",
    contain: "contain",
    fill: "fill",
    inside: "inside",
    outside: "outside",
  };

  return fitMap[nextFit] || "cover";
}

// Handle Next.js image requests
async function handleNextJsImage(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);
  const nextParams = parseNextImageParams(url);

  if (!nextParams) {
    return new Response("Invalid image parameters", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { path, transformOptions } = convertToImagePath(nextParams);

  try {
    // Fetch image from R2
    const object = await env.IMAGES.get(path);

    if (!object) {
      return new Response("Image not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    // In a production environment, this would apply the transformations
    // For now, we'll just return the original image with appropriate headers

    const headers = new Headers(corsHeaders);
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "image/jpeg",
    );
    headers.set("Cache-Control", "public, max-age=31536000"); // 1 year cache for transformed images
    headers.set("ETag", object.httpEtag);

    if (object.size) {
      headers.set("Content-Length", object.size.toString());
    }

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Error processing Next.js image:", error);
    return new Response("Error processing image", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
