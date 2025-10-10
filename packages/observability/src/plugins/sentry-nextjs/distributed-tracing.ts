/**
 * Distributed tracing utilities for Sentry Next.js integration
 * Supports trace propagation across services and components
 */

import type {
  DynamicSamplingContext,
  PropagationContext,
  TraceparentData,
} from "../sentry/types";

/**
 * Escape special regex characters in a string
 */
function _escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Sentry trace header regex pattern
 * Format: TRACE_ID-SPAN_ID-SAMPLED
 */
const SENTRY_TRACE_REGEX = /^([0-9a-f]{32})-([0-9a-f]{16})-([01])$/;

/**
 * W3C Traceparent header regex pattern
 * Format: VERSION-TRACE_ID-SPAN_ID-FLAGS
 */
const TRACEPARENT_REGEX = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

/**
 * Extract traceparent data from a sentry-trace header
 */
export function extractTraceparentData(
  sentryTrace: string,
): TraceparentData | undefined {
  const match = sentryTrace.match(SENTRY_TRACE_REGEX);

  if (!match) {
    return undefined;
  }

  const [, traceId, parentSpanId, sampled] = match;

  return {
    traceId,
    parentSpanId,
    parentSampled: sampled === "1",
  };
}

/**
 * Extract traceparent data from a W3C traceparent header
 */
export function extractW3CTraceparent(
  traceparent: string,
): TraceparentData | undefined {
  const match = traceparent.match(TRACEPARENT_REGEX);

  if (!match) {
    return undefined;
  }

  const [, traceId, parentSpanId, flags] = match;
  const sampled = (parseInt(flags, 16) & 0x01) === 1;

  return {
    traceId,
    parentSpanId,
    parentSampled: sampled,
  };
}

/**
 * Continue a trace from incoming headers
 */
export function continueTrace(
  sentryTrace: string | undefined,
  baggage?: string | undefined,
): TraceparentData {
  // Try to extract from sentry-trace header
  if (sentryTrace) {
    const traceparentData = extractTraceparentData(sentryTrace);
    if (traceparentData) {
      // If baggage is provided, parse it for additional context
      if (baggage) {
        // Parse baggage header for additional trace context
        // Format: key1=value1,key2=value2
        const baggageEntries = baggage.split(",").reduce(
          (acc, entry) => {
            const [key, value] = entry.trim().split("=");
            if (key && value) {
              acc[key] = decodeURIComponent(value);
            }
            return acc;
          },
          {} as Record<string, string>,
        );

        // Extend traceparent data with baggage context
        return {
          ...traceparentData,
          baggage: baggageEntries,
        };
      }
      return traceparentData;
    }
  }

  // Generate new trace if no valid header found
  return generatePropagationContext();
}

/**
 * Generate a new propagation context
 */
export function generatePropagationContext(): PropagationContext {
  const traceId = generateTraceId();
  const spanId = generateSpanId();

  return {
    traceId,
    spanId,
    sampled: undefined, // Let Sentry decide based on sample rate
  };
}

/**
 * Generate a random trace ID (32 hex chars)
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Generate a random span ID (16 hex chars)
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Parse baggage header into dynamic sampling context
 */
export function parseBaggage(
  baggageHeader: string,
): DynamicSamplingContext | undefined {
  if (!baggageHeader) return undefined;

  const dsc: DynamicSamplingContext = {} as DynamicSamplingContext;
  const items = baggageHeader.split(",");

  for (const item of items) {
    const [key, value] = item.split("=").map((s) => s.trim());

    // Only include sentry- prefixed items
    if (key?.startsWith("sentry-")) {
      const dscKey = key.replace("sentry-", "").replace(/-/g, "_");
      dsc[dscKey] = decodeURIComponent(value || "");
    }
  }

  return Object.keys(dsc).length > 0 ? dsc : undefined;
}

/**
 * Create baggage string from dynamic sampling context
 */
export function createBaggage(dsc: DynamicSamplingContext): string {
  return Object.entries(dsc)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const baggageKey = `sentry-${key.replace(/_/g, "-")}`;
      return `${baggageKey}=${encodeURIComponent(value || "")}`;
    })
    .join(",");
}

/**
 * Create sentry-trace header value
 */
export function createSentryTraceHeader(
  traceId: string,
  spanId: string,
  sampled?: boolean,
): string {
  const sampledFlag = sampled === undefined ? "-" : sampled ? "1" : "0";
  return `${traceId}-${spanId}-${sampledFlag}`;
}

/**
 * Create W3C traceparent header value
 */
export function createTraceparentHeader(
  traceId: string,
  spanId: string,
  sampled?: boolean,
): string {
  const flags = sampled ? "01" : "00";
  return `00-${traceId}-${spanId}-${flags}`;
}

/**
 * Extract trace headers from Next.js request
 */
export function extractTraceHeaders(
  headers: Headers | Record<string, string>,
): {
  sentryTrace?: string;
  traceparent?: string;
  baggage?: string;
} {
  const getHeader = (name: string): string | undefined => {
    if (headers instanceof Headers) {
      return headers.get(name) || undefined;
    }
    return headers[name] || headers[name.toLowerCase()];
  };

  return {
    sentryTrace: getHeader("sentry-trace"),
    traceparent: getHeader("traceparent"),
    baggage: getHeader("baggage"),
  };
}

/**
 * Create trace headers for outgoing requests
 */
export function createTraceHeaders(
  traceId: string,
  spanId: string,
  sampled?: boolean,
  dsc?: DynamicSamplingContext,
): Record<string, string> {
  const headers: Record<string, string> = {
    "sentry-trace": createSentryTraceHeader(traceId, spanId, sampled),
    traceparent: createTraceparentHeader(traceId, spanId, sampled),
  };

  if (dsc) {
    headers.baggage = createBaggage(dsc);
  }

  return headers;
}

/**
 * Inject trace headers into fetch request
 */
export function injectTraceHeaders(
  init: RequestInit | undefined,
  traceId: string,
  spanId: string,
  sampled?: boolean,
  dsc?: DynamicSamplingContext,
): RequestInit {
  const traceHeaders = createTraceHeaders(traceId, spanId, sampled, dsc);

  const headers = new Headers(init?.headers);
  Object.entries(traceHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return {
    ...init,
    headers,
  };
}

/**
 * Helper to continue trace in server components
 */
export function continueTraceInServerComponent(
  headers: Headers,
): TraceparentData {
  const { sentryTrace, traceparent, baggage } = extractTraceHeaders(headers);

  // Try W3C traceparent first
  if (traceparent) {
    const data = extractW3CTraceparent(traceparent);
    if (data) return data;
  }

  // Fall back to sentry-trace
  return continueTrace(sentryTrace, baggage);
}

/**
 * Helper to create trace context for client navigation
 */
export function createClientNavigationContext(
  pathname: string,
  params?: Record<string, string | string[]>,
): PropagationContext & { name: string; op: string } {
  const context = generatePropagationContext();

  // Parameterize the route
  let name = pathname;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      const valueStr = Array.isArray(value) ? "[...]" : "[" + key + "]";
      const searchValue = `/${String(value)}/`;
      name = name.split(searchValue).join(`/${valueStr}/`);
    });
  }

  return {
    ...context,
    name,
    op: "navigation",
  };
}
