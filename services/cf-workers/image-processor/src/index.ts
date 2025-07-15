/**
 * Image Processor Worker
 * Handles image upload, processing, and AI classification
 */

interface Env {
  IMAGES: R2Bucket;
  SIGNING_KEY: string;
  IMAGE_METADATA?: KVNamespace;
  AI?: any; // Cloudflare AI binding
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for pre-flight requests
    if (request.method === "OPTIONS") {
      return handleCors(request);
    }

    // Image upload and processing endpoint
    if (path === "/process" && request.method === "POST") {
      return handleImageUpload(request, env, ctx);
    }

    // Image metadata management endpoint
    if (
      path.startsWith("/metadata") &&
      (request.method === "GET" || request.method === "PUT")
    ) {
      return handleMetadata(request, env, ctx);
    }

    // Default response
    return new Response(
      "Cloudflare Image Processor: Use /process to upload and process images",
      {
        headers: corsHeaders,
      },
    );
  },
};

// CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file type
    const contentType = file.type;
    if (!contentType.startsWith("image/")) {
      return new Response(
        JSON.stringify({ error: "Only image files are allowed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate unique ID for the image
    const imageId = crypto.randomUUID();
    const timestamp = Date.now();

    // Create object key with directory structure
    const objectKey = `images/${formatDate(timestamp)}/${imageId}${getExtensionFromMimeType(contentType)}`;

    // Upload original image to R2
    await env.IMAGES.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: contentType,
      },
      customMetadata: {
        uploadedAt: timestamp.toString(),
        originalFilename: file.name,
      },
    });

    // AI classification if available
    let classification = null;
    if (env.AI && env.IMAGE_METADATA) {
      ctx.waitUntil(classifyImageWithAI(file, imageId, env));
    }

    // Generate signed URL for direct access with 1-hour expiration
    const imageUrl = await generateSignedUrl(objectKey, env.SIGNING_KEY, 3600);

    return new Response(
      JSON.stringify({
        success: true,
        imageId: imageId,
        url: imageUrl,
        key: objectKey,
        contentType: contentType,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response(JSON.stringify({ error: "Failed to process image" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Handle image metadata operations
async function handleMetadata(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);
  const imageId = url.pathname.split("/").pop();

  if (!imageId || !env.IMAGE_METADATA) {
    return new Response(
      JSON.stringify({
        error: "Invalid request or metadata storage not configured",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // GET metadata
  if (request.method === "GET") {
    const metadata = await env.IMAGE_METADATA.get(imageId);
    if (!metadata) {
      return new Response(JSON.stringify({ error: "Metadata not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(metadata, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // PUT metadata (update)
  if (request.method === "PUT") {
    try {
      const data = await request.json();
      await env.IMAGE_METADATA.put(imageId, JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Failed to update metadata" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Classify image using Cloudflare AI
async function classifyImageWithAI(
  file: File,
  imageId: string,
  env: Env,
): Promise<void> {
  try {
    // Convert image to blob for AI processing
    const imageBlob = new Blob([await file.arrayBuffer()], { type: file.type });

    // Run image classification with Cloudflare AI
    const classification = await env.AI.run(
      "@cf/microsoft/resnet-50",
      imageBlob,
    );

    // Store classification results in KV
    if (classification && env.IMAGE_METADATA) {
      await env.IMAGE_METADATA.put(
        imageId,
        JSON.stringify({
          classification: classification,
          timestamp: Date.now(),
          contentType: file.type,
        }),
      );
    }
  } catch (error) {
    console.error("AI classification error:", error);
    // Store error info but don't fail the upload
    if (env.IMAGE_METADATA) {
      await env.IMAGE_METADATA.put(
        imageId,
        JSON.stringify({
          classification: null,
          error: "Classification failed",
          timestamp: Date.now(),
        }),
      );
    }
  }
}

// Generate date-based path format YYYY/MM/DD
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getUTCDate().toString().padStart(2, "0")}`;
}

// Get file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
  };

  return extensions[mimeType] || ".bin";
}

// Generate signed URL for image access
async function generateSignedUrl(
  objectKey: string,
  signingKey: string,
  expirationSeconds: number,
): Promise<string> {
  const expiration = Math.floor(Date.now() / 1000) + expirationSeconds;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${objectKey}:${expiration}`);

  // Create HMAC signature using the signing key
  const keyData = encoder.encode(signingKey);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `/${objectKey}?sig=${signatureHex}&exp=${expiration}`;
}
