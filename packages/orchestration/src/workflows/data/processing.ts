import { batchHTTPRequests, processBatches } from '../../runtime/features/batch-processing';
import {
  createFlowControl,
  type FlowControlConfig,
  runWithFlowControl,
} from '../../runtime/features/flow-control';
import { batchVerifySignatures, createSigningConfigFromEnv } from '../../runtime/features/request-signing';
import { createURLGroup, fanOutToURLGroup } from '../../runtime/features/url-groups';
import {
  parseTimeWindow,
  convertToCSV,
  convertToXML,
  aggregateByKey,
  calculateSuccessRate,
  calculateElapsedTime,
} from '../../utils/helpers';
import { devLog } from '../../utils/observability';
import { withWorkflowErrorHandling, withApiErrorHandling } from '../../utils/error-handling';
import { createResponse } from '../../utils/response';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Real-time Event Processing Configuration
 */
export interface EventProcessingConfig {
  eventBatch: {
    eventId: string;
    eventType: string;
    timestamp: string;
    data: any;
    source: string;
  }[];
  options?: {
    flowControl?: FlowControlConfig;
    customAggregation?: (events: any[]) => any;
    enableDeduplication?: boolean;
  };
  processingConfig: {
    batchSize: number;
    aggregationWindow: string; // e.g., "5m", "1h"
    outputTargets: string[]; // URLs for batch results
  };
  signatureValidation: boolean;
}

/**
 * Event Processing Result
 */
export interface EventProcessingResult {
  aggregatedBatches: number;
  aggregations: {
    batchId: string;
    eventCount: number;
    aggregatedData: any;
    outputResults: any;
  }[];
  metrics: {
    eventsPerSecond: number;
    successRate: string;
    averageBatchSize: number;
  };
  outputsSent: number;
  processedEvents: number;
  processingDuration: number;
}

/**
 * Process Real-time Event Batch
 */
export async function processEventBatch(
  context: WorkflowContext<any>,
  config: EventProcessingConfig,
): Promise<EventProcessingResult> {
  return withWorkflowErrorHandling(async () => {
    const startTime = Date.now();
    const { signatureValidation, eventBatch, options = {}, processingConfig } = config;

    devLog.workflow(context, `Processing ${eventBatch.length} events`);

    // Step 1: Verify signatures if enabled
    if (signatureValidation) {
      await context.run('verify-event-signatures', async () => {
        return withApiErrorHandling(async () => {
          const signingConfig = createSigningConfigFromEnv();
          if (!signingConfig) {
            throw new Error('Signature validation enabled but no signing config found');
          }

          const signatureRequests = eventBatch.map((event) => ({
            url: (event as any).sourceUrl,
            payload: JSON.stringify(event.data),
            signature: (event as any).signature || '',
            timestamp: Math.floor(new Date(event.timestamp).getTime() / 1000),
          }));

          const verificationResults = batchVerifySignatures(signatureRequests, signingConfig);
          const invalidSignatures = verificationResults.filter((r) => !r.valid);

          if (invalidSignatures.length > 0) {
            devLog.warn(
              `${invalidSignatures.length} events have invalid signatures`,
            );
            // Remove invalid events from batch
            invalidSignatures.forEach((invalid) => {
              eventBatch.splice(invalid.index, 1);
            });
          }

          devLog.info(
            `Signature verification complete: ${eventBatch.length} valid events`,
          );
        }, 'signature-verification');
      });
    }

    // Step 2: Group events by type and time window
    const eventGroups = await context.run('group-events', async () => {
      const groups = new Map<string, any[]>();
      const windowMs = parseTimeWindow(processingConfig.aggregationWindow);

      eventBatch.forEach((event) => {
        // Create time-based groups
        const eventTime = new Date(event.timestamp).getTime();
        const windowStart = Math.floor(eventTime / windowMs) * windowMs;
        const groupKey = `${event.eventType}-${windowStart}`;

        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(event);
      });

      devLog.info(`Grouped events into ${groups.size} time-based batches`);
      return Array.from(groups.entries()).map(([key, events]) => ({
        batchId: key,
        events,
      }));
    });

    // Step 3: Process and aggregate each group
    const flowControl =
      options.flowControl ||
      createFlowControl({
        key: 'event-processing',
        parallelism: 5,
        ratePerSecond: 20,
      });

    const aggregationResults = await runWithFlowControl(
      context,
      'aggregate-event-groups',
      async () => {
        return processBatches(
          context,
          'process-event-batches',
          eventGroups,
          async (group) => {
            return processEventGroup(context, group, processingConfig, options.customAggregation);
          },
          {
            batchSize: processingConfig.batchSize,
            continueOnError: true,
            delayBetweenBatches: 500,
            maxConcurrentBatches: 3,
          },
        );
      },
      flowControl,
    );

    // Step 4: Send aggregated results to output targets
    const outputResults = await context.run('send-aggregated-outputs', async () => {
      if (processingConfig.outputTargets.length === 0) {
        return { outputsSent: 0, results: [] };
      }

      const successfulBatches = aggregationResults.batches
        .filter((batch) => batch.successfulItems > 0)
        .flatMap((batch) => batch.results);

      if (successfulBatches.length === 0) {
        return { outputsSent: 0, results: [] };
      }

      // Create URL group for outputs
      const outputGroup = createURLGroup({
        endpoints: processingConfig.outputTargets,
        groupName: 'event-processing-outputs',
        headers: {
          'X-Batch-Count': successfulBatches.length.toString(),
          'X-Event-Processing': 'true',
        },
      });

      // Send each batch result to all output targets
      const outputPromises = successfulBatches.map(async (batchResult, index) => {
        const outputPayload = {
          aggregatedData: batchResult.aggregatedData,
          batchId: batchResult.batchId,
          eventCount: batchResult.eventCount,
          metadata: {
            batchIndex: index,
            totalBatches: successfulBatches.length,
          },
          processedAt: new Date().toISOString(),
        };

        return fanOutToURLGroup(context, `output-batch-${index}`, {
          urlGroup: outputGroup,
          payload: outputPayload,
          waitForAll: true,
        });
      });

      const results = await Promise.allSettled(outputPromises);
      const successfulOutputs = results.filter((r) => r.status === 'fulfilled').length;

      return {
        outputsSent: successfulOutputs,
        results: results.map((r) =>
          r.status === 'fulfilled' ? r.value : { error: (r as any).reason },
        ),
      };
    });

    // Step 5: Generate metrics and summary
    const processingDuration = calculateElapsedTime(startTime);
    const successfulBatches = aggregationResults.batches.filter((b) => b.successfulItems > 0);
    const totalProcessedEvents = successfulBatches.reduce(
      (sum, batch) => sum + batch.processedItems,
      0,
    );

    const metrics = {
      averageBatchSize:
        successfulBatches.length > 0
          ? Math.round(totalProcessedEvents / successfulBatches.length)
          : 0,
      eventsPerSecond: Math.round((totalProcessedEvents / processingDuration) * 1000 * 100) / 100,
      successRate: calculateSuccessRate(totalProcessedEvents, eventBatch.length),
    };

    return {
      aggregatedBatches: successfulBatches.length,
      aggregations: successfulBatches.map((batch) => batch.results).flat(),
      metrics,
      outputsSent: outputResults.outputsSent,
      processedEvents: totalProcessedEvents,
      processingDuration,
    };
  }, 'processEventBatch');
}

