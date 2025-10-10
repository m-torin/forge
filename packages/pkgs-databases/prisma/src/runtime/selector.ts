/**
 * Automatic adapter selection and client creation based on runtime environment
 */

import {
  getAdapterCompatibility,
  getRuntimeInfo,
  isAdapterSupported,
  validateAdapterEnvironment,
  type RuntimeEnvironment,
} from './detector';
import { loadAdapterStatic } from './static-loader';

export interface AdapterConfig {
  provider: string;
  connectionString: string;
  options?: Record<string, any>;
}

export interface ClientOptions {
  preferredProvider?: string;
  connectionString?: string;
  log?: Array<'query' | 'info' | 'warn' | 'error'>;
  maxRetries?: number;
  timeout?: number;
  fallbackProviders?: string[];
  strictMode?: boolean; // If true, fail if preferred provider unavailable
  debugMode?: boolean; // Enable detailed selection logging
}

/**
 * Auto-detect and create the optimal adapter for the current runtime
 * Enhanced with environment awareness and graceful fallbacks
 */
export async function autoSelectAdapter(options: ClientOptions = {}): Promise<{
  adapter: any;
  config: AdapterConfig;
  runtime: RuntimeEnvironment;
  selectionReason: string;
}> {
  const runtimeInfo = getRuntimeInfo();
  const runtime = runtimeInfo.detected;

  if (options.debugMode) {
    console.log('[Prisma Adapter Selection] Runtime info:', runtimeInfo);
  }

  // Get compatibility matrix for decision making
  const compatibilityMatrix = getAdapterCompatibility(runtime);
  const availableAdapters = compatibilityMatrix
    .filter(a => a.supported && a.confidence !== 'low')
    .map(a => a.adapter);

  if (options.debugMode) {
    console.log('[Prisma Adapter Selection] Compatibility matrix:', compatibilityMatrix);
  }

  // Try to select the best provider with fallbacks
  const selectionResult = await selectOptimalProvider({
    preferredProvider: options.preferredProvider,
    availableAdapters,
    runtime,
    connectionString: options.connectionString,
    fallbackProviders: options.fallbackProviders,
    strictMode: options.strictMode || false,
    debugMode: options.debugMode || false,
  });

  if (!selectionResult.success) {
    const supportedAdapters = getSupportedAdaptersForRuntime(runtime).join(', ');
    throw new Error(
      `Failed to select suitable adapter. ${selectionResult.error}\n` +
        `Runtime: ${runtime.runtime} (confidence: ${runtime.confidence}%)\n` +
        `Supported adapters: ${supportedAdapters}\n` +
        `Available connection strings: ${listAvailableConnectionStrings(runtime)}`,
    );
  }

  const { provider, connectionString, selectionReason } = selectionResult;

  if (!provider || !connectionString) {
    throw new Error('Selection succeeded but provider or connectionString is missing');
  }

  // Create adapter configuration with enhanced options
  const config: AdapterConfig = {
    provider,
    connectionString,
    options: getProviderSpecificOptions(provider, runtime),
  };

  // Load and create the adapter with error handling
  let adapter: any;
  try {
    adapter = await loadAdapter(config, runtime);
  } catch (error) {
    if (options.debugMode) {
      console.error('[Prisma Adapter Selection] Failed to load adapter:', error);
    }

    // Try fallback adapters if not in strict mode
    if (!options.strictMode && selectionResult.fallbackAdapters?.length) {
      for (const fallbackProvider of selectionResult.fallbackAdapters) {
        try {
          const fallbackConnectionString =
            options.connectionString || getConnectionString(runtime, fallbackProvider);

          if (fallbackConnectionString) {
            const fallbackConfig = {
              ...config,
              provider: fallbackProvider,
              connectionString: fallbackConnectionString,
            };
            adapter = await loadAdapter(fallbackConfig, runtime);
            config.provider = fallbackProvider;
            config.connectionString = fallbackConfig.connectionString;
            break;
          }
        } catch {
          // Continue trying fallbacks
        }
      }
    }

    if (!adapter) {
      throw new Error(
        `Failed to create adapter '${provider}': ${error instanceof Error ? error.message : String(error)}\n` +
          `Runtime: ${runtime.runtime}\n` +
          `Selection reason: ${selectionReason}`,
      );
    }
  }

  if (options.debugMode) {
    console.log('[Prisma Adapter Selection] Successfully created adapter:', {
      provider: config.provider,
      runtime: runtime.runtime,
      selectionReason,
    });
  }

  return {
    adapter,
    config,
    runtime,
    selectionReason: selectionReason || 'Unknown selection reason',
  };
}

