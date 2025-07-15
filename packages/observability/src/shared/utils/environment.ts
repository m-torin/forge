/**
 * Environment detection utilities
 * Centralized environment checks for React 19 and Next.js 15 compatibility
 */

import { getRawEnv } from '../../../env';

/**
 * Environment types for consistent detection
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Runtime types for Next.js applications
 */
export type Runtime = 'nodejs' | 'edge' | 'browser';

/**
 * Context types for execution environment
 */
export type ExecutionContext = 'server' | 'client' | 'edge';

/**
 * Environment detection configuration
 */
export interface EnvironmentConfig {
  /** Override NODE_ENV for testing */
  nodeEnv?: string;
  /** Override NEXT_RUNTIME for testing */
  nextRuntime?: string;
  /** Force specific environment for testing */
  forceEnvironment?: Environment;
  /** Force specific runtime for testing */
  forceRuntime?: Runtime;
}

/**
 * Global environment configuration (mainly for testing)
 */
let globalConfig: EnvironmentConfig = {};

/**
 * Set global environment configuration (for testing)
 */
export function setEnvironmentConfig(config: EnvironmentConfig): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Clear global environment configuration
 */
export function clearEnvironmentConfig(): void {
  globalConfig = {};
}

/**
 * Get current environment with override support
 */
export function getEnvironment(): Environment {
  if (globalConfig.forceEnvironment) {
    return globalConfig.forceEnvironment;
  }

  const nodeEnv = globalConfig.nodeEnv || getRawEnv().NODE_ENV || 'development';

  if (nodeEnv === 'test') return 'test';
  if (nodeEnv === 'production') return 'production';
  return 'development';
}

/**
 * Get current runtime with override support
 */
export function getRuntime(): Runtime {
  if (globalConfig.forceRuntime) {
    return globalConfig.forceRuntime;
  }

  const nextRuntime = globalConfig.nextRuntime || getRawEnv().NEXT_RUNTIME;

  if (nextRuntime === 'edge') return 'edge';

  // Check if we're in a browser environment
  if (typeof window !== 'undefined') return 'browser';

  return 'nodejs';
}

/**
 * Get execution context
 */
export function getExecutionContext(): ExecutionContext {
  const runtime = getRuntime();

  if (runtime === 'edge') return 'edge';
  if (runtime === 'browser') return 'client';
  return 'server';
}

/**
 * Environment detection helpers
 */
export const Environment = {
  /**
   * Check if in development environment
   */
  isDevelopment(): boolean {
    return getEnvironment() === 'development';
  },

  /**
   * Check if in production environment
   */
  isProduction(): boolean {
    return getEnvironment() === 'production';
  },

  /**
   * Check if in test environment
   */
  isTest(): boolean {
    return getEnvironment() === 'test';
  },

  /**
   * Check if NOT in production (development or test)
   */
  isNonProduction(): boolean {
    return !this.isProduction();
  },
} as const;

/**
 * Runtime detection helpers
 */
export const Runtime = {
  /**
   * Check if running in Node.js runtime
   */
  isNodeJS(): boolean {
    return getRuntime() === 'nodejs';
  },

  /**
   * Check if running in Edge runtime
   */
  isEdge(): boolean {
    return getRuntime() === 'edge';
  },

  /**
   * Check if running in browser
   */
  isBrowser(): boolean {
    return getRuntime() === 'browser';
  },

  /**
   * Check if running on server (Node.js or Edge)
   */
  isServer(): boolean {
    const runtime = getRuntime();
    return runtime === 'nodejs' || runtime === 'edge';
  },

  /**
   * Check if running on client (browser)
   */
  isClient(): boolean {
    return this.isBrowser();
  },
} as const;

/**
 * Combined environment and runtime checks
 */
export const EnvironmentRuntime = {
  /**
   * Check if in development AND Node.js runtime
   */
  isDevelopmentNodeJS(): boolean {
    return Environment.isDevelopment() && Runtime.isNodeJS();
  },

  /**
   * Check if in production AND Edge runtime
   */
  isProductionEdge(): boolean {
    return Environment.isProduction() && Runtime.isEdge();
  },

  /**
   * Check if should enable debug logging
   */
  shouldEnableDebugLogging(): boolean {
    return Environment.isNonProduction();
  },

  /**
   * Check if should enable advanced tracing
   */
  shouldEnableAdvancedTracing(): boolean {
    return Environment.isDevelopment() && Runtime.isNodeJS();
  },

  /**
   * Check if should enable performance monitoring
   */
  shouldEnablePerformanceMonitoring(): boolean {
    return Environment.isProduction() || (Environment.isDevelopment() && Runtime.isNodeJS());
  },
} as const;

/**
 * Get environment info object for debugging
 */
export function getEnvironmentInfo(): {
  environment: Environment;
  runtime: Runtime;
  context: ExecutionContext;
  nodeEnv: string;
  nextRuntime?: string;
  isServer: boolean;
  isClient: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
} {
  return {
    environment: getEnvironment(),
    runtime: getRuntime(),
    context: getExecutionContext(),
    nodeEnv: getRawEnv().NODE_ENV || 'development',
    nextRuntime: getRawEnv().NEXT_RUNTIME,
    isServer: Runtime.isServer(),
    isClient: Runtime.isClient(),
    isDevelopment: Environment.isDevelopment(),
    isProduction: Environment.isProduction(),
  };
}

/**
 * Log environment info (development only)
 */
export function logEnvironmentInfo(prefix = 'Environment'): void {
  if (Environment.isDevelopment()) {
    const info = getEnvironmentInfo();
    console.log(`[${prefix}] Environment Info: `, info);
  }
}
