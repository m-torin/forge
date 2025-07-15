import type { Adapter } from 'flags';
import { flag } from 'flags/next';
import { identify } from '../shared/identify';

/**
 * Create a simple boolean feature flag with fallback
 */
export function createBooleanFlag(
  key: string,
  options: {
    description?: string;
    adapter: Adapter<boolean, any>;
    fallback?: boolean;
    options?: Array<{ label: string; value: boolean }>;
  },
) {
  return flag<boolean>({
    key,
    description: options.description,
    identify,
    adapter: options.adapter,
    defaultValue: options.fallback ?? false,
    options: options.options ?? [
      { label: 'Enabled', value: true },
      { label: 'Disabled', value: false },
    ],
  });
}

/**
 * Create a variant feature flag (A/B testing)
 */
export function createVariantFlag<T extends string>(
  key: string,
  variants: Array<{ label: string; value: T }>,
  options: {
    description?: string;
    adapter: Adapter<T, any>;
    fallback?: T;
  },
) {
  return flag<T>({
    key,
    description: options.description,
    identify,
    adapter: options.adapter,
    defaultValue: options.fallback ?? variants[0]?.value,
    options: variants as any,
  });
}

/**
 * Create a percentage rollout flag
 */
export function createRolloutFlag(
  key: string,
  options: {
    description?: string;
    adapter: Adapter<boolean, any>;
    percentage?: number;
  },
) {
  return flag<boolean>({
    key,
    description: options.description,
    identify,
    adapter: options.adapter,
    defaultValue: false,
    options: [
      { label: 'Enabled', value: true },
      { label: 'Disabled', value: false },
    ],
  });
}
