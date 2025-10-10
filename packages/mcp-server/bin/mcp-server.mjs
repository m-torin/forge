#!/usr/bin/env node

/**
 * MCP Utils Server Executable
 * Entry point for running the MCP server
 */

import MCPUtilsServer from '../dist/server.mjs';

async function main() {
  try {
    const server = new MCPUtilsServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start MCP Utils server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('Main function error:', error);
  process.exit(1);
});