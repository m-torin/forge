/**
 * Runtime environment detection for optimal Prisma client selection
 * Supports Vercel Edge, Cloudflare Workers, Deno Deploy, and Node.js
 */

// Global type declarations are available via globals.d.ts

export interface RuntimeEnvironment {
  runtime: 'nodejs' | 'vercel-edge' | 'cloudflare' | 'deno';
  hasEnvVar: (name: string) => boolean;
  preferredAdapter?: string;
  confidence: number; // 0-100 confidence score for runtime detection
  capabilities: {
    supportsSQL: boolean;
    supportsHTTP: boolean;
    supportsTCP: boolean;
    supportsWebStreams: boolean;
  };
  metadata: {
    detectionMethod: string;
    userAgent?: string;
    platform?: string;
    version?: string;
    hasCloudflareApis?: boolean;
    hasCloudflareEnv?: boolean;
    confidence?: number;
  };
}

/**
 * Detection methods ranked by reliability
 */
interface DetectionMethod {
  name: string;
  detect: () => RuntimeEnvironment | null;
  priority: number; // Higher = more reliable
}

/**
 * Detect the current runtime environment with confidence scoring
 */
export function detectRuntime(): RuntimeEnvironment {
  const detectionMethods: DetectionMethod[] = [
    {
      name: 'vercel-edge-explicit',
      priority: 100,
      detect: () => detectVercelEdgeExplicit(),
    },
    {
      name: 'cloudflare-explicit',
      priority: 100,
      detect: () => detectCloudflareExplicit(),
    },
    {
      name: 'deno-explicit',
      priority: 100,
      detect: () => detectDenoExplicit(),
    },
    {
      name: 'vercel-edge-heuristic',
      priority: 80,
      detect: () => detectVercelEdgeHeuristic(),
    },
    {
      name: 'cloudflare-heuristic',
      priority: 80,
      detect: () => detectCloudflareHeuristic(),
    },
    {
      name: 'nodejs-fallback',
      priority: 10,
      detect: () => detectNodeJsFallback(),
    },
  ];

  // Try detection methods in priority order
  for (const method of detectionMethods.sort((a, b) => b.priority - a.priority)) {
    try {
      const result = method.detect();
      if (result) {
        return {
          ...result,
          confidence: method.priority,
          metadata: {
            ...result.metadata,
            detectionMethod: method.name,
          },
        };
      }
    } catch (error) {
      // Continue to next method if detection fails
      console.debug(`Runtime detection method '${method.name}' failed:`, error);
    }
  }

  // Fallback to Node.js with low confidence
  return createNodeJsEnvironment({
    confidence: 5,
    detectionMethod: 'fallback-unknown',
    userAgent:
      typeof globalThis !== 'undefined' && 'navigator' in globalThis
        ? (globalThis as any).navigator?.userAgent
        : undefined,
  });
}

/**
 * Explicit Vercel Edge Runtime detection (highest confidence)
 */
function detectVercelEdgeExplicit(): RuntimeEnvironment | null {
  if (typeof globalThis === 'undefined') return null;

  // Primary indicator: EdgeRuntime global
  if ('EdgeRuntime' in globalThis) {
    const edgeRuntime = (globalThis as any).EdgeRuntime;
    return {
      runtime: 'vercel-edge',
      hasEnvVar: name => typeof process !== 'undefined' && process.env[name] !== undefined,
      preferredAdapter: detectVercelAdapter(),
      confidence: 100,
      capabilities: {
        supportsSQL: false,
        supportsHTTP: true,
        supportsTCP: false,
        supportsWebStreams: true,
      },
      metadata: {
        detectionMethod: 'vercel-edge-explicit',
        version: typeof edgeRuntime === 'string' ? edgeRuntime : undefined,
        userAgent:
          typeof globalThis !== 'undefined' && 'navigator' in globalThis
            ? (globalThis as any).navigator?.userAgent
            : undefined,
      },
    };
  }

  return null;
}

/**
 * Heuristic Vercel Edge Runtime detection (medium confidence)
 */
function detectVercelEdgeHeuristic(): RuntimeEnvironment | null {
  if (typeof globalThis === 'undefined') return null;

  // Check for Vercel-specific patterns
  const hasVercelEnv =
    typeof process !== 'undefined' &&
    (process.env.VERCEL === '1' ||
      process.env.VERCEL_ENV !== undefined ||
      process.env.VERCEL_URL !== undefined);

  const hasEdgeCapabilities =
    typeof Request !== 'undefined' &&
    typeof Response !== 'undefined' &&
    typeof fetch !== 'undefined' &&
    typeof ReadableStream !== 'undefined';

  if (hasVercelEnv && hasEdgeCapabilities) {
    return {
      runtime: 'vercel-edge',
      hasEnvVar: name => typeof process !== 'undefined' && process.env[name] !== undefined,
      preferredAdapter: detectVercelAdapter(),
      confidence: 80,
      capabilities: {
        supportsSQL: false,
        supportsHTTP: true,
        supportsTCP: false,
        supportsWebStreams: true,
      },
      metadata: {
        detectionMethod: 'vercel-edge-heuristic',
        platform: process?.env?.VERCEL_ENV || 'unknown',
      },
    };
  }

  return null;
}

