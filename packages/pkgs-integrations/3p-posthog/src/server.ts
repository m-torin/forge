/**
 * PostHog Node.js server integration
 */

import { PostHogAdapter } from './client';
import type { PostHogConfig } from './types';

export class PostHogServerAnalytics extends PostHogAdapter {
  constructor(config: PostHogConfig) {
    // Ensure server-optimized configuration
    super({
      ...config,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      session_recording: undefined, // Not available server-side
      flushAt: config.flushAt || 20,
      flushInterval: config.flushInterval || 10000,
      requestTimeout: config.requestTimeout || 30000,
    });
  }

  // Server-specific methods for advanced PostHog features
  public async getPersonProfile(distinctId: string): Promise<any> {
    const config = this.getConfig();

    if (!config.personalApiKey || !config.projectId) {
      this.log('warn', 'Personal API key and project ID required for person profile lookup');
      return null;
    }

    try {
      // This would make an API call to PostHog's REST API
      const response = await fetch(
        `${config.host}/api/projects/${config.projectId}/persons/?distinct_id=${distinctId}`,
        {
          headers: {
            Authorization: `Bearer ${config.personalApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results?.[0] || null;
    } catch (error) {
      this.log('error', 'Failed to get person profile', error);
      return null;
    }
  }

  public async createCohort(
    name: string,
    filters: any[],
    description?: string,
  ): Promise<string | null> {
    const config = this.getConfig();

    if (!config.personalApiKey || !config.projectId) {
      this.log('warn', 'Personal API key and project ID required for cohort creation');
      return null;
    }

    try {
      const response = await fetch(`${config.host}/api/projects/${config.projectId}/cohorts/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.personalApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          filters: { properties: filters },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const cohort = await response.json();
      return cohort.id;
    } catch (error) {
      this.log('error', 'Failed to create cohort', error);
      return null;
    }
  }

  public async batchCapture(events: any[]): Promise<boolean> {
    try {
      const serverClient = (this as any).serverClient;
      if (!serverClient) {
        this.log('error', 'Server client not initialized');
        return false;
      }

      events.forEach(event => {
        serverClient.capture(event);
      });

      return true;
    } catch (error) {
      this.log('error', 'Failed to batch capture events', error);
      return false;
    }
  }
}

export function createServerAnalytics(config: PostHogConfig) {
  return new PostHogServerAnalytics(config);
}
