/**
 * SQLite adapter for Node.js environments
 * Uses better-sqlite3 for optimal performance
 */

import { createAdapterError, withRetry, type BaseAdapterOptions } from './base';

export interface SQLiteAdapterOptions extends BaseAdapterOptions {
  url: string;
  readonly?: boolean;
  fileMustExist?: boolean;
  timeout?: number;
  verbose?: (message?: any, ...additionalArgs: any[]) => void;
}

/**
 * Create a SQLite adapter instance
 */
export async function createSQLiteAdapter(options: SQLiteAdapterOptions): Promise<any> {
  return withRetry(async () => {
    try {
      const { PrismaBetterSQLite3 } = await import('@prisma/adapter-better-sqlite3');

      const adapterConfig = {
        url: options.url,
        readonly: options.readonly,
        fileMustExist: options.fileMustExist,
        timeout: options.timeout,
        verbose: options.verbose,
      };

      // Remove undefined properties but ensure url is always present
      const cleanConfig = Object.fromEntries(
        Object.entries(adapterConfig).filter(([_, value]) => value !== undefined),
      ) as any;

      // Ensure url is always present as it's required by BetterSQLite3InputParams
      if (!cleanConfig.url) {
        cleanConfig.url = ':memory:';
      }

      return new PrismaBetterSQLite3(cleanConfig);
    } catch (error) {
      throw createAdapterError('SQLite', error, 'creating adapter instance');
    }
  }, options.retries);
}

/**
 * Create a SQLite adapter with development-friendly defaults
 */
export async function createDevelopmentSQLiteAdapter(
  dbPath: string = './dev.db',
  options: Partial<SQLiteAdapterOptions> = {},
): Promise<any> {
  const dbUrl = dbPath.startsWith('file:') ? dbPath : `file:${dbPath}`;

  return createSQLiteAdapter({
    url: dbUrl,
    readonly: false,
    fileMustExist: false, // Create DB if it doesn't exist
    timeout: 5000,
    verbose: options.verbose, // Can be enabled for debugging
    ...options,
  });
}

/**
 * Create a SQLite adapter with production-friendly defaults
 */
export async function createProductionSQLiteAdapter(
  dbPath: string,
  options: Partial<SQLiteAdapterOptions> = {},
): Promise<any> {
  const dbUrl = dbPath.startsWith('file:') ? dbPath : `file:${dbPath}`;

  return createSQLiteAdapter({
    url: dbUrl,
    readonly: false,
    fileMustExist: true, // DB should exist in production
    timeout: 30000, // Longer timeout for production
    ...options,
  });
}

/**
 * Create a read-only SQLite adapter
 */
export async function createReadOnlySQLiteAdapter(
  dbPath: string,
  options: Partial<SQLiteAdapterOptions> = {},
): Promise<any> {
  const dbUrl = dbPath.startsWith('file:') ? dbPath : `file:${dbPath}`;

  return createSQLiteAdapter({
    url: dbUrl,
    readonly: true,
    fileMustExist: true,
    timeout: 30000,
    ...options,
  });
}

/**
 * Validate SQLite adapter options
 */
export function validateSQLiteOptions(options: SQLiteAdapterOptions): boolean {
  if (!options.url) {
    return false;
  }

  // Validate timeout
  if (options.timeout && (options.timeout < 100 || options.timeout > 300000)) {
    return false;
  }

  // Validate URL format
  if (!isSQLiteUrl(options.url)) {
    return false;
  }

  return true;
}

/**
 * Get required dependencies for SQLite adapter
 */
export function getSQLiteDependencies(): string[] {
  return ['@prisma/adapter-better-sqlite3', 'better-sqlite3', '@types/better-sqlite3'];
}

/**
 * Check if SQLite adapter is available in current environment
 */
export async function isSQLiteAvailable(): Promise<boolean> {
  try {
    await import('@prisma/adapter-better-sqlite3');
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to detect if a URL is for SQLite
 */
export function isSQLiteUrl(url: string): boolean {
  return (
    url.startsWith('file:') ||
    url === ':memory:' ||
    url.endsWith('.db') ||
    url.endsWith('.sqlite') ||
    url.endsWith('.sqlite3')
  );
}

/**
 * Helper to detect if a connection string is for SQLite
 */
export function isSQLiteConnectionString(connectionString: string): boolean {
  return isSQLiteUrl(connectionString);
}

/**
 * Normalize SQLite file path
 */
export function normalizeSQLitePath(path: string): string {
  if (path === ':memory:') {
    return path;
  }

  if (path.startsWith('file:')) {
    return path;
  }

  // Convert relative/absolute paths to file: URLs
  if (path.startsWith('/')) {
    return `file:${path}`; // Absolute path
  } else {
    return `file:./${path}`; // Relative path
  }
}

/**
 * Create a connection string validator for SQLite
 */
export function validateSQLiteConnectionString(connectionString: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  type: 'memory' | 'file';
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  let type: 'memory' | 'file' = 'file';

  if (connectionString === ':memory:') {
    type = 'memory';
    return {
      isValid: true,
      issues,
      suggestions,
      type,
    };
  }

  if (!isSQLiteUrl(connectionString)) {
    issues.push('Invalid SQLite URL format');
    suggestions.push(
      'Use one of: file:./database.db, file:/absolute/path/database.db, or :memory:',
    );
  }

  if (connectionString.startsWith('file:')) {
    const filePath = connectionString.slice(5); // Remove 'file:' prefix

    if (!filePath) {
      issues.push('File path is empty');
    }

    if (filePath.includes('..')) {
      suggestions.push('Avoid using .. in file paths for security');
    }

    if (!filePath.match(/\.(db|sqlite|sqlite3)$/)) {
      suggestions.push('Consider using .db, .sqlite, or .sqlite3 file extension');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    type,
  };
}

/**
 * Get SQLite database info from file path
 */
export function getSQLiteInfo(url: string): {
  isMemory: boolean;
  filePath?: string;
  directory?: string;
  filename?: string;
} {
  if (url === ':memory:') {
    return { isMemory: true };
  }

  let filePath = url;
  if (url.startsWith('file:')) {
    filePath = url.slice(5);
  }

  const lastSlashIndex = filePath.lastIndexOf('/');
  const directory = lastSlashIndex > -1 ? filePath.slice(0, lastSlashIndex) : '.';
  const filename = lastSlashIndex > -1 ? filePath.slice(lastSlashIndex + 1) : filePath;

  return {
    isMemory: false,
    filePath,
    directory,
    filename,
  };
}

/**
 * Helper to get environment variables for SQLite configuration
 */
export function getSQLiteEnvConfig(): {
  url?: string;
  readonly?: boolean;
} {
  const config: any = {};

  if (typeof process !== 'undefined') {
    config.url = process.env.SQLITE_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';

    config.readonly = process.env.SQLITE_READONLY === 'true';
  }

  return config;
}
