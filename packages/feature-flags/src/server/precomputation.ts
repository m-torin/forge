import { logError, logInfo, logWarn } from '@repo/observability';
import { evaluate, precompute, serialize } from 'flags/next';

/**
 * Modern precomputation using the v4+ SDK pattern
 * This replaces our manual precomputation with official API
 */

/**
 * Precompute flags for middleware with performance tracking
 */
export async function precomputeFlags<T extends readonly any[]>(
  flags: T,
  context: any,
  options: {
    enableMetrics?: boolean;
    timeout?: number;
  } = {},
): Promise<string> {
  const { enableMetrics = true, timeout = 5000 } = options;
  const startTime = Date.now();

  try {
    // Use the modern precomputation API
    const code = await Promise.race([
      precompute(flags),
      new Promise<never>((_resolve, reject) =>
        setTimeout(() => reject(new Error('Precomputation timeout')), timeout),
      ),
    ]);

    const duration = Date.now() - startTime;

    if (enableMetrics) {
      logInfo('Flags precomputed successfully', {
        flagCount: flags.length,
        duration,
        codeLength: code.length,
        context: Object.keys(context || {}),
      });
    }

    return code;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(error instanceof Error ? error : new Error('Flag precomputation failed'), {
      flagCount: flags.length,
      duration,
      context: 'precomputation',
    });

    throw error;
  }
}

/**
 * Evaluate flags manually (useful for debugging)
 */
export async function evaluateFlags<T extends readonly any[]>(
  flags: T,
  context: any,
  options: {
    enableMetrics?: boolean;
  } = {},
): Promise<any> {
  const { enableMetrics = true } = options;
  const startTime = Date.now();

  try {
    const values = await evaluate(flags);
    const duration = Date.now() - startTime;

    if (enableMetrics) {
      logInfo('Flags evaluated successfully', {
        flagCount: flags.length,
        duration,
        values: Object.keys(values),
      });
    }

    return values;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(error instanceof Error ? error : new Error('Flag evaluation failed'), {
      flagCount: flags.length,
      duration,
      context: 'evaluation',
    });

    throw error;
  }
}

/**
 * Serialize flag values to code (useful for custom scenarios)
 */
export async function serializeFlagValues<T extends readonly any[]>(
  flags: T,
  values: any,
  options: {
    enableMetrics?: boolean;
  } = {},
): Promise<string> {
  const { enableMetrics = true } = options;
  const startTime = Date.now();

  try {
    const code = await serialize(flags, values);
    const duration = Date.now() - startTime;

    if (enableMetrics) {
      logInfo('Flag values serialized successfully', {
        flagCount: flags.length,
        duration,
        codeLength: code.length,
      });
    }

    return code;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(error instanceof Error ? error : new Error('Flag serialization failed'), {
      flagCount: flags.length,
      duration,
      context: 'serialization',
    });

    throw error;
  }
}

/**
 * Batch precompute multiple flag groups
 * Useful for complex applications with multiple flag sets
 */
export async function batchPrecompute(
  flagGroups: Array<{
    name: string;
    flags: readonly any[];
    context: any;
  }>,
  options: {
    enableMetrics?: boolean;
    failFast?: boolean;
  } = {},
): Promise<Array<{ name: string; code: string; error?: Error }>> {
  const { enableMetrics = true, failFast = false } = options;
  const startTime = Date.now();

  const results = await Promise.allSettled(
    flagGroups.map(async ({ name, flags, context }) => {
      try {
        const code = await precomputeFlags(flags, context, { enableMetrics: false });
        return { name, code };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(`Failed to precompute ${name}`);

        if (failFast) {
          throw err;
        }

        return { name, code: '', error: err };
      }
    }),
  );

  const finalResults = results.map((result, index) => {
    const { name } = flagGroups[index];

    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        name,
        code: '',
        error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
      };
    }
  });

  const duration = Date.now() - startTime;
  const successful = finalResults.filter(r => !r.error).length;
  const failed = finalResults.length - successful;

  if (enableMetrics) {
    logInfo('Batch precomputation completed', {
      total: flagGroups.length,
      successful,
      failed,
      duration,
    });
  }

  if (failed > 0) {
    logWarn(`${failed} flag groups failed to precompute`, {
      failures: finalResults
        .filter(r => r.error)
        .map(r => ({ name: r.name, error: r.error?.message })),
    });
  }

  return finalResults;
}

/**
 * Precompute flags with caching
 * Useful for expensive flag computations
 */
export async function precomputeWithCache<T extends readonly any[]>(
  flags: T,
  context: any,
  options: {
    cacheKey: string;
    cacheDuration?: number;
    enableMetrics?: boolean;
  },
): Promise<string> {
  const { cacheKey, cacheDuration = 300000, enableMetrics = true } = options; // 5 minutes default

  // Simple in-memory cache (in production, use Redis or similar)
  const cache = globalThis.__flagPrecomputeCache || (globalThis.__flagPrecomputeCache = new Map());

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    if (enableMetrics) {
      logInfo('Using cached precomputed flags', { cacheKey });
    }
    return cached.code;
  }

  // Precompute fresh
  const code = await precomputeFlags(flags, context, { enableMetrics });

  // Cache the result
  cache.set(cacheKey, {
    code,
    timestamp: Date.now(),
  });

  // Cleanup old cache entries (simple LRU)
  if (cache.size > 100) {
    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => b.timestamp - a.timestamp)
      .slice(0, 50);

    cache.clear();
    entries.forEach(([key, value]) => cache.set(key, value));
  }

  return code;
}

// Types for better DX
export type PrecomputeOptions = {
  enableMetrics?: boolean;
  timeout?: number;
};

export type BatchPrecomputeGroup = {
  name: string;
  flags: readonly any[];
  context: any;
};

export type BatchPrecomputeResult = {
  name: string;
  code: string;
  error?: Error;
};

// Global cache type augmentation
declare global {
  var __flagPrecomputeCache: Map<string, { code: string; timestamp: number }> | undefined;
}
