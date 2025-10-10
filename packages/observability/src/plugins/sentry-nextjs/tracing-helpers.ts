/**
 * Next.js specific tracing helpers
 * Provides utilities for instrumenting various Next.js features
 */

import * as Sentry from "@sentry/nextjs";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { NextRequest } from "next/server";
import {
  continueTraceInServerComponent,
  extractTraceHeaders,
} from "./distributed-tracing";

/**
 * Wrap a server component with tracing
 */
export function withServerComponentTracing<T>(
  name: string,
  fn: () => T | Promise<T>,
  options?: {
    op?: string;
    description?: string;
    tags?: Record<string, string>;
    data?: Record<string, any>;
  },
): T | Promise<T> {
  const {
    op = "server.component",
    description: _description,
    tags,
    data,
  } = options || {};

  // Start a new span for this component
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: {
        ...tags,
        ...data,
        "component.type": "server",
      },
    },
    () => fn(),
  );
}

/**
 * Wrap an API route handler with tracing
 */
export function withApiRouteTracing(
  handler: NextApiHandler,
  options?: {
    parameterize?: boolean;
    includeRequest?: boolean;
    includeResponse?: boolean;
  },
): NextApiHandler {
  const {
    parameterize = true,
    includeRequest = true,
    includeResponse = false,
  } = options || {};

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, url, headers } = req;

    // Extract trace headers from request
    const traceData = extractTraceHeaders(headers as Record<string, string>);

    // Create transaction name
    let transactionName = `${method} ${url}`;
    if (parameterize && req.query) {
      // Replace dynamic segments with placeholders
      Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === "string") {
          transactionName = transactionName.replace(value, `[${key}]`);
        }
      });
    }

    // Start transaction using v9 API
    return Sentry.startSpan(
      {
        name: transactionName,
        op: "http.server",
        attributes: {
          method,
          url,
          ...(includeRequest && {
            "http.query": JSON.stringify(req.query),
            "http.body":
              typeof req.body === "string"
                ? req.body
                : JSON.stringify(req.body),
          }),
          ...traceData,
        },
      },
      async (span) => {
        try {
          // Intercept response to capture status
          const originalJson = res.json;
          const originalSend = res.send;
          const originalEnd = res.end;

          res.json = function (data: any) {
            span.setStatus?.({ code: res.statusCode < 400 ? 1 : 2 });
            if (includeResponse) {
              span.setAttribute("response.data", JSON.stringify(data));
            }
            return originalJson.call(this, data);
          };

          res.send = function (data: any) {
            span.setStatus?.({ code: res.statusCode < 400 ? 1 : 2 });
            if (includeResponse && typeof data === "object") {
              span.setAttribute("response.data", JSON.stringify(data));
            }
            return originalSend.call(this, data);
          };

          res.end = function (chunk?: any, encoding?: any, cb?: any) {
            span.setStatus?.({ code: res.statusCode < 400 ? 1 : 2 });
            return originalEnd.call(this, chunk, encoding, cb);
          };

          // Execute handler
          await handler(req, res);
        } catch (error) {
          span.setStatus?.({ code: 2, message: "internal error" });
          throw error;
        }
      },
    );
  };
}

/**
 * Wrap a server action with tracing
 */
export async function withServerActionTracing<T>(
  name: string,
  fn: () => Promise<T>,
  options?: {
    formData?: FormData;
    headers?: Headers;
    recordResponse?: boolean;
  },
): Promise<T> {
  const { formData, headers, recordResponse = false } = options || {};

  // Extract trace context from headers if available
  const traceData = headers ? continueTraceInServerComponent(headers) : {};

  return Sentry.startSpan(
    {
      name,
      op: "server.action",
      attributes: {
        ...(traceData.traceId && { "trace.traceId": traceData.traceId }),
        ...(traceData.parentSpanId && {
          "trace.parentSpanId": traceData.parentSpanId,
        }),
        ...(traceData.parentSampled !== undefined && {
          "trace.parentSampled": traceData.parentSampled,
        }),
        ...(traceData.baggage && {
          "trace.baggage": JSON.stringify(traceData.baggage),
        }),
        ...(formData && {
          "server.action.formData": JSON.stringify(
            Object.fromEntries(formData.entries()),
          ),
        }),
      },
    },
    async (span) => {
      try {
        const result = await fn();

        if (recordResponse) {
          span.setAttribute("response.data", JSON.stringify(result));
        }

        span.setStatus?.({ code: 1 });
        return result;
      } catch (error) {
        span.setStatus?.({ code: 2, message: "internal error" });
        throw error;
      }
    },
  );
}

/**
 * Wrap a route handler (app router) with tracing
 */
