import type { WorkflowContext } from '@upstash/workflow';

/**
 * URL Group configuration for fan-out messaging
 */
export interface URLGroupConfig {
  /** List of endpoint URLs to fan out to */
  endpoints: string[];
  /** Name of the URL group */
  groupName: string;
  /** Optional headers to include with all requests */
  headers?: Record<string, string>;
  /** Retry configuration for each endpoint */
  retries?: number;
}

/**
 * Fan-out messaging options
 */
export interface FanOutOptions {
  /** Optional delay before sending */
  delay?: number;
  /** Message payload to send to all endpoints */
  payload: any;
  /** Timeout for each endpoint call */
  timeout?: number;
  /** URL group configuration */
  urlGroup: URLGroupConfig;
  /** Whether to wait for all endpoints to respond */
  waitForAll?: boolean;
}

/**
 * Result from fan-out operation
 */
export interface FanOutResult {
  failedEndpoints: number;
  groupName: string;
  results: {
    endpoint: string;
    success: boolean;
    response?: any;
    error?: string;
    duration: number;
  }[];
  successfulEndpoints: number;
  totalEndpoints: number;
}

/**
 * Send a message to all endpoints in a URL group (fan-out)
 */
export async function fanOutToURLGroup(
  context: WorkflowContext<any>,
  stepName: string,
  options: FanOutOptions,
): Promise<FanOutResult> {
  return context.run(stepName, async () => {
    const { urlGroup, payload, timeout = 30000, waitForAll = false } = options;
    const { endpoints, groupName, headers = {}, retries = 3 } = urlGroup;

    console.log(`[URL-GROUP] Fan-out to ${endpoints.length} endpoints in group "${groupName}"`);

    const results: FanOutResult['results'] = [];
    let successfulEndpoints = 0;
    let failedEndpoints = 0;

    // Function to call a single endpoint
    const callEndpoint = async (endpoint: string): Promise<void> => {
      const startTime = Date.now();

      try {
        const response = await context.call('fanout-endpoint', {
          url: endpoint,
          body: payload,
          headers: {
            'Content-Type': 'application/json',
            'X-Fan-Out': 'true',
            'X-URL-Group': groupName,
            ...headers,
          },
          method: 'POST',
          retries,
          timeout,
        });

        results.push({
          duration: Date.now() - startTime,
          endpoint,
          response: response.body,
          success: true,
        });
        successfulEndpoints++;
      } catch (error) {
        results.push({
          duration: Date.now() - startTime,
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        });
        failedEndpoints++;
      }
    };

    if (waitForAll) {
      // Wait for all endpoints to complete
      await Promise.all(endpoints.map(callEndpoint));
    } else {
      // Fire and forget - start all calls but don't wait
      endpoints.forEach(callEndpoint);

      // Give a brief moment for calls to start
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const result: FanOutResult = {
      failedEndpoints,
      groupName,
      results,
      successfulEndpoints,
      totalEndpoints: endpoints.length,
    };

    console.log(
      `[URL-GROUP] Fan-out complete: ${successfulEndpoints}/${endpoints.length} successful`,
    );
    return result;
  });
}

/**
 * Create a URL group configuration
 */
export function createURLGroup(config: {
  groupName: string;
  endpoints: string[];
  headers?: Record<string, string>;
  retries?: number;
}): URLGroupConfig {
  return {
    endpoints: config.endpoints,
    groupName: config.groupName,
    headers: config.headers,
    retries: config.retries || 3,
  };
}

/**
 * Notify multiple URL groups with different payloads
 */
export async function notifyMultipleGroups(
  context: WorkflowContext<any>,
  stepName: string,
  notifications: {
    urlGroup: URLGroupConfig;
    payload: any;
    delay?: number;
  }[],
): Promise<FanOutResult[]> {
  return context.run(stepName, async () => {
    const results: FanOutResult[] = [];

    for (const notification of notifications) {
      if (notification.delay) {
        await new Promise((resolve) => setTimeout(resolve, notification.delay));
      }

      const result = await fanOutToURLGroup(
        context,
        `notify-group-${notification.urlGroup.groupName}`,
        {
          urlGroup: notification.urlGroup,
          payload: notification.payload,
          waitForAll: true,
        },
      );

      results.push(result);
    }

    return results;
  });
}

/**
 * Send different payloads to different endpoints in a group
 */
export async function fanOutWithCustomPayloads(
  context: WorkflowContext<any>,
  stepName: string,
  config: {
    groupName: string;
    endpointPayloads: {
      endpoint: string;
      payload: any;
      headers?: Record<string, string>;
    }[];
    retries?: number;
  },
): Promise<FanOutResult> {
  return context.run(stepName, async () => {
    const { endpointPayloads, groupName, retries = 3 } = config;

    console.log(
      `[URL-GROUP] Custom fan-out to ${endpointPayloads.length} endpoints in group "${groupName}"`,
    );

    const results: FanOutResult['results'] = [];
    let successfulEndpoints = 0;
    let failedEndpoints = 0;

    await Promise.all(
      endpointPayloads.map(async ({ endpoint, headers = {}, payload }) => {
        const startTime = Date.now();

        try {
          const response = await context.call('custom-fanout-endpoint', {
            url: endpoint,
            body: payload,
            headers: {
              'Content-Type': 'application/json',
              'X-Fan-Out': 'custom',
              'X-URL-Group': groupName,
              ...headers,
            },
            method: 'POST',
            retries,
          });

          results.push({
            duration: Date.now() - startTime,
            endpoint,
            response: response.body,
            success: true,
          });
          successfulEndpoints++;
        } catch (error) {
          results.push({
            duration: Date.now() - startTime,
            endpoint,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          });
          failedEndpoints++;
        }
      }),
    );

    return {
      failedEndpoints,
      groupName,
      results,
      successfulEndpoints,
      totalEndpoints: endpointPayloads.length,
    };
  });
}

/**
 * Predefined URL groups for common use cases
 */
export const commonURLGroups = {
  /**
   * Analytics endpoints
   */
  analytics: (endpoints: string[]) =>
    createURLGroup({
      endpoints,
      groupName: 'analytics',
      headers: {
        'X-Event-Type': 'analytics',
      },
      retries: 2,
    }),

  /**
   * Notification endpoints
   */
  notifications: (endpoints: string[]) =>
    createURLGroup({
      endpoints,
      groupName: 'notifications',
      headers: {
        'X-Event-Type': 'notification',
      },
      retries: 3,
    }),

  /**
   * Webhook endpoints
   */
  webhooks: (endpoints: string[]) =>
    createURLGroup({
      endpoints,
      groupName: 'webhooks',
      headers: {
        'X-Event-Type': 'webhook',
      },
      retries: 1,
    }),

  /**
   * Audit log endpoints
   */
  auditLogs: (endpoints: string[]) =>
    createURLGroup({
      endpoints,
      groupName: 'audit-logs',
      headers: {
        'X-Event-Type': 'audit',
      },
      retries: 3,
    }),
};
