/**
 * Core v4 Functions - Missing from the current implementation
 * These functions are essential for full flags v4 compliance
 */

import { logInfo, logWarn } from '@repo/observability';
import type { ApiData, FlagDefinition, FlagValuesType } from './types';

/**
 * Merge multiple provider data sources into a unified result
 * Essential for enterprise multi-provider setups
 *
 * @param providerDataArray - Array of provider data objects to merge
 * @returns Merged provider data with combined flags and metadata
 *
 * @example
 * ```typescript
 * const merged = await mergeProviderData([
 *   getProviderData(codeFlags),
 *   getStatsigProviderData({ apiKey: '...', projectId: '...' }),
 *   getPostHogProviderData({ personalApiKey: '...', projectId: '...' })
 * ]);
 * ```
 */
export async function mergeProviderData(providerDataArray: ApiData[]): Promise<ApiData> {
  if (!Array.isArray(providerDataArray) || providerDataArray.length === 0) {
    logWarn('mergeProviderData called with empty or invalid array');
    return {
      definitions: {},
      values: {},
      overrides: {},
      treatments: {},
    };
  }

  logInfo('Merging provider data', {
    providerCount: providerDataArray.length,
    sources: providerDataArray.map((data, index) => ({
      index,
      definitionCount: Object.keys(data.definitions || {}).length,
      valueCount: Object.keys(data.values || {}).length,
      overrideCount: Object.keys(data.overrides || {}).length,
      treatmentCount: Object.keys(data.treatments || {}).length,
    })),
  });

  const merged: ApiData = {
    definitions: {},
    values: {},
    overrides: {},
    treatments: {},
  };

  // Merge all provider data in order (later sources override earlier ones)
  for (const [index, providerData] of providerDataArray.entries()) {
    if (!providerData || typeof providerData !== 'object') {
      logWarn('Skipping invalid provider data', { index, type: typeof providerData });
      continue;
    }

    // Merge definitions - preserve metadata from all sources
    if (providerData.definitions && typeof providerData.definitions === 'object') {
      for (const [key, definition] of Object.entries(providerData.definitions)) {
        if (merged.definitions[key]) {
          // Merge definitions, with later sources taking precedence
          merged.definitions[key] = {
            ...merged.definitions[key],
            ...definition,
            // Preserve origin information for debugging
            origin: definition.origin || merged.definitions[key].origin,
            // Combine options if both exist
            options: definition.options || merged.definitions[key].options,
          };
          logInfo('Merged flag definition', { key, source: index });
        } else {
          merged.definitions[key] = { ...definition };
          logInfo('Added flag definition', { key, source: index });
        }
      }
    }

    // Merge values - later sources override
    if (providerData.values && typeof providerData.values === 'object') {
      Object.assign(merged.values, providerData.values);
    }

    // Merge overrides - later sources override
    if (providerData.overrides && typeof providerData.overrides === 'object') {
      Object.assign(merged.overrides, providerData.overrides);
    }

    // Merge treatments - later sources override
    if (providerData.treatments && typeof providerData.treatments === 'object') {
      Object.assign(merged.treatments, providerData.treatments);
    }
  }

  const finalStats = {
    totalDefinitions: Object.keys(merged.definitions).length,
    totalValues: Object.keys(merged.values).length,
    totalOverrides: Object.keys(merged.overrides).length,
    totalTreatments: Object.keys(merged.treatments).length,
  };

  logInfo('Provider data merge complete', finalStats);

  return merged;
}

/**
 * Report resolved flag values for analytics and debugging
 * Core reporting functionality for the v4 SDK
 *
 * @param flagName - Name of the flag being reported
 * @param value - The resolved value to report
 * @param context - Additional context for the report
 *
 * @example
 * ```typescript
 * reportValue('checkout-flow', 'variant-a', {
 *   userId: 'user_123',
 *   experiment: 'checkout-optimization'
 * });
 * ```
 */
export function reportValue(flagName: string, value: any, context?: Record<string, any>): void {
  if (!flagName || typeof flagName !== 'string') {
    logWarn('reportValue called with invalid flag name', { flagName, value });
    return;
  }

  const reportData = {
    flagName,
    value,
    timestamp: new Date().toISOString(),
    context: context || {},
  };

  logInfo('Flag value reported', reportData);

  // In a production implementation, this would:
  // 1. Send to analytics service (PostHog, Amplitude, etc.)
  // 2. Store in metrics database
  // 3. Trigger experiment exposure logging
  // 4. Update A/B test assignment tracking

  // For now, we log the report for debugging
  // TODO: Integrate with @repo/analytics when ready

  // Emit a custom event that can be caught by analytics systems
  if (typeof globalThis !== 'undefined' && 'dispatchEvent' in globalThis) {
    const event = new CustomEvent('flag-value-reported', {
      detail: reportData,
    });
    globalThis.dispatchEvent(event);
  }
}

