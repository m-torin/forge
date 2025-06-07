import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { type BrowserContext, type Page } from "@playwright/test";

/**
 * Performance metrics collected during benchmarking
 */
export interface PerformanceMetrics {
  /** Bundle size in bytes */
  bundleSize: number;
  /** Cumulative Layout Shift score */
  cls: number;
  /** CPU usage percentage */
  cpuUsage: number;
  /** Custom timing marks */
  customTimings: Record<string, number>;
  /** First Contentful Paint in milliseconds */
  fcp: number;
  /** First Input Delay in milliseconds */
  fid: number;
  /** Largest Contentful Paint in milliseconds */
  lcp: number;
  /** Page load time in milliseconds */
  loadTime: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Number of network requests */
  networkRequests: number;
  /** Speed Index score */
  speedIndex: number;
  /** Total Blocking Time in milliseconds */
  tbt: number;
  /** Total transferred bytes */
  transferredBytes: number;
  /** Time to Interactive in milliseconds */
  tti: number;
}

/**
 * Performance baseline for comparison
 */
export interface PerformanceBaseline {
  commitHash?: string;
  device: string;
  environment: string;
  metrics: PerformanceMetrics;
  timestamp: number;
  url: string;
  version: string;
}

/**
 * Performance comparison result
 */
export interface PerformanceComparison {
  baseline: PerformanceBaseline;
  current: PerformanceMetrics;
  differences: {
    [K in keyof PerformanceMetrics]: {
      baseline: PerformanceMetrics[K];
      current: PerformanceMetrics[K];
      difference: number;
      percentageChange: number;
      status: "improved" | "degraded" | "stable";
    };
  };
  overallStatus: "passed" | "failed" | "warning";
  score: number; // 0-100 performance score
  url: string;
}

/**
 * Performance regression thresholds
 */
export interface PerformanceThresholds {
  bundleSize: { warning: number; error: number };
  cls: { warning: number; error: number };
  fcp: { warning: number; error: number };
  fid: { warning: number; error: number };
  lcp: { warning: number; error: number };
  loadTime: { warning: number; error: number };
  memoryUsage: { warning: number; error: number };
  speedIndex: { warning: number; error: number };
  tbt: { warning: number; error: number };
  tti: { warning: number; error: number };
}

/**
 * Performance benchmarker configuration
 */
export interface BenchmarkerConfig {
  baselineDir: string;
  benchmarkRuns: number;
  cpuThrottling?: number;
  networkConditions?: {
    downloadThroughput: number;
    uploadThroughput: number;
    latency: number;
  };
  reportsDir: string;
  thresholds: PerformanceThresholds;
  warmupRuns: number;
}

/**
 * Performance Benchmarker - Establishes baselines and tracks performance trends
 */
export class PerformanceBenchmarker {
  private config: BenchmarkerConfig;

  constructor(config: BenchmarkerConfig) {
    this.config = config;
  }

