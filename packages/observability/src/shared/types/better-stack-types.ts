/**
 * Better Stack specific types and configurations
 */

export interface BetterStackConfig {
  // Application metadata
  application?: string;

  // Logging configuration
  batchInterval?: number; // Defaults to 1000ms
  batchSize?: number; // Defaults to 100
  // Advanced configuration
  bufferOffline?: boolean; // Defaults to true
  captureConsole?: boolean; // Defaults to false
  // Features
  captureErrors?: boolean; // Defaults to true

  captureRejections?: boolean; // Defaults to true
  // Context and enrichment
  defaultContext?: Record<string, any>;
  enableMetrics?: boolean; // Defaults to false
  enableTracing?: boolean; // Defaults to false

  endpoint?: string; // Custom endpoint if needed
  environment?: string;
  globalTags?: Record<string, boolean | number | string>;
  // Filtering
  ignorePatterns?: string[]; // Regex patterns to ignore

  maxBufferSize?: number; // Defaults to 1000
  release?: string;

  retryCount?: number; // Defaults to 3
  retryDelay?: number; // Defaults to 1000ms
  sampleRate?: number; // 0-1, percentage of logs to sample
  sendLogsToConsoleInDev?: boolean; // Defaults to true

  // Required configuration
  sourceToken: string;
  version?: string;
}

export interface BetterStackEvent {
  context?: Record<string, any>;
  error?: {
    code?: number | string;
    message: string;
    name: string;
    stack?: string;
  };
  hostname?: string;
  level: string;
  message: string;
  performance?: {
    cpu?: number;
    duration: number;
    memory?: number;
  };
  pid?: number;
  request?: {
    headers?: Record<string, string>;
    ip?: string;
    method?: string;
    url?: string;
    userAgent?: string;
  };
  source?: string;
  tags?: Record<string, boolean | number | string>;
  timestamp: number;
  trace?: {
    id: string;
    span_id?: string;
  };
  user?: {
    [key: string]: any;
    email?: string;
    id: string;
    username?: string;
  };
}

export interface BetterStackMetrics {
  bufferSize: number;
  errorsCount: number;
  failureCount: number;
  lastLogTime: number;
  logsCount: number;
  warningsCount: number;
}

export interface BetterStackOptions {
  // Context fields to include with every log
  context?: Record<string, any>;

  // Custom formatters
  errorFormatter?: (error: Error) => Record<string, any>;

  integrateWithNextjs?: boolean;
  // Integration options
  integrateWithVercel?: boolean;

  messageFormatter?: (message: string, level: string) => Record<string, any>;
  // Middleware functions
  middleware?: ((log: any) => any)[];

  performanceThreshold?: number; // Milliseconds
  // Performance monitoring
  trackPerformance?: boolean;
}

export interface BetterStackSpan {
  duration?: number;
  endTime?: number;
  id: string;
  logs?: any[];
  name: string;
  parentId?: string;
  startTime: number;
  tags?: Record<string, boolean | number | string>;
}

export interface BetterStackTrace {
  duration?: number;
  endTime?: number;
  id: string;
  metadata?: Record<string, any>;
  name: string;
  spans: BetterStackSpan[];
  startTime: number;
  status: 'error' | 'pending' | 'success';
}
