/**
 * Vercel Analytics Server Adapter - Standardized 3p-core implementation
 * Supports Node.js server environments
 */

import { BaseMinimalAdapter } from '@repo/3p-core/adapters/minimal-adapter';
import type {
  AnalyticsEvent,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
} from '@repo/3p-core/types';
import type { VercelConfig } from './adapter';

export class VercelServerAdapter extends BaseMinimalAdapter {
  private serverTrack:
    | ((name: string, data?: Record<string, any>, options?: { flags?: string[] }) => void)
    | null = null;

  constructor(config: VercelConfig) {
    super(config);
  }

  get provider() {
    return 'vercel' as const;
  }

  protected async doInitialize(): Promise<void> {
    try {
      // Dynamic import of the official @vercel/analytics/server package
      const { track } = await import('@vercel/analytics/server');
      this.serverTrack = track;
      this.log('info', 'Vercel Analytics server initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Vercel Analytics server: ${(error as Error).message}`);
    }
  }

  protected async doTrack(event: AnalyticsEvent): Promise<boolean> {
    if (!this.serverTrack) {
      this.log('error', 'Vercel Analytics server not initialized');
      return false;
    }

    try {
      const eventData = this.sanitizeProperties(event.properties || {});

      if (Object.keys(eventData).length > 0) {
        this.serverTrack(event.name, eventData);
      } else {
        this.serverTrack(event.name);
      }

      this.log('debug', 'Server event tracked successfully', {
        name: event.name,
        properties: eventData,
      });
      return true;
    } catch (error) {
      this.log('error', 'Failed to track server event', error);
      return false;
    }
  }

  protected async doIdentify(payload: IdentifyPayload): Promise<boolean> {
    // Vercel Analytics doesn't have native identify support
    // Track as a custom event instead
    try {
      if (!this.serverTrack) return false;

      this.serverTrack('User Identified', {
        user_id: payload.userId,
        ...this.sanitizeProperties(payload.traits || {}),
      });

      this.log('debug', 'Server user identified successfully', { userId: payload.userId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify user on server', error);
      return false;
    }
  }

  protected async doGroup(payload: GroupPayload): Promise<boolean> {
    try {
      if (!this.serverTrack) return false;

      this.serverTrack('Group Identified', {
        group_id: payload.groupId,
        user_id: payload.userId,
        ...this.sanitizeProperties(payload.traits || {}),
      });

      this.log('debug', 'Server group identified successfully', { groupId: payload.groupId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify group on server', error);
      return false;
    }
  }

  protected async doPage(payload: PagePayload): Promise<boolean> {
    try {
      if (this.serverTrack && payload.properties && Object.keys(payload.properties).length > 0) {
        this.serverTrack('Page Viewed', {
          page_name: payload.name,
          page_category: payload.category,
          ...this.sanitizeProperties(payload.properties),
        });

        this.log('debug', 'Server page tracked successfully', payload);
      }
      return true;
    } catch (error) {
      this.log('error', 'Failed to track page on server', error);
      return false;
    }
  }

  protected async doDestroy(): Promise<void> {
    this.serverTrack = null;
    this.log('info', 'Vercel Analytics server adapter destroyed');
  }

  // Server-specific features

  async trackWithFlags(name: string, data: Record<string, any>, flags: string[]): Promise<boolean> {
    try {
      if (!this.serverTrack) {
        await this.initialize();
      }

      if (this.serverTrack) {
        // Use official server feature flag support
        this.serverTrack(name, data, { flags });
        this.log('debug', 'Server event with flags tracked', { name, flags });
        return true;
      }
      return false;
    } catch (error) {
      this.log('error', 'Failed to track server event with flags', error);
      return false;
    }
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value !== null && value !== undefined) {
        // Server can handle more complex data types
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
