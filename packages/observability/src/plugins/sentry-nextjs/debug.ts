/**
 * Debug utilities for Sentry Next.js integration
 */

// Use a generic type for Integration since @sentry/nextjs doesn't export it directly
import type { SentryNextJSPluginConfig } from "./plugin";

/**
 * Debug configuration
 */
export interface DebugConfig {
  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;

  /**
   * Log integration status
   * @default true
   */
  logIntegrations?: boolean;

  /**
   * Log configuration validation
   * @default true
   */
  logValidation?: boolean;

  /**
   * Log performance metrics
   * @default false
   */
  logPerformance?: boolean;

  /**
   * Enable browser devtools integration
   * @default true
   */
  enableDevtools?: boolean;

  /**
   * Custom logger function
   */
  logger?: (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: any,
  ) => void;
}

/**
 * Debug logger
 */
export class DebugLogger {
  public config: DebugConfig;
  private startTime: number;

  constructor(config: DebugConfig = {}) {
    this.config = config;
    this.startTime = Date.now();
  }

  private log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: any,
  ): void {
    if (this.config.logger) {
      this.config.logger(level, message, data);
      return;
    }

    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    const prefix = `[Sentry Next.js ${level.toUpperCase()}] [${timestamp}] [+${elapsed}ms]`;

    switch (level) {
      case "debug":
        if (this.config.verbose) {
          console.debug(prefix, message, data || "");
        }
        break;
      case "info":
        console.info(prefix, message, data || "");
        break;
      case "warn":
        console.warn(prefix, message, data || "");
        break;
      case "error":
        console.error(prefix, message, data || "");
        break;
    }
  }

  debug(message: string, data?: any): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: any): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: any): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: any): void {
    this.log("error", message, data);
  }
}

/**
 * Configuration validator
 */
