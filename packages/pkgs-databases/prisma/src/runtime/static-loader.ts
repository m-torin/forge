/**
 * Static adapter loader for webpack compatibility
 * Replaces dynamic imports with static imports to eliminate webpack warnings
 */

// Import all adapters statically - webpack can analyze these
import * as d1Adapter from '../adapters/d1';
import * as neonAdapter from '../adapters/neon';
import * as planetscaleAdapter from '../adapters/planetscale';
import * as postgresqlAdapter from '../adapters/postgresql';
import * as sqliteAdapter from '../adapters/sqlite';
import * as tursoAdapter from '../adapters/turso';

export interface StaticAdapterConfig {
  provider: string;
  connectionString: string;
  options?: Record<string, any>;
}

export interface BuildFallbackAdapter {
  name: string;
  execute: () => Promise<any>;
  query: () => Promise<any>;
  close: () => Promise<void>;
}

/**
 * Create a minimal build-time fallback adapter that satisfies Prisma 6 requirements
 * This adapter doesn't connect to any real database - just provides the interface
 */
function createBuildFallbackAdapter(): BuildFallbackAdapter {
  return {
    name: 'build-fallback',
    execute: async () => ({ rows: [], affectedRows: 0 }),
    query: async () => ({ rows: [], affectedRows: 0 }),
    close: async () => {
      // No-op for build time
    },
  };
}

/**
 * Detect if we're in a build phase where we shouldn't connect to real databases
 */
function isBuildPhase(): boolean {
  // Next.js build detection
  const isNextBuild = process.env.NEXT_PHASE === 'phase-production-build';
  const isNextExport = process.env.NEXT_PHASE === 'phase-export';

  // Webpack build detection
  const isWebpackBuild =
    process.env.WEBPACK === 'true' ||
    (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL);

  // Generic build detection
  const isBuild = process.env.BUILD_PHASE === 'true' || process.env.npm_lifecycle_event === 'build';

  return isNextBuild || isNextExport || isWebpackBuild || isBuild;
}

/**
 * Load adapter with static imports (webpack-friendly)
 * No dynamic imports = no webpack warnings
 */
export async function loadAdapterStatic(config: StaticAdapterConfig): Promise<any> {
  const { provider, connectionString, options = {} } = config;

  // Return build fallback during build phase
  if (isBuildPhase()) {
    console.log('[Static Loader] Build phase detected, using fallback adapter');
    return createBuildFallbackAdapter();
  }

  // Use static imports - webpack can analyze these properly
  try {
    switch (provider) {
      case 'postgresql':
        return await postgresqlAdapter.createPostgreSQLAdapter({
          connectionString,
          ...options,
        });

      case 'neon':
        return await neonAdapter.createNeonAdapter({
          connectionString,
          ...options,
        });

      case 'planetscale':
        return await planetscaleAdapter.createPlanetScaleAdapter({
          url: connectionString,
          ...options,
        });

      case 'turso':
        return await tursoAdapter.createTursoAdapter({
          url: connectionString,
          ...options,
        });

      case 'd1':
        return await d1Adapter.createD1Adapter({
          ...options,
          // D1 options come from environment/bindings
        });

      case 'sqlite':
        return await sqliteAdapter.createSQLiteAdapter({
          url: connectionString,
          ...options,
        });

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    // If adapter creation fails, provide build fallback as last resort
    if (error instanceof Error && error.message.includes('Cannot resolve module')) {
      console.warn(
        `[Static Loader] Adapter '${provider}' not available, using fallback:`,
        error.message,
      );
      return createBuildFallbackAdapter();
    }
    throw error;
  }
}

/**
 * Check if an adapter is available at build time
 * Uses static imports so webpack can determine availability
 */
export function isAdapterAvailableStatic(provider: string): boolean {
  switch (provider) {
    case 'postgresql':
      return !!postgresqlAdapter.createPostgreSQLAdapter;
    case 'sqlite':
      return !!sqliteAdapter.createSQLiteAdapter;
    case 'neon':
      return !!neonAdapter.createNeonAdapter;
    case 'planetscale':
      return !!planetscaleAdapter.createPlanetScaleAdapter;
    case 'turso':
      return !!tursoAdapter.createTursoAdapter;
    case 'd1':
      return !!d1Adapter.createD1Adapter;
    default:
      return false;
  }
}

/**
 * Get all available adapters (statically determined)
 */
export function getAvailableAdaptersStatic(): string[] {
  const adapters: string[] = [];

  if (isAdapterAvailableStatic('postgresql')) adapters.push('postgresql');
  if (isAdapterAvailableStatic('sqlite')) adapters.push('sqlite');
  if (isAdapterAvailableStatic('neon')) adapters.push('neon');
  if (isAdapterAvailableStatic('planetscale')) adapters.push('planetscale');
  if (isAdapterAvailableStatic('turso')) adapters.push('turso');
  if (isAdapterAvailableStatic('d1')) adapters.push('d1');

  return adapters;
}
