/**
 * Edge runtime optimization for Sentry Next.js
 */

/**
 * Edge runtime configuration
 */
export interface EdgeRuntimeConfig {
  /**
   * Minimal payload mode
   * @default true
   */
  minimalMode?: boolean;

  /**
   * Max event size in bytes
   * @default 200000 (200KB)
   */
  maxEventSize?: number;

  /**
   * Enable compression
   * @default true
   */
  enableCompression?: boolean;

  /**
   * Sampling configuration for edge
   */
  sampling?: {
    /**
     * Base sample rate
     */
    rate?: number;

    /**
     * Dynamic sampling based on edge location
     */
    byLocation?: Record<string, number>;

    /**
     * Dynamic sampling based on route
     */
    byRoute?: Record<string, number>;
  };

  /**
   * Features to disable in edge runtime
   */
  disabledFeatures?: (
    | "breadcrumbs"
    | "contexts"
    | "tags"
    | "user"
    | "extra"
    | "attachments"
  )[];
}

/**
 * Create edge-optimized Sentry configuration
 */
export function createEdgeOptimizedConfig(
  baseConfig: any,
  edgeConfig: EdgeRuntimeConfig = {},
): any {
  const {
    minimalMode = true,
    maxEventSize = 200000,
    enableCompression = true,
    sampling = {},
    disabledFeatures = [],
  } = edgeConfig;

  // Edge-optimized configuration
  const config: any = {
    ...baseConfig,

    // Reduce payload size
    maxBreadcrumbs: minimalMode ? 10 : 50,
    attachStacktrace: !minimalMode,

    // Edge-specific transport options
    transportOptions: {
      ...baseConfig.transportOptions,
      // Use minimal headers
      headers: {
        "Content-Type": "application/json",
        ...(enableCompression && { "Content-Encoding": "gzip" }),
      },
    },

    // Custom before send to optimize payload
    beforeSend: (event: any, hint: any) => {
      // Apply edge location sampling
      if (sampling.byLocation && process.env.VERCEL_REGION) {
        const locationRate = sampling.byLocation[process.env.VERCEL_REGION];
        if (locationRate !== undefined && Math.random() > locationRate) {
          return null;
        }
      }

      // Apply route-based sampling
      if (sampling.byRoute && event.request?.url) {
        const route = new URL(event.request.url).pathname;
        const routeRate = Object.entries(sampling.byRoute).find(([pattern]) => {
          try {
            // Use safe string matching instead of RegExp
            return route.includes(pattern) || route.startsWith(pattern);
          } catch {
            // If pattern is invalid, treat as no match
            return false;
          }
        })?.[1];

        if (routeRate !== undefined && Math.random() > routeRate) {
          return null;
        }
      }

      // Optimize event for edge runtime
      const optimizedEvent = optimizeEventForEdge(event, {
        maxEventSize,
        minimalMode,
        disabledFeatures,
      });

      // Call original beforeSend if exists
      if (baseConfig.beforeSend) {
        return baseConfig.beforeSend(optimizedEvent, hint);
      }

      return optimizedEvent;
    },

    // Disable features not needed in edge
    integrations: (integrations: any[]) => {
      const baseIntegrations =
        typeof baseConfig.integrations === "function"
          ? baseConfig.integrations(integrations)
          : integrations;

      // Filter out heavy integrations for edge
      return baseIntegrations.filter((integration: any) => {
        const name = integration.name;

        // Remove heavy integrations in minimal mode
        if (minimalMode) {
          const heavyIntegrations = [
            "ExtraErrorData",
            "ReportingObserver",
            "SessionTiming",
          ];
          if (heavyIntegrations.includes(name)) {
            return false;
          }
        }

        return true;
      });
    },
  };

  // Set appropriate sample rate
  if (sampling.rate !== undefined) {
    config.tracesSampleRate = sampling.rate;
  }

  return config;
}

/**
 * Optimize event payload for edge runtime
 */
