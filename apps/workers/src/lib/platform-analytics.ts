import { devLog as logger } from '@repo/orchestration';

import type { WorkflowRunDoc } from './firestore-service';

import { Analytics } from '@repo/analytics/server';

// Initialize universal analytics for workers
const analytics = new Analytics({
  providers: {
    posthog: process.env.NEXT_PUBLIC_POSTHOG_KEY ? {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      config: {
        apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      }
    } : undefined,
    segment: process.env.SEGMENT_WRITE_KEY ? {
      writeKey: process.env.SEGMENT_WRITE_KEY,
    } : undefined,
    googleAnalytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    } : undefined,
  },
  debug: process.env.NODE_ENV === 'development',
  defaultAnonymousId: 'workers-system',
});

/**
 * Platform Analytics Service
 * Tracks system and platform events in addition to user actions
 */

// Platform event types
export type PlatformEventType =
  // Workflow lifecycle events
  | 'workflow.triggered'
  | 'workflow.started'
  | 'workflow.step.started'
  | 'workflow.step.completed'
  | 'workflow.step.failed'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.cancelled'
  | 'workflow.retried'
  | 'workflow.timeout'

  // System events
  | 'system.error'
  | 'system.rate_limit'
  | 'system.health_check'
  | 'system.sse.connected'
  | 'system.sse.disconnected'
  | 'system.sse.error'

  // Resource events
  | 'resource.queue.full'
  | 'resource.memory.high'
  | 'resource.cpu.high'

  // Integration events
  | 'integration.firestore.error'
  | 'integration.qstash.error'
  | 'integration.email.sent'
  | 'integration.email.failed'

  // Performance events
  | 'performance.slow_workflow'
  | 'performance.batch_processing'

  // User action events (existing)
  | 'user.workflow.trigger'
  | 'user.workflow.cancel'
  | 'user.workflow.approve'
  | 'user.workflow.reject'

  // Workflow management events
  | 'workflow.config.enabled'
  | 'workflow.config.disabled'
  | 'workflow.schedule.created'
  | 'workflow.execution.recorded';

interface PlatformEventData {
  organizationId?: string;
  userId?: string;
  workflowRunId?: string;
  // Common properties
  workflowType?: string;

  // Event-specific properties
  [key: string]: any;
}

class PlatformAnalyticsService {
  private static instance: PlatformAnalyticsService;
  private eventBuffer: {
    event: PlatformEventType;
    data: PlatformEventData;
    timestamp: number;
  }[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start periodic flush
    this.startPeriodicFlush();
  }

  static getInstance(): PlatformAnalyticsService {
    if (!PlatformAnalyticsService.instance) {
      PlatformAnalyticsService.instance = new PlatformAnalyticsService();
    }
    return PlatformAnalyticsService.instance;
  }

