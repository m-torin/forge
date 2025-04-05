/**
 * Observability Package
 *
 * This package provides utilities for logging, error tracking, and monitoring.
 */

// Re-export components and utilities
// Export a unified initialization function
import { initializeSentryClient } from "./client";
import { initializeSentryServer } from "./instrumentation";

import type { init } from "@sentry/nextjs";

export * from "./log";
export * from "./error";
export * from "./client";
export * from "./instrumentation";

/**
 * Initialize Sentry based on the current environment
 * @returns Result of Sentry initialization
 */
export const initializeSentry = (): ReturnType<typeof init> | null => {
  const isServer = typeof window === "undefined";
  return isServer ? initializeSentryServer() : initializeSentryClient();
};

// Note: React components like LogProvider are temporarily disabled
// to avoid JSX issues. We'll reimplement them after getting the
// basic functionality working.