/**
 * Process a single event group
 */
async function processEventGroup(
  context: WorkflowContext<any>,
  group: { batchId: string; events: any[] },
  processingConfig: any,
  customAggregation?: (events: any[]) => any,
): Promise<{
  batchId: string;
  eventCount: number;
  aggregatedData: any;
  outputResults: any;
}> {
  const { batchId, events } = group;

  // Default aggregation using utility functions
  const defaultAggregation = (events: any[]) => {
    const eventsByType = aggregateByKey(
      events,
      (event) => event.eventType,
      () => 1
    );

    const eventsBySource = aggregateByKey(
      events,
      (event) => event.source,
      () => 1
    );

    const totalEvents = events.length;
    const typeCount = Object.keys(eventsByType).length;
    const sourceCount = Object.keys(eventsBySource).length;

    return {
      eventsBySource,
      eventsByType,
      summary: {
        averageEventsPerType: typeCount > 0 ? Math.round(totalEvents / typeCount) : 0,
        uniqueSources: sourceCount,
        uniqueTypes: typeCount,
      },
      timeWindow: {
        end: Math.max(...events.map((e) => new Date(e.timestamp).getTime())),
        start: Math.min(...events.map((e) => new Date(e.timestamp).getTime())),
      },
      totalEvents,
    };
  };

  const aggregationFunction = customAggregation || defaultAggregation;
  const aggregatedData = aggregationFunction(events);

  return {
    aggregatedData,
    batchId,
    eventCount: events.length,
    outputResults: null, // Will be populated when sent to outputs
  };
}


/**
 * Real-time Stream Processing
 */
