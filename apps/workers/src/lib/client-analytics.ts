/**
 * Client-side analytics wrapper
 * Only logs events, actual tracking happens server-side
 */

// Simple client-safe logger
const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(message, data);
    }
  },
};

export type PlatformEventType =
  // Workflow lifecycle events
  | 'workflow.triggered'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.cancelled'
  // System events
  | 'system.sse.connected'
  | 'system.sse.disconnected'
  | 'system.sse.error'
  // User action events
  | 'user.workflow.trigger'
  | 'user.workflow.cancel'
  | 'user.workflow.approve'
  | 'user.workflow.reject';

type EventData = Record<string, any>;

class ClientAnalytics {
  /**
   * Track an event (client-side logging only)
   */
  track(event: PlatformEventType, data: EventData = {}): void {
    logger.info(`[Analytics] ${event}`, data);

    // In production, you could send this to an API endpoint
    // that handles the server-side tracking
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // TODO: Send to analytics API endpoint
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify({ event, data }),
      // });
    }
  }

  /**
   * Track user action
   */
  trackUserAction(action: 'trigger' | 'cancel' | 'approve' | 'reject', data: EventData): void {
    this.track(`user.workflow.${action}` as PlatformEventType, data);
  }

  /**
   * Track SSE events
   */
  trackSSEEvent(type: 'connected' | 'disconnected' | 'error', data: EventData = {}): void {
    this.track(`system.sse.${type}` as PlatformEventType, data);
  }
}

// Export singleton instance
export const platformAnalytics = new ClientAnalytics();
