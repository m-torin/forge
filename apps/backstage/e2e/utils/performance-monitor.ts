import { BrowserContext, Page } from '@playwright/test';

export interface PerformanceMetrics {
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  fid?: number; // First Input Delay
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  ttfb?: number; // Time to First Byte

  // Additional metrics
  domContentLoaded?: number;
  failedRequestCount?: number;
  loadComplete?: number;
  totalRequestCount?: number;
  totalRequestSize?: number;

  // Resource timings
  resources?: ResourceTiming[];
}

export interface ResourceTiming {
  duration: number;
  name: string;
  size?: number;
  status?: number;
  type: string;
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  timestamp: string;
  url: string;
  violations?: PerformanceViolation[];
}

export interface PerformanceViolation {
  actual: number;
  metric: string;
  severity: 'warning' | 'error';
  threshold: number;
}

export interface PerformanceThresholds {
  cls?: { warning: number; error: number };
  fcp?: { warning: number; error: number };
  fid?: { warning: number; error: number };
  lcp?: { warning: number; error: number };
  loadComplete?: { warning: number; error: number };
  ttfb?: { warning: number; error: number };
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fid: { error: 300, warning: 100 }, // milliseconds
  cls: { error: 0.25, warning: 0.1 }, // score
  fcp: { error: 3000, warning: 1800 }, // milliseconds
  lcp: { error: 4000, warning: 2500 }, // milliseconds
  loadComplete: { error: 5000, warning: 3000 }, // milliseconds
  ttfb: { error: 1800, warning: 800 }, // milliseconds
};

export class PerformanceMonitor {
  private page: Page;
  private context: BrowserContext;
  private thresholds: PerformanceThresholds;
  private networkRequests = new Map<
    string,
    { start: number; end?: number; size?: number; status?: number }
  >();