/**
 * Detect the best adapter for Vercel Edge Runtime
 */
function detectVercelAdapter(): string {
  if (typeof process === 'undefined') return 'neon';

  const env = process.env;

  // Check for Vercel Postgres (which uses Neon)
  if (env.POSTGRES_PRISMA_URL) return 'neon';

  // Check for other providers
  if (env.DATABASE_URL) {
    const url = env.DATABASE_URL;
    if (url.includes('neon.tech')) return 'neon';
    if (url.includes('planetscale.com') || url.includes('psdb.cloud')) return 'planetscale';
    if (url.includes('turso.tech')) return 'turso';
  }

  // Default to Neon for Vercel Edge
  return 'neon';
}

/**
 * Explicit Cloudflare Workers detection (highest confidence)
 */
function detectCloudflareExplicit(): RuntimeEnvironment | null {
  if (typeof globalThis === 'undefined') return null;

  // Primary indicators: Cloudflare-specific globals
  const navigator = typeof globalThis !== 'undefined' ? (globalThis as any).navigator : undefined;
  const userAgent = navigator?.userAgent;

  if (userAgent === 'Cloudflare-Workers') {
    return {
      runtime: 'cloudflare',
      hasEnvVar: name =>
        typeof globalThis !== 'undefined' && (globalThis as any)[name] !== undefined,
      preferredAdapter: detectCloudflareAdapter(),
      confidence: 100,
      capabilities: {
        supportsSQL: true, // D1 support
        supportsHTTP: true,
        supportsTCP: true, // via connect() API
        supportsWebStreams: true,
      },
      metadata: {
        detectionMethod: 'cloudflare-explicit',
        userAgent,
        platform: 'cloudflare-workers',
      },
    };
  }

  return null;
}

/**
 * Heuristic Cloudflare Workers detection (medium confidence)
 */
function detectCloudflareHeuristic(): RuntimeEnvironment | null {
  if (typeof globalThis === 'undefined') return null;

  // Check for Cloudflare-specific patterns
  const hasCloudflareApis =
    typeof (globalThis as any).caches !== 'undefined' &&
    typeof (globalThis as any).addEventListener !== 'undefined' &&
    typeof (globalThis as any).fetch !== 'undefined';

  const hasCloudflareEnv =
    'CF_PAGES' in globalThis ||
    'CF_PAGES_COMMIT_SHA' in globalThis ||
    'CLOUDFLARE_D1_TOKEN' in globalThis ||
    'CF_WORKER' in globalThis;

  // Additional heuristic: no process.env but has fetch
  const hasWorkerProfile =
    typeof process === 'undefined' &&
    typeof fetch !== 'undefined' &&
    typeof Request !== 'undefined' &&
    typeof Response !== 'undefined';

  if ((hasCloudflareApis || hasCloudflareEnv) && hasWorkerProfile) {
    return {
      runtime: 'cloudflare',
      hasEnvVar: name =>
        typeof globalThis !== 'undefined' && (globalThis as any)[name] !== undefined,
      preferredAdapter: detectCloudflareAdapter(),
      confidence: 80,
      capabilities: {
        supportsSQL: true, // D1 support
        supportsHTTP: true,
        supportsTCP: true, // via connect() API
        supportsWebStreams: true,
      },
      metadata: {
        detectionMethod: 'cloudflare-heuristic',
        hasCloudflareApis,
        hasCloudflareEnv,
      },
    };
  }

  return null;
}

/**
 * Detect the best adapter for Cloudflare Workers
 */
function detectCloudflareAdapter(): string {
  // Check for D1 binding (most common in CF Workers)
  if (typeof globalThis !== 'undefined' && 'DB' in globalThis) return 'd1';

  // Check for environment variables
  if (typeof globalThis !== 'undefined') {
    const hasD1Token = 'CLOUDFLARE_D1_TOKEN' in globalThis;
    const hasNeonUrl =
      'DATABASE_URL' in globalThis &&
      typeof (globalThis as any).DATABASE_URL === 'string' &&
      (globalThis as any).DATABASE_URL.includes('neon.tech');
    const hasPlanetScaleUrl =
      'DATABASE_URL' in globalThis &&
      typeof (globalThis as any).DATABASE_URL === 'string' &&
      (globalThis as any).DATABASE_URL.includes('planetscale');

    if (hasD1Token) return 'd1';
    if (hasNeonUrl) return 'neon';
    if (hasPlanetScaleUrl) return 'planetscale';
  }

  // Default to D1 for Cloudflare
  return 'd1';
}

