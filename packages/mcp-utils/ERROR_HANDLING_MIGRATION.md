# Error Handling Standardization Migration Guide

## Overview

This document outlines the standardization of error handling patterns across all
MCP Utils tools and utilities. The goal is to provide consistent, secure, and
maintainable error handling throughout the codebase.

## Current State

- **Total catch blocks**: 61
- **Files with error handling**: 19
- **Patterns to standardize**: Multiple inconsistent approaches

## New Standardized Approach

### 1. Import the Error Handling Utilities

```typescript
import {
  createMCPErrorResponse,
  ErrorPatterns,
  getSafeErrorMessage
} from "../utils/error-handling";
```

### 2. Replace Unknown Action Errors

**Before:**

```typescript
default:
  throw new Error(`Unknown action: ${action}`);
```

**After:**

```typescript
default:
  ErrorPatterns.unknownAction(action, [
    'validAction1', 'validAction2', 'validAction3'
  ]);
```

### 3. Replace Generic Catch Blocks

**Before:**

```typescript
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          action: args.action,
          timestamp: new Date().toISOString(),
        }),
      },
    ],
    isError: true,
  };
}
```

**After:**

```typescript
} catch (error) {
  return createMCPErrorResponse(error, action, {
    contextInfo: 'Tool Name',
    logToConsole: false,
  });
}
```

### 4. Replace Manual Error Logging

**Before:**

```typescript
queueMicrotask(() => {
  process.stderr.write(`Tool error: ${String(error)}\n`);
});
```

**After:**

```typescript
import { logErrorAsync } from "../utils/error-handling";

logErrorAsync(error, "Tool Name");
```

### 5. Replace Missing Parameter Checks

**Before:**

```typescript
if (!requiredParam) {
  throw new Error("Required parameter missing");
}
```

**After:**

```typescript
if (!requiredParam) {
  ErrorPatterns.missingParameter("requiredParam", "actionName");
}
```

## Migration Checklist by File

### ✅ Completed Files

- [x] `/src/tools/pattern-analyzer.ts` - Updated with standardized patterns
- [x] `/src/tools/batch-processor.ts` - Updated with standardized patterns

### 🔄 Files To Migrate (High Priority)

#### Core MCP Tools

- [ ] `/src/tools/report-generator.ts` (5 catch blocks)
- [ ] `/src/tools/async-logger.ts` (6 catch blocks)
- [ ] `/src/tools/worktree-manager.ts` (2 catch blocks)
- [ ] `/src/tools/path-manager.ts` (3 catch blocks)
- [ ] `/src/tools/code-analysis.ts` (4 catch blocks)

#### Comprehensive Tools

- [ ] `/src/tools/comprehensive-code-analysis.ts` (1 catch block)
- [ ] `/src/tools/context-session-manager.ts` (2 catch blocks)
- [ ] `/src/tools/workflow-orchestrator.ts` (2 catch blocks)
- [ ] `/src/tools/test-runner.ts` (6 catch blocks)
- [ ] `/src/tools/file-discovery.ts` (1 catch block)

#### Utilities

- [ ] `/src/tools/simple-tools.ts` (5 catch blocks)
- [ ] `/src/tools/session-management.ts` (3 catch blocks)
- [ ] `/src/tools/safe-stringify.ts` (2 catch blocks)
- [ ] `/src/tools/memory-monitor.ts` (2 catch blocks)
- [ ] `/src/tools/code-transformation.ts` (3 catch blocks)

#### Supporting Files

- [ ] `/src/utils/retry.ts` (1 catch block)
- [ ] `/src/server.ts` (4 catch blocks)

## Benefits of Standardization

### 1. **Security**

- Prevents sensitive data leakage through error messages
- Sanitizes error output automatically
- Consistent logging patterns

### 2. **Maintainability**

- Single point of control for error handling logic
- Consistent error response format
- Easier debugging with standardized error objects

### 3. **Reliability**

- Proper error categorization (ValidationError, TimeoutError, etc.)
- Safe async logging to prevent blocking
- Error cause chains for better debugging

### 4. **Developer Experience**

- Clear error patterns for common cases
- Type-safe error handling
- Comprehensive error context

## Example Full Migration

### Before (report-generator.ts):

```typescript
try {
  // ... tool logic
  switch (action) {
    case "generateQualityReport":
      if (!analysisData) {
        throw new Error("Analysis data required for quality report generation");
      }
      // ... implementation
      break;
    default:
      throw new Error(`Unknown report generator action: ${action}`);
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return {
    content: [
      {
        type: "text",
        text: `Error in report generator: ${errorMessage}`
      }
    ],
    isError: true
  };
}
```

### After (report-generator.ts):

```typescript
import { createMCPErrorResponse, ErrorPatterns } from "../utils/error-handling";

try {
  // ... tool logic
  switch (action) {
    case "generateQualityReport":
      if (!analysisData) {
        ErrorPatterns.missingParameter("analysisData", "generateQualityReport");
      }
      // ... implementation
      break;
    default:
      ErrorPatterns.unknownAction(action, [
        "generateQualityReport",
        "generateSummaryReport",
        "createPullRequest"
        // ... other valid actions
      ]);
  }
} catch (error) {
  return createMCPErrorResponse(error, action, {
    contextInfo: "Report Generator"
  });
}
```

## Validation

After migration, run these checks:

1. `pnpm typecheck` - Ensure TypeScript compilation
2. `pnpm lint` - Verify ESLint compliance
3. `pnpm build` - Confirm build success
4. Test error scenarios to verify proper error formatting

## Custom Error Types Available

- `ValidationError` - For parameter validation failures
- `TimeoutError` - For operation timeouts
- `ConfigurationError` - For configuration issues

## Common Patterns Reference

```typescript
// Unknown action
ErrorPatterns.unknownAction(action, validActions);

// Missing parameter
ErrorPatterns.missingParameter("paramName", "actionName");

// Invalid type
ErrorPatterns.invalidParameterType("paramName", "string", actualValue);

// File not found
ErrorPatterns.fileNotFound("/path/to/file");

// Timeout
ErrorPatterns.operationTimeout("operationName", 5000);

// Custom error with cause
const error = createErrorWithCause("Operation failed", originalError);

// Safe logging
logErrorAsync(error, "Context Info");
```

This migration ensures consistent, secure, and maintainable error handling
across the entire MCP Utils codebase.
