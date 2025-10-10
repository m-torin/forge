"use client";

import { useEffect } from "react";

interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

export function useWebVitals(onMetric?: (metric: WebVitalMetric) => void) {
  useEffect(() => {
    if (typeof window === "undefined" || !onMetric) return;

    let observer: PerformanceObserver | undefined;

    // Monitor Core Web Vitals
    const initWebVitals = async () => {
      try {
        // Try to import web-vitals library if available
        let webVitals: any = null;
        try {
          // @ts-ignore - web-vitals may not be installed
          webVitals = await import("web-vitals");
        } catch {
          // web-vitals not available, use fallback
          webVitals = null;
        }

        if (!webVitals) {
          // Fallback to basic performance monitoring
          if ("PerformanceObserver" in window) {
            const observer = new PerformanceObserver((list) => {
              list.getEntries().forEach((entry) => {
                if (entry.entryType === "navigation") {
                  const navEntry = entry as PerformanceNavigationTiming;
                  onMetric({
                    name: "FCP",
                    value: navEntry.loadEventEnd - navEntry.loadEventStart,
                    rating: "good",
                    delta: 0,
                    id: "fallback-fcp",
                  });
                }
              });
            });
            observer.observe({ entryTypes: ["navigation"] });
          }
          return;
        }

        const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitals;

        // Cumulative Layout Shift
        getCLS((metric: any) => {
          onMetric({
            name: "CLS",
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          });
        });

        // First Input Delay
        getFID((metric: any) => {
          onMetric({
            name: "FID",
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          });
        });

        // First Contentful Paint
        getFCP((metric: any) => {
          onMetric({
            name: "FCP",
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          });
        });

        // Largest Contentful Paint
        getLCP((metric: any) => {
          onMetric({
            name: "LCP",
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          });
        });

        // Time to First Byte
        getTTFB((metric: any) => {
          onMetric({
            name: "TTFB",
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          });
        });

        // Monitor long tasks that can hurt performance
        if ("PerformanceObserver" in window) {
          observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.entryType === "longtask") {
                onMetric({
                  name: "Long Task",
                  value: entry.duration,
                  rating: entry.duration > 50 ? "poor" : "good",
                  delta: entry.duration,
                  id: `longtask-${Date.now()}`,
                });
              }
            });
          });

          observer.observe({ entryTypes: ["longtask"] });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("Web Vitals monitoring failed to initialize:", error);
      }
    };

    initWebVitals();

    return () => {
      observer?.disconnect();
    };
  }, [onMetric]);
}