export async function processEventStream(
  context: WorkflowContext<any>,
  config: {
    streamId: string;
    events: any[];
    processingRules: {
      filters?: { field: string; operator: 'eq' | 'gt' | 'lt' | 'contains'; value: any }[];
      transformations?: { type: 'map' | 'filter' | 'reduce'; function: string }[];
      routing?: { condition: string; target: string }[];
    };
    outputConfig: {
      targets: string[];
      format: 'json' | 'csv' | 'xml';
      compression?: 'gzip' | 'none';
    };
  },
): Promise<{
  streamId: string;
  processedEvents: number;
  filteredEvents: number;
  routedEvents: Record<string, number>;
  outputs: any[];
}> {
  return withWorkflowErrorHandling(async () => {
    const { events, outputConfig, processingRules, streamId } = config;

    devLog.workflow(context, `Processing stream ${streamId} with ${events.length} events`);

    // Step 1: Apply filters
    const filteredEvents = await context.run('apply-filters', async () => {
      if (!processingRules.filters || processingRules.filters.length === 0) {
        return events;
      }

      return events.filter((event) => {
        return processingRules.filters!.every((filter) => {
          const fieldValue = event.data[filter.field];

          switch (filter.operator) {
            case 'eq':
              return fieldValue === filter.value;
            case 'gt':
              return fieldValue > filter.value;
            case 'lt':
              return fieldValue < filter.value;
            case 'contains':
              return String(fieldValue).includes(filter.value);
            default:
              return true;
          }
        });
      });
    });

    // Step 2: Apply transformations
    const transformedEvents = await context.run('apply-transformations', async () => {
      if (!processingRules.transformations || processingRules.transformations.length === 0) {
        return filteredEvents;
      }

      let result = filteredEvents;

      for (const transformation of processingRules.transformations) {
        switch (transformation.type) {
          case 'map':
            // Apply mapping function (simplified)
            result = result.map((event) => ({
              ...event,
              data: { ...event.data, transformed: true },
            }));
            break;

          case 'filter':
            // Additional filtering (simplified)
            result = result.filter((event) => event.data.value !== null);
            break;

          case 'reduce':
            // Aggregation using utility function
            const aggregatedValue = aggregateByKey(
              result,
              () => 'total',
              (event) => event.data.value || 0
            );
            result = [
              {
                data: {
                  aggregatedValue: aggregatedValue.total || 0,
                  count: result.length,
                },
                eventId: 'aggregated',
                eventType: 'aggregation',
                source: 'stream-processor',
                timestamp: new Date().toISOString(),
              },
            ];
            break;
        }
      }

      return result;
    });

    // Step 3: Route events
    const routedEvents = await context.run('route-events', async () => {
      const routing: Record<string, any[]> = {};

      if (!processingRules.routing || processingRules.routing.length === 0) {
        routing.default = transformedEvents;
        return routing;
      }

      transformedEvents.forEach((event) => {
        let routed = false;

        for (const rule of processingRules.routing!) {
          // Simplified condition evaluation
          if (event.eventType === rule.condition || rule.condition === 'all') {
            if (!routing[rule.target]) {
              routing[rule.target] = [];
            }
            routing[rule.target].push(event);
            routed = true;
            break;
          }
        }

        if (!routed) {
          if (!routing.default) {
            routing.default = [];
          }
          routing.default.push(event);
        }
      });

      return routing;
    });

    // Step 4: Send to outputs
    const outputs = await context.run('send-to-outputs', async () => {
      const outputPromises = Object.entries(routedEvents).map(async ([target, targetEvents]) => {
        if (targetEvents.length === 0) return null;

        // Format events based on output config
        let formattedData;
        switch (outputConfig.format) {
          case 'json':
            formattedData = JSON.stringify(targetEvents, null, 2);
            break;
          case 'csv':
            formattedData = convertToCSV(targetEvents);
            break;
          case 'xml':
            formattedData = convertToXML(targetEvents);
            break;
          default:
            formattedData = JSON.stringify(targetEvents);
        }

        // Send to each output target
        const requests = outputConfig.targets.map((url) => ({
          id: `${target}-${url}`,
          url,
          body: {
            data: formattedData,
            eventCount: targetEvents.length,
            format: outputConfig.format,
            streamId,
            target,
          },
          headers: {
            'Content-Type': 'application/json',
            'X-Event-Count': targetEvents.length.toString(),
            'X-Stream-ID': streamId,
            'X-Target': target,
          },
          method: 'POST',
        }));

        return batchHTTPRequests(context, `output-${target}`, requests, {
          batchSize: 3,
          continueOnError: true,
          maxConcurrentBatches: 2,
        });
      });

      const results = await Promise.allSettled(outputPromises);
      return results.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean);
    });

    const routedEventCounts = Object.fromEntries(
      Object.entries(routedEvents).map(([target, targetEvents]) => [target, targetEvents.length]),
    );

    return {
      filteredEvents: filteredEvents.length,
      outputs,
      processedEvents: events.length,
      routedEvents: routedEventCounts,
      streamId,
    };
  }, 'processEventStream');
}
