/**
 * Shared observability utilities and types
 * This module provides isomorphic logging functions that work in any environment
 */

// Runtime environment detection utilities
export const getRuntimeInfo = () => {
  // Edge runtime detection (Vercel Edge, Cloudflare Workers)
  if (typeof globalThis !== 'undefined' && (globalThis as any).EdgeRuntime) {
    return { type: 'edge', variant: 'vercel' };
  }
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as any).caches &&
    typeof caches !== 'undefined'
  ) {
    return { type: 'edge', variant: 'cloudflare' };
  }

  // Bun detection
  if (typeof process !== 'undefined' && process.versions?.bun) {
    return { type: 'bun', version: process.versions.bun };
  }

  // Browser detection (more robust)
  if (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.navigator !== 'undefined'
  ) {
    return { type: 'browser', isNextJs: !!(window as any).__NEXT_DATA__ };
  }

  // Node.js detection with version check
  if (typeof process !== 'undefined' && process.versions?.node) {
    const nodeVersion = parseInt(process.versions.node.split('.')[0]);
    if (nodeVersion < 22) {
      // Note: Using console.warn here as observability system may not be initialized yet
      console.warn(
        `[Observability] Node ${process.versions.node} detected. Node 22+ is required for optimal performance.`,
      );
    }

    return {
      type: 'node',
      version: process.versions.node,
      isNextJs:
        !!process.env.NEXT_RUNTIME ||
        !!process.env.__NEXT_RUNTIME ||
        !!process.env.NEXT_PUBLIC_VERCEL_ENV,
    };
  }

  // Fallback
  return { type: 'unknown' };
};

// Cache the runtime info
const runtimeInfo = getRuntimeInfo();

// Export runtime info for debugging purposes
export const getRuntimeEnvironment = () => runtimeInfo;

// Placeholder observability instance - consumers should import environment-specific modules
let observabilityInstance: any = null;

// Set the observability instance (called by environment-specific modules)
export function setObservabilityInstance(instance: any) {
  observabilityInstance = instance;
}

// Create a generic log function factory to reduce code duplication
const createLogFunction = (level: 'debug' | 'info' | 'warn' | 'error') => {
  return (message: string | Error, context?: any) => {
    if (observabilityInstance) {
      const methodName = `log${level.charAt(0).toUpperCase() + level.slice(1)}`;
      observabilityInstance[methodName](message, context);
    } else {
      // Fallback to console with runtime info
      const contextStr = context ? JSON.stringify(context) : '';
      console[level](`[Observability:${runtimeInfo.type}]`, message, contextStr);
    }
  };
};

// Isomorphic log functions that work in any environment
export const logDebug = createLogFunction('debug');
export const logInfo = createLogFunction('info');
export const logWarn = createLogFunction('warn');
export const logError = createLogFunction('error');

// Export types for convenience
export type {
  ObservabilityClient,
  ObservabilityContext,
  ObservabilityServer,
  ObservabilityUser,
} from './types';

// Note: For direct access to observability instances, import from environment-specific modules:
// - @repo/observability/client-next
// - @repo/observability/server-next
// - @repo/observability/server-edge
// - @repo/observability/client
// - @repo/observability/server