  /**
   * Collect comprehensive performance metrics for a page
   */
  async collectMetrics(
    page: Page,
    url: string,
    options: {
      waitForSelector?: string;
      additionalTimings?: Record<string, () => Promise<number>>;
      device?: string;
    } = {},
  ): Promise<PerformanceMetrics> {
    const {
      additionalTimings = {},
      device = "desktop",
      waitForSelector,
    } = options;

    // Set up performance monitoring
    await this.setupPerformanceMonitoring(page);

    // Apply network and CPU throttling if configured
    if (this.config.networkConditions) {
      const context = page.context();
      await this.setupNetworkThrottling(context);
    }

    if (this.config.cpuThrottling) {
      await this.setupCPUThrottling(page);
    }

    const startTime = Date.now();

    // Navigate to page and wait for load
    await page.goto(url, { waitUntil: "networkidle" });

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 30000 });
    }

    const loadTime = Date.now() - startTime;

    // Collect Web Vitals and performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise<Partial<PerformanceMetrics>>((resolve) => {
        // Wait for all performance entries to be available
        setTimeout(async () => {
          const navigation = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType("paint");

          const fcp =
            paint.find((entry) => entry.name === "first-contentful-paint")
              ?.startTime || 0;

          // Use Performance Observer for LCP and CLS
          let lcp = 0;
          let cls = 0;

          // Try to get LCP from PerformanceObserver
          const lcpEntries = performance.getEntriesByType(
            "largest-contentful-paint",
          );
          if (lcpEntries.length > 0) {
            lcp = lcpEntries[lcpEntries.length - 1].startTime;
          }

          // Estimate CLS (simplified)
          const layoutShiftEntries =
            performance.getEntriesByType("layout-shift");
          cls = layoutShiftEntries.reduce((sum: number, entry: any) => {
            if (!entry.hadRecentInput) {
              return sum + entry.value;
            }
            return sum;
          }, 0);

          // Calculate other metrics
          const tti = navigation.domInteractive;
          const speedIndex =
            navigation.loadEventEnd - navigation.loadEventStart;
          const tbt = Math.max(
            0,
            navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart -
              50,
          );

          resolve({
            fid: 0, // FID requires actual user interaction
            cls,
            fcp,
            lcp,
            speedIndex,
            tbt,
            tti,
          });
        }, 1000);
      });
    });

    // Collect network metrics
    const networkMetrics = await this.collectNetworkMetrics(page);

    // Collect memory usage
    const memoryMetrics = await this.collectMemoryMetrics(page);

    // Collect bundle size
    const bundleSize = await this.collectBundleSize(page);

    // Collect custom timings
    const customTimings: Record<string, number> = {};
    for (const [name, timingFn] of Object.entries(additionalTimings)) {
      try {
        customTimings[name] = await timingFn();
      } catch (error) {
        console.warn(`Failed to collect custom timing '${name}':`, error);
        customTimings[name] = 0;
      }
    }

    return {
      fid: metrics.fid || 0,
      bundleSize,
      cls: metrics.cls || 0,
      cpuUsage: memoryMetrics.cpu,
      customTimings,
      fcp: metrics.fcp || 0,
      lcp: metrics.lcp || 0,
      loadTime,
      memoryUsage: memoryMetrics.used,
      networkRequests: networkMetrics.requests,
      speedIndex: metrics.speedIndex || 0,
      tbt: metrics.tbt || 0,
      transferredBytes: networkMetrics.bytes,
      tti: metrics.tti || 0,
    };
  }

  /**
   * Run performance benchmark with multiple iterations
   */
  async benchmark(
    page: Page,
    url: string,
    options: {
      device?: string;
      environment?: string;
      version?: string;
      commitHash?: string;
      warmupRuns?: number;
      benchmarkRuns?: number;
    } = {},
  ): Promise<PerformanceMetrics> {
    const {
      benchmarkRuns = this.config.benchmarkRuns,
      commitHash,
      device = "desktop",
      environment = "test",
      version = "1.0.0",
      warmupRuns = this.config.warmupRuns,
    } = options;

    console.log(`🏃‍♂️ Running performance benchmark for ${url}`);
    console.log(`   Device: ${device}, Environment: ${environment}`);
    console.log(
      `   Warmup runs: ${warmupRuns}, Benchmark runs: ${benchmarkRuns}`,
    );

    // Warmup runs
    for (let i = 0; i < warmupRuns; i++) {
      console.log(`   Warmup ${i + 1}/${warmupRuns}...`);
      await this.collectMetrics(page, url, { device });
      await page.waitForTimeout(1000); // Brief pause between runs
    }

    // Benchmark runs
    const results: PerformanceMetrics[] = [];
    for (let i = 0; i < benchmarkRuns; i++) {
      console.log(`   Benchmark ${i + 1}/${benchmarkRuns}...`);
      const metrics = await this.collectMetrics(page, url, { device });
      results.push(metrics);
      await page.waitForTimeout(1000);
    }

    // Calculate averages
    const averageMetrics = this.calculateAverageMetrics(results);

    console.log(
      `✅ Benchmark complete. Load time: ${Math.round(averageMetrics.loadTime)}ms`,
    );

    return averageMetrics;
  }

  /**
   * Establish performance baseline
   */
  async establishBaseline(
    page: Page,
    url: string,
    options: {
      device?: string;
      environment?: string;
      version?: string;
      commitHash?: string;
    } = {},
  ): Promise<PerformanceBaseline> {
    const {
      commitHash,
      device = "desktop",
      environment = "production",
      version = "1.0.0",
    } = options;

    console.log(`📊 Establishing performance baseline for ${url}`);

    const metrics = await this.benchmark(page, url, {
      commitHash,
      device,
      environment,
      version,
    });

    const baseline: PerformanceBaseline = {
      url,
      commitHash,
      device,
      environment,
      metrics,
      timestamp: Date.now(),
      version,
    };

    // Save baseline
    await this.saveBaseline(baseline);

    console.log(`✅ Baseline established and saved`);

    return baseline;
  }

  /**
   * Compare current performance against baseline
   */
  async compareWithBaseline(
    page: Page,
    url: string,
    options: {
      device?: string;
      environment?: string;
      baselineEnvironment?: string;
    } = {},
  ): Promise<PerformanceComparison> {
    const {
      baselineEnvironment = "production",
      device = "desktop",
      environment = "test",
    } = options;

    // Load baseline
    const baseline = await this.loadBaseline(url, device, baselineEnvironment);
    if (!baseline) {
      throw new Error(
        `No baseline found for ${url} on ${device} in ${baselineEnvironment}`,
      );
    }

    // Collect current metrics
    const currentMetrics = await this.benchmark(page, url, {
      device,
      environment,
    });

    // Create comparison
    const comparison = this.createComparison(baseline, currentMetrics);

    // Save comparison report
    await this.saveComparisonReport(comparison);

    return comparison;
  }

  /**
   * Generate performance trend report
   */
  async generateTrendReport(
    url: string,
    device: string,
    environment: string,
    days = 30,
  ): Promise<{
    trends: {
      date: string;
      metrics: PerformanceMetrics;
      score: number;
    }[];
    analysis: {
      improving: string[];
      degrading: string[];
      stable: string[];
    };
  }> {
    const trends: {
      date: string;
      metrics: PerformanceMetrics;
      score: number;
    }[] = [];

    // This would typically load historical data from a database
    // For now, return a placeholder structure

    const analysis = {
      degrading: ["Cumulative Layout Shift"],
      improving: ["First Contentful Paint", "Bundle Size"],
      stable: ["Load Time", "Time to Interactive"],
    };

    return { analysis, trends };
  }

  /**
   * Set up performance monitoring hooks
   */
  private async setupPerformanceMonitoring(page: Page): Promise<void> {
    // Inject performance monitoring scripts
    await page.addInitScript(() => {
      // Set up PerformanceObserver for Web Vitals
      if ("PerformanceObserver" in window) {
        // LCP observer
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            console.log("LCP:", entry.startTime);
          });
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

        // Layout shift observer
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              console.log("CLS shift:", entry.value);
            }
          });
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      }
    });
  }

  /**
   * Set up network throttling
   */
  private async setupNetworkThrottling(context: BrowserContext): Promise<void> {
    if (!this.config.networkConditions) return;

    const { downloadThroughput, latency, uploadThroughput } =
      this.config.networkConditions;

    // Use CDP to set network conditions
    const pages = context.pages();
    for (const page of pages) {
      const client = await page.context().newCDPSession(page);
      await client.send("Network.emulateNetworkConditions", {
        downloadThroughput,
        latency,
        offline: false,
        uploadThroughput,
      });
    }
  }

  /**
   * Set up CPU throttling
   */
  private async setupCPUThrottling(page: Page): Promise<void> {
    if (!this.config.cpuThrottling) return;

    const client = await page.context().newCDPSession(page);
    await client.send("Emulation.setCPUThrottlingRate", {
      rate: this.config.cpuThrottling,
    });
  }

  /**
   * Collect network metrics
   */
  private async collectNetworkMetrics(page: Page): Promise<{
    requests: number;
    bytes: number;
  }> {
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];
      return {
        bytes: resources.reduce(
          (total, resource) => total + (resource.transferSize || 0),
          0,
        ),
        requests: resources.length,
      };
    });
  }

  /**
   * Collect memory metrics
   */
  private async collectMemoryMetrics(page: Page): Promise<{
    used: number;
    cpu: number;
  }> {
    try {
      const metrics = await page.evaluate(() => {
        // @ts-ignore - performance.memory is available in Chrome
        const memory = performance.memory;
        return {
          cpu: 0, // CPU metrics would require additional implementation
          used: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
        };
      });
      return metrics;
    } catch (error) {
      return { cpu: 0, used: 0 };
    }
  }

  /**
   * Collect bundle size information
   */
  private async collectBundleSize(page: Page): Promise<number> {
    return await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      const stylesheets = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      );

      // This is an approximation - actual bundle size would need to be measured differently
      return scripts.length * 50000 + stylesheets.length * 10000; // Rough estimate
    });
  }

  /**
   * Calculate average metrics from multiple runs
   */
  private calculateAverageMetrics(
    results: PerformanceMetrics[],
  ): PerformanceMetrics {
    if (results.length === 0) {
      throw new Error("No results to average");
    }

    const sums = results.reduce((acc, metrics) => {
      Object.keys(metrics).forEach((key) => {
        if (key === "customTimings") {
          acc[key] = acc[key] || {};
          Object.keys(metrics[key]).forEach((timingKey) => {
            acc[key][timingKey] =
              (acc[key][timingKey] || 0) + metrics[key][timingKey];
          });
        } else if (
          typeof metrics[key as keyof PerformanceMetrics] === "number"
        ) {
          acc[key] =
            (acc[key] || 0) +
            (metrics[key as keyof PerformanceMetrics] as number);
        }
      });
      return acc;
    }, {} as any);

    const averages: PerformanceMetrics = {} as PerformanceMetrics;

    Object.keys(sums).forEach((key) => {
      if (key === "customTimings") {
        averages[key] = {};
        Object.keys(sums[key]).forEach((timingKey) => {
          averages[key][timingKey] = Math.round(
            sums[key][timingKey] / results.length,
          );
        });
      } else {
        averages[key as keyof PerformanceMetrics] = Math.round(
          sums[key] / results.length,
        ) as any;
      }
    });

    return averages;
  }

  /**
   * Create performance comparison
   */
  private createComparison(
    baseline: PerformanceBaseline,
    current: PerformanceMetrics,
  ): PerformanceComparison {
    const differences = {} as PerformanceComparison["differences"];

    Object.keys(baseline.metrics).forEach((key) => {
      if (key === "customTimings") return; // Skip custom timings for now

      const metricKey = key as keyof PerformanceMetrics;
      const baselineValue = baseline.metrics[metricKey] as number;
      const currentValue = current[metricKey] as number;
      const difference = currentValue - baselineValue;
      const percentageChange =
        baselineValue > 0 ? (difference / baselineValue) * 100 : 0;

      let status: "improved" | "degraded" | "stable" = "stable";
      const threshold =
        this.config.thresholds[metricKey as keyof PerformanceThresholds];

      if (threshold) {
        const absPercentage = Math.abs(percentageChange);
        if (absPercentage > threshold.error) {
          status = difference > 0 ? "degraded" : "improved";
        } else if (absPercentage > threshold.warning) {
          status = difference > 0 ? "degraded" : "improved";
        }
      }

      differences[metricKey] = {
        baseline: baselineValue,
        current: currentValue,
        difference,
        percentageChange,
        status,
      };
    });

    // Calculate overall score and status
    const degradedCount = Object.values(differences).filter(
      (d) => d.status === "degraded",
    ).length;
    const improvedCount = Object.values(differences).filter(
      (d) => d.status === "improved",
    ).length;

    let overallStatus: "passed" | "failed" | "warning" = "passed";
    if (degradedCount > improvedCount) {
      overallStatus = "warning";
    }
    if (degradedCount > 3) {
      overallStatus = "failed";
    }

    const score = Math.max(
      0,
      Math.min(100, 100 - degradedCount * 15 + improvedCount * 5),
    );

    return {
      url: baseline.url,
      baseline,
      current,
      differences,
      overallStatus,
      score,
    };
  }

  /**
   * Save baseline to file
   */
  private async saveBaseline(baseline: PerformanceBaseline): Promise<void> {
    const filename = this.getBaselineFilename(
      baseline.url,
      baseline.device,
      baseline.environment,
    );
    const filepath = resolve(this.config.baselineDir, filename);

    writeFileSync(filepath, JSON.stringify(baseline, null, 2));
  }

  /**
   * Load baseline from file
   */
  private async loadBaseline(
    url: string,
    device: string,
    environment: string,
  ): Promise<PerformanceBaseline | null> {
    const filename = this.getBaselineFilename(url, device, environment);
    const filepath = resolve(this.config.baselineDir, filename);

    if (!existsSync(filepath)) {
      return null;
    }

    try {
      const content = readFileSync(filepath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load baseline from ${filepath}:`, error);
      return null;
    }
  }

  /**
   * Save comparison report
   */
  private async saveComparisonReport(
    comparison: PerformanceComparison,
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `comparison-${timestamp}.json`;
    const filepath = resolve(this.config.reportsDir, filename);

    writeFileSync(filepath, JSON.stringify(comparison, null, 2));
  }

  /**
   * Generate baseline filename
   */
  private getBaselineFilename(
    url: string,
    device: string,
    environment: string,
  ): string {
    const urlHash = url.replace(/[^a-zA-Z0-9]/g, "_");
    return `baseline-${urlHash}-${device}-${environment}.json`;
  }
}

/**
 * Default configuration for performance benchmarking
 */
export const createDefaultBenchmarkerConfig = (
  projectRoot: string,
): BenchmarkerConfig => ({
  baselineDir: resolve(projectRoot, ".performance-baselines"),
  benchmarkRuns: 5,
  cpuThrottling: 4, // 4x CPU slowdown
  networkConditions: {
    downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
    latency: 40, // 40ms RTT
    uploadThroughput: (750 * 1024) / 8, // 750 Kbps
  },
  reportsDir: resolve(projectRoot, "test-results/performance"),
  thresholds: {
    fid: { error: 25, warning: 10 },
    bundleSize: { error: 15, warning: 5 },
    cls: { error: 25, warning: 10 },
    fcp: { error: 25, warning: 10 },
    lcp: { error: 25, warning: 10 },
    loadTime: { error: 25, warning: 10 },
    memoryUsage: { error: 30, warning: 15 },
    speedIndex: { error: 25, warning: 10 },
    tbt: { error: 25, warning: 10 },
    tti: { error: 25, warning: 10 },
  },
  warmupRuns: 2,
});
