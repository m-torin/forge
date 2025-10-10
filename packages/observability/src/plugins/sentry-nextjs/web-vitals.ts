/**
 * Web Vitals integration for Next.js
 * Automatically captures and reports Core Web Vitals
 */

import * as Sentry from "@sentry/nextjs";
import type { NextWebVitalsMetric } from "next/app";

/**
 * Web Vital thresholds based on Google's recommendations
 */
const WEB_VITAL_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

/**
 * Get rating for a Web Vital value
 */
function getRating(
  metric: string,
  value: number,
): "good" | "needs-improvement" | "poor" {
  const thresholds =
    WEB_VITAL_THRESHOLDS[metric as keyof typeof WEB_VITAL_THRESHOLDS];

  if (!thresholds) {
    return "needs-improvement";
  }

  if (value <= thresholds.good) {
    return "good";
  }

  if (value > thresholds.poor) {
    return "poor";
  }

  return "needs-improvement";
}

/**
 * Report Web Vitals to Sentry
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  const { id, name, value, attribution } = metric;
  const rating = (metric as any).rating;

  // Get the current transaction
  const transaction = Sentry.getActiveSpan();

  if (transaction) {
    // Add measurement to transaction using setAttribute in v9
    const unit = name === "CLS" ? "none" : "millisecond";
    transaction.setAttribute(`webvital.${name.toLowerCase()}.value`, value);
    transaction.setAttribute(`webvital.${name.toLowerCase()}.unit`, unit);

    // Add rating as attribute or data
    const computedRating = rating || getRating(name, value);
    transaction.setAttribute?.(
      `webvital.${name.toLowerCase()}.rating`,
      computedRating,
    );

    // Add attribution data if available
    if (attribution) {
      // Convert attribution object to individual attributes
      Object.entries(attribution).forEach(([key, val]) => {
        transaction.setAttribute(
          `webvital.${name.toLowerCase()}.attribution.${key}`,
          String(val),
        );
      });
    }
  }

  // Also send as a standalone event for Web Vitals monitoring
  Sentry.addBreadcrumb({
    category: "web-vital",
    message: `${name} measurement`,
    level: "info",
    data: {
      id,
      name,
      value,
      rating: rating || getRating(name, value),
      ...(attribution && { attribution }),
    },
  });
}

/**
 * Create a Web Vitals handler with custom processing
 */
export function createWebVitalsHandler(options?: {
  /**
   * Custom handler to run before sending to Sentry
   */
  beforeSend?: (metric: NextWebVitalsMetric) => void;
  /**
   * Only report metrics that exceed thresholds
   */
  onlyReportPoor?: boolean;
  /**
   * Custom thresholds for ratings
   */
  thresholds?: Partial<typeof WEB_VITAL_THRESHOLDS>;
  /**
   * Send metrics as transactions instead of measurements
   */
  sendAsTransactions?: boolean;
}): (metric: NextWebVitalsMetric) => void {
  const {
    beforeSend,
    onlyReportPoor = false,
    thresholds = {},
    sendAsTransactions = false,
  } = options || {};

  // Merge custom thresholds
  const _mergedThresholds = { ...WEB_VITAL_THRESHOLDS, ...thresholds };

  return (metric: NextWebVitalsMetric) => {
    // Run custom handler first
    if (beforeSend) {
      beforeSend(metric);
    }

    // Check if we should report
    const rating =
      (metric as any).rating || getRating(metric.name, metric.value);
    if (onlyReportPoor && rating !== "poor") {
      return;
    }

    if (sendAsTransactions) {
      // Send as a transaction for detailed tracking
      const _span = Sentry.startSpan(
        {
          name: `Web Vital: ${metric.name}`,
          op: "web.vital",
          attributes: {
            "webvital.name": metric.name,
            "webvital.rating": rating,
            "webvital.id": metric.id,
          },
        },
        (span) => {
          // Note: In v9, use setAttribute for span attributes
          if (metric.attribution) {
            Object.entries(metric.attribution).forEach(([key, val]) => {
              span.setAttribute(`attribution.${key}`, String(val));
            });
          }
        },
      );
    } else {
      // Use standard reporting
      reportWebVitals(metric);
    }
  };
}

/**
 * Initialize Web Vitals tracking with sensible defaults
 */
export function initWebVitalsTracking(
  options?: Parameters<typeof createWebVitalsHandler>[0],
): void {
  if (typeof window === "undefined") {
    return;
  }

  const handler = createWebVitalsHandler(options);

  // Hook into Next.js Web Vitals reporting
  if ("addEventListener" in window) {
    window.addEventListener("web-vitals", (event: any) => {
      handler(event.detail);
    });
  }
}

/**
 * Manually track a custom performance metric
 */
