# DRY Refactoring Plan for packages/orchestration/src

## Executive Summary

After analyzing all TypeScript files in the orchestration package, I've identified significant
redundancy and opportunities for consolidation. The main areas of duplication are:

1. **Batch Processing Logic** - Multiple implementations of batch processing patterns
2. **Retry Logic** - Duplicated retry patterns across different modules
3. **Error Handling** - Repeated error classification and handling code
4. **Parallel Processing** - Similar parallel execution patterns in multiple places
5. **Result Types** - Duplicated result interfaces and type definitions
6. **Time/Duration Utilities** - Repeated time calculation and formatting functions
7. **Validation Logic** - Similar validation patterns across modules

## Detailed Analysis

### 1. Batch Processing Duplication

**Files with duplication:**

- `runtime/patterns/patterns.ts` - `processBatchPattern()`
- `runtime/features/batch-processing.ts` - `processBatches()`
- `utils/parallel.ts` - `processParallel()` with batch support

**Common patterns:**

- Chunking arrays into batches
- Processing batches with concurrency control
- Handling batch completion callbacks
- Delay between batches
- Error aggregation

**Recommendation:** Create a single `BatchProcessor` class in `utils/batch-processing.ts` that all
other modules can use.

### 2. Retry Logic Duplication

**Files with duplication:**

- `utils/retry.ts` - Core retry implementation
- `runtime/patterns/patterns.ts` - `retryWithBackoffPattern()`
- Multiple files using custom retry logic

**Common patterns:**

- Exponential backoff calculation
- Retry configuration (maxAttempts, delays, etc.)
- Error classification for retry decisions
- Jitter implementation

**Recommendation:** The `utils/retry.ts` already provides a good centralized implementation. Remove
duplicate implementations and use the centralized `retryOperation()` function everywhere.

### 3. Error Handling Duplication

**Files with duplication:**

- `utils/error-handling.ts` - Core error handling
- `utils/helpers.ts` - Error utility functions
- Various workflow files with custom error handling

**Common patterns:**

- Error classification (network, timeout, rate limit, etc.)
- Error message formatting
- Retry decision logic based on error type
- Error context enrichment

**Recommendation:** Consolidate all error handling into `utils/error-handling.ts` and remove
duplicate error classification logic.

### 4. Parallel Processing Duplication

**Files with duplication:**

- `utils/parallel.ts` - Core parallel processing
- `runtime/patterns/patterns.ts` - `parallelExecute()`, `parallelRacePattern()`
- `runtime/features/batch-processing.ts` - Parallel batch processing

**Common patterns:**

- Concurrent execution with limits
- Promise.all/Promise.race patterns
- Error aggregation
- Timeout handling

**Recommendation:** Use `utils/parallel.ts` as the single source of truth for all parallel
processing needs.

### 5. Result Type Duplication

**Files with duplication:**

- `utils/results.ts` - Base result types
- `runtime/features/batch-processing.ts` - BatchResult interface
- Various files defining similar success/error result structures

**Common patterns:**

- Success/failure boolean
- Error arrays
- Duration tracking
- Metadata fields (startedAt, completedAt)

**Recommendation:** Extend the base `BaseOperationResult` interface from `utils/results.ts` for all
result types.

### 6. Time/Duration Utilities Duplication

**Files with duplication:**

- `utils/helpers.ts` - Various time utilities
- Multiple files with custom time formatting

**Common patterns:**

- Timestamp formatting
- Duration calculation
- Human-readable duration formatting
- Time window parsing

**Recommendation:** Create a dedicated `utils/time.ts` module for all time-related utilities.

### 7. Validation Logic Duplication

**Files with duplication:**

- `utils/helpers.ts` - `validatePayload()`
- Various workflow files with custom validation

**Common patterns:**

- Required field checking
- Type validation
- Payload extraction with defaults

**Recommendation:** Create a `utils/validation.ts` module with generic validation utilities.

## Refactoring Steps

### Phase 1: Create New Utility Modules

1. **Create `utils/batch-processing.ts`**

   - Move all batch processing logic here
   - Create a unified `BatchProcessor` class
   - Support different batch strategies

2. **Create `utils/time.ts`**

   - Consolidate all time-related utilities
   - Remove duplicates from `helpers.ts`

3. **Create `utils/validation.ts`**
   - Generic validation utilities
   - Type guards and validators

### Phase 2: Update Existing Modules

1. **Update `runtime/patterns/patterns.ts`**

   - Replace `processBatchPattern` with calls to new `BatchProcessor`
   - Replace `retryWithBackoffPattern` with `retryOperation` from utils
   - Use centralized parallel utilities

2. **Update `runtime/features/batch-processing.ts`**

   - Delegate to new `BatchProcessor` class
   - Keep QStash-specific features only

3. **Clean up `utils/helpers.ts`**
   - Remove functions moved to specialized modules
   - Keep only truly generic helpers

### Phase 3: Update Imports and Tests

1. Update all imports to use the new centralized modules
2. Update tests to reflect the new structure
3. Remove deprecated functions

## Code Examples

### Example: Unified BatchProcessor

```typescript
// utils/batch-processing.ts
export class BatchProcessor<T, R> {
  constructor(private config: BatchConfig) {}

  async process(
    items: T[],
    processor: (item: T, index: number) => Promise<R>
  ): Promise<BatchResult<R>> {
    // Unified batch processing logic
  }

  async processWithContext<C>(
    context: C,
    items: T[],
    processor: (context: C, item: T, index: number) => Promise<R>
  ): Promise<BatchResult<R>> {
    // Batch processing with workflow context support
  }
}
```

### Example: Using Centralized Retry

```typescript
// Before (in patterns.ts)
export async function retryWithBackoffPattern(...) {
  // Duplicate retry logic
}

// After
import { retryOperation, RETRY_PRESETS } from '../../utils/retry';

export async function retryWithBackoffPattern(
  context: WorkflowContext,
  options: { operation: () => Promise<T>; stepName: string; ... }
) {
  return context.run(options.stepName, () =>
    retryOperation(options.operation, {
      ...RETRY_PRESETS.api,
      ...options
    })
  );
}
```

## Benefits

1. **Reduced Code Size**: Estimated 30-40% reduction in total lines of code
2. **Improved Maintainability**: Single source of truth for each pattern
3. **Better Testing**: Test core utilities once, use everywhere
4. **Consistent Behavior**: All batch processing, retry logic, etc. works the same way
5. **Easier Debugging**: Issues can be traced to a single implementation

## Migration Strategy

1. **Incremental Migration**: Update one module at a time
2. **Backward Compatibility**: Keep deprecated functions with warnings initially
3. **Comprehensive Testing**: Ensure all tests pass after each change
4. **Documentation**: Update all documentation and examples

## Timeline

- **Week 1**: Create new utility modules and write tests
- **Week 2**: Migrate runtime modules to use new utilities
- **Week 3**: Migrate workflow examples and update documentation
- **Week 4**: Remove deprecated code and final cleanup

## Metrics

Track these metrics to measure success:

- Lines of code reduced
- Number of duplicate implementations removed
- Test coverage maintained or improved
- Performance benchmarks (should remain the same or improve)