/**
 * Create an optimized client based on runtime environment
 * Note: This function is not currently used to avoid dynamic imports during builds
 * Use createNodeClient or createEdgeClient directly instead
 */
export async function createOptimizedClient(options: ClientOptions = {}) {
  const { adapter, runtime } = await autoSelectAdapter(options);

  // For now, always return a generic client to avoid dynamic imports
  // The specific client factories should be used directly
  throw new Error(
    'createOptimizedClient is deprecated to avoid build issues. ' +
      'Use createNodeClient or createEdgeClient directly instead.',
  );
}

/**
 * Detect provider from environment variables
 */
function detectProviderFromEnvironment(runtime: RuntimeEnvironment): string | null {
  // Check for provider-specific environment variables
  if (runtime.hasEnvVar('CLOUDFLARE_D1_TOKEN') || runtime.hasEnvVar('CLOUDFLARE_ACCOUNT_ID')) {
    return 'd1';
  }

  if (runtime.hasEnvVar('TURSO_DATABASE_URL')) {
    return 'turso';
  }

  if (runtime.hasEnvVar('POSTGRES_PRISMA_URL')) {
    return 'neon'; // Vercel Postgres uses Neon
  }

  // Analyze DATABASE_URL if present
  if (runtime.hasEnvVar('DATABASE_URL')) {
    const url = getConnectionString(runtime, 'auto') || '';

    if (url.includes('psdb.cloud') || url.includes('planetscale.com')) {
      return 'planetscale';
    }

    if (url.includes('neon.tech') || url.includes('neon.cc')) {
      return 'neon';
    }

    if (url.includes('turso.tech') || url.includes('turso.io')) {
      return 'turso';
    }

    if (url.startsWith('postgresql://') && runtime.runtime === 'nodejs') {
      return 'postgresql';
    }

    if (url.startsWith('file:') || url.endsWith('.db') || url.endsWith('.sqlite')) {
      return 'sqlite';
    }
  }

  return null;
}

/**
 * Get the default provider for a runtime if no specific provider is detected
 */
function getDefaultProvider(runtime: RuntimeEnvironment): string {
  switch (runtime.runtime) {
    case 'cloudflare':
      return 'd1';
    case 'vercel-edge':
      return 'neon';
    case 'deno':
      return 'postgresql';
    case 'nodejs':
    default:
      return 'postgresql';
  }
}

/**
 * Get supported adapters for a specific runtime
 */
function getSupportedAdaptersForRuntime(runtime: RuntimeEnvironment): string[] {
  const adapters: string[] = [];

  if (runtime.capabilities.supportsHTTP) {
    adapters.push('neon', 'planetscale', 'turso');
  }

  if (runtime.runtime === 'cloudflare') {
    adapters.push('d1');
    if (runtime.capabilities.supportsTCP) {
      adapters.push('postgresql');
    }
  }

  if (runtime.runtime === 'nodejs') {
    adapters.push('postgresql', 'sqlite');
  }

  if (runtime.runtime === 'deno') {
    adapters.push('postgresql');
  }

  return adapters;
}

/**
 * Get connection string for a provider from environment
 */