export function trackCustomMetric(
  name: string,
  value: number,
  options?: {
    unit?: string;
    tags?: Record<string, string>;
    data?: Record<string, any>;
  },
): void {
  const { unit = "millisecond", tags = {}, data = {} } = options || {};

  const transaction = Sentry.getActiveSpan();

  if (transaction) {
    // Use setAttribute for measurements in v9
    transaction.setAttribute(`metric.${name}.value`, value);
    transaction.setAttribute(`metric.${name}.unit`, unit);

    // Add tags as attributes
    Object.entries(tags).forEach(([key, val]) => {
      transaction.setAttribute?.(key, val);
    });

    // Add data as individual attributes
    if (Object.keys(data).length > 0) {
      Object.entries(data).forEach(([key, val]) => {
        transaction.setAttribute(`custom_metric.${name}.${key}`, String(val));
      });
    }
  }

  // Also log as breadcrumb
  Sentry.addBreadcrumb({
    category: "custom-metric",
    message: name,
    level: "info",
    data: {
      value,
      unit,
      ...tags,
      ...data,
    },
  });
}

/**
 * Track page load performance
 */
export function trackPageLoadPerformance(): void {
  if (typeof window === "undefined" || !window.performance) {
    return;
  }

  const navigation = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming;

  if (!navigation) {
    return;
  }

  const transaction = Sentry.getActiveSpan();

  if (transaction) {
    // Network timings - use setAttribute in v9
    transaction.setAttribute(
      "dns_lookup.value",
      navigation.domainLookupEnd - navigation.domainLookupStart,
    );
    transaction.setAttribute("dns_lookup.unit", "millisecond");
    transaction.setAttribute(
      "tcp_connect.value",
      navigation.connectEnd - navigation.connectStart,
    );
    transaction.setAttribute("tcp_connect.unit", "millisecond");
    transaction.setAttribute(
      "request_time.value",
      navigation.responseStart - navigation.requestStart,
    );
    transaction.setAttribute("request_time.unit", "millisecond");
    transaction.setAttribute(
      "response_time.value",
      navigation.responseEnd - navigation.responseStart,
    );
    transaction.setAttribute("response_time.unit", "millisecond");

    // Document timings
    transaction.setAttribute(
      "dom_interactive.value",
      navigation.domInteractive - navigation.fetchStart,
    );
    transaction.setAttribute("dom_interactive.unit", "millisecond");
    transaction.setAttribute(
      "dom_content_loaded.value",
      navigation.domContentLoadedEventEnd - navigation.fetchStart,
    );
    transaction.setAttribute("dom_content_loaded.unit", "millisecond");
    transaction.setAttribute(
      "load_complete.value",
      navigation.loadEventEnd - navigation.fetchStart,
    );
    transaction.setAttribute("load_complete.unit", "millisecond");

    // Transfer sizes
    transaction.setAttribute("transfer_size.value", navigation.transferSize);
    transaction.setAttribute("transfer_size.unit", "byte");
    transaction.setAttribute(
      "encoded_body_size.value",
      navigation.encodedBodySize,
    );
    transaction.setAttribute("encoded_body_size.unit", "byte");
    transaction.setAttribute(
      "decoded_body_size.value",
      navigation.decodedBodySize,
    );
    transaction.setAttribute("decoded_body_size.unit", "byte");

    // Add navigation type as attribute
    transaction.setAttribute?.("navigation.type", navigation.type);
  }
}

/**
 * Track resource loading performance
 */
export function trackResourcePerformance(options?: {
  /**
   * Resource types to track
   */
  types?: string[];
  /**
   * Minimum duration to track (ms)
   */
  minDuration?: number;
  /**
   * Maximum number of resources to track
   */
  maxResources?: number;
}): void {
  if (typeof window === "undefined" || !window.performance) {
    return;
  }

  const {
    types = ["script", "link", "img", "xmlhttprequest", "fetch"],
    minDuration = 10,
    maxResources = 50,
  } = options || {};

  const resources = performance.getEntriesByType(
    "resource",
  ) as PerformanceResourceTiming[];
  const transaction = Sentry.getActiveSpan();

  if (!transaction) {
    return;
  }

  resources
    .filter((resource) => types.includes(resource.initiatorType))
    .filter((resource) => resource.duration >= minDuration)
    .slice(0, maxResources)
    .forEach((resource) => {
      const url = new URL(resource.name);
      const _name = `${resource.initiatorType}: ${url.pathname}`;

      // Create a span for the resource
      // Note: Sentry v9 uses different span creation
      // const span = transaction.startChild({
      //   op: 'resource',
      //   description: name,
      //   data: {
      //     url: resource.name,
      //     type: resource.initiatorType,
      //     transferSize: resource.transferSize,
      //     encodedBodySize: resource.encodedBodySize,
      //     decodedBodySize: resource.decodedBodySize,
      //   },
      // });

      // span.startTimestamp = resource.startTime / 1000;
      // span.finish(resource.responseEnd / 1000);
    });
}