  constructor(page: Page, context: BrowserContext, thresholds?: PerformanceThresholds) {
    this.page = page;
    this.context = context;
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring(): void {
    this.page.on('request', (request: any) => {
      this.networkRequests.set(request.url(), {
        start: Date.now(),
      });
    });

    this.page.on('response', (response: any) => {
      const timing = this.networkRequests.get(response.url());
      if (timing) {
        timing.end = Date.now();
        timing.status = response.status();
        const headers = response.headers();
        if (headers['content-length']) {
          timing.size = parseInt(headers['content-length'], 10);
        }
      }
    });

    this.page.on('requestfailed', (request: any) => {
      const timing = this.networkRequests.get(request.url());
      if (timing) {
        timing.end = Date.now();
        timing.status = 0; // Failed request
      }
    });
  }

  async collectMetrics(): Promise<PerformanceMetrics> {
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');

    // Collect Core Web Vitals and other metrics
    const metrics = await this.page.evaluate(() => {
      const navigationTiming = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const paintTimings = performance.getEntriesByType('paint');

      // Get LCP
      let lcp: number | undefined;
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const lastEntry = lcpEntries[lcpEntries.length - 1] as any;
        lcp = lastEntry.startTime;
      }

      // Get FCP
      let fcp: number | undefined;
      const fcpEntry = paintTimings.find((entry: any) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        fcp = fcpEntry.startTime;
      }

      // Get CLS
      let cls = 0;
      const clsEntries = performance.getEntriesByType('layout-shift') as any[];
      clsEntries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });

      // Get TTFB
      const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;

      // Get DOM and load timings
      const domContentLoaded =
        navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart;
      const loadComplete = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;

      return {
        cls,
        domContentLoaded,
        fcp,
        lcp,
        loadComplete,
        ttfb,
      };
    });

    // Calculate network metrics
    const networkMetrics = this.calculateNetworkMetrics();

    // Collect resource timings
    const resources = await this.collectResourceTimings();

    return {
      ...metrics,
      ...networkMetrics,
      resources,
    };
  }

  private calculateNetworkMetrics(): Partial<PerformanceMetrics> {
    let totalRequestCount = 0;
    let totalRequestSize = 0;
    let failedRequestCount = 0;

    this.networkRequests.forEach((timing: any) => {
      totalRequestCount++;
      if (timing.size) {
        totalRequestSize += timing.size;
      }
      if (timing.status === 0 || (timing.status && timing.status >= 400)) {
        failedRequestCount++;
      }
    });

    return {
      failedRequestCount,
      totalRequestCount,
      totalRequestSize,
    };
  }

  private async collectResourceTimings(): Promise<ResourceTiming[]> {
    return await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter((resource: any) => resource.duration > 0)
        .map((resource: any) => ({
          name: resource.name,
          type: resource.initiatorType,
          duration: Math.round(resource.duration),
          size: resource.transferSize,
        }))
        .sort((a, b: any) => b.duration - a.duration)
        .slice(0, 20); // Top 20 slowest resources
    });
  }

  async measureFID(): Promise<number | undefined> {
    // FID requires user interaction, so we'll simulate a click
    try {
      const startTime = Date.now();

      // Find a clickable element
      const clickableElement = this.page.locator('button, a, input, [role="button"]').first();
      if (await clickableElement.isVisible()) {
        await clickableElement.click({ force: true });
        const endTime = Date.now();
        return endTime - startTime;
      }
    } catch (error: any) {
      // If we can't measure FID, return undefined
      console.warn('Could not measure FID: ', error);
    }
    return undefined;
  }

  checkThresholds(metrics: PerformanceMetrics): PerformanceViolation[] {
    const violations: PerformanceViolation[] = [];

    const metricsToCheck: {
      key: keyof PerformanceMetrics;
      name: string;
    }[] = [
      { name: 'Largest Contentful Paint', key: 'lcp' },
      { name: 'First Input Delay', key: 'fid' },
      { name: 'Cumulative Layout Shift', key: 'cls' },
      { name: 'First Contentful Paint', key: 'fcp' },
      { name: 'Time to First Byte', key: 'ttfb' },
      { name: 'Page Load Complete', key: 'loadComplete' },
    ];

    metricsToCheck.forEach(({ name, key }: any) => {
      const value = metrics[key];
      const threshold = this.thresholds[key as keyof PerformanceThresholds];

      if (value !== undefined && threshold) {
        if (value > threshold.error) {
          violations.push({
            actual: value,
            metric: name,
            severity: 'error',
            threshold: threshold.error,
          });
        } else if (value > threshold.warning) {
          violations.push({
            actual: value,
            metric: name,
            severity: 'warning',
            threshold: threshold.warning,
          });
        }
      }
    });

    return violations;
  }

  async generateReport(url: string): Promise<PerformanceReport> {
    const metrics = await this.collectMetrics();

    // Try to measure FID if not already captured
    if (metrics.fid === undefined) {
      metrics.fid = await this.measureFID();
    }

    const violations = this.checkThresholds(metrics);

    return {
      url,
      metrics,
      timestamp: new Date().toISOString(),
      violations,
    };
  }

  static formatReport(report: PerformanceReport): string {
    const lines = [
      `Performance Report for ${report.url}`,
      `Generated at: ${report.timestamp}`,
      '',
      'Core Web Vitals:',
      `  LCP: ${report.metrics.lcp?.toFixed(0) || 'N/A'} ms`,
      `  FID: ${report.metrics.fid?.toFixed(0) || 'N/A'} ms`,
      `  CLS: ${report.metrics.cls?.toFixed(3) || 'N/A'}`,
      '',
      'Other Metrics:',
      `  FCP: ${report.metrics.fcp?.toFixed(0) || 'N/A'} ms`,
      `  TTFB: ${report.metrics.ttfb?.toFixed(0) || 'N/A'} ms`,
      `  DOM Content Loaded: ${report.metrics.domContentLoaded?.toFixed(0) || 'N/A'} ms`,
      `  Page Load Complete: ${report.metrics.loadComplete?.toFixed(0) || 'N/A'} ms`,
      '',
      'Network Metrics:',
      `  Total Requests: ${report.metrics.totalRequestCount || 0}`,
      `  Total Size: ${((report.metrics.totalRequestSize || 0) / 1024 / 1024).toFixed(2)} MB`,
      `  Failed Requests: ${report.metrics.failedRequestCount || 0}`,
    ];

    if (report.violations && report.violations.length > 0) {
      lines.push('', 'Performance Violations:');
      report.violations.forEach((violation: any) => {
        const icon = violation.severity === 'error' ? '❌' : '⚠️';
        lines.push(
          `  ${icon} ${violation.metric}: ${violation.actual.toFixed(0)} ms (threshold: ${violation.threshold.toFixed(0)} ms)`,
        );
      });
    }

    if (report.metrics.resources && report.metrics.resources.length > 0) {
      lines.push('', 'Slowest Resources:');
      report.metrics.resources.slice(0, 5).forEach((resource: any) => {
        const name = resource.name.length > 50 ? '...' + resource.name.slice(-47) : resource.name;
        lines.push(`  ${resource.duration} ms - ${name}`);
      });
    }

    return lines.join('\n');
  }

  reset(): void {
    this.networkRequests.clear();
  }
}

// Helper function to create a performance monitor for a test
export async function withPerformanceMonitoring<T>(
  page: Page,
  context: BrowserContext,
  url: string,
  testFn: () => Promise<T>,
  thresholds?: PerformanceThresholds,
): Promise<{ result: T; report: PerformanceReport }> {
  const monitor = new PerformanceMonitor(page, context, thresholds);

  try {
    await page.goto(url);
    const result = await testFn();
    const report = await monitor.generateReport(url);

    // Log the report
    console.log(PerformanceMonitor.formatReport(report));

    // Fail the test if there are errors
    const errors = report.violations?.filter((v: any) => v.severity === 'error');
    if (errors && errors.length > 0) {
      throw new Error(
        `Performance violations detected:\n${errors.map((e: any) => `${e.metric}: ${e.actual} ms`).join('\n')}`,
      );
    }

    return { report, result };
  } finally {
    monitor.reset();
  }
}

// Factory function to create a performance monitor instance
export function createPerformanceMonitor(thresholds?: PerformanceThresholds) {
  return {
    async withPerformanceMonitoring<T>(
      page: Page,
      context: BrowserContext,
      url: string,
      testFn: () => Promise<T>,
      overrideThresholds?: PerformanceThresholds,
    ): Promise<{ result: T; report: PerformanceReport }> {
      return withPerformanceMonitoring(
        page,
        context,
        url,
        testFn,
        overrideThresholds || thresholds,
      );
    },

    createInstance(page: Page, context: BrowserContext) {
      return new PerformanceMonitor(page, context, thresholds);
    },
  };
}