function getConnectionString(runtime: RuntimeEnvironment, provider: string): string | null {
  // For auto-detection, return the raw DATABASE_URL
  if (provider === 'auto') {
    if (runtime.runtime === 'nodejs' || runtime.runtime === 'deno') {
      return typeof process !== 'undefined' ? process.env.DATABASE_URL || null : null;
    }
    if (runtime.runtime === 'vercel-edge') {
      return typeof process !== 'undefined' ? process.env.DATABASE_URL || null : null;
    }
    if (runtime.runtime === 'cloudflare') {
      return typeof globalThis !== 'undefined' && 'DATABASE_URL' in globalThis
        ? (globalThis as any).DATABASE_URL
        : null;
    }
    return null;
  }

  switch (provider) {
    case 'postgresql':
    case 'neon':
      if (runtime.hasEnvVar('POSTGRES_PRISMA_URL')) {
        return typeof process !== 'undefined' ? process.env.POSTGRES_PRISMA_URL || null : null;
      }
      if (runtime.hasEnvVar('DATABASE_URL')) {
        if (
          runtime.runtime === 'nodejs' ||
          runtime.runtime === 'vercel-edge' ||
          runtime.runtime === 'deno'
        ) {
          return typeof process !== 'undefined' ? process.env.DATABASE_URL || null : null;
        }
        if (runtime.runtime === 'cloudflare') {
          return typeof globalThis !== 'undefined' && 'DATABASE_URL' in globalThis
            ? (globalThis as any).DATABASE_URL
            : null;
        }
      }
      break;

    case 'planetscale':
      if (runtime.hasEnvVar('DATABASE_URL')) {
        if (
          runtime.runtime === 'nodejs' ||
          runtime.runtime === 'vercel-edge' ||
          runtime.runtime === 'deno'
        ) {
          return typeof process !== 'undefined' ? process.env.DATABASE_URL || null : null;
        }
        if (runtime.runtime === 'cloudflare') {
          return typeof globalThis !== 'undefined' && 'DATABASE_URL' in globalThis
            ? (globalThis as any).DATABASE_URL
            : null;
        }
      }
      break;

    case 'turso':
      if (runtime.hasEnvVar('TURSO_DATABASE_URL')) {
        if (
          runtime.runtime === 'nodejs' ||
          runtime.runtime === 'vercel-edge' ||
          runtime.runtime === 'deno'
        ) {
          return typeof process !== 'undefined' ? process.env.TURSO_DATABASE_URL || null : null;
        }
        if (runtime.runtime === 'cloudflare') {
          return typeof globalThis !== 'undefined' && 'TURSO_DATABASE_URL' in globalThis
            ? (globalThis as any).TURSO_DATABASE_URL
            : null;
        }
      }
      // Fall back to DATABASE_URL
      if (runtime.hasEnvVar('DATABASE_URL')) {
        if (
          runtime.runtime === 'nodejs' ||
          runtime.runtime === 'vercel-edge' ||
          runtime.runtime === 'deno'
        ) {
          return typeof process !== 'undefined' ? process.env.DATABASE_URL || null : null;
        }
        if (runtime.runtime === 'cloudflare') {
          return typeof globalThis !== 'undefined' && 'DATABASE_URL' in globalThis
            ? (globalThis as any).DATABASE_URL
            : null;
        }
      }
      break;

    case 'sqlite':
      if (runtime.hasEnvVar('SQLITE_DATABASE_URL')) {
        return typeof process !== 'undefined' ? process.env.SQLITE_DATABASE_URL || null : null;
      }
      // Default SQLite file
      return 'file:./dev.db';

    case 'd1':
      // D1 uses bindings, not connection strings
      return 'cloudflare-d1://d1';
  }

  return null;
}

/**
 * Get provider-specific options
 */
function getProviderSpecificOptions(
  provider: string,
  runtime: RuntimeEnvironment,
): Record<string, any> {
  const options: Record<string, any> = {};

  // Cloudflare Workers need special fetch handling for PlanetScale
  if (provider === 'planetscale' && runtime.runtime === 'cloudflare') {
    options.fetch = (url: string, init: any) => {
      // Remove cache property to avoid Cloudflare Worker issues
      delete init['cache'];
      return fetch(url, init);
    };
  }

  // Edge runtimes may need reduced connection limits
  if (runtime.runtime === 'vercel-edge' || runtime.runtime === 'cloudflare') {
    options.connectionLimit = 2;
    options.poolTimeout = 10000; // 10 seconds
  }

  return options;
}

