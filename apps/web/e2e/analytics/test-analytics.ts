import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Test execution record for analytics
 */
export interface TestExecutionRecord {
  branch: string;
  browser: string;
  buildId?: string;
  commitHash: string;
  duration: number;
  endTime: string;
  environment: string;
  error?: string;
  filePath: string;
  metadata: Record<string, any>;
  retries: number;
  startTime: string;
  status: "passed" | "failed" | "skipped" | "flaky";
  tags: string[];
  testName: string;
}

/**
 * Flaky test analysis
 */
export interface FlakyTestAnalysis {
  browsers: string[];
  environments: string[];
  failurePatterns: string[];
  failures: number;
  filePath: string;
  flakyScore: number; // 0-1, where 1 is most flaky
  recentTrend: "improving" | "stable" | "degrading";
  recommendations: string[];
  successes: number;
  testName: string;
  totalRuns: number;
}

/**
 * Test coverage trend
 */
export interface CoverageTrend {
  coveragePercentage: number;
  date: string;
  newTestsAdded: number;
  testsRemoved: number;
  totalTests: number;
  uncoveredCriticalPaths: string[];
}

/**
 * Performance trend analysis
 */
export interface PerformanceTrend {
  averageTestDuration: number;
  bottlenecks: string[];
  date: string;
  improvements: string[];
  performanceScore: number;
  slowestTests: { name: string; duration: number }[];
}

/**
 * Test reliability metrics
 */
export interface ReliabilityMetrics {
  averageRetries: number;
  consistentTests: number;
  flakyTestCount: number;
  period: string;
  reliabilityScore: number; // 0-100
  successRate: number;
  totalExecutions: number;
  trends: {
    successRateChange: number;
    flakyTestChange: number;
    reliabilityScoreChange: number;
  };
}

/**
 * Test execution insights
 */
export interface TestInsights {
  alerts: {
    criticalIssues: string[];
    warnings: string[];
    notices: string[];
  };
  executionPatterns: {
    peakExecutionHours: number[];
    averageExecutionsPerDay: number;
    mostActiveEnvironments: string[];
    mostActiveBranches: string[];
  };
  qualityMetrics: {
    overallPassRate: number;
    flakyTestPercentage: number;
    averageExecutionTime: number;
    testStability: number;
  };
  recommendations: {
    testsToOptimize: string[];
    testsToFix: string[];
    coverageGaps: string[];
    performanceImprovements: string[];
  };
}

/**
 * Test Analytics Engine - Analyzes test execution patterns and trends
 */
