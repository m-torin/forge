import { expect } from "@playwright/test";

/**
 * Performance budgets configuration
 */
export interface PerformanceBudgets {
  /** Page load time in milliseconds */
  pageLoad?: number;
  /** Largest Contentful Paint in milliseconds */
  lcp?: number;
  /** First Input Delay in milliseconds */
  fid?: number;
  /** Cumulative Layout Shift (unitless) */
  cls?: number;
  /** First Contentful Paint in milliseconds */
  fcp?: number;
  /** Time to Interactive in milliseconds */
  tti?: number;
  /** Total bundle size in bytes */
  totalBundleSize?: number;
  /** Individual resource size in bytes */
  maxResourceSize?: number;
  /** Memory usage growth percentage */
  memoryGrowthPercentage?: number;
  /** Number of HTTP requests */
  maxRequests?: number;
}

/**
 * Default performance budgets based on web performance best practices
 */
export const DEFAULT_BUDGETS: PerformanceBudgets = {
  pageLoad: 3000, // 3 seconds
  lcp: 2500, // Good LCP
  fid: 100, // Good FID
  cls: 0.1, // Good CLS
  fcp: 1800, // Good FCP
  tti: 3800, // Good TTI
  totalBundleSize: 1024 * 1024, // 1MB
  maxResourceSize: 500 * 1024, // 500KB
  memoryGrowthPercentage: 50, // 50% growth limit
  maxRequests: 50, // Reasonable request count
};

/**
 * Environment-specific performance budgets
 */
export const ENVIRONMENT_BUDGETS = {
  development: {
    ...DEFAULT_BUDGETS,
    // More lenient for development
    pageLoad: 5000,
    lcp: 4000,
    totalBundleSize: 2 * 1024 * 1024, // 2MB
  },
  production: {
    ...DEFAULT_BUDGETS,
    // Stricter for production
    pageLoad: 2000,
    lcp: 2000,
    totalBundleSize: 800 * 1024, // 800KB
  },
  ci: {
    ...DEFAULT_BUDGETS,
    // Account for CI environment variability
    pageLoad: 4000,
    lcp: 3000,
    memoryGrowthPercentage: 75,
  },
};

/**
 * Performance budget validator
 */
export class PerformanceBudgetValidator {
  private budgets: PerformanceBudgets;

  constructor(budgets?: PerformanceBudgets) {
    // Auto-select budget based on environment
    const environment =
      process.env.NODE_ENV === "production"
        ? "production"
        : process.env.CI
          ? "ci"
          : "development";

    this.budgets = budgets || ENVIRONMENT_BUDGETS[environment];
  }

