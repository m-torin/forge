/**
 * Custom PostHog adapter for Vercel Flags
 * This enables the Vercel Toolbar to work with PostHog feature flags
 *
 * Note: This is a simplified implementation that doesn't use @vercel/flags
 * due to API compatibility issues. For full Vercel Flags integration,
 * refer to the Vercel documentation.
 */

interface PostHogAdapterConfig {
  apiHost?: string;
  apiKey: string;
}

export function createPostHogAdapter(config: PostHogAdapterConfig) {
  return {
    async getProviderData() {
      // This would fetch flag metadata from PostHog API
      try {
        const response = await fetch(
          `${config.apiHost || 'https://app.posthog.com'}/api/projects/@current/feature_flags/`,
          {
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const flags = await response.json();
        return (
          flags.results?.map((flag: any) => ({
            description: flag.name,
            key: flag.key,
            options: [{ value: true }, { value: false }],
          })) || []
        );
      } catch (error) {
        console.error('Failed to fetch PostHog flags:', error);
        return [];
      }
    },
  };
}

/**
 * Simple flag function for PostHog integration
 * This is a basic implementation without Vercel Flags dependency
 */
export async function createPostHogFlag<T = boolean>(
  key: string,
  options?: {
    description?: string;
    defaultValue?: T;
  },
): Promise<T> {
  // 1. Check LOCAL_FLAGS (development)
  const localFlags = process.env.LOCAL_FLAGS || process.env.NEXT_PUBLIC_LOCAL_FLAGS;
  if (localFlags) {
    try {
      const flags = JSON.parse(localFlags);
      if (key in flags) {
        console.log(`[Feature Flag] Using local override for ${key}:`, flags[key]);
        return flags[key];
      }
    } catch (error) {
      console.error('[Feature Flag] Failed to parse LOCAL_FLAGS:', error);
    }
  }

  // 2. Check PostHog on the client
  if (typeof window !== 'undefined' && (window as any).posthog) {
    const value = (window as any).posthog.isFeatureEnabled(key);
    console.log(`[Feature Flag] PostHog client value for ${key}:`, value);
    return value ?? options?.defaultValue ?? (false as T);
  }

  // 3. Server-side PostHog check would go here
  // For now, we'll fall back to default

  // 4. Fallback to default
  console.log(`[Feature Flag] Using default value for ${key}:`, options?.defaultValue ?? false);
  return options?.defaultValue ?? (false as T);
}

/**
 * Example usage:
 *
 * export const darkModeFlag = createPostHogFlag('ui.dark-mode', {
 *   description: 'Enable dark mode UI',
 *   defaultValue: false,
 * });
 *
 * // In your component
 * const isDarkMode = await darkModeFlag();
 */
