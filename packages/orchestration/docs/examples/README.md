# Usage Examples

This directory contains practical examples of using Node 22+ features in the
`@repo/orchestration` package.

## Examples Overview

### 1. [Performance Monitoring](./performance-monitoring.md)

- High-resolution timing with `process.hrtime.bigint()`
- Performance metrics collection
- Real-time monitoring dashboards
- SLA tracking and alerting

### 2. [Memory Management](./memory-management.md)

- WeakMap-based automatic cleanup
- Memory leak detection
- Streaming with backpressure control
- Resource tracking

### 3. [Audit Logging](./audit-logging.md)

- Comprehensive security audit logs
- PII detection and redaction
- Cryptographic integrity verification
- Compliance reporting

### 4. [Promise Management](./promise-management.md)

- Advanced timeout handling with `Promise.withResolvers()`
- Concurrent operation management
- Error recovery patterns
- Rate limiting

### 5. [Object Cloning](./object-cloning.md)

- Safe cloning with `structuredClone()`
- Circular reference handling
- Complex object types
- Performance considerations

### 6. [Streaming Operations](./streaming-operations.md)

- Backpressure-aware streaming
- Memory-efficient data processing
- Concurrent stream processing
- Error handling in streams

### 7. [Security Patterns](./security-patterns.md)

- Data integrity verification
- Timing-safe comparisons
- Secure error handling
- Cryptographic operations

### 8. [Testing Patterns](./testing-patterns.md)

- Node 22+ feature testing
- Performance test patterns
- Memory leak testing
- Integration test examples

## Quick Start

```typescript
import {
  globalPerformanceMonitor,
  globalMemoryMonitor,
  globalAuditLogger,
  AuditUtils
} from "@repo/orchestration";

// Start monitoring systems
await globalPerformanceMonitor.start();
await globalMemoryMonitor.start();
await startGlobalAuditLogging();

// Example: Timed operation with audit logging
const timingId = globalPerformanceMonitor.startTiming("user-operation");

try {
  // Use Node 22+ features
  const start = process.hrtime.bigint();
  const result = await performOperation();
  const durationNs = process.hrtime.bigint() - start;

  // Log success
  await AuditUtils.logDataAccess(
    "user_operation",
    "operation-123",
    "execute",
    "user-456",
    true,
    { durationNs: Number(durationNs) }
  );

  return result;
} catch (error) {
  // Log failure
  await AuditUtils.logSecurityEvent(
    "Operation failed",
    "high",
    ["operation_failure"],
    { error: error.message }
  );
  throw error;
} finally {
  const metrics = globalPerformanceMonitor.endTiming(timingId);
  console.log(`Operation completed in ${metrics.durationMs}ms`);
}
```

## Example Categories

### Real-World Scenarios

- **E-commerce**: Order processing with audit trails
- **Healthcare**: HIPAA-compliant data handling
- **Financial**: SOX-compliant transaction processing
- **SaaS**: Multi-tenant performance monitoring

### Performance Optimization

- **Large Dataset Processing**: Memory-efficient streaming
- **High-Throughput APIs**: Concurrent request handling
- **Real-time Systems**: Low-latency operations
- **Background Jobs**: Resource-conscious processing

### Security and Compliance

- **PII Handling**: Automatic detection and redaction
- **Audit Trails**: Comprehensive security logging
- **Data Integrity**: Cryptographic verification
- **Access Control**: Fine-grained permission tracking

### Development and Testing

- **Unit Tests**: Node 22+ feature validation
- **Integration Tests**: Cross-package compatibility
- **Performance Tests**: Benchmarking and profiling
- **Security Tests**: Vulnerability assessment

## Code Style Guidelines

All examples follow these conventions:

1. **Use Node 22+ features** where applicable
2. **Include error handling** with audit logging
3. **Add performance monitoring** for significant operations
4. **Implement proper cleanup** using WeakMap patterns
5. **Follow security best practices** with PII protection
6. **Include comprehensive tests** with realistic scenarios

## Environment Setup

Ensure your environment is configured correctly:

```bash
# Node.js version
node --version # Should be v22.0.0+

# Install dependencies
npm install

# Run examples
npm run examples

# Run tests
npm run test:examples
```

## Contributing Examples

To contribute new examples:

1. Create a new file in the appropriate category
2. Follow the established patterns and documentation style
3. Include both positive and negative test cases
4. Add performance benchmarks where relevant
5. Ensure all examples are self-contained and runnable

## Next Steps

Start with the [Performance Monitoring examples](./performance-monitoring.md) to
understand the core concepts, then explore other categories based on your
specific use case.

For detailed API documentation, see the
[API Reference](../api/node22-features.md). For migration guidance, see the
[Migration Guide](../migration/legacy-to-node22.md).
