/**
 * Client-safe analytics wrapper
 * This provides analytics functionality without server-only restrictions
 */

interface TrackEvent {
  event: string;
  properties?: Record<string, any>;
}

class ClientAnalytics {
  async track(event: string, properties?: Record<string, any>): Promise<void> {
    try {
      // Send analytics event to our API
      await fetch('/api/analytics/track', {
        body: JSON.stringify({ event, properties }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    try {
      await fetch('/api/analytics/identify', {
        body: JSON.stringify({ properties, userId }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }
}

export const analytics = new ClientAnalytics();