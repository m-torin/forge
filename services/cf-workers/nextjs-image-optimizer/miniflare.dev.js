#!/usr/bin/env node
import { Miniflare } from "miniflare";
import { readFileSync } from "fs";
import { join } from "path";
import { createServer } from "http";

const PORT = 8789;

// Start miniflare instance for development
async function start() {
  console.log(
    "Starting Miniflare development server for nextjs-image-optimizer...",
  );

  // Create Miniflare instance
  const mf = new Miniflare({
    modules: true,
    scriptPath: "./dist/nextjs_image_optimizer/index.js",
    port: PORT,
    watch: true,
    buildCommand: "pnpm build",
  });

  // Create an HTTP server to proxy requests to Miniflare
  const server = createServer(async (req, res) => {
    // Construct the URL from the request
    const url = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`,
    );

    // Get the request body if applicable
    let body;
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "PATCH"
    ) {
      body = await new Promise((resolve) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      });
    }

    try {
      // Dispatch the request to Miniflare
      const mfResponse = await mf.dispatchFetch(url, {
        method: req.method,
        headers: req.headers,
        body,
      });

      // Set the status code and headers
      res.statusCode = mfResponse.status;
      mfResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Send the response body
      const responseBody = await mfResponse.arrayBuffer();
      res.end(Buffer.from(responseBody));
    } catch (error) {
      console.error("Error handling request:", error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Start the server
  server.listen(PORT, () => {
    console.log(`Miniflare server listening on http://localhost:${PORT}`);
  });

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log("
Shutting down server...");
    server.close();
    process.exit(0);
  });
}

start().catch(console.error);
