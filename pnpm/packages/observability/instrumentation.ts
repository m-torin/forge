/**
 * Instrumentation utilities for the observability package
 * This file configures Sentry for server-side monitoring
 */
import { init } from '@sentry/nextjs';
import { keys } from './keys';
import { log } from './log';

/**
 * Initialize Sentry with the appropriate configuration for the current runtime
 * @returns Result of Sentry initialization
 */
export const initializeSentry = (): ReturnType<typeof init> | null => {
  const dsn = keys().NEXT_PUBLIC_SENTRY_DSN;

  // Common configuration options
  const options = {
    dsn,
    debug: process.env.NODE_ENV === 'development',
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  };

  // Check for a valid DSN
  if (!dsn) {
    log.warn('Sentry DSN not provided, skipping initialization');
    return null;
  }

  // Initialize based on runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    log.info('Initializing Sentry for Node.js runtime');
    return init(options);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    log.info('Initializing Sentry for Edge runtime');
    return init(options);
  }

  log.warn(
    `Sentry not initialized for unknown runtime: ${process.env.NEXT_RUNTIME}`,
  );
  return null;
};
