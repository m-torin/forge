import { logWarn } from '@repo/observability/server/next';
import {
  DEFAULT_PERPLEXITY_TIER2_CONFIG,
  PERPLEXITY_PRESETS,
  PerplexityTier2Config,
} from '../models/perplexity';

/**
 * Parse Perplexity configuration from environment
 */
export function parsePerplexityConfig(configString?: string): PerplexityTier2Config {
  if (!configString) {
    return DEFAULT_PERPLEXITY_TIER2_CONFIG;
  }

  try {
    const parsed = JSON.parse(configString);

    // Handle preset configurations
    if (typeof parsed === 'string' && parsed in PERPLEXITY_PRESETS) {
      return PERPLEXITY_PRESETS[parsed as keyof typeof PERPLEXITY_PRESETS];
    }

    // Handle custom configuration
    if (typeof parsed === 'object') {
      return {
        ...DEFAULT_PERPLEXITY_TIER2_CONFIG,
        ...parsed,
        tier2: {
          ...DEFAULT_PERPLEXITY_TIER2_CONFIG.tier2,
          ...parsed.tier2,
        },
        search: {
          ...DEFAULT_PERPLEXITY_TIER2_CONFIG.search,
          ...parsed.search,
        },
        search_types: {
          ...DEFAULT_PERPLEXITY_TIER2_CONFIG.search_types,
          ...parsed.search_types,
        },
      };
    }

    return DEFAULT_PERPLEXITY_TIER2_CONFIG;
  } catch (error) {
    logWarn('Failed to parse Perplexity config, using defaults', {
      operation: 'perplexity_config_parse',
      error: error instanceof Error ? error.message : String(error),
      configString: configString?.slice(0, 100),
    });
    return DEFAULT_PERPLEXITY_TIER2_CONFIG;
  }
}

/**
 * Convert configuration to provider options
 */
export function perplexityConfigToProviderOptions(config: PerplexityTier2Config): any {
  const options: any = {};

  // Tier 2 features
  if (config.tier2?.enabled && config.tier2.return_images) {
    options.return_images = true;
  }

  // Search configuration
  if (config.search) {
    Object.entries(config.search).forEach(([key, value]) => {
      if (value !== undefined) {
        options[`search_${key}`] = value;
      }
    });
  }

  // Search type toggles
  if (config.search_types) {
    Object.entries(config.search_types).forEach(([key, value]) => {
      if (value !== undefined) {
        options[`search_use_${key.replace('_search', '')}`] = value;
      }
    });
  }

  return options;
}
