/**
 * Logtail/BetterStack-specific types
 */

export interface LogtailConfig {
  batchInterval?: number;
  batchSize?: number;
  endpoint?: string;
  retryCount?: number;
  retryDelay?: number;
  sourceToken: string;

  // Metadata
  application?: string;
  environment?: string;
  release?: string;

  captureErrors?: boolean;
  captureRejections?: boolean;
  // Options
  sendLogsToConsoleInDev?: boolean;
  
  // Better Stack specific options (passed to Logger constructor)
  options?: Record<string, any>;
}

export interface LogtailOptions {
  // Context fields to include with every log
  context?: Record<string, any>;

  // Middleware functions
  middleware?: ((log: any) => any)[];

  // Should logs be buffered when offline
  bufferOffline?: boolean;

  // Maximum buffer size
  maxBufferSize?: number;
}