/**
 * Explicit Deno deployment detection (highest confidence)
 */
function detectDenoExplicit(): RuntimeEnvironment | null {
  if (typeof globalThis === 'undefined') return null;

  // Primary indicator: Deno global
  if ('Deno' in globalThis) {
    const deno = (globalThis as any).Deno;
    return {
      runtime: 'deno',
      hasEnvVar: name => deno?.env?.get?.(name) !== undefined,
      preferredAdapter: 'postgresql', // Deno has good PostgreSQL support
      confidence: 100,
      capabilities: {
        supportsSQL: false, // No local SQL
        supportsHTTP: true,
        supportsTCP: true,
        supportsWebStreams: true,
      },
      metadata: {
        detectionMethod: 'deno-explicit',
        version: deno?.version?.deno || 'unknown',
        platform: 'deno',
      },
    };
  }

  return null;
}

/**
 * Node.js fallback detection
 */
function detectNodeJsFallback(): RuntimeEnvironment | null {
  // If we have process but no other runtime indicators
  if (typeof process !== 'undefined') {
    return createNodeJsEnvironment({
      confidence: 50,
      detectionMethod: 'nodejs-process-detected',
      platform: process.platform,
      version: process.version,
    });
  }

  return null;
}

/**
 * Create Node.js environment configuration
 */
function createNodeJsEnvironment(
  options: {
    confidence?: number;
    detectionMethod?: string;
    platform?: string;
    version?: string;
    userAgent?: string;
  } = {},
): RuntimeEnvironment {
  return {
    runtime: 'nodejs',
    hasEnvVar: name => typeof process !== 'undefined' && process.env[name] !== undefined,
    preferredAdapter: 'postgresql',
    confidence: options.confidence || 60,
    capabilities: {
      supportsSQL: true,
      supportsHTTP: true,
      supportsTCP: true,
      supportsWebStreams: false, // Node.js streams
    },
    metadata: {
      detectionMethod: options.detectionMethod || 'nodejs-fallback',
      platform: options.platform || (typeof process !== 'undefined' ? process.platform : 'unknown'),
      version: options.version || (typeof process !== 'undefined' ? process.version : 'unknown'),
      userAgent: options.userAgent,
    },
  };
}

/**
 * Validate runtime detection result
 */
