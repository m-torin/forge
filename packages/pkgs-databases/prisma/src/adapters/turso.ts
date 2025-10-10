/**
 * Turso (LibSQL) adapter for edge runtimes
 * Optimized for distributed SQLite workloads
 */

import { createAdapterError, withRetry, type BaseAdapterOptions } from './base';

export interface TursoAdapterOptions extends BaseAdapterOptions {
  url: string;
  authToken?: string;
  syncUrl?: string;
  syncInterval?: number;
  readYourWrites?: boolean;
  encryptionKey?: string;
  intMode?: 'number' | 'bigint' | 'string';
}

/**
 * Create a Turso (LibSQL) adapter instance
 */
export async function createTursoAdapter(options: TursoAdapterOptions): Promise<any> {
  return withRetry(async () => {
    try {
      const libsqlModule = await import('@prisma/adapter-libsql' as any).catch(() => {
        throw new Error(
          '@prisma/adapter-libsql package not found. Install with: pnpm add @prisma/adapter-libsql',
        );
      });
      const clientModule = await import('@libsql/client' as any).catch(() => {
        throw new Error('@libsql/client package not found. Install with: pnpm add @libsql/client');
      });
      const { PrismaLibSQL } = libsqlModule;
      const { createClient } = clientModule;

      // Create LibSQL client
      const clientConfig = {
        url: options.url,
        authToken: options.authToken,
        syncUrl: options.syncUrl,
        syncInterval: options.syncInterval,
        readYourWrites: options.readYourWrites,
        encryptionKey: options.encryptionKey,
        intMode: options.intMode,
      };

      // Remove undefined properties
      const cleanConfig = Object.fromEntries(
        Object.entries(clientConfig).filter(([_, value]) => value !== undefined),
      );

      const client = createClient(cleanConfig);

      return new PrismaLibSQL(client);
    } catch (error) {
      throw createAdapterError('Turso', error, 'creating adapter instance');
    }
  }, options.retries);
}

/**
 * Create a Turso adapter optimized for edge environments
 */
export async function createEdgeTursoAdapter(
  url: string,
  authToken?: string,
  options: Partial<TursoAdapterOptions> = {},
): Promise<any> {
  return createTursoAdapter({
    url,
    authToken,
    readYourWrites: true, // Important for edge consistency
    intMode: 'number', // Better for JSON serialization
    connectionTimeout: 10000, // 10 second timeout for edge
    ...options,
  });
}

/**
 * Create a Turso adapter with embedded replica (for hybrid local/remote)
 */
export async function createTursoReplicaAdapter(
  remoteUrl: string,
  authToken: string,
  localDbPath: string = ':memory:',
  options: Partial<TursoAdapterOptions> = {},
): Promise<any> {
  return createTursoAdapter({
    url: localDbPath, // Local SQLite database
    authToken,
    syncUrl: remoteUrl, // Remote Turso database
    syncInterval: options.syncInterval || 60000, // Sync every minute
    readYourWrites: true,
    ...options,
  });
}

/**
 * Validate Turso adapter options
 */
export function validateTursoOptions(options: TursoAdapterOptions): boolean {
  if (!options.url) {
    return false;
  }

  // For remote Turso databases, auth token is required
  if (isTursoRemoteUrl(options.url) && !options.authToken) {
    return false;
  }

  // Validate sync configuration
  if (options.syncUrl && !options.authToken) {
    return false;
  }

  if (options.syncInterval && options.syncInterval < 1000) {
    return false; // Minimum 1 second sync interval
  }

  return true;
}

/**
 * Get required dependencies for Turso adapter
 */
export function getTursoDependencies(): string[] {
  return ['@prisma/adapter-libsql', '@libsql/client'];
}

/**
 * Check if Turso adapter is available in current environment
 */
export async function isTursoAvailable(): Promise<boolean> {
  try {
    await import('@prisma/adapter-libsql' as any);
    await import('@libsql/client' as any);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to detect if a URL is for a remote Turso database
 */
export function isTursoRemoteUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === 'libsql:' ||
      parsedUrl.hostname.includes('turso.tech') ||
      parsedUrl.hostname.includes('turso.io')
    );
  } catch {
    return false;
  }
}

/**
 * Helper to detect if a connection string is for Turso
 */
export function isTursoConnectionString(connectionString: string): boolean {
  return (
    isTursoRemoteUrl(connectionString) ||
    connectionString.startsWith('file:') ||
    connectionString === ':memory:' ||
    connectionString.endsWith('.db')
  );
}

/**
 * Create a connection string validator for Turso
 */
export function validateTursoConnectionString(
  connectionString: string,
  authToken?: string,
): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  type: 'remote' | 'local' | 'memory';
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Determine connection type
  let type: 'remote' | 'local' | 'memory' = 'local';

  if (connectionString === ':memory:') {
    type = 'memory';
  } else if (isTursoRemoteUrl(connectionString)) {
    type = 'remote';

    // Remote connections require auth token
    if (!authToken) {
      issues.push('Remote Turso connections require an auth token');
      suggestions.push('Set TURSO_AUTH_TOKEN environment variable or pass authToken option');
    }

    try {
      const url = new URL(connectionString);
      if (url.protocol !== 'libsql:' && !url.hostname.includes('turso')) {
        suggestions.push('Use libsql:// protocol for Turso connections');
      }
    } catch {
      issues.push('Invalid URL format for remote Turso connection');
    }
  } else if (connectionString.startsWith('file:') || connectionString.endsWith('.db')) {
    type = 'local';

    if (!connectionString.startsWith('file:') && !connectionString.startsWith('/')) {
      suggestions.push('Use file: protocol for local database files (e.g., file:./local.db)');
    }
  } else {
    issues.push('Unrecognized connection string format');
    suggestions.push(
      'Use one of: libsql://... (remote), file:./db.sqlite (local), or :memory: (in-memory)',
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    type,
  };
}

/**
 * Helper to extract database name from Turso URL
 */
export function extractTursoDatabaseName(url: string): string | null {
  try {
    if (url === ':memory:') return 'memory';

    if (url.startsWith('file:')) {
      const filename = url.split('/').pop();
      return filename ? filename.replace('.db', '') : null;
    }

    if (isTursoRemoteUrl(url)) {
      const parsedUrl = new URL(url);
      // Turso database name is often in the hostname
      const hostname = parsedUrl.hostname;
      const parts = hostname.split('.');
      return parts[0] || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Helper to get environment variables for Turso configuration
 */
export function getTursoEnvConfig(): {
  url?: string;
  authToken?: string;
  syncUrl?: string;
} {
  const config: any = {};

  // Try common environment variable names
  if (typeof process !== 'undefined') {
    config.url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    config.authToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_TOKEN;
    config.syncUrl = process.env.TURSO_SYNC_URL;
  }

  // For edge runtimes
  if (typeof globalThis !== 'undefined') {
    config.url = config.url || (globalThis as any).TURSO_DATABASE_URL;
    config.authToken = config.authToken || (globalThis as any).TURSO_AUTH_TOKEN;
    config.syncUrl = config.syncUrl || (globalThis as any).TURSO_SYNC_URL;
  }

  return config;
}
