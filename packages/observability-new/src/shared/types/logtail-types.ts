/**
 * Logtail/BetterStack-specific types
 */

export interface LogtailConfig {
  sourceToken: string;
  endpoint?: string;
  batchSize?: number;
  batchInterval?: number;
  retryCount?: number;
  retryDelay?: number;
  
  // Metadata
  application?: string;
  environment?: string;
  release?: string;
  
  // Options
  sendLogsToConsoleInDev?: boolean;
  captureErrors?: boolean;
  captureRejections?: boolean;
}

export interface LogtailOptions {
  // Context fields to include with every log
  context?: Record<string, any>;
  
  // Middleware functions
  middleware?: Array<(log: any) => any>;
  
  // Should logs be buffered when offline
  bufferOffline?: boolean;
  
  // Maximum buffer size
  maxBufferSize?: number;
}