  /**
   * Track a platform event
   */
  track(event: PlatformEventType, data: PlatformEventData = {}): void {
    try {
      // Add timestamp and environment data
      const enrichedData = {
        ...data,
        environment: process.env.NODE_ENV || 'development',
        service: 'workers',
        timestamp: Date.now(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      };

      // Track immediately for critical events
      if (this.isCriticalEvent(event)) {
        analytics.track(event, enrichedData);
        logger.info(`Platform event tracked: ${event}`, enrichedData);
      } else {
        // Buffer non-critical events
        this.eventBuffer.push({
          data: enrichedData,
          event,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      logger.error('Failed to track platform event:', error);
    }
  }

  /**
   * Track workflow lifecycle events
   */
  trackWorkflowLifecycle(
    workflow: Partial<WorkflowRunDoc>,
    event: 'started' | 'completed' | 'failed' | 'cancelled',
  ): void {
    const eventMap = {
      cancelled: 'workflow.cancelled',
      completed: 'workflow.completed',
      failed: 'workflow.failed',
      started: 'workflow.started',
    } as const;

    this.track(eventMap[event], {
      duration: workflow.duration,
      error: workflow.error,
      organizationId: workflow.organizationId,
      status: workflow.status,
      stepCount: workflow.steps?.length,
      userId: workflow.userId,
      workflowRunId: workflow.workflowRunId,
      workflowType: workflow.workflowType,
    });
  }

  /**
   * Track workflow step events
   */
  trackWorkflowStep(
    workflowRunId: string,
    stepName: string,
    event: 'started' | 'completed' | 'failed',
    data: Record<string, any> = {},
  ): void {
    const eventMap = {
      completed: 'workflow.step.completed',
      failed: 'workflow.step.failed',
      started: 'workflow.step.started',
    } as const;

    this.track(eventMap[event], {
      stepName,
      workflowRunId,
      ...data,
    });
  }

  /**
   * Track system events
   */
  trackSystemEvent(
    type: 'error' | 'rate_limit' | 'health_check',
    data: Record<string, any> = {},
  ): void {
    this.track(`system.${type}` as PlatformEventType, data);
  }

  /**
   * Track SSE connection events
   */
  trackSSEEvent(
    type: 'connected' | 'disconnected' | 'error',
    data: Record<string, any> = {},
  ): void {
    this.track(`system.sse.${type}` as PlatformEventType, data);
  }

  /**
   * Track performance events
   */
  trackPerformanceEvent(workflowRunId: string, duration: number, stepCount: number): void {
    // Track slow workflows (> 30 seconds)
    if (duration > 30000) {
      this.track('performance.slow_workflow', {
        averageStepDuration: duration / stepCount,
        duration,
        stepCount,
        workflowRunId,
      });
    }
  }

  /**
   * Track resource events
   */
  trackResourceEvent(
    resource: 'queue' | 'memory' | 'cpu',
    status: 'full' | 'high',
    data: Record<string, any> = {},
  ): void {
    this.track(`resource.${resource}.${status}` as PlatformEventType, data);
  }

  /**
   * Track integration events
   */
  trackIntegrationEvent(
    integration: 'firestore' | 'qstash' | 'email',
    status: 'error' | 'sent' | 'failed',
    data: Record<string, any> = {},
  ): void {
    const event =
      integration === 'email' && status !== 'error'
        ? `integration.email.${status}`
        : `integration.${integration}.error`;

    this.track(event as PlatformEventType, data);
  }

  /**
   * Track user actions (existing functionality)
   */
  trackUserAction(
    action: 'trigger' | 'cancel' | 'approve' | 'reject',
    data: PlatformEventData,
  ): void {
    this.track(`user.workflow.${action}` as PlatformEventType, data);
  }

  /**
   * Batch track multiple events
   */
  trackBatch(events: { event: PlatformEventType; data: PlatformEventData }[]): void {
    events.forEach(({ data, event }) => this.track(event, data));
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    criticalEvents: number;
    recentEvents: { event: PlatformEventType; data: PlatformEventData; timestamp: number }[];
  }> {
    const now = Date.now();
    const ranges = {
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - ranges[timeRange];

    const recentEvents = this.eventBuffer.filter((e) => e.timestamp > cutoff);
    const eventsByType: Record<string, number> = {};
    let criticalEvents = 0;

    recentEvents.forEach(({ event }) => {
      eventsByType[event] = (eventsByType[event] || 0) + 1;
      if (this.isCriticalEvent(event)) {
        criticalEvents++;
      }
    });

    return {
      criticalEvents,
      eventsByType,
      recentEvents: recentEvents.slice(-10), // Last 10 events
      totalEvents: recentEvents.length,
    };
  }

  /**
   * Check if event is critical
   */
  private isCriticalEvent(event: PlatformEventType): boolean {
    const criticalEvents: PlatformEventType[] = [
      'workflow.failed',
      'workflow.timeout',
      'system.error',
      'system.rate_limit',
      'resource.queue.full',
      'resource.memory.high',
      'resource.cpu.high',
      'integration.firestore.error',
      'integration.qstash.error',
    ];
    return criticalEvents.includes(event);
  }

  /**
   * Flush buffered events
   */
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Batch track events
      for (const { data, event } of eventsToFlush) {
        await analytics.track(event, data);
      }

      logger.info(`Flushed ${eventsToFlush.length} platform events`);
    } catch (error) {
      logger.error('Failed to flush platform events:', error);
      // Re-add events to buffer on failure
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  /**
   * Start periodic flush
   */
  private startPeriodicFlush(): void {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  /**
   * Stop periodic flush
   */
  async stopPeriodicFlush(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    // Flush any remaining events
    await this.flushEvents();
    await analytics.flush();
  }
}

// Export singleton instance
export const platformAnalytics = PlatformAnalyticsService.getInstance();

// Re-export user-facing track function for backward compatibility
export const track = (event: string, data?: any) => {
  // Map old events to new platform events
  const eventMap: Record<string, PlatformEventType> = {
    'workflow.completed': 'workflow.completed',
    'workflow.triggered': 'user.workflow.trigger',
  };

  const platformEvent =
    eventMap[event] || ((event.startsWith('user.') ? event : `user.${event}`) as PlatformEventType);
  platformAnalytics.trackUserAction(platformEvent.replace('user.workflow.', '') as any, data);
};
