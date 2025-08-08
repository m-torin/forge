#!/usr/bin/env node

/**
 * MCP Utils Server Executable
 * Entry point for running the MCP server
 */

import MCPUtilsServer from '../dist/server.mjs';
// Note: Lifecycle management is now handled by the server itself

async function main() {
  try {
    const server = new MCPUtilsServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start MCP Utils server:', error);
    process.exit(1);
  }
}

// Process lifecycle management is now centralized in the server

main().catch((error) => {
  console.error('Main function error:', error);
  process.exit(1);
});