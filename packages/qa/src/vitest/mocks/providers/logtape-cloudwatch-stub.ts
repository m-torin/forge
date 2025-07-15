/**
 * Stub for @logtape/cloudwatch-logs
 *
 * This is a minimal implementation to handle the missing optional dependency
 * during testing. The real package is not installed because it's optional.
 */

export function getCloudWatchLogsSink(config: any) {
  return {
    // Mock CloudWatch sink that does nothing
    log: () => {},
    dispose: () => Promise.resolve(),
    ...config,
  };
}