/**
 * Generate static permutations for build-time optimization
 * Replaces unstable_generatePermutations from v3
 *
 * @param flags - Array of flag definitions to generate permutations for
 * @param options - Configuration options for generation
 * @returns Array of serialized flag permutation codes
 *
 * @example
 * ```typescript
 * // In getStaticPaths
 * const permutations = await generatePermutations([
 *   showBannerFlag.definition,
 *   checkoutFlowFlag.definition
 * ]);
 *
 * return {
 *   paths: permutations.map(code => ({ params: { code } })),
 *   fallback: 'blocking'
 * };
 * ```
 */
export async function generatePermutations(
  flags: FlagDefinition[],
  options: {
    maxPermutations?: number;
    includeDefaults?: boolean;
    filterByEnvironment?: string;
  } = {},
): Promise<string[]> {
  if (!Array.isArray(flags) || flags.length === 0) {
    logWarn('generatePermutations called with invalid flags array');
    return [];
  }

  const { maxPermutations = 100, includeDefaults = true, filterByEnvironment } = options;

  logInfo('Generating flag permutations', {
    flagCount: flags.length,
    maxPermutations,
    includeDefaults,
    filterByEnvironment,
  });

  const validFlags = flags.filter(flag => {
    if (!flag || typeof flag !== 'object' || !flag.key) {
      logWarn('Skipping invalid flag definition', { flag });
      return false;
    }
    return true;
  });

  if (validFlags.length === 0) {
    logWarn('No valid flags found for permutation generation');
    return [];
  }

  const permutations: string[] = [];

  // Generate combinations based on flag options
  const generateCombinations = (flagIndex: number, currentValues: FlagValuesType): void => {
    if (flagIndex >= validFlags.length) {
      // Generate serialized code for this combination
      const code = Buffer.from(JSON.stringify(currentValues)).toString('base64url');
      permutations.push(code);
      return;
    }

    if (permutations.length >= maxPermutations) {
      return; // Stop if we've reached the max
    }

    const flag = validFlags[flagIndex];
    const possibleValues: any[] = [];

    // Determine possible values for this flag
    if (flag.options && Array.isArray(flag.options)) {
      // Use explicit options if provided
      possibleValues.push(...flag.options.map(opt => opt.value));
    } else if (flag.defaultValue !== undefined) {
      // For boolean flags, generate true/false
      if (typeof flag.defaultValue === 'boolean') {
        possibleValues.push(true, false);
      } else {
        // For other types, include default and a few variants
        possibleValues.push(flag.defaultValue);
        if (typeof flag.defaultValue === 'string') {
          possibleValues.push('variant-a', 'variant-b');
        } else if (typeof flag.defaultValue === 'number') {
          possibleValues.push(0, 1, 2);
        }
      }
    } else {
      // Fallback for flags without clear options
      possibleValues.push(true, false);
    }

    // Generate combinations for each possible value
    for (const value of possibleValues.slice(0, 3)) {
      // Limit to 3 values per flag
      generateCombinations(flagIndex + 1, {
        ...currentValues,
        [flag.key]: value,
      });
    }
  };

  // Start generation
  generateCombinations(0, {});

  // Include default permutation if requested
  if (includeDefaults && permutations.length < maxPermutations) {
    const defaultValues: FlagValuesType = {};
    for (const flag of validFlags) {
      defaultValues[flag.key] = flag.defaultValue;
    }
    const defaultCode = Buffer.from(JSON.stringify(defaultValues)).toString('base64url');
    if (!permutations.includes(defaultCode)) {
      permutations.unshift(defaultCode); // Add at the beginning
    }
  }

  logInfo('Flag permutations generated', {
    generatedCount: permutations.length,
    truncated: permutations.length >= maxPermutations,
  });

  return permutations.slice(0, maxPermutations);
}

/**
 * Enhanced flag value decoding for static generation
 * Companion to generatePermutations for reading permutation codes
 *
 * @param code - Base64url encoded permutation code
 * @returns Decoded flag values object
 */
export function decodePermutation(code: string): FlagValuesType {
  try {
    if (!code || typeof code !== 'string') {
      logWarn('Invalid permutation code provided', { code });
      return {};
    }

    const decoded = Buffer.from(code, 'base64url').toString('utf-8');
    const values = JSON.parse(decoded);

    if (typeof values !== 'object' || values === null) {
      logWarn('Decoded permutation is not a valid object', { decoded });
      return {};
    }

    return values;
  } catch (error) {
    logWarn('Failed to decode permutation code', { code, error });
    return {};
  }
}
