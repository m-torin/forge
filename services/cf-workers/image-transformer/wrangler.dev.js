#!/usr/bin/env node
import { spawn } from "child_process";

// Start wrangler dev with specific configuration
console.log("Starting Wrangler development server for image-transformer...");

const wrangler = spawn(
  "npx",
  [
    "wrangler",
    "dev",
    "dist/index.js",
    "--modules",
    "--watch",
    "--local",
    "--port",
    "8788",
  ],
  {
    cwd: process.cwd(),
    stdio: "inherit",
  },
);

// Handle process events
wrangler.on("error", (error) => {
  console.error(`Error starting Wrangler: ${error.message}`);
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down image-transformer development server...");
  wrangler.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Shutting down image-transformer development server...");
  wrangler.kill("SIGTERM");
  process.exit(0);
});
