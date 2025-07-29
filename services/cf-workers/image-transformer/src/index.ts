/**
 * Image Transformer Worker
 * Handles image transformation, resizing, and delivery
 */

interface Env {
  IMAGES: R2Bucket;
  SIGNING_KEY: string;
  IMAGE_METADATA?: KVNamespace;
}

interface ImageTransformOptions {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside" | "scale-down";
  format?: "auto" | "webp" | "avif" | "jpeg" | "png" | "gif";
  quality?: number;
  background?: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleCors(request);
    }

    // Handle CDN image transformations
    if (path.startsWith("/cdn-cgi/image/")) {
      return handleImageTransformation(request, env, ctx);
    }

    // Direct image access (requires signature verification)
    if (path.startsWith("/images/")) {
      return handleDirectImageAccess(request, env);
    }

    // Default response
    return new Response("Cloudflare Image Transformer Service", {
      headers: corsHeaders,
    });
  },
};

// CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight requests
function handleCors(request: Request): Response {
  return new Response(null, {
    headers: corsHeaders,
  });
}

// Parse image transformation parameters from CDN-style URL
function parseTransformOptions(url: URL): ImageTransformOptions {
  const path = url.pathname;
  const options: ImageTransformOptions = {};

  // Extract parameters from path like /cdn-cgi/image/width=200,format=auto,quality=80/images/...
  const transformPart = path
    .split("/images/")[0]
    .replace("/cdn-cgi/image/", "");

  transformPart.split(",").forEach((param) => {
    const [key, value] = param.split("=");
    if (key && value) {
      switch (key) {
        case "width":
        case "height":
        case "quality":
          options[key] = parseInt(value, 10);
          break;
        case "format":
          if (["auto", "webp", "avif", "jpeg", "png", "gif"].includes(value)) {
            options[key] = value as any;
          }
          break;
        case "fit":
          if (
            [
              "cover",
              "contain",
              "fill",
              "inside",
              "outside",
              "scale-down",
            ].includes(value)
          ) {
            options[key] = value as any;
          }
          break;
        case "background":
          options[key] = value;
          break;
      }
    }
  });

  return options;
}

// Extract the image path from a transformation URL
function extractImagePath(url: URL): string {
  const path = url.pathname;
  const match = path.match(/\/cdn-cgi\/image\/.*?\/(images\/.*)$/);
  return match ? match[1] : path.replace("/cdn-cgi/image/", "");
}

// Handle image transformation requests
async function handleImageTransformation(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);
  const transformOptions = parseTransformOptions(url);
  const imagePath = extractImagePath(url);

  try {
    // Get the image from R2
    const object = await env.IMAGES.get(imagePath);

    if (!object) {
      return new Response("Image not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    // For now, we're returning the original image
    // In a production environment, this would use the Cloudflare Image Resizing API
    // or a custom implementation to transform the image

    const headers = new Headers(corsHeaders);
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "image/jpeg",
    );
    headers.set("Cache-Control", "public, max-age=31536000"); // 1 year cache
    headers.set("ETag", object.httpEtag);

    if (object.size) {
      headers.set("Content-Length", object.size.toString());
    }

    // Return the image (in a real implementation, this would be transformed)
    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Error transforming image:", error);
    return new Response("Error processing image transformation", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// Handle direct image access (with signature verification)
async function handleDirectImageAccess(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const signature = url.searchParams.get("sig");
  const expiration = url.searchParams.get("exp");
  const path = url.pathname.substring(1); // Remove leading slash

  // Verify signature and expiration if provided
  if (signature && expiration) {
    const isValid = await verifySignature(
      path,
      signature,
      expiration,
      env.SIGNING_KEY,
    );

    if (!isValid) {
      return new Response("Invalid or expired signature", {
        status: 403,
        headers: corsHeaders,
      });
    }
  } else {
    // Public images might not require signatures, but we're enforcing it here
    return new Response("Signature required for image access", {
      status: 403,
      headers: corsHeaders,
    });
  }

  try {
    // Get the image from R2
    const object = await env.IMAGES.get(path);

    if (!object) {
      return new Response("Image not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const headers = new Headers(corsHeaders);
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "image/jpeg",
    );
    headers.set("Cache-Control", "public, max-age=3600"); // 1 hour cache for direct access
    headers.set("ETag", object.httpEtag);

    if (object.size) {
      headers.set("Content-Length", object.size.toString());
    }

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Error accessing image:", error);
    return new Response("Error accessing image", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// Verify signature for image access
async function verifySignature(
  path: string,
  signature: string,
  expiration: string,
  signingKey: string,
): Promise<boolean> {
  // Check if the signature has expired
  const expTime = parseInt(expiration, 10);
  const currentTime = Math.floor(Date.now() / 1000);

  if (expTime < currentTime) {
    return false;
  }

  // Verify the signature
  const encoder = new TextEncoder();
  const data = encoder.encode(`${path}:${expiration}`);

  // Create HMAC signature using the signing key
  const keyData = encoder.encode(signingKey);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  // Convert hex signature to ArrayBuffer
  const signatureBytes = new Uint8Array(
    signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );

  // Verify the signature
  return crypto.subtle.verify("HMAC", key, signatureBytes, data);
}