function optimizeEventForEdge(
  event: any,
  options: {
    maxEventSize: number;
    minimalMode: boolean;
    disabledFeatures: string[];
  },
): any {
  const { maxEventSize, minimalMode, disabledFeatures } = options;

  // Clone event to avoid mutations
  const optimized = JSON.parse(JSON.stringify(event));

  // Remove disabled features
  for (const feature of disabledFeatures) {
    delete optimized[feature];
  }

  // Minimal mode optimizations
  if (minimalMode) {
    // Truncate large strings
    truncateStrings(optimized, 1000);

    // Remove non-essential contexts
    if (optimized.contexts) {
      const essentialContexts = ["os", "runtime", "app"];
      for (const key of Object.keys(optimized.contexts)) {
        if (!essentialContexts.includes(key)) {
          delete optimized.contexts[key];
        }
      }
    }

    // Limit breadcrumbs
    if (optimized.breadcrumbs && optimized.breadcrumbs.values) {
      optimized.breadcrumbs.values = optimized.breadcrumbs.values.slice(-10);
    }

    // Simplify stack traces
    if (optimized.exception?.values) {
      for (const exception of optimized.exception.values) {
        if (exception.stacktrace?.frames) {
          // Keep only top 10 frames
          exception.stacktrace.frames = exception.stacktrace.frames.slice(-10);

          // Remove source context
          for (const frame of exception.stacktrace.frames) {
            delete frame.pre_context;
            delete frame.context_line;
            delete frame.post_context;
            delete frame.vars;
          }
        }
      }
    }
  }

  // Check event size and truncate if needed
  let eventString = JSON.stringify(optimized);
  if (eventString.length > maxEventSize) {
    // Progressive trimming
    if (optimized.extra) {
      optimized.extra = { trimmed: true };
      eventString = JSON.stringify(optimized);
    }

    if (eventString.length > maxEventSize && optimized.breadcrumbs) {
      optimized.breadcrumbs = { values: [] };
      eventString = JSON.stringify(optimized);
    }

    if (eventString.length > maxEventSize && optimized.contexts) {
      optimized.contexts = { trimmed: true };
      eventString = JSON.stringify(optimized);
    }
  }

  return optimized;
}

/**
 * Recursively truncate strings in an object
 */
function truncateStrings(obj: any, maxLength: number): void {
  if (typeof obj === "string") {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => truncateStrings(item, maxLength));
    return;
  }

  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "string" && obj[key].length > maxLength) {
        obj[key] = obj[key].substring(0, maxLength) + "...";
      } else if (typeof obj[key] === "object") {
        truncateStrings(obj[key], maxLength);
      }
    }
  }
}

/**
 * Edge-specific integrations
 */

/**
 * Edge Performance Integration
 * Lightweight performance monitoring for edge runtime
 */
export const edgePerformanceIntegration = () => ({
  name: "EdgePerformance",
  setupOnce: () => {},
  setup: (client: any) => {
    if (typeof globalThis.performance === "undefined") return;

    // Track edge function execution time
    const startTime = performance.now();

    // Add cleanup on response
    if (globalThis.addEventListener) {
      globalThis.addEventListener("beforeunload", () => {
        const duration = performance.now() - startTime;

        client.addBreadcrumb({
          category: "edge.performance",
          message: "Edge function completed",
          data: {
            duration,
            region: process.env.VERCEL_REGION || "unknown",
            runtime: "edge",
          },
        });
      });
    }
  },
});

/**
 * Edge location context integration
 */
export const edgeLocationIntegration = () => ({
  name: "EdgeLocation",
  setupOnce: () => {},
  setup: (client: any) => {
    client.configureScope((scope: any) => {
      scope.setContext("edge", {
        region: process.env.VERCEL_REGION || "unknown",
        requestId: process.env.VERCEL_REQUEST_ID,
        env: process.env.VERCEL_ENV || process.env.NODE_ENV,
        runtime: "edge",
      });

      scope.setTag("edge.region", process.env.VERCEL_REGION || "unknown");
      scope.setTag("runtime", "edge");
    });
  },
});

