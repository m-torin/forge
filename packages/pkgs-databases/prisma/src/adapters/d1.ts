/**
 * Cloudflare D1 adapter for Cloudflare Workers and Pages
 * Optimized for Cloudflare's edge SQLite environment
 */

import { createAdapterError, withRetry, type BaseAdapterOptions } from './base';

export interface D1AdapterOptions extends BaseAdapterOptions {
  CLOUDFLARE_D1_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_DATABASE_ID?: string;
  binding?: any; // D1 database binding from Cloudflare Workers
  databaseName?: string;
}

/**
 * Create a Cloudflare D1 adapter instance
 */
export async function createD1Adapter(options: D1AdapterOptions = {}): Promise<any> {
  return withRetry(async () => {
    try {
      const { PrismaD1 } = await import('@prisma/adapter-d1');

      // Priority 1: Use D1 binding (most common in Workers)
      if (options.binding) {
        return new PrismaD1(options.binding);
      }

      // Priority 2: Try to get binding from global context
      const binding = getD1BindingFromContext(options.databaseName);
      if (binding) {
        return new PrismaD1(binding);
      }

      // Priority 3: Use API credentials for external access
      if (
        options.CLOUDFLARE_D1_TOKEN &&
        options.CLOUDFLARE_ACCOUNT_ID &&
        options.CLOUDFLARE_DATABASE_ID
      ) {
        const apiConfig = {
          CLOUDFLARE_D1_TOKEN: options.CLOUDFLARE_D1_TOKEN,
          CLOUDFLARE_ACCOUNT_ID: options.CLOUDFLARE_ACCOUNT_ID,
          CLOUDFLARE_DATABASE_ID: options.CLOUDFLARE_DATABASE_ID,
        };

        return new PrismaD1(apiConfig);
      }

      throw new Error(
        'D1 adapter requires either a database binding or API credentials. ' +
          'Ensure you have configured D1 bindings in your wrangler.toml or ' +
          'provide CLOUDFLARE_D1_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_DATABASE_ID.',
      );
    } catch (error) {
      throw createAdapterError('D1', error, 'creating adapter instance');
    }
  }, options.retries);
}

/**
 * Create a D1 adapter using Worker bindings (recommended approach)
 */
export async function createD1WorkerAdapter(
  binding?: any,
  bindingName: string = 'DB',
): Promise<any> {
  const d1Binding = binding || getD1BindingFromContext(bindingName);

  if (!d1Binding) {
    throw new Error(
      `D1 binding '${bindingName}' not found. ` +
        'Ensure your wrangler.toml has the correct D1 database binding configured.',
    );
  }

  return createD1Adapter({ binding: d1Binding });
}

/**
 * Create a D1 adapter using API credentials (for external access)
 */
export async function createD1ApiAdapter(
  accountId: string,
  databaseId: string,
  token: string,
): Promise<any> {
  return createD1Adapter({
    CLOUDFLARE_ACCOUNT_ID: accountId,
    CLOUDFLARE_DATABASE_ID: databaseId,
    CLOUDFLARE_D1_TOKEN: token,
  });
}

/**
 * Get D1 database binding from Cloudflare Workers context
 */
function getD1BindingFromContext(bindingName: string = 'DB'): any {
  // Check if we're in a Cloudflare Worker environment
  if (typeof globalThis === 'undefined') {
    return null;
  }

  // Try to get binding from global context
  const binding = (globalThis as any)[bindingName];

  // Validate that it looks like a D1 binding
  if (binding && typeof binding.prepare === 'function') {
    return binding;
  }

  // Try alternative binding names
  const alternativeNames = ['D1', 'DATABASE', 'DB'];
  for (const name of alternativeNames) {
    const altBinding = (globalThis as any)[name];
    if (altBinding && typeof altBinding.prepare === 'function') {
      return altBinding;
    }
  }

  return null;
}

/**
 * Validate D1 adapter options
 */
