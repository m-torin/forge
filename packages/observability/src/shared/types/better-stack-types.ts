/**
 * Better Stack specific types and configurations
 */

export interface BetterStackConfig {
  // Required configuration
  sourceToken: string;

  // Logging configuration
  batchInterval?: number; // Defaults to 1000ms
  batchSize?: number; // Defaults to 100
  endpoint?: string; // Custom endpoint if needed
  retryCount?: number; // Defaults to 3
  retryDelay?: number; // Defaults to 1000ms

  // Application metadata
  application?: string;
  environment?: string;
  release?: string;
  version?: string;

  // Features
  captureErrors?: boolean; // Defaults to true
  captureRejections?: boolean; // Defaults to true
  captureConsole?: boolean; // Defaults to false
  sendLogsToConsoleInDev?: boolean; // Defaults to true

  // Context and enrichment
  defaultContext?: Record<string, any>;
  globalTags?: Record<string, string | number | boolean>;

  // Advanced configuration
  bufferOffline?: boolean; // Defaults to true
  maxBufferSize?: number; // Defaults to 1000
  enableMetrics?: boolean; // Defaults to false
  enableTracing?: boolean; // Defaults to false

  // Filtering
  ignorePatterns?: string[]; // Regex patterns to ignore
  sampleRate?: number; // 0-1, percentage of logs to sample
}

export interface BetterStackOptions {
  // Context fields to include with every log
  context?: Record<string, any>;

  // Middleware functions
  middleware?: ((log: any) => any)[];

  // Custom formatters
  errorFormatter?: (error: Error) => Record<string, any>;
  messageFormatter?: (message: string, level: string) => Record<string, any>;

  // Performance monitoring
  trackPerformance?: boolean;
  performanceThreshold?: number; // Milliseconds

  // Integration options
  integrateWithVercel?: boolean;
  integrateWithNextjs?: boolean;
}

export interface BetterStackMetrics {
  logsCount: number;
  errorsCount: number;
  warningsCount: number;
  lastLogTime: number;
  bufferSize: number;
  failureCount: number;
}

export interface BetterStackTrace {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  spans: BetterStackSpan[];
  metadata?: Record<string, any>;
}

export interface BetterStackSpan {
  id: string;
  name: string;
  parentId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, string | number | boolean>;
  logs?: any[];
}

export interface BetterStackEvent {
  timestamp: number;
  level: string;
  message: string;
  source?: string;
  hostname?: string;
  pid?: number;
  context?: Record<string, any>;
  tags?: Record<string, string | number | boolean>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
  };
  trace?: {
    id: string;
    span_id?: string;
  };
  user?: {
    id: string;
    email?: string;
    username?: string;
    [key: string]: any;
  };
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };
  performance?: {
    duration: number;
    memory?: number;
    cpu?: number;
  };
}