export class ConfigValidator {
  private logger: DebugLogger;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  /**
   * Validate Sentry configuration
   */
  validate(config: SentryNextJSPluginConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    this.errors = [];
    this.warnings = [];

    // Validate DSN
    if (!config.dsn) {
      this.warnings.push("No DSN configured - Sentry will run in debug mode");
    } else if (!this.isValidDSN(config.dsn)) {
      this.errors.push("Invalid DSN format");
    }

    // Validate sample rates
    this.validateSampleRate("tracesSampleRate", config.tracesSampleRate);
    this.validateSampleRate(
      "replaysSessionSampleRate",
      config.replaysSessionSampleRate,
    );
    this.validateSampleRate(
      "replaysOnErrorSampleRate",
      config.replaysOnErrorSampleRate,
    );
    this.validateSampleRate("profilesSampleRate", config.profilesSampleRate);

    // Validate integrations
    if (config.integrations) {
      for (const integration of config.integrations) {
        if (!this.isValidIntegration(integration)) {
          this.errors.push(`Invalid integration: ${integration}`);
        }
      }
    }

    // Validate feature flags
    if (config.featureFlags) {
      const { provider, launchDarkly, unleash } = config.featureFlags;

      if (provider === "launchdarkly" && !launchDarkly?.clientId) {
        this.errors.push(
          "LaunchDarkly provider selected but no clientId provided",
        );
      }

      if (provider === "unleash" && (!unleash?.url || !unleash?.clientKey)) {
        this.errors.push(
          "Unleash provider selected but missing url or clientKey",
        );
      }
    }

    // Performance warnings
    if (config.enableProfiling && (config.profilesSampleRate || 0) > 0.1) {
      this.warnings.push("High profiling sample rate may impact performance");
    }

    if (config.enableReplay && (config.replaysSessionSampleRate || 0) > 0.5) {
      this.warnings.push("High replay sample rate may impact bandwidth");
    }

    // Log results
    if (this.logger.config.logValidation) {
      if (this.errors.length > 0) {
        this.logger.error("Configuration validation failed", {
          errors: this.errors,
        });
      }
      if (this.warnings.length > 0) {
        this.logger.warn("Configuration warnings", { warnings: this.warnings });
      }
      if (this.errors.length === 0 && this.warnings.length === 0) {
        this.logger.info("Configuration validation passed");
      }
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private isValidDSN(dsn: string): boolean {
    try {
      const url = new URL(dsn);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }

  private validateSampleRate(name: string, rate?: number): void {
    if (rate === undefined) return;

    if (typeof rate !== "number" || rate < 0 || rate > 1) {
      this.errors.push(`Invalid ${name}: must be between 0 and 1`);
    }
  }

  private isValidIntegration(integration: any): boolean {
    return (
      typeof integration === "object" &&
      integration !== null &&
      "name" in integration &&
      typeof integration.name === "string"
    );
  }
}

/**
 * Integration status checker
 */
export class IntegrationStatus {
  private logger: DebugLogger;

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  /**
   * Check and log integration status
   */
  checkIntegrations(client: any): void {
    if (!this.logger.config.logIntegrations || !client) {
      return;
    }

    const integrations: string[] = [];
    const failedIntegrations: string[] = [];

    // Common integrations to check
    const integrationsToCheck = [
      "BrowserTracing",
      "Replay",
      "ReplayCanvas",
      "Feedback",
      "Profiling",
      "HttpClient",
      "ContextLines",
      "ReportingObserver",
      "CaptureConsole",
      "ExtraErrorData",
      "RewriteFrames",
      "SessionTiming",
      "Debug",
      "Dedupe",
      "FeatureFlags",
      "LaunchDarkly",
      "Unleash",
    ];

    for (const name of integrationsToCheck) {
      try {
        const integration = client.getIntegrationByName?.(name);
        if (integration) {
          integrations.push(name);
        }
      } catch (error) {
        failedIntegrations.push(name);
        this.logger.warn(`Failed to get integration ${name}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.info("Integration status", {
      active: integrations,
      failed: failedIntegrations,
      total: integrations.length,
    });
  }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private logger: DebugLogger;
  private metrics: Map<string, number[]> = new Map();

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name);
    if (!values) {
      console.warn(`Metrics array not found for ${name}`);
      return;
    }
    values.push(value);

    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Get metrics summary
   */
  getMetrics(): Record<
    string,
    {
      count: number;
      average: number;
      min: number;
      max: number;
      p95: number;
    }
  > {
    const summary: Record<string, any> = {};

    for (const [name, values] of this.metrics) {
      if (values.length === 0) continue;

      const sorted = [...values].sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      const p95Index = Math.floor(sorted.length * 0.95);

      summary[name] = {
        count: sorted.length,
        average: Math.round(sum / sorted.length),
        min: Math.round(sorted[0]),
        max: Math.round(sorted[sorted.length - 1]),
        p95: Math.round(sorted[p95Index] || sorted[sorted.length - 1]),
      };
    }

    return summary;
  }

  /**
   * Log current metrics
   */
  logMetrics(): void {
    if (!this.logger.config.logPerformance) {
      return;
    }

    const metrics = this.getMetrics();
    this.logger.info("Performance metrics", metrics);
  }
}

/**
 * Browser DevTools integration
 */
export class DevToolsIntegration {
  private logger: DebugLogger;
  private enabled: boolean;

  constructor(logger: DebugLogger) {
    this.logger = logger;
    this.enabled = logger.config.enableDevtools ?? true;
  }

  /**
   * Initialize DevTools integration
   */
  initialize(client: any): void {
    if (!this.enabled || typeof window === "undefined") {
      return;
    }

    // Add Sentry client to window for debugging
    (window as any).__SENTRY_CLIENT__ = client;

    // Add debug commands
    (window as any).__SENTRY_DEBUG__ = {
      // Get current configuration
      getConfig: () => client.getOptions?.(),

      // Get integration status
      getIntegrations: () =>
        client.getIntegrationByName
          ? ["BrowserTracing", "Replay", "Feedback", "Profiling"].map(
              (name) => ({
                name,
                active: !!client.getIntegrationByName(name),
              }),
            )
          : [],

      // Capture test event
      testError: () => {
        client.captureException(new Error("Test error from DevTools"));
      },

      // Get current user
      getUser: () => client.getUser?.(),

      // Get current scope
      getScope: () => client.getCurrentScope?.(),

      // Get performance metrics
      getMetrics: () =>
        this.logger.config.logPerformance
          ? (window as any).__SENTRY_PERFORMANCE__?.getMetrics()
          : "Performance monitoring disabled",
    };

    // Add performance monitor to window
    if (this.logger.config.logPerformance) {
      (window as any).__SENTRY_PERFORMANCE__ = new PerformanceMonitor(
        this.logger,
      );
    }

    this.logger.info(
      "DevTools integration initialized - use window.__SENTRY_DEBUG__",
    );
  }
}

/**
 * Create debug dashboard
 */
export function createDebugDashboard(config: DebugConfig = {}): {
  logger: DebugLogger;
  validator: ConfigValidator;
  integrationStatus: IntegrationStatus;
  performanceMonitor: PerformanceMonitor;
  devTools: DevToolsIntegration;
} {
  const logger = new DebugLogger(config);
  const validator = new ConfigValidator(logger);
  const integrationStatus = new IntegrationStatus(logger);
  const performanceMonitor = new PerformanceMonitor(logger);
  const devTools = new DevToolsIntegration(logger);

  return {
    logger,
    validator,
    integrationStatus,
    performanceMonitor,
    devTools,
  };
}

/**
 * Debug mode setup guide
 */
export const DEBUG_MODE_GUIDE = `
# Sentry Next.js Debug Mode Guide

## 1. Enable Debug Mode

\`\`\`typescript
import { createDebugDashboard } from '@repo/observability/plugins/sentry-nextjs/debug';

const debug = createDebugDashboard({
  verbose: true,
  logIntegrations: true,
  logValidation: true,
  logPerformance: true,
  enableDevtools: true,
});

// Use with Sentry configuration
const config = {
  // ... your config
};

// Validate configuration
const validation = debug.validator.validate(config);
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
\`\`\`

## 2. Browser DevTools Commands

Open browser console and use:

\`\`\`javascript
// Get current configuration
__SENTRY_DEBUG__.getConfig()

// Check integration status
__SENTRY_DEBUG__.getIntegrations()

// Capture test error
__SENTRY_DEBUG__.testError()

// Get current user
__SENTRY_DEBUG__.getUser()

// Get current scope
__SENTRY_DEBUG__.getScope()

// Get performance metrics
__SENTRY_DEBUG__.getMetrics()
\`\`\`

## 3. Performance Monitoring

\`\`\`typescript
// Start timing an operation
const stopTimer = debug.performanceMonitor.startTimer('api-call');

// Perform operation
await fetch('/api/data');

// Stop timer
stopTimer();

// Log all metrics
debug.performanceMonitor.logMetrics();
\`\`\`

## 4. Custom Logger

\`\`\`typescript
const debug = createDebugDashboard({
  logger: (level, message, data) => {
    // Send to your logging service
    myLogger.log({
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },
});
\`\`\`

## 5. Integration Testing

\`\`\`typescript
// After Sentry initialization
debug.integrationStatus.checkIntegrations(Sentry.getClient());
\`\`\`
`;
