# @repo/mcp-utils

- _Can build:_ **NO**

- _Exports:_
  - **Core**: MCP server providing utilities for Claude Code agents
  - **Tools**: `safe_stringify`, `bounded_cache`, `async_logger`

- _AI Hints:_
  ```typescript
  // Primary: MCP protocol utilities for Claude agents - reduces code duplication
  // Use: mcp__claude_utils__safe_stringify({ obj, maxLength })
  // Cache: mcp__claude_utils__create_bounded_cache({ name, maxSize })
  // ❌ NEVER: Duplicate utility functions - use MCP tools instead
  ```

A centralized MCP (Model Context Protocol) server providing common utilities for
Claude Code agents. This package eliminates code duplication across agent files
by offering shared utilities through a standardized MCP interface.

## Overview

The MCP Utils package addresses the DRY (Don't Repeat Yourself) problem in
Claude agent development by providing:

- **Safe JSON stringification** with circular reference handling
- **Bounded caching** with LRU eviction and TTL
- **Async logging** with buffering and file rotation
- **Centralized resource management** through MCP protocol

## Installation & Setup

### 1. Install Dependencies

```bash
cd packages/mcp-utils
pnpm install
```

### 2. Register with Claude Code

The MCP server is already configured in the project's `.mcp.json` file:

```json
{
  "mcpServers": {
    "claude-utils": {
      "command": "node",
      "args": ["./packages/mcp-utils/bin/mcp-server.mjs"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info",
        "PROJECT_ROOT": "${PROJECT_ROOT}"
      }
    }
  }
}
```

### 3. Test the Server

Test the MCP server directly:

```bash
# Test server startup
node packages/mcp-utils/bin/mcp-server.mjs

# Test with MCP client
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node packages/mcp-utils/bin/mcp-server.mjs
```

## Available Tools

### String Utilities

#### `safe_stringify`

Advanced JSON stringification with circular reference handling, size limits, and
metadata.

```javascript
// Usage in Claude agents
await mcp__claude_utils__safe_stringify({
  obj: complexObject,
  maxLength: 50000,
  prettify: true,
  includeMetadata: true
});
```

#### `legacy_safe_stringify`

Backward-compatible version matching the original `safeStringify` function.

```javascript
await mcp__claude_utils__legacy_safe_stringify({
  obj: myObject,
  maxLength: 75000
});
```

### Cache Management

#### `create_bounded_cache`

Create a bounded cache with LRU eviction, TTL, and analytics.

```javascript
await mcp__claude_utils__create_bounded_cache({
  name: "my-cache",
  maxSize: 100,
  ttl: 1800000, // 30 minutes
  enableAnalytics: true
});
```

#### `cache_operation`

Perform operations on a bounded cache.

```javascript
// Set a value
await mcp__claude_utils__cache_operation({
  cacheName: "my-cache",
  operation: "set",
  key: "user-123",
  value: { name: "John", age: 30 }
});

// Get a value
await mcp__claude_utils__cache_operation({
  cacheName: "my-cache",
  operation: "get",
  key: "user-123"
});
```

#### `cache_analytics`

Get performance metrics and analytics for caches.

```javascript
await mcp__claude_utils__cache_analytics({
  cacheName: "my-cache" // omit for global analytics
});
```

#### `cache_cleanup`

Perform memory cleanup on caches.

```javascript
await mcp__claude_utils__cache_cleanup({
  force: true // force cleanup regardless of memory pressure
});
```

### Logger Management

#### `create_async_logger`

Create an async logger with buffering and file rotation.

```javascript
await mcp__claude_utils__create_async_logger({
  sessionId: "analysis-session-123",
  logLevel: "info",
  logDir: "./logs",
  maxBufferSize: 16384,
  maxFileSize: 10485760,
  maxFiles: 5
});
```

#### `log_message`

Log a message using a specific logger.

```javascript
await mcp__claude_utils__log_message({
  sessionId: "analysis-session-123",
  message: "Processing file: example.ts",
  level: "info"
});
```

#### `logger_stats`

Get statistics and performance metrics for loggers.

```javascript
await mcp__claude_utils__logger_stats({
  sessionId: "analysis-session-123" // omit for global stats
});
```

#### `logger_management`

Manage loggers (list, close, flush).

```javascript
// List all loggers
await mcp__claude_utils__logger_management({
  operation: "list"
});

// Flush a specific logger
await mcp__claude_utils__logger_management({
  operation: "flush",
  sessionId: "analysis-session-123"
});
```

## Migration Guide

### Before (Duplicated Code)

```javascript
// Each agent file had this duplicated
function safeStringify(obj, maxLength = 75000) {
  try {
    const str = JSON.stringify(obj, null, 2);
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + "...[truncated]";
    }
    return str;
  } catch (error) {
    return `[Error stringifying: ${error.message}]`;
  }
}

class BoundedCache {
  // 50+ lines of duplicated cache implementation
}

class AsyncLogger {
  // 100+ lines of duplicated logger implementation
}
```

### After (Using MCP Utils)

```javascript
// Simple MCP tool calls
const stringified = await mcp__claude_utils__safe_stringify({
  obj: myObject,
  maxLength: 50000,
  prettify: true
});

await mcp__claude_utils__create_bounded_cache({
  name: "analysis-cache",
  maxSize: 100,
  ttl: 1800000
});

await mcp__claude_utils__create_async_logger({
  sessionId: "my-session",
  logLevel: "info"
});
```

## Benefits

### 🚀 Performance Improvements

- **Shared resources**: Single cache and logger instances across agents
- **Memory efficiency**: Centralized memory management and cleanup
- **Optimized implementations**: Performance-tuned utilities

### 🛠 Maintenance Benefits

- **Single source of truth**: One implementation for all utilities
- **Centralized updates**: Fix bugs and add features in one place
- **Consistent behavior**: Same implementation across all agents

### 📊 Analytics & Monitoring

- **Cache hit rates**: Track cache performance across agents
- **Memory usage**: Monitor and optimize memory consumption
- **Logging statistics**: Comprehensive logging metrics

### 🧪 Testing & Quality

- **Centralized testing**: Full test coverage for all utilities
- **Type safety**: TypeScript definitions for all tools
- **Error handling**: Robust error handling and recovery

## Development

### Running Tests

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

### Linting & Type Checking

```bash
pnpm lint
pnpm typecheck
```

### Development Mode

```bash
pnpm dev # Runs with --watch for auto-restart
```

## Architecture

### Package Structure

```
packages/mcp-utils/
├── bin/
│   └── mcp-server.mjs         # Executable entry point
├── src/
│   ├── index.mjs              # Main MCP server
│   ├── tools/                 # MCP tool definitions
│   │   ├── safe-stringify.mjs
│   │   ├── bounded-cache.mjs
│   │   ├── async-logger.mjs
│   │   └── index.mjs
│   └── utils/                 # Core utility implementations
│       ├── stringify.mjs
│       ├── cache.mjs
│       ├── logger.mjs
│       └── index.mjs
├── __tests__/                 # Test files
└── README.md
```

### MCP Protocol Support

- **Tools**: All utilities exposed as MCP tools
- **Resources**: Caches and loggers as readable resources
- **Error Handling**: Comprehensive error reporting
- **Cleanup**: Automatic resource cleanup on shutdown

## Contributing

1. **Add new utilities** in `src/utils/`
2. **Create MCP tools** in `src/tools/`
3. **Add comprehensive tests** in `__tests__/`
4. **Update documentation** in README.md
5. **Follow existing patterns** for consistency

## Troubleshooting

### Server Won't Start

- Check Node.js version (requires 18+)
- Verify file permissions: `chmod +x bin/mcp-server.mjs`
- Check for port conflicts or permission issues

### Tools Not Available in Claude Code

- Verify `.mcp.json` configuration
- Restart Claude Code after configuration changes
- Check MCP server logs for errors

### Memory Issues

- Use `cache_cleanup` tool to free memory
- Monitor cache analytics for memory usage
- Adjust cache sizes and TTL values

### Performance Issues

- Check logger and cache analytics
- Reduce buffer sizes if needed
- Use `force` cleanup for immediate memory relief

## License

Private package for internal use in the forge-fork monorepo.