/**
 * Load and instantiate the appropriate adapter
 */
async function loadAdapter(config: AdapterConfig, runtime: RuntimeEnvironment): Promise<any> {
  // Use static import - no dynamic imports to avoid webpack warnings
  try {
    return await loadAdapterStatic({
      provider: config.provider,
      connectionString: config.connectionString,
      options: config.options,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot resolve module')) {
      throw new Error(
        `Adapter '${config.provider}' is not available. Please install the required dependencies:\n` +
          `npm install ${getRequiredDependencies(config.provider).join(' ')}`,
      );
    }
    throw error;
  }
}

/**
 * Enhanced provider selection with fallback logic
 */
async function selectOptimalProvider(params: {
  preferredProvider?: string;
  availableAdapters: string[];
  runtime: RuntimeEnvironment;
  connectionString?: string;
  fallbackProviders?: string[];
  strictMode: boolean;
  debugMode: boolean;
}): Promise<{
  success: boolean;
  provider?: string;
  connectionString?: string;
  selectionReason?: string;
  fallbackAdapters?: string[];
  error?: string;
}> {
  const { preferredProvider, availableAdapters, runtime, strictMode, debugMode } = params;

  // Step 1: Try preferred provider if specified
  if (preferredProvider) {
    if (debugMode) {
      console.log(`[Adapter Selection] Trying preferred provider: ${preferredProvider}`);
    }

    const connectionString =
      params.connectionString || getConnectionString(runtime, preferredProvider);

    if (isAdapterSupported(preferredProvider, runtime) && connectionString) {
      const envValidation = validateAdapterEnvironment(preferredProvider, runtime);
      if (envValidation.isValid) {
        return {
          success: true,
          provider: preferredProvider,
          connectionString,
          selectionReason: 'User-specified preferred provider',
        };
      } else if (strictMode) {
        return {
          success: false,
          error: `Preferred provider '${preferredProvider}' failed validation: ${envValidation.suggestions.join(', ')}`,
        };
      }
    } else if (strictMode) {
      return {
        success: false,
        error: `Preferred provider '${preferredProvider}' is not supported or has no connection string`,
      };
    }
  }

  // Step 2: Try environment-detected provider
  const envProvider = detectProviderFromEnvironment(runtime);
  if (envProvider && availableAdapters.includes(envProvider)) {
    const connectionString = params.connectionString || getConnectionString(runtime, envProvider);
    if (connectionString) {
      if (debugMode) {
        console.log(`[Adapter Selection] Using environment-detected provider: ${envProvider}`);
      }
      return {
        success: true,
        provider: envProvider,
        connectionString,
        selectionReason: 'Environment-detected provider',
      };
    }
  }

  // Step 3: Try runtime preferred adapter
  if (runtime.preferredAdapter && availableAdapters.includes(runtime.preferredAdapter)) {
    const connectionString =
      params.connectionString || getConnectionString(runtime, runtime.preferredAdapter);
    if (connectionString) {
      if (debugMode) {
        console.log(
          `[Adapter Selection] Using runtime preferred adapter: ${runtime.preferredAdapter}`,
        );
      }
      return {
        success: true,
        provider: runtime.preferredAdapter,
        connectionString,
        selectionReason: 'Runtime-preferred adapter',
      };
    }
  }

  // Step 4: Try fallback providers
  const fallbacks = params.fallbackProviders || getDefaultFallbackOrder(runtime);
  for (const provider of fallbacks) {
    if (availableAdapters.includes(provider)) {
      const connectionString = params.connectionString || getConnectionString(runtime, provider);
      if (connectionString) {
        const envValidation = validateAdapterEnvironment(provider, runtime);
        if (envValidation.isValid) {
          if (debugMode) {
            console.log(`[Adapter Selection] Using fallback provider: ${provider}`);
          }
          return {
            success: true,
            provider,
            connectionString,
            selectionReason: `Fallback provider (from ${fallbacks.join(', ')})`,
            fallbackAdapters: fallbacks.slice(fallbacks.indexOf(provider) + 1),
          };
        }
      }
    }
  }

  // Step 5: Last resort - try any available adapter
  if (!strictMode) {
    for (const provider of availableAdapters) {
      const connectionString = params.connectionString || getConnectionString(runtime, provider);
      if (connectionString) {
        if (debugMode) {
          console.log(`[Adapter Selection] Using last resort provider: ${provider}`);
        }
        return {
          success: true,
          provider,
          connectionString,
          selectionReason: 'Last resort - first available adapter with connection string',
        };
      }
    }
  }

  return {
    success: false,
    error: strictMode
      ? 'No suitable adapter found in strict mode'
      : 'No adapter with valid connection string found',
  };
}

/**
 * Get default fallback order for providers based on runtime
 */
function getDefaultFallbackOrder(runtime: RuntimeEnvironment): string[] {
  const base = ['neon', 'planetscale', 'postgresql', 'sqlite'];

  switch (runtime.runtime) {
    case 'vercel-edge':
      return ['neon', 'planetscale', 'turso'];
    case 'cloudflare':
      return ['d1', 'neon', 'planetscale', 'turso'];
    case 'deno':
      return ['neon', 'postgresql', 'planetscale'];
    case 'nodejs':
    default:
      return ['postgresql', 'neon', 'planetscale', 'sqlite'];
  }
}

/**
 * List available connection strings for debugging
 */
function listAvailableConnectionStrings(runtime: RuntimeEnvironment): string {
  const available: string[] = [];

  if (runtime.hasEnvVar('DATABASE_URL')) available.push('DATABASE_URL');
  if (runtime.hasEnvVar('POSTGRES_PRISMA_URL')) available.push('POSTGRES_PRISMA_URL');
  if (runtime.hasEnvVar('TURSO_DATABASE_URL')) available.push('TURSO_DATABASE_URL');
  if (runtime.hasEnvVar('SQLITE_DATABASE_URL')) available.push('SQLITE_DATABASE_URL');

  return available.length > 0 ? available.join(', ') : 'none found';
}

/**
 * Get required dependencies for an adapter
 */
function getRequiredDependencies(provider: string): string[] {
  switch (provider) {
    case 'postgresql':
      return ['@prisma/adapter-pg', 'pg'];
    case 'neon':
      return ['@prisma/adapter-neon', '@neondatabase/serverless'];
    case 'planetscale':
      return ['@prisma/adapter-planetscale', '@planetscale/database'];
    case 'turso':
      return ['@prisma/adapter-libsql', '@libsql/client'];
    case 'd1':
      return ['@prisma/adapter-d1'];
    case 'sqlite':
      return ['@prisma/adapter-better-sqlite3', 'better-sqlite3'];
    default:
      return [];
  }
}

/**
 * Validate adapter availability before attempting to create
 */
export async function validateAdapterAvailability(provider: string): Promise<{
  available: boolean;
  missingDependencies: string[];
  installCommand?: string;
}> {
  // During build phase, skip dependency validation to avoid dynamic imports
  if (
    typeof process !== 'undefined' &&
    (process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      process.env.WEBPACK === 'true')
  ) {
    return {
      available: true,
      missingDependencies: [],
      installCommand: undefined,
    };
  }

  const requiredDeps = getRequiredDependencies(provider);
  const missingDependencies: string[] = [];

  for (const dep of requiredDeps) {
    try {
      await import(dep);
    } catch {
      missingDependencies.push(dep);
    }
  }

  return {
    available: missingDependencies.length === 0,
    missingDependencies,
    installCommand:
      missingDependencies.length > 0 ? `npm install ${missingDependencies.join(' ')}` : undefined,
  };
}
