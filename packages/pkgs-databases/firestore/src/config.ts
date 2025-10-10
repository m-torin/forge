/**
 * Firestore configuration and environment detection
 */

import { logWarn } from '@repo/observability/server/next';
import { z } from 'zod';
import type { FirestoreClientConfig, FirestoreConfig, RuntimeEnvironment } from './types';

/**
 * Server-side Firestore configuration schema
 */
const firestoreConfigSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  clientEmail: z.string().email().optional(),
  privateKey: z.string().optional(),
  keyFilename: z.string().optional(),
  databaseURL: z.string().url().optional(),
  databaseId: z.string().optional(),
});

/**
 * Client-side Firestore configuration schema
 */
const firestoreClientConfigSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  apiKey: z.string().optional(),
  authDomain: z.string().optional(),
  databaseURL: z.string().url().optional(),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().optional(),
});

/**
 * Validate server configuration
 */
export function validateServerConfig(config: unknown): FirestoreConfig {
  const result = firestoreConfigSchema.safeParse(config);
  if (!result.success) {
    logWarn('Invalid Firestore server config, using defaults', {
      error: result.error.message,
      receivedConfig: config,
    });
    return {
      projectId: '',
      databaseId: '(default)',
    } as FirestoreConfig;
  }
  return result.data;
}

/**
 * Validate client configuration
 */
export function validateClientConfig(config: unknown): FirestoreClientConfig {
  const result = firestoreClientConfigSchema.safeParse(config);
  if (!result.success) {
    logWarn('Invalid Firestore client config, using defaults', {
      error: result.error.message,
      receivedConfig: config,
    });
    return {
      projectId: '',
    } as FirestoreClientConfig;
  }
  return result.data;
}

/**
 * Detect runtime environment
 */
export function detectRuntime(): RuntimeEnvironment {
  // Check for Node.js
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'nodejs';
  }

  // Check for browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'browser';
  }

  // Check for edge runtime
  if (typeof EdgeRuntime !== 'undefined') {
    return 'edge';
  }

  // Check for web worker
  if (typeof importScripts === 'function') {
    return 'worker';
  }

  // Default to nodejs
  return 'nodejs';
}

/**
 * Get default configuration from environment variables
 */
export function getDefaultConfig(): Partial<FirestoreConfig> {
  const env = typeof process !== 'undefined' ? process.env : {};

  return {
    projectId: env.FIREBASE_PROJECT_ID || env.GCP_PROJECT_ID || env.GOOGLE_CLOUD_PROJECT,
    clientEmail: env.FIREBASE_CLIENT_EMAIL || env.GOOGLE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY || env.GOOGLE_PRIVATE_KEY,
    keyFilename: env.FIREBASE_KEY_FILENAME || env.GOOGLE_APPLICATION_CREDENTIALS,
    databaseURL: env.FIREBASE_DATABASE_URL,
    databaseId: env.FIRESTORE_DATABASE_ID || '(default)',
  };
}

/**
 * Get client configuration from environment variables
 */
export function getDefaultClientConfig(): Partial<FirestoreClientConfig> {
  const env = typeof process !== 'undefined' ? process.env : {};

  return {
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID,
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

/**
 * Merge configuration with defaults
 */
export function mergeConfig(
  userConfig: Partial<FirestoreConfig>,
  defaults?: Partial<FirestoreConfig>,
): FirestoreConfig {
  const defaultConfig = defaults || getDefaultConfig();
  const merged = { ...defaultConfig, ...userConfig };

  return validateServerConfig(merged);
}

/**
 * Merge client configuration with defaults
 */
export function mergeClientConfig(
  userConfig: Partial<FirestoreClientConfig>,
  defaults?: Partial<FirestoreClientConfig>,
): FirestoreClientConfig {
  const defaultConfig = defaults || getDefaultClientConfig();
  const merged = { ...defaultConfig, ...userConfig };

  return validateClientConfig(merged);
}

/**
 * Check if configuration is complete for server usage
 */
export function isServerConfigComplete(config: Partial<FirestoreConfig>): boolean {
  if (!config.projectId) return false;

  // Need either service account credentials or keyfile
  return !!((config.clientEmail && config.privateKey) || config.keyFilename);
}

/**
 * Check if configuration is complete for client usage
 */
export function isClientConfigComplete(config: Partial<FirestoreClientConfig>): boolean {
  return !!(config.projectId && config.apiKey);
}

/**
 * Create configuration for specific environment
 */
export function createEnvironmentConfig(
  runtime: RuntimeEnvironment,
  userConfig: Partial<FirestoreConfig | FirestoreClientConfig> = {},
): FirestoreConfig | FirestoreClientConfig {
  switch (runtime) {
    case 'nodejs':
    case 'edge':
      return mergeConfig(userConfig as Partial<FirestoreConfig>);

    case 'browser':
    case 'worker':
      return mergeClientConfig(userConfig as Partial<FirestoreClientConfig>);

    default:
      logWarn('Unsupported runtime environment, falling back to server config', { runtime });
      return mergeConfig(userConfig as Partial<FirestoreConfig>);
  }
}

/**
 * Connection pool settings for server environments
 */
export interface ConnectionPoolConfig {
  maxIdleTime?: number;
  maxConnections?: number;
  keepAlive?: boolean;
  timeout?: number;
}

/**
 * Default connection pool configuration
 */
export const defaultConnectionPool: ConnectionPoolConfig = {
  maxIdleTime: 300000, // 5 minutes
  maxConnections: 10,
  keepAlive: true,
  timeout: 30000, // 30 seconds
};

/**
 * Create optimized settings for different environments
 */
export function getOptimizedSettings(runtime: RuntimeEnvironment) {
  switch (runtime) {
    case 'nodejs':
      return {
        ssl: true,
        maxIdleTime: 300000,
        keepAlive: true,
        enableLogging: process.env.NODE_ENV === 'development',
      };

    case 'edge':
      return {
        ssl: true,
        maxIdleTime: 60000, // Shorter for serverless
        keepAlive: false,
        enableLogging: false,
      };

    case 'browser':
      return {
        cacheSizeBytes: 40 * 1024 * 1024, // 40MB
        enablePersistence: true,
        experimentalForceLongPolling: false,
      };

    case 'worker':
      return {
        cacheSizeBytes: 10 * 1024 * 1024, // 10MB
        enablePersistence: false,
        experimentalForceLongPolling: true,
      };

    default:
      return {};
  }
}