export class TestAnalytics {
  private dataDir: string;
  private executionRecords: TestExecutionRecord[] = [];

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.loadExecutionRecords();
  }

  /**
   * Record a test execution
   */
  recordExecution(record: TestExecutionRecord): void {
    this.executionRecords.push(record);
    this.saveExecutionRecords();
  }

  /**
   * Record multiple test executions
   */
  recordExecutions(records: TestExecutionRecord[]): void {
    this.executionRecords.push(...records);
    this.saveExecutionRecords();
  }

  /**
   * Analyze flaky tests
   */
  analyzeFlakyTests(
    options: {
      timeframeDays?: number;
      minExecutions?: number;
      environment?: string;
    } = {},
  ): FlakyTestAnalysis[] {
    const { environment, minExecutions = 5, timeframeDays = 30 } = options;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    // Filter records by timeframe and environment
    const relevantRecords = this.executionRecords.filter((record) => {
      const recordDate = new Date(record.startTime);
      return (
        recordDate >= cutoffDate &&
        (!environment || record.environment === environment)
      );
    });

    // Group by test
    const testGroups = this.groupRecordsByTest(relevantRecords);

    const flakyTests: FlakyTestAnalysis[] = [];

    Object.entries(testGroups).forEach(([testKey, records]) => {
      if (records.length < minExecutions) return;

      const failures = records.filter(
        (r) => r.status === "failed" || r.status === "flaky",
      );
      const successes = records.filter((r) => r.status === "passed");
      const flakyScore = failures.length / records.length;

      // Only include tests with some level of flakiness
      if (flakyScore > 0.1) {
        const failurePatterns = this.extractFailurePatterns(failures);
        const environments = [...new Set(records.map((r) => r.environment))];
        const browsers = [...new Set(records.map((r) => r.browser))];
        const recentTrend = this.calculateRecentTrend(records);
        const recommendations = this.generateFlakyTestRecommendations(
          records,
          flakyScore,
        );

        flakyTests.push({
          browsers,
          environments,
          failurePatterns,
          failures: failures.length,
          filePath: records[0].filePath,
          flakyScore,
          recentTrend,
          recommendations,
          successes: successes.length,
          testName: records[0].testName,
          totalRuns: records.length,
        });
      }
    });

    // Sort by flaky score (most flaky first)
    return flakyTests.sort((a, b) => b.flakyScore - a.flakyScore);
  }

  /**
   * Analyze test coverage trends
   */
  analyzeCoverageTrends(days = 30): CoverageTrend[] {
    const trends: CoverageTrend[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayRecords = this.executionRecords.filter((record) =>
        record.startTime.startsWith(dateStr),
      );

      if (dayRecords.length > 0) {
        const uniqueTests = new Set(dayRecords.map((r) => r.testName));
        const totalTests = uniqueTests.size;

        // Calculate coverage (this would typically come from actual coverage data)
        const coveragePercentage = this.estimateCoverage(dayRecords);

        trends.push({
          coveragePercentage,
          date: dateStr,
          newTestsAdded: this.countNewTests(dayRecords, dateStr),
          testsRemoved: 0, // Would need historical data to calculate
          totalTests,
          uncoveredCriticalPaths: this.identifyUncoveredPaths(dayRecords),
        });
      }
    }

    return trends;
  }

  /**
   * Analyze performance trends
   */
  analyzePerformanceTrends(days = 30): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayRecords = this.executionRecords.filter(
        (record) =>
          record.startTime.startsWith(dateStr) && record.status !== "skipped",
      );

      if (dayRecords.length > 0) {
        const averageDuration =
          dayRecords.reduce((sum, r) => sum + r.duration, 0) /
          dayRecords.length;
        const slowestTests = dayRecords
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5)
          .map((r) => ({ name: r.testName, duration: r.duration }));

        const performanceScore = this.calculatePerformanceScore(dayRecords);
        const bottlenecks = this.identifyBottlenecks(dayRecords);
        const improvements = this.identifyImprovements(dayRecords);

        trends.push({
          averageTestDuration: averageDuration,
          bottlenecks,
          date: dateStr,
          improvements,
          performanceScore,
          slowestTests,
        });
      }
    }

    return trends;
  }

  /**
   * Calculate reliability metrics
   */
  calculateReliabilityMetrics(period = "30d"): ReliabilityMetrics {
    const days = this.parsePeriod(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantRecords = this.executionRecords.filter(
      (record) => new Date(record.startTime) >= cutoffDate,
    );

    const totalExecutions = relevantRecords.length;
    const successfulExecutions = relevantRecords.filter(
      (r) => r.status === "passed",
    ).length;
    const successRate =
      totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const averageRetries =
      relevantRecords.reduce((sum, r) => sum + r.retries, 0) / totalExecutions;

    const flakyTests = this.analyzeFlakyTests({ timeframeDays: days });
    const flakyTestCount = flakyTests.length;

    const consistentTests = this.countConsistentTests(relevantRecords);
    const reliabilityScore = this.calculateReliabilityScore(
      successRate,
      flakyTestCount,
      totalExecutions,
    );

    // Calculate trends by comparing with previous period
    const previousPeriodRecords = this.getPreviousPeriodRecords(
      cutoffDate,
      days,
    );
    const trends = this.calculateTrends(relevantRecords, previousPeriodRecords);

    return {
      averageRetries,
      consistentTests,
      flakyTestCount,
      period,
      reliabilityScore,
      successRate,
      totalExecutions,
      trends,
    };
  }

  /**
   * Generate comprehensive insights
   */
  generateInsights(
    options: {
      timeframeDays?: number;
      environment?: string;
    } = {},
  ): TestInsights {
    const { environment, timeframeDays = 30 } = options;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    const relevantRecords = this.executionRecords.filter((record) => {
      const recordDate = new Date(record.startTime);
      return (
        recordDate >= cutoffDate &&
        (!environment || record.environment === environment)
      );
    });

    const executionPatterns = this.analyzeExecutionPatterns(relevantRecords);
    const qualityMetrics = this.calculateQualityMetrics(relevantRecords);
    const recommendations = this.generateRecommendations(relevantRecords);
    const alerts = this.generateAlerts(relevantRecords);

    return {
      alerts,
      executionPatterns,
      qualityMetrics,
      recommendations,
    };
  }

  /**
   * Export analytics data
   */
  exportAnalytics(format: "json" | "csv" = "json"): string {
    const analytics = {
      coverageTrends: this.analyzeCoverageTrends(),
      flakyTests: this.analyzeFlakyTests(),
      generatedAt: new Date().toISOString(),
      insights: this.generateInsights(),
      performanceTrends: this.analyzePerformanceTrends(),
      summary: this.calculateReliabilityMetrics(),
    };

    if (format === "json") {
      return JSON.stringify(analytics, null, 2);
    } else {
      return this.convertToCSV(analytics);
    }
  }

  /**
   * Get test health dashboard data
   */
  getDashboardData(): {
    overview: {
      totalTests: number;
      passRate: number;
      flakyTests: number;
      avgDuration: number;
    };
    trends: {
      passRateTrend: number[];
      durationTrend: number[];
      flakyTestTrend: number[];
    };
    topIssues: {
      type: "flaky" | "slow" | "failing";
      testName: string;
      severity: "high" | "medium" | "low";
      description: string;
    }[];
  } {
    const recentRecords = this.getRecentRecords(7); // Last 7 days
    const flakyTests = this.analyzeFlakyTests({ timeframeDays: 7 });

    const overview = {
      avgDuration: this.calculateAverageDuration(recentRecords),
      flakyTests: flakyTests.length,
      passRate: this.calculatePassRate(recentRecords),
      totalTests: new Set(recentRecords.map((r) => r.testName)).size,
    };

    const trends = {
      durationTrend: this.getDurationTrend(30),
      flakyTestTrend: this.getFlakyTestTrend(30),
      passRateTrend: this.getPassRateTrend(30),
    };

    const topIssues = this.identifyTopIssues(recentRecords, flakyTests);

    return { overview, topIssues, trends };
  }

  // Private helper methods

  private loadExecutionRecords(): void {
    const recordsFile = resolve(this.dataDir, "execution-records.json");
    if (existsSync(recordsFile)) {
      try {
        const data = readFileSync(recordsFile, "utf8");
        this.executionRecords = JSON.parse(data);
      } catch (error) {
        console.warn("Failed to load execution records:", error);
        this.executionRecords = [];
      }
    }
  }

  private saveExecutionRecords(): void {
    const recordsFile = resolve(this.dataDir, "execution-records.json");
    try {
      writeFileSync(
        recordsFile,
        JSON.stringify(this.executionRecords, null, 2),
      );
    } catch (error) {
      console.warn("Failed to save execution records:", error);
    }
  }

  private groupRecordsByTest(
    records: TestExecutionRecord[],
  ): Record<string, TestExecutionRecord[]> {
    return records.reduce(
      (groups, record) => {
        const key = `${record.filePath}:${record.testName}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(record);
        return groups;
      },
      {} as Record<string, TestExecutionRecord[]>,
    );
  }

  private extractFailurePatterns(failures: TestExecutionRecord[]): string[] {
    const patterns = new Set<string>();

    failures.forEach((failure) => {
      if (failure.error) {
        // Extract common error patterns
        const error = failure.error.toLowerCase();
        if (error.includes("timeout")) patterns.add("timeout");
        if (error.includes("element not found"))
          patterns.add("element_not_found");
        if (error.includes("network")) patterns.add("network_error");
        if (error.includes("assertion")) patterns.add("assertion_failure");
      }
    });

    return Array.from(patterns);
  }

  private calculateRecentTrend(
    records: TestExecutionRecord[],
  ): "improving" | "stable" | "degrading" {
    if (records.length < 10) return "stable";

    const sortedRecords = records.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const recentHalf = sortedRecords.slice(
      Math.floor(sortedRecords.length / 2),
    );
    const olderHalf = sortedRecords.slice(
      0,
      Math.floor(sortedRecords.length / 2),
    );

    const recentFailureRate =
      recentHalf.filter((r) => r.status === "failed").length /
      recentHalf.length;
    const olderFailureRate =
      olderHalf.filter((r) => r.status === "failed").length / olderHalf.length;

    const difference = recentFailureRate - olderFailureRate;

    if (difference < -0.1) return "improving";
    if (difference > 0.1) return "degrading";
    return "stable";
  }

  private generateFlakyTestRecommendations(
    records: TestExecutionRecord[],
    flakyScore: number,
  ): string[] {
    const recommendations: string[] = [];

    if (flakyScore > 0.5) {
      recommendations.push(
        "Consider disabling this test until it can be stabilized",
      );
    }

    const timeoutFailures = records.filter((r) =>
      r.error?.toLowerCase().includes("timeout"),
    ).length;

    if (timeoutFailures > records.length * 0.3) {
      recommendations.push(
        "Increase timeout values or optimize test performance",
      );
    }

    const environmentFailures = this.analyzeEnvironmentFailures(records);
    if (environmentFailures.length > 0) {
      recommendations.push(
        `Test fails more often in: ${environmentFailures.join(", ")}`,
      );
    }

    return recommendations;
  }

  private estimateCoverage(records: TestExecutionRecord[]): number {
    // This is a simplified estimation - real implementation would use actual coverage data
    const uniqueTests = new Set(records.map((r) => r.testName));
    const estimatedTotalTests = Math.max(100, uniqueTests.size * 1.5);
    return Math.min(100, (uniqueTests.size / estimatedTotalTests) * 100);
  }

  private identifyUncoveredPaths(records: TestExecutionRecord[]): string[] {
    // Placeholder - would identify critical user paths not covered by tests
    return ["checkout-flow", "user-registration", "password-reset"];
  }

  private countNewTests(records: TestExecutionRecord[], date: string): number {
    // Placeholder - would track when tests were first added
    return Math.floor(Math.random() * 3);
  }

  private calculatePerformanceScore(records: TestExecutionRecord[]): number {
    const avgDuration =
      records.reduce((sum, r) => sum + r.duration, 0) / records.length;
    const fastThreshold = 5000; // 5 seconds
    const slowThreshold = 30000; // 30 seconds

    if (avgDuration <= fastThreshold) return 100;
    if (avgDuration >= slowThreshold) return 0;

    return Math.round(
      100 -
        ((avgDuration - fastThreshold) / (slowThreshold - fastThreshold)) * 100,
    );
  }

  private identifyBottlenecks(records: TestExecutionRecord[]): string[] {
    const slowTests = records
      .filter((r) => r.duration > 20000) // Slower than 20 seconds
      .map((r) => r.testName);

    return [...new Set(slowTests)];
  }

  private identifyImprovements(records: TestExecutionRecord[]): string[] {
    // Placeholder for identifying performance improvements
    return ["Added lazy loading", "Optimized database queries"];
  }

  private parsePeriod(period: string): number {
    const match = period.match(/(\d+)([dw])/);
    if (!match) return 30;

    const [, num, unit] = match;
    const days = parseInt(num, 10);

    return unit === "w" ? days * 7 : days;
  }

  private countConsistentTests(records: TestExecutionRecord[]): number {
    const testGroups = this.groupRecordsByTest(records);

    return Object.values(testGroups).filter((testRecords) => {
      const failureRate =
        testRecords.filter((r) => r.status === "failed").length /
        testRecords.length;
      return failureRate < 0.05; // Less than 5% failure rate
    }).length;
  }

  private calculateReliabilityScore(
    successRate: number,
    flakyTestCount: number,
    totalExecutions: number,
  ): number {
    const baseScore = successRate * 100;
    const flakyPenalty =
      (flakyTestCount / Math.max(1, totalExecutions / 10)) * 10;

    return Math.max(0, Math.min(100, baseScore - flakyPenalty));
  }

  private getPreviousPeriodRecords(
    cutoffDate: Date,
    days: number,
  ): TestExecutionRecord[] {
    const previousCutoff = new Date(cutoffDate);
    previousCutoff.setDate(previousCutoff.getDate() - days);

    return this.executionRecords.filter((record) => {
      const recordDate = new Date(record.startTime);
      return recordDate >= previousCutoff && recordDate < cutoffDate;
    });
  }

  private calculateTrends(
    currentRecords: TestExecutionRecord[],
    previousRecords: TestExecutionRecord[],
  ): ReliabilityMetrics["trends"] {
    const currentSuccessRate =
      currentRecords.filter((r) => r.status === "passed").length /
      Math.max(1, currentRecords.length);
    const previousSuccessRate =
      previousRecords.filter((r) => r.status === "passed").length /
      Math.max(1, previousRecords.length);

    const currentFlakyCount = this.analyzeFlakyTests({
      timeframeDays: 30,
    }).length;

    const previousFlakyCount = Math.floor(currentFlakyCount * 0.9); // Simplified calculation

    return {
      flakyTestChange: currentFlakyCount - previousFlakyCount,
      reliabilityScoreChange: 2.5, // Placeholder
      successRateChange: currentSuccessRate - previousSuccessRate,
    };
  }

  private analyzeExecutionPatterns(
    records: TestExecutionRecord[],
  ): TestInsights["executionPatterns"] {
    const hours = records.map((r) => new Date(r.startTime).getHours());
    const peakExecutionHours = this.findPeakHours(hours);

    const dailyExecutions = this.groupByDay(records);
    const averageExecutionsPerDay =
      Object.values(dailyExecutions).reduce((sum, count) => sum + count, 0) /
      Object.keys(dailyExecutions).length;

    const environmentCounts = this.countByField(records, "environment");
    const mostActiveEnvironments = Object.entries(environmentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([env]) => env);

    const branchCounts = this.countByField(records, "branch");
    const mostActiveBranches = Object.entries(branchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([branch]) => branch);

    return {
      averageExecutionsPerDay,
      mostActiveBranches,
      mostActiveEnvironments,
      peakExecutionHours,
    };
  }

  private calculateQualityMetrics(
    records: TestExecutionRecord[],
  ): TestInsights["qualityMetrics"] {
    const passedCount = records.filter((r) => r.status === "passed").length;
    const overallPassRate = passedCount / Math.max(1, records.length);

    const flakyTests = this.analyzeFlakyTests();
    const flakyTestPercentage =
      (flakyTests.length /
        Math.max(1, new Set(records.map((r) => r.testName)).size)) *
      100;

    const averageExecutionTime =
      records.reduce((sum, r) => sum + r.duration, 0) /
      Math.max(1, records.length);

    const testStability = this.calculateTestStability(records);

    return {
      averageExecutionTime,
      flakyTestPercentage,
      overallPassRate,
      testStability,
    };
  }

  private generateRecommendations(
    records: TestExecutionRecord[],
  ): TestInsights["recommendations"] {
    const slowTests = records
      .filter((r) => r.duration > 20000)
      .map((r) => r.testName)
      .filter((test, index, arr) => arr.indexOf(test) === index)
      .slice(0, 5);

    const failingTests = records
      .filter((r) => r.status === "failed")
      .map((r) => r.testName)
      .filter((test, index, arr) => arr.indexOf(test) === index)
      .slice(0, 5);

    return {
      coverageGaps: [
        "API error handling",
        "Edge cases",
        "Mobile responsiveness",
      ],
      performanceImprovements: [
        "Reduce test setup time",
        "Optimize page load waits",
        "Parallel execution",
      ],
      testsToFix: failingTests,
      testsToOptimize: slowTests,
    };
  }

  private generateAlerts(
    records: TestExecutionRecord[],
  ): TestInsights["alerts"] {
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const notices: string[] = [];

    const passRate = this.calculatePassRate(records);
    if (passRate < 0.8) {
      criticalIssues.push(`Low pass rate: ${Math.round(passRate * 100)}%`);
    } else if (passRate < 0.9) {
      warnings.push(`Pass rate below target: ${Math.round(passRate * 100)}%`);
    }

    const flakyTests = this.analyzeFlakyTests();
    if (flakyTests.length > 10) {
      criticalIssues.push(`High number of flaky tests: ${flakyTests.length}`);
    } else if (flakyTests.length > 5) {
      warnings.push(`Moderate number of flaky tests: ${flakyTests.length}`);
    }

    const avgDuration = this.calculateAverageDuration(records);
    if (avgDuration > 300000) {
      // 5 minutes
      warnings.push(
        `Long average test duration: ${Math.round(avgDuration / 1000)}s`,
      );
    }

    return { criticalIssues, notices, warnings };
  }

  // Additional helper methods...

  private analyzeEnvironmentFailures(records: TestExecutionRecord[]): string[] {
    const envFailures: Record<string, number> = {};
    const envTotals: Record<string, number> = {};

    records.forEach((record) => {
      const env = record.environment;
      envTotals[env] = (envTotals[env] || 0) + 1;
      if (record.status === "failed") {
        envFailures[env] = (envFailures[env] || 0) + 1;
      }
    });

    return Object.entries(envFailures)
      .filter(([env, failures]) => failures / envTotals[env] > 0.2)
      .map(([env]) => env);
  }

  private findPeakHours(hours: number[]): number[] {
    const hourCounts: Record<number, number> = {};
    hours.forEach((hour) => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour, 10));
  }

  private groupByDay(records: TestExecutionRecord[]): Record<string, number> {
    return records.reduce(
      (groups, record) => {
        const day = record.startTime.split("T")[0];
        groups[day] = (groups[day] || 0) + 1;
        return groups;
      },
      {} as Record<string, number>,
    );
  }

  private countByField(
    records: TestExecutionRecord[],
    field: keyof TestExecutionRecord,
  ): Record<string, number> {
    return records.reduce(
      (counts, record) => {
        const value = record[field] as string;
        counts[value] = (counts[value] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );
  }

  private calculateTestStability(records: TestExecutionRecord[]): number {
    const testGroups = this.groupRecordsByTest(records);
    const stableTests = Object.values(testGroups).filter((testRecords) => {
      const variability = this.calculateVariability(
        testRecords.map((r) => r.duration),
      );
      return variability < 0.3; // Coefficient of variation < 30%
    });

    return stableTests.length / Math.max(1, Object.keys(testGroups).length);
  }

  private calculateVariability(durations: number[]): number {
    if (durations.length < 2) return 0;

    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance =
      durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
      durations.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? stdDev / mean : 0;
  }

  private convertToCSV(analytics: any): string {
    // Simplified CSV conversion - would need proper implementation
    return "CSV format not implemented yet";
  }

  private getRecentRecords(days: number): TestExecutionRecord[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.executionRecords.filter(
      (record) => new Date(record.startTime) >= cutoff,
    );
  }

  private calculatePassRate(records: TestExecutionRecord[]): number {
    if (records.length === 0) return 0;
    return records.filter((r) => r.status === "passed").length / records.length;
  }

  private calculateAverageDuration(records: TestExecutionRecord[]): number {
    if (records.length === 0) return 0;
    return records.reduce((sum, r) => sum + r.duration, 0) / records.length;
  }

  private getPassRateTrend(days: number): number[] {
    // Simplified - would calculate daily pass rates
    return Array.from({ length: days }, () => Math.random() * 0.2 + 0.8);
  }

  private getDurationTrend(days: number): number[] {
    // Simplified - would calculate daily average durations
    return Array.from({ length: days }, () => Math.random() * 10000 + 15000);
  }

  private getFlakyTestTrend(days: number): number[] {
    // Simplified - would calculate daily flaky test counts
    return Array.from({ length: days }, () => Math.floor(Math.random() * 5));
  }

  private identifyTopIssues(
    records: TestExecutionRecord[],
    flakyTests: FlakyTestAnalysis[],
  ): {
    type: "flaky" | "slow" | "failing";
    testName: string;
    severity: "high" | "medium" | "low";
    description: string;
  }[] {
    const issues: {
      type: "flaky" | "slow" | "failing";
      testName: string;
      severity: "high" | "medium" | "low";
      description: string;
    }[] = [];

    // Add flaky test issues
    flakyTests.slice(0, 3).forEach((test) => {
      issues.push({
        type: "flaky",
        description: `Fails ${Math.round(test.flakyScore * 100)}% of the time`,
        severity:
          test.flakyScore > 0.7
            ? "high"
            : test.flakyScore > 0.4
              ? "medium"
              : "low",
        testName: test.testName,
      });
    });

    // Add slow test issues
    const slowTests = records
      .filter((r) => r.duration > 30000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 2);

    slowTests.forEach((test) => {
      issues.push({
        type: "slow",
        description: `Takes ${Math.round(test.duration / 1000)}s to complete`,
        severity: test.duration > 60000 ? "high" : "medium",
        testName: test.testName,
      });
    });

    return issues;
  }
}