/**
 * Generate edge runtime configuration
 */
export function generateEdgeRuntimeConfig(
  environment: "development" | "preview" | "production",
): EdgeRuntimeConfig {
  switch (environment) {
    case "development":
      return {
        minimalMode: false,
        maxEventSize: 500000,
        enableCompression: false,
        sampling: {
          rate: 1.0,
        },
      };

    case "preview":
      return {
        minimalMode: true,
        maxEventSize: 200000,
        enableCompression: true,
        sampling: {
          rate: 0.5,
        },
      };

    case "production":
      return {
        minimalMode: true,
        maxEventSize: 100000,
        enableCompression: true,
        sampling: {
          rate: 0.1,
          byLocation: {
            iad1: 0.2, // US East
            sfo1: 0.2, // US West
            fra1: 0.15, // Europe
            hnd1: 0.1, // Asia
          },
          byRoute: {
            "^/api/critical": 1.0,
            "^/api/": 0.2,
            "^/": 0.05,
          },
        },
        disabledFeatures: ["attachments"],
      };
  }
}

/**
 * Edge runtime setup guide
 */
export const EDGE_RUNTIME_SETUP_GUIDE = `
# Edge Runtime Optimization Guide

## 1. Basic Edge Configuration

\`\`\`typescript
// instrumentation-edge.ts
import * as Sentry from '@sentry/nextjs';
import { createEdgeOptimizedConfig } from '@repo/observability/plugins/sentry-nextjs/edge';

const baseConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
};

const edgeConfig = createEdgeOptimizedConfig(baseConfig, {
  minimalMode: true,
  maxEventSize: 100000, // 100KB limit
  sampling: {
    rate: 0.1,
    byLocation: {
      'iad1': 0.2,
      'sfo1': 0.2,
    },
  },
});

Sentry.init(edgeConfig);
\`\`\`

## 2. Edge-Specific Integrations

\`\`\`typescript
import { edgePerformanceIntegration, edgeLocationIntegration } from '@repo/observability/plugins/sentry-nextjs/edge';

Sentry.init({
  ...edgeConfig,
  integrations: [
    edgePerformanceIntegration(),
    edgeLocationIntegration(),
  ],
});
\`\`\`

## 3. Middleware Integration

\`\`\`typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export function middleware(request: NextRequest) {
  return Sentry.withEdgeMiddleware(request, () => {
    // Your middleware logic
    return NextResponse.next();
  });
}
\`\`\`

## 4. Performance Considerations

### Payload Size Optimization
- Enable minimal mode for production
- Limit breadcrumbs to 10
- Disable non-essential contexts
- Use aggressive sampling

### Latency Optimization
- Disable synchronous operations
- Use fire-and-forget for non-critical events
- Implement region-based sampling

### Memory Usage
- Avoid storing large objects
- Clear references after use
- Use streaming where possible

## 5. Monitoring Edge Performance

\`\`\`typescript
// Track edge function performance
export async function GET(request: Request) {
  return Sentry.startSpan({
    name: 'edge-api-handler',
    op: 'http.server',
  }, async (span) => {
    try {
      // Your logic here
      const result = await processRequest(request);
      
      span.setStatus({ code: 1 }); // 1 = ok
      return Response.json(result);
    } catch (error) {
      span.setStatus({ code: 2, message: 'internal error' }); // 2 = error
      Sentry.captureException(error);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}
\`\`\`

## 6. Best Practices

1. **Use Minimal Mode**: Always enable in production
2. **Sample Aggressively**: Edge functions handle high volume
3. **Optimize Payloads**: Remove unnecessary data
4. **Monitor Latency**: Track impact on response times
5. **Test Limits**: Verify payload sizes stay under limits
`;