export function validateD1Options(options: D1AdapterOptions): boolean {
  // If binding is provided, it's valid
  if (options.binding) {
    return true;
  }

  // If all API credentials are provided, it's valid
  if (
    options.CLOUDFLARE_D1_TOKEN &&
    options.CLOUDFLARE_ACCOUNT_ID &&
    options.CLOUDFLARE_DATABASE_ID
  ) {
    return true;
  }

  // If we're in Cloudflare Workers and can detect a binding, it's valid
  if (typeof globalThis !== 'undefined' && getD1BindingFromContext(options.databaseName)) {
    return true;
  }

  return false;
}

/**
 * Get required dependencies for D1 adapter
 */
export function getD1Dependencies(): string[] {
  return ['@prisma/adapter-d1'];
}

/**
 * Check if D1 adapter is available in current environment
 */
export async function isD1Available(): Promise<boolean> {
  try {
    await import('@prisma/adapter-d1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if we're running in Cloudflare Workers environment
 */
export function isCloudflareWorkers(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    ((globalThis as any).navigator?.userAgent === 'Cloudflare-Workers' ||
      typeof (globalThis as any).caches !== 'undefined' ||
      typeof (globalThis as any).addEventListener !== 'undefined')
  );
}

/**
 * Auto-detect D1 configuration from environment
 */
export function detectD1Config(): {
  hasBinding: boolean;
  bindingName?: string;
  hasApiCredentials: boolean;
  accountId?: string;
  databaseId?: string;
  token?: string;
} {
  const config = {
    hasBinding: false,
    hasApiCredentials: false,
    bindingName: undefined as string | undefined,
    accountId: undefined as string | undefined,
    databaseId: undefined as string | undefined,
    token: undefined as string | undefined,
  };

  // Check for bindings
  if (isCloudflareWorkers()) {
    const commonBindingNames = ['DB', 'D1', 'DATABASE'];
    for (const name of commonBindingNames) {
      if (getD1BindingFromContext(name)) {
        config.hasBinding = true;
        config.bindingName = name;
        break;
      }
    }
  }

  // Check for API credentials
  if (typeof globalThis !== 'undefined') {
    const globals = globalThis as any;
    config.accountId = globals.CLOUDFLARE_ACCOUNT_ID;
    config.databaseId = globals.CLOUDFLARE_DATABASE_ID;
    config.token = globals.CLOUDFLARE_D1_TOKEN;
  }

  if (typeof process !== 'undefined') {
    config.accountId = config.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    config.databaseId = config.databaseId || process.env.CLOUDFLARE_DATABASE_ID;
    config.token = config.token || process.env.CLOUDFLARE_D1_TOKEN;
  }

  config.hasApiCredentials = !!(config.accountId && config.databaseId && config.token);

  return config;
}

/**
 * Create helpful error messages for D1 configuration issues
 */
export function getD1ConfigurationHelp(): string {
  const config = detectD1Config();

  if (config.hasBinding) {
    return `✅ D1 binding detected: ${config.bindingName}`;
  }

  if (config.hasApiCredentials) {
    return '✅ D1 API credentials detected';
  }

  const suggestions: string[] = [];

  if (isCloudflareWorkers()) {
    suggestions.push(
      '1. Add D1 binding to your wrangler.toml:',
      '   [[d1_databases]]',
      '   binding = "DB"',
      '   database_name = "my-database"',
      '   database_id = "your-database-id"',
    );
  } else {
    suggestions.push(
      '1. Set D1 API environment variables:',
      '   CLOUDFLARE_ACCOUNT_ID=your-account-id',
      '   CLOUDFLARE_DATABASE_ID=your-database-id',
      '   CLOUDFLARE_D1_TOKEN=your-api-token',
    );
  }

  suggestions.push(
    '2. Create a D1 database: wrangler d1 create my-database',
    '3. Get your Account ID: wrangler whoami',
    '4. Generate API token: https://dash.cloudflare.com/profile/api-tokens',
  );

  return `❌ D1 configuration not found.\n\n${suggestions.join('\n')}`;
}
