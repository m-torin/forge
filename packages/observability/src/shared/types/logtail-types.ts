/**
 * Logtail/BetterStack-specific types
 */

export interface LogtailConfig {
  // Metadata
  application?: string;
  batchInterval?: number;
  batchSize?: number;
  captureErrors?: boolean;
  captureRejections?: boolean;
  endpoint?: string;

  environment?: string;
  // Better Stack specific options (passed to Logger constructor)
  options?: Record<string, any>;
  release?: string;

  retryCount?: number;
  retryDelay?: number;
  // Options
  sendLogsToConsoleInDev?: boolean;

  sourceToken: string;
}

export interface LogtailOptions {
  // Should logs be buffered when offline
  bufferOffline?: boolean;

  // Context fields to include with every log
  context?: Record<string, any>;

  // Maximum buffer size
  maxBufferSize?: number;

  // Middleware functions
  middleware?: ((log: any) => any)[];
}
