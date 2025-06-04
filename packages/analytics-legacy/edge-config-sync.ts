/**
 * PostHog to Edge Config Sync
 * This would sync PostHog feature flags to Vercel Edge Config
 * for ultra-low latency reads
 */

import { get } from '@vercel/edge-config';

interface PostHogFlag {
  active: boolean;
  filters?: any[];
  key: string;
  rollout_percentage?: number;
}

/**
 * Sync PostHog flags to Edge Config
 * This would typically be run as a cron job or webhook
 */
export async function syncPostHogToEdgeConfig() {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error('Missing PostHog credentials');
  }

  try {
    // Fetch flags from PostHog
    const response = await fetch(
      `https://app.posthog.com/api/projects/${projectId}/feature_flags/`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const data = await response.json();
    const flags = data.results as PostHogFlag[];

    // Transform to Edge Config format
    const edgeConfigData = flags.reduce(
      (acc, flag) => {
        acc[flag.key] = {
          enabled: flag.active,
          filters: flag.filters || [],
          rollout: flag.rollout_percentage || 100,
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    // Update Edge Config
    const edgeConfigResponse = await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        body: JSON.stringify({
          items: Object.entries(edgeConfigData).map(([key, value]) => ({
            key,
            operation: 'upsert',
            value,
          })),
        }),
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      },
    );

    if (!edgeConfigResponse.ok) {
      throw new Error(`Failed to update Edge Config: ${edgeConfigResponse.statusText}`);
    }

    console.log(`Successfully synced ${flags.length} flags to Edge Config`);
    return { flagCount: flags.length, success: true };
  } catch (error) {
    console.error('Failed to sync PostHog flags to Edge Config:', error);
    throw error;
  }
}

/**
 * Read flag from Edge Config (ultra-fast)
 */
export async function getFlagFromEdgeConfig(key: string): Promise<boolean> {
  try {
    const flagData = await get(key);
    return (flagData as any)?.enabled ?? false;
  } catch {
    return false;
  }
}

/**
 * API route for webhook sync
 * Create this in your app: /api/sync-flags/route.ts
 */
export async function POST() {
  try {
    await syncPostHogToEdgeConfig();
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Sync failed' }, { status: 500 });
  }
}
