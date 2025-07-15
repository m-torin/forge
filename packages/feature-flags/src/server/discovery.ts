import { logError, logInfo } from '@repo/observability';
import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next';
import { safeEnv } from '../../env';

/**
 * Create a modern flags discovery endpoint using the v4+ pattern with native createFlagsDiscoveryEndpoint
 *
 * @example
 * ```typescript
 * // app/api/.well-known/vercel/flags/route.ts
 * import { createModernFlagsDiscoveryEndpoint } from '@repo/feature-flags/server/next';
 * import * as flags from '../../../../flags';
 *
 * export const GET = createModernFlagsDiscoveryEndpoint(async () => {
 *   return getProviderData(flags);
 * });
 * ```
 */
export function createModernFlagsDiscoveryEndpoint(
  getFlags: () => Promise<any>,
  options: {
    secret?: string;
    enableLogging?: boolean;
  } = {},
) {
  const env = safeEnv();
  const { secret: _secret = env.FLAGS_SECRET, enableLogging = true } = options;

  // Use the official createFlagsDiscoveryEndpoint from the modern SDK
  return createFlagsDiscoveryEndpoint(async () => {
    if (enableLogging) {
      logInfo('Flags discovery endpoint accessed', {
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const providerData = await getFlags();

      if (enableLogging) {
        logInfo('Flags discovery data generated', {
          flagCount: providerData.definitions?.length || 0,
          hasOverrides: !!providerData.overrideEncryptionMode,
        });
      }

      return providerData;
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to generate flags data'), {
        context: 'flags-discovery',
      });
      throw error;
    }
  });
}

/**
 * Provider data with additional metadata
 * Merges multiple providers and adds observability
 */
export async function getProviderDataWithMetadata(
  flagDefinitions: Record<string, any>,
  options: {
    includeMetadata?: boolean;
    enableAnalytics?: boolean;
  } = {},
) {
  const { includeMetadata = true, enableAnalytics = false } = options;
  const env = safeEnv();

  try {
    // Get base provider data
    const baseData = await getProviderData(flagDefinitions);

    // Add metadata if requested
    if (includeMetadata) {
      const enriched = {
        ...baseData,
        metadata: {
          ...((baseData as any).metadata || {}),
          generatedAt: new Date().toISOString(),
          sdkVersion: '4.0.0',
          totalFlags: baseData.definitions?.length || 0,
          environment: env.NODE_ENV || 'development',
          deployment: process.env.DEPLOYMENT_ID || 'local', // DEPLOYMENT_ID not in env schema
        },
      };

      // Add analytics integration if enabled
      if (enableAnalytics && typeof window !== 'undefined') {
        // Client-side analytics integration would go here
        logInfo('Analytics integration enabled for flags discovery');
      }

      return enriched;
    }

    return baseData;
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error('Failed to generate provider data with metadata'),
      { context: 'provider-data-metadata' },
    );
    throw error;
  }
}

/**
 * Merge multiple provider data sources
 * Useful for combining code-defined flags with external providers
 */
export async function mergeMultipleProviders(providers: Array<() => Promise<any>>): Promise<any> {
  try {
    const providerResults = await Promise.allSettled(providers.map(provider => provider()));

    const successfulResults = providerResults
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    if (successfulResults.length === 0) {
      throw new Error('All flag providers failed');
    }

    // Log any failed providers
    const failedCount = providerResults.length - successfulResults.length;
    if (failedCount > 0) {
      logError(new Error(`${failedCount} flag providers failed`), { context: 'provider-merge' });
    }

    // Merge definitions from all successful providers
    const mergedDefinitions = successfulResults.reduce((acc, data) => {
      if (data.definitions) {
        acc.push(...data.definitions);
      }
      return acc;
    }, []);

    // Use the first successful result as base and override definitions
    const baseResult = successfulResults[0];
    return {
      ...baseResult,
      definitions: mergedDefinitions,
      metadata: {
        ...baseResult.metadata,
        providersUsed: successfulResults.length,
        providersFailed: failedCount,
      },
    };
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to merge providers'), {
      context: 'provider-merge',
    });
    throw error;
  }
}
