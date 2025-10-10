import type { BrowserContext, Page } from "@playwright/test";

/**
 * Shared interfaces and types for utility integration
 */

/**
 * Common timeout configuration
 */
export interface TimeoutConfig {
  /** Default timeout for operations */
  default?: number;
  /** Timeout for network operations */
  network?: number;
  /** Timeout for file operations */
  file?: number;
  /** Timeout for authentication operations */
  auth?: number;
  /** Timeout for performance measurements */
  performance?: number;
}

/**
 * Common test metadata
 */
export interface TestMetadata {
  /** Test name or identifier */
  testName?: string;
  /** Test category */
  category?: string;
  /** Test environment */
  environment?: "development" | "staging" | "production" | "ci";
  /** Custom tags */
  tags?: string[];
  /** Test configuration */
  config?: Record<string, any>;
}

/**
 * Performance measurement result
 */
export interface PerformanceMeasurement {
  /** Operation name */
  operation: string;
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp when measurement started */
  startTime: number;
  /** Timestamp when measurement ended */
  endTime: number;
  /** Additional metrics */
  metrics?: Record<string, number>;
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * File operation result
 */
export interface FileOperationResult {
  /** Number of files processed */
  fileCount: number;
  /** Total size in bytes */
  totalSize: number;
  /** Operation duration */
  duration: number;
  /** Success status */
  success: boolean;
  /** File paths involved */
  filePaths: string[];
  /** Error details if failed */
  error?: string;
}

/**
 * Network operation result
 */
export interface NetworkOperationResult {
  /** Request/response count */
  requestCount: number;
  /** Total data transferred */
  totalBytes: number;
  /** Average response time */
  averageResponseTime: number;
  /** Success rate */
  successRate: number;
  /** Failed requests */
  failures: Array<{
    url: string;
    error: string;
    timestamp: number;
  }>;
}

/**
 * Session information
 */
export interface SessionInfo {
  /** Session identifier */
  sessionId?: string;
  /** User information */
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  /** Authentication state */
  authenticated: boolean;
  /** Session metadata */
  metadata?: Record<string, any>;
  /** Session expiry */
  expiresAt?: Date;
}

/**
 * Base utility configuration
 */
export interface BaseUtilityConfig {
  /** Page instance */
  page: Page;
  /** Browser context */
  context?: BrowserContext;
  /** Timeout configuration */
  timeouts?: TimeoutConfig;
  /** Test metadata */
  metadata?: TestMetadata;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Composite test result combining multiple utility results
 */
export interface CompositeTestResult {
  /** Test metadata */
  metadata: TestMetadata;
  /** Performance measurements */
  performance?: PerformanceMeasurement[];
  /** File operations */
  fileOperations?: FileOperationResult[];
  /** Network operations */
  networkOperations?: NetworkOperationResult[];
  /** Session information */
  session?: SessionInfo;
  /** Overall success status */
  success: boolean;
  /** Total test duration */
  totalDuration: number;
  /** Errors encountered */
  errors: string[];
  /** Warnings */
  warnings: string[];
}

/**
 * Event handler interface for utility integration
 */
export interface UtilityEventHandler {
  /** Called before operation starts */
  onStart?(operation: string, context: any): void | Promise<void>;
  /** Called after operation completes */
  onComplete?(operation: string, result: any): void | Promise<void>;
  /** Called when operation fails */
  onError?(operation: string, error: Error): void | Promise<void>;
  /** Called for progress updates */
  onProgress?(
    operation: string,
    progress: { current: number; total: number },
  ): void | Promise<void>;
}

/**
 * Resource usage tracking
 */
export interface ResourceUsage {
  /** Memory usage in bytes */
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  /** CPU usage percentage */
  cpu?: number;
  /** Network usage */
  network?: {
    requests: number;
    bytesReceived: number;
    bytesSent: number;
  };
  /** Timing information */
  timing?: {
    start: number;
    end: number;
    duration: number;
  };
}

/**
 * Test fixture interface for sharing state between utilities
 */
export interface TestFixture {
  /** Shared page instance */
  page: Page;
  /** Shared context */
  context: BrowserContext;
  /** Shared session info */
  session?: SessionInfo;
  /** Shared test data */
  testData?: Record<string, any>;
  /** Cleanup functions */
  cleanup: Array<() => Promise<void>>;
  /** Resource usage tracking */
  resourceUsage?: ResourceUsage;
}

/**
 * Utility factory configuration
 */
export interface UtilityFactoryConfig extends BaseUtilityConfig {
  /** Which utilities to enable */
  enabledUtilities?: {
    auth?: boolean;
    performance?: boolean;
    fileUpload?: boolean;
    network?: boolean;
    session?: boolean;
  };
  /** Event handlers */
  eventHandlers?: UtilityEventHandler;
  /** Shared test fixture */
  fixture?: TestFixture;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /** Whether configuration is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Suggested fixes */
  suggestions: string[];
}