export function withRouteHandlerTracing<T extends (...args: any[]) => any>(
  handler: T,
  options?: {
    route?: string;
    parameterize?: boolean;
  },
): T {
  const { route, parameterize = true } = options || {};

  return (async (...args: Parameters<T>) => {
    const [request, ...restArgs] = args as unknown as [
      NextRequest,
      ...unknown[],
    ];
    const { method, url, headers } = request;

    // Extract trace headers
    const traceData = continueTraceInServerComponent(headers);

    // Create transaction name
    let transactionName = `${method} ${route || new URL(url).pathname}`;
    if (parameterize) {
      // Replace UUIDs and common dynamic segments
      transactionName = transactionName
        .replace(
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
          "[id]",
        )
        .replace(/\b\d+\b/g, "[id]");
    }

    return Sentry.startSpan(
      {
        name: transactionName,
        op: "http.server",
        attributes: {
          method,
          url,
          route,
          ...(traceData.traceId && { "trace.traceId": traceData.traceId }),
          ...(traceData.parentSpanId && {
            "trace.parentSpanId": traceData.parentSpanId,
          }),
          ...(traceData.parentSampled !== undefined && {
            "trace.parentSampled": traceData.parentSampled,
          }),
          ...(traceData.baggage && {
            "trace.baggage": JSON.stringify(traceData.baggage),
          }),
        },
      },
      async (span) => {
        try {
          const response = await handler(request, ...restArgs);

          // Set status from response
          if (response instanceof Response) {
            span.setStatus?.({ code: response.status < 400 ? 1 : 2 });
          }

          return response;
        } catch (error) {
          span.setStatus?.({ code: 2, message: "internal error" });
          throw error;
        }
      },
    );
  }) as T;
}

/**
 * Create a span for a database query
 */
export async function withDatabaseSpan<T>(
  operation: string,
  fn: () => Promise<T>,
  options?: {
    db?: string;
    table?: string;
    query?: string;
  },
): Promise<T> {
  const { db, table, query } = options || {};

  return Sentry.startSpan(
    {
      name: `db.${operation}`,
      op: "db",
      attributes: {
        "db.system": db || "unknown",
        ...(table && { "db.table": table }),
        ...(query && { "db.statement": query }),
      },
    },
    () => fn(),
  );
}

/**
 * Create a span for an external HTTP request
 */
export async function withHttpSpan<T>(
  url: string,
  fn: () => Promise<T>,
  options?: {
    method?: string;
    statusCode?: number;
  },
): Promise<T> {
  const { method = "GET", statusCode } = options || {};
  const urlObj = new URL(url);

  return Sentry.startSpan(
    {
      name: `${method} ${urlObj.hostname}${urlObj.pathname}`,
      op: "http.client",
      attributes: {
        "http.method": method,
        "http.url": url,
        "http.host": urlObj.hostname,
        ...(statusCode && { "http.status_code": statusCode }),
      },
    },
    () => fn(),
  );
}

/**
 * Create a span for cache operations
 */
export async function withCacheSpan<T>(
  operation: "get" | "set" | "delete" | "revalidate",
  key: string,
  fn: () => Promise<T>,
  options?: {
    hit?: boolean;
    ttl?: number;
  },
): Promise<T> {
  const { hit, ttl } = options || {};

  return Sentry.startSpan(
    {
      name: `cache.${operation}`,
      op: "cache",
      attributes: {
        "cache.key": key,
        "cache.operation": operation,
        ...(hit !== undefined && { "cache.hit": hit }),
        ...(ttl !== undefined && { "cache.ttl": ttl }),
      },
    },
    () => fn(),
  );
}

/**
 * Measure and record a Web Vital
 */
export function recordWebVital(
  name: string,
  value: number,
  options?: {
    unit?: string;
    vital?: boolean;
  },
): void {
  const { unit = "millisecond", vital = true } = options || {};

  const span = Sentry.getActiveSpan();
  if (span) {
    // In v9, use setAttribute for span attributes
    span.setAttribute(`${name}.value`, value);
    span.setAttribute(`${name}.unit`, unit);

    if (vital) {
      span.setAttribute(`vital.${name}`, value > 0 ? "good" : "poor");
    }
  }
}

/**
 * Helper to parameterize dynamic route segments
 */
export function parameterizePath(
  path: string,
  params?: Record<string, string | string[]>,
): string {
  let parameterized = path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Replace catch-all segments - use safe string replacement
        const searchValue = `/${value.join("/")}`;
        parameterized = parameterized.replace(searchValue, `/[...${key}]`);
      } else {
        // Replace single segments - use indexOf and replace
        const searchValue = `/${value}`;
        const index = parameterized.indexOf(searchValue);
        if (index !== -1) {
          const before = parameterized.substring(0, index);
          const after = parameterized.substring(index + searchValue.length);
          parameterized = before + `/[${key}]` + after;
        }
      }
    });
  }

  // Replace common patterns
  parameterized = parameterized
    // UUIDs
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "[id]",
    )
    // Numbers
    .replace(/\/\d+/g, "/[id]")
    // Hashes
    .replace(/\/[0-9a-f]{32,}/g, "/[hash]");

  return parameterized;
}