export function validateRuntimeDetection(env: RuntimeEnvironment): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check confidence level
  if (env.confidence < 50) {
    issues.push(`Low confidence runtime detection (${env.confidence}%)`);
    suggestions.push('Consider setting explicit runtime environment variables');
  }

  // Validate capabilities vs adapter preference
  if (env.preferredAdapter === 'postgresql' && !env.capabilities.supportsTCP) {
    issues.push('Preferred PostgreSQL adapter requires TCP support but runtime lacks it');
    suggestions.push('Consider using an HTTP-based adapter like Neon or PlanetScale');
  }

  if (env.preferredAdapter === 'd1' && env.runtime !== 'cloudflare') {
    issues.push('D1 adapter preferred but not in Cloudflare Workers environment');
    suggestions.push('D1 adapter only works in Cloudflare Workers');
  }

  // Check for missing environment variable support
  if (!env.hasEnvVar('DATABASE_URL') && !env.hasEnvVar('POSTGRES_PRISMA_URL')) {
    suggestions.push('No database connection string found in environment variables');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Get detailed runtime information for debugging
 */
export function getRuntimeInfo(): {
  detected: RuntimeEnvironment;
  validation: ReturnType<typeof validateRuntimeDetection>;
  alternatives: RuntimeEnvironment[];
} {
  const detected = detectRuntime();
  const validation = validateRuntimeDetection(detected);

  // Try all detection methods to show alternatives
  const alternatives: RuntimeEnvironment[] = [];
  const methods = [
    () => detectVercelEdgeExplicit(),
    () => detectVercelEdgeHeuristic(),
    () => detectCloudflareExplicit(),
    () => detectCloudflareHeuristic(),
    () => detectDenoExplicit(),
    () => detectNodeJsFallback(),
  ];

  for (const method of methods) {
    try {
      const result = method();
      if (result && result.runtime !== detected.runtime) {
        alternatives.push(result);
      }
    } catch {
      // Ignore detection failures
    }
  }

  return { detected, validation, alternatives };
}

/**
 * Check if the current runtime supports a specific adapter
 */
export function isAdapterSupported(adapter: string, runtime?: RuntimeEnvironment): boolean {
  const env = runtime || detectRuntime();

  switch (adapter) {
    case 'postgresql':
      return env.runtime === 'nodejs' || env.runtime === 'deno';

    case 'neon':
      return env.capabilities.supportsHTTP;

    case 'planetscale':
      return env.capabilities.supportsHTTP;

    case 'turso':
      return env.capabilities.supportsHTTP;

    case 'd1':
      return env.runtime === 'cloudflare';

    case 'sqlite':
      return env.runtime === 'nodejs';

    default:
      return false;
  }
}

/**
 * Get all supported adapters for the current runtime
 */
export function getSupportedAdapters(runtime?: RuntimeEnvironment): string[] {
  const env = runtime || detectRuntime();
  const adapters: string[] = [];

  // Add adapters based on runtime capabilities
  if (env.capabilities.supportsHTTP) {
    adapters.push('neon', 'planetscale', 'turso');
  }

  if (env.runtime === 'cloudflare') {
    adapters.push('d1');
  }

  if (env.runtime === 'nodejs') {
    adapters.push('postgresql', 'sqlite');
  }

  if (env.runtime === 'deno' && env.capabilities.supportsTCP) {
    adapters.push('postgresql');
  }

  return adapters;
}

/**
 * Validate that required environment variables are present for an adapter
 */
export function validateAdapterEnvironment(
  adapter: string,
  runtime?: RuntimeEnvironment,
): {
  isValid: boolean;
  missingVars: string[];
  suggestions: string[];
} {
  const env = runtime || detectRuntime();
  const missingVars: string[] = [];
  const suggestions: string[] = [];

  switch (adapter) {
    case 'postgresql':
      if (!env.hasEnvVar('DATABASE_URL')) {
        missingVars.push('DATABASE_URL');
        suggestions.push('Set DATABASE_URL to your PostgreSQL connection string');
      }
      break;

    case 'neon':
      if (!env.hasEnvVar('DATABASE_URL') && !env.hasEnvVar('POSTGRES_PRISMA_URL')) {
        missingVars.push('DATABASE_URL or POSTGRES_PRISMA_URL');
        suggestions.push('Set DATABASE_URL or POSTGRES_PRISMA_URL for Neon connection');
      }
      break;

    case 'planetscale':
      if (!env.hasEnvVar('DATABASE_URL')) {
        missingVars.push('DATABASE_URL');
        suggestions.push('Set DATABASE_URL to your PlanetScale connection string');
      }
      break;

    case 'turso':
      if (!env.hasEnvVar('TURSO_DATABASE_URL') && !env.hasEnvVar('DATABASE_URL')) {
        missingVars.push('TURSO_DATABASE_URL or DATABASE_URL');
        suggestions.push('Set TURSO_DATABASE_URL or DATABASE_URL for Turso connection');
      }
      break;

    case 'd1':
      if (env.runtime !== 'cloudflare') {
        suggestions.push('D1 adapter only works in Cloudflare Workers environment');
        return { isValid: false, missingVars: [], suggestions };
      }
      // D1 typically uses bindings, not env vars
      break;

    case 'sqlite':
      // SQLite can work with default file
      break;

    default:
      suggestions.push(`Unknown adapter '${adapter}'`);
      return { isValid: false, missingVars: [], suggestions };
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    suggestions,
  };
}

/**
 * Get adapter compatibility matrix for current runtime
 */
export function getAdapterCompatibility(runtime?: RuntimeEnvironment): {
  adapter: string;
  supported: boolean;
  reason?: string;
  confidence: 'high' | 'medium' | 'low';
}[] {
  const env = runtime || detectRuntime();

  const adapters = ['postgresql', 'neon', 'planetscale', 'turso', 'd1', 'sqlite'];

  return adapters.map(adapter => {
    const supported = isAdapterSupported(adapter, env);
    const envValidation = validateAdapterEnvironment(adapter, env);

    let confidence: 'high' | 'medium' | 'low' = 'high';
    let reason: string | undefined;

    if (!supported) {
      confidence = 'low';
      reason = `Not supported in ${env.runtime} runtime`;
    } else if (!envValidation.isValid) {
      confidence = 'medium';
      reason = `Missing: ${envValidation.missingVars.join(', ')}`;
    } else if (env.confidence < 70) {
      confidence = 'medium';
      reason = 'Low runtime detection confidence';
    }

    return {
      adapter,
      supported,
      reason,
      confidence,
    };
  });
}