  /**
   * Validate Web Vitals against budgets
   */
  validateWebVitals(vitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
  }) {
    if (this.budgets.lcp && vitals.lcp) {
      expect(
        vitals.lcp,
        `LCP ${vitals.lcp}ms exceeds budget of ${this.budgets.lcp}ms`,
      ).toBeLessThan(this.budgets.lcp);
    }

    if (this.budgets.fid && vitals.fid) {
      expect(
        vitals.fid,
        `FID ${vitals.fid}ms exceeds budget of ${this.budgets.fid}ms`,
      ).toBeLessThan(this.budgets.fid);
    }

    if (this.budgets.cls && vitals.cls) {
      expect(
        vitals.cls,
        `CLS ${vitals.cls} exceeds budget of ${this.budgets.cls}`,
      ).toBeLessThan(this.budgets.cls);
    }

    if (this.budgets.fcp && vitals.fcp) {
      expect(
        vitals.fcp,
        `FCP ${vitals.fcp}ms exceeds budget of ${this.budgets.fcp}ms`,
      ).toBeLessThan(this.budgets.fcp);
    }
  }

  /**
   * Validate page load performance against budgets
   */
  validatePageLoad(metrics: {
    loadComplete?: number;
    domContentLoaded?: number;
  }) {
    if (this.budgets.pageLoad && metrics.loadComplete) {
      expect(
        metrics.loadComplete,
        `Page load ${metrics.loadComplete}ms exceeds budget of ${this.budgets.pageLoad}ms`,
      ).toBeLessThan(this.budgets.pageLoad);
    }
  }

  /**
   * Validate resource loading against budgets
   */
  validateResourceLoading(analysis: {
    totalSize: number;
    totalResources: number;
    largeResources: Array<{ size: number; name: string }>;
  }) {
    if (this.budgets.totalBundleSize) {
      expect(
        analysis.totalSize,
        `Total bundle size ${analysis.totalSize} bytes exceeds budget of ${this.budgets.totalBundleSize} bytes`,
      ).toBeLessThan(this.budgets.totalBundleSize);
    }

    if (this.budgets.maxRequests) {
      expect(
        analysis.totalResources,
        `Total requests ${analysis.totalResources} exceeds budget of ${this.budgets.maxRequests}`,
      ).toBeLessThan(this.budgets.maxRequests);
    }

    if (this.budgets.maxResourceSize) {
      analysis.largeResources.forEach((resource) => {
        expect(
          resource.size,
          `Resource ${resource.name} size ${resource.size} bytes exceeds budget of ${this.budgets.maxResourceSize} bytes`,
        ).toBeLessThan(this.budgets.maxResourceSize!);
      });
    }
  }

  /**
   * Validate memory usage against budgets
   */
  validateMemoryUsage(leakDetection: {
    hasLeak: boolean;
    growthPercentage: number;
  }) {
    if (this.budgets.memoryGrowthPercentage) {
      expect(
        leakDetection.growthPercentage,
        `Memory growth ${leakDetection.growthPercentage}% exceeds budget of ${this.budgets.memoryGrowthPercentage}%`,
      ).toBeLessThan(this.budgets.memoryGrowthPercentage);
    }

    expect(leakDetection.hasLeak, "Memory leak detected").toBe(false);
  }

  /**
   * Validate interactivity metrics against budgets
   */
  validateInteractivity(metrics: {
    domInteractive?: number;
    averageInputDelay?: number;
  }) {
    if (this.budgets.tti && metrics.domInteractive) {
      expect(
        metrics.domInteractive,
        `TTI ${metrics.domInteractive}ms exceeds budget of ${this.budgets.tti}ms`,
      ).toBeLessThan(this.budgets.tti);
    }

    if (this.budgets.fid && metrics.averageInputDelay) {
      expect(
        metrics.averageInputDelay,
        `Average input delay ${metrics.averageInputDelay}ms exceeds budget of ${this.budgets.fid}ms`,
      ).toBeLessThan(this.budgets.fid);
    }
  }

  /**
   * Generate a performance report
   */
  generateReport(results: {
    vitals?: any;
    pageLoad?: any;
    resourceLoading?: any;
    memoryUsage?: any;
    interactivity?: any;
  }) {
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      budgets: this.budgets,
      results,
      violations: [] as string[],
      score: 100,
    };

    // Calculate performance score based on budget compliance
    let violations = 0;
    let totalChecks = 0;

    // Check each metric against budgets
    if (results.vitals) {
      if (this.budgets.lcp && results.vitals.lcp > this.budgets.lcp) {
        violations++;
        report.violations.push(
          `LCP budget violation: ${results.vitals.lcp}ms > ${this.budgets.lcp}ms`,
        );
      }
      totalChecks++;
    }

    // Calculate score (0-100)
    report.score = Math.max(
      0,
      Math.round(100 - (violations / Math.max(totalChecks, 1)) * 100),
    );

    return report;
  }
}

/**
 * Create a performance budget validator with custom budgets
 */
export function createPerformanceBudgets(
  customBudgets?: Partial<PerformanceBudgets>,
) {
  const environment =
    process.env.NODE_ENV === "production"
      ? "production"
      : process.env.CI
        ? "ci"
        : "development";

  const baseBudgets = ENVIRONMENT_BUDGETS[environment];
  const finalBudgets = { ...baseBudgets, ...customBudgets };

  return new PerformanceBudgetValidator(finalBudgets);
}
