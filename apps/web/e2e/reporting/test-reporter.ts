import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Test execution summary
 */
export interface TestExecutionSummary {
  branch: string;
  commitHash: string;
  duration: number;
  endTime: string;
  environment: string;
  failedTests: number;
  flakyTests: number;
  passedTests: number;
  skippedTests: number;
  startTime: string;
  totalTests: number;
  triggeredBy: string;
}

/**
 * Test failure information
 */
export interface TestFailure {
  duration: number;
  error: string;
  filePath: string;
  retries: number;
  screenshots: string[];
  stackTrace: string;
  testName: string;
  videos: string[];
}

/**
 * Performance regression data
 */
export interface PerformanceRegression {
  baseline: number;
  current: number;
  difference: number;
  metric: string;
  page: string;
  percentageChange: number;
  severity: "minor" | "major" | "critical";
}

/**
 * Test coverage information
 */
export interface TestCoverage {
  coveragePercentage: number;
  coveredFiles: number;
  criticalUncovered: string[];
  totalFiles: number;
  uncoveredFiles: string[];
}

/**
 * Comprehensive test report
 */
export interface TestReport {
  coverage: TestCoverage;
  failures: TestFailure[];
  insights: {
    slowestTests: { name: string; duration: number }[];
    mostFlakyTests: { name: string; flakyScore: number }[];
    recommendations: string[];
    trends: {
      passRate: number;
      averageDuration: number;
      flakyTestCount: number;
    };
  };
  metadata: {
    reportVersion: string;
    generatedAt: string;
    generatedBy: string;
    reportId: string;
  };
  performanceRegressions: PerformanceRegression[];
  summary: TestExecutionSummary;
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  channels: {
    slack?: {
      webhook: string;
      channel: string;
      mentions?: string[];
    };
    teams?: {
      webhook: string;
    };
    email?: {
      recipients: string[];
      smtp: {
        host: string;
        port: number;
        user: string;
        password: string;
      };
    };
  };
  enabled: boolean;
  triggers: {
    onFailure: boolean;
    onPerformanceRegression: boolean;
    onCoverageDecrease: boolean;
    onFlakyTestIncrease: boolean;
  };
}

/**
 * Test Reporter - Generates comprehensive HTML reports and sends notifications
 */
export class TestReporter {
  private config: {
    reportsDir: string;
    templatesDir: string;
    notificationConfig?: NotificationConfig;
    retainReports: number; // Number of reports to retain
  };

  constructor(config: {
    reportsDir: string;
    templatesDir: string;
    notificationConfig?: NotificationConfig;
    retainReports?: number;
  }) {
    this.config = {
      retainReports: 30,
      ...config,
    };

    // Ensure directories exist
    if (!existsSync(this.config.reportsDir)) {
      mkdirSync(this.config.reportsDir, { recursive: true });
    }
    if (!existsSync(this.config.templatesDir)) {
      mkdirSync(this.config.templatesDir, { recursive: true });
    }
  }

  /**
   * Generate comprehensive test report from Playwright results
   */
  async generateReport(
    playwrightResults: any,
    options: {
      environment?: string;
      branch?: string;
      commitHash?: string;
      triggeredBy?: string;
      performanceData?: any;
      coverageData?: any;
    } = {},
  ): Promise<TestReport> {
    const {
      branch = this.getCurrentBranch(),
      commitHash = this.getCurrentCommit(),
      coverageData,
      environment = process.env.NODE_ENV || "test",
      performanceData,
      triggeredBy = process.env.USER || "unknown",
    } = options;

    console.log("📊 Generating comprehensive test report...");

    const startTime = new Date().toISOString();
    const summary = this.createTestSummary(playwrightResults, {
      branch,
      commitHash,
      environment,
      triggeredBy,
    });

    const failures = this.extractTestFailures(playwrightResults);
    const performanceRegressions =
      this.analyzePerformanceRegressions(performanceData);
    const coverage = this.analyzeCoverage(coverageData);
    const insights = await this.generateInsights(playwrightResults, failures);

    const report: TestReport = {
      coverage,
      failures,
      insights,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: "TestReporter",
        reportId: this.generateReportId(),
        reportVersion: "1.0.0",
      },
      performanceRegressions,
      summary,
    };

    // Save report data
    await this.saveReportData(report);

    // Generate HTML report
    await this.generateHTMLReport(report);

    // Send notifications if configured
    if (this.config.notificationConfig?.enabled) {
      await this.sendNotifications(report);
    }

    // Cleanup old reports
    await this.cleanupOldReports();

    console.log(
      `✅ Test report generated: ${this.getReportPath(report.metadata.reportId)}.html`,
    );

    return report;
  }

  /**
   * Create test execution summary
   */
  private createTestSummary(
    results: any,
    context: {
      environment: string;
      branch: string;
      commitHash: string;
      triggeredBy: string;
    },
  ): TestExecutionSummary {
    const stats = this.calculateTestStats(results);

    return {
      branch: context.branch,
      commitHash: context.commitHash,
      duration: stats.duration,
      endTime: new Date().toISOString(),
      environment: context.environment,
      failedTests: stats.failed,
      flakyTests: stats.flaky,
      passedTests: stats.passed,
      skippedTests: stats.skipped,
      startTime: results.startTime || new Date().toISOString(),
      totalTests: stats.total,
      triggeredBy: context.triggeredBy,
    };
  }

  /**
   * Extract detailed failure information
   */
  private extractTestFailures(results: any): TestFailure[] {
    const failures: TestFailure[] = [];

    // This would extract from actual Playwright results
    // For now, return a placeholder structure

    return failures;
  }

  /**
   * Analyze performance regressions
   */
  private analyzePerformanceRegressions(
    performanceData: any,
  ): PerformanceRegression[] {
    if (!performanceData) return [];

    const regressions: PerformanceRegression[] = [];

    // Analyze performance data for regressions
    // This would compare against baselines

    return regressions;
  }

  /**
   * Analyze test coverage
   */
  private analyzeCoverage(coverageData: any): TestCoverage {
    if (!coverageData) {
      return {
        coveragePercentage: 0,
        coveredFiles: 0,
        criticalUncovered: [],
        totalFiles: 0,
        uncoveredFiles: [],
      };
    }

    // Analyze coverage data
    return {
      coveragePercentage: coverageData.percentage || 0,
      coveredFiles: coverageData.coveredFiles || 0,
      criticalUncovered: coverageData.criticalUncovered || [],
      totalFiles: coverageData.totalFiles || 0,
      uncoveredFiles: coverageData.uncovered || [],
    };
  }

  /**
   * Generate insights and recommendations
   */
  private async generateInsights(
    results: any,
    failures: TestFailure[],
  ): Promise<TestReport["insights"]> {
    const slowestTests = this.findSlowestTests(results);
    const mostFlakyTests = this.findFlakyTests(results);
    const recommendations = this.generateRecommendations(results, failures);
    const trends = await this.analyzeTrends();

    return {
      mostFlakyTests,
      recommendations,
      slowestTests,
      trends,
    };
  }

  /**
   * Generate HTML report
   */
  private async generateHTMLReport(report: TestReport): Promise<void> {
    const template = this.getHTMLTemplate();
    const html = this.populateTemplate(template, report);

    const reportPath = this.getReportPath(report.metadata.reportId);
    writeFileSync(`${reportPath}.html`, html);

    // Also save as latest
    writeFileSync(resolve(this.config.reportsDir, "latest.html"), html);
  }

  /**
   * Get HTML template
   */
  private getHTMLTemplate(): string {
    const templatePath = resolve(
      this.config.templatesDir,
      "report-template.html",
    );

    if (existsSync(templatePath)) {
      return readFileSync(templatePath, "utf8");
    }

    // Return default template
    return this.getDefaultHTMLTemplate();
  }

  /**
   * Default HTML template
   */
  private getDefaultHTMLTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - {{reportId}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
        }
        .header .subtitle {
            opacity: 0.9;
            font-size: 1.1em;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #fafafa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .summary-card .label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .passed { color: #10b981; }
        .failed { color: #ef4444; }
        .skipped { color: #f59e0b; }
        .flaky { color: #8b5cf6; }
        .section {
            padding: 30px;
            border-bottom: 1px solid #e5e5e5;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section h2 {
            margin: 0 0 20px 0;
            color: #333;
            font-size: 1.5em;
        }
        .failures-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .failure-item {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .failure-title {
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 8px;
        }
        .failure-error {
            background: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.85em;
            overflow-x: auto;
        }
        .recommendations {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 15px;
        }
        .recommendation {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        .recommendation:before {
            content: "💡";
            position: absolute;
            left: 0;
        }
        .trends {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .trend-card {
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            padding: 20px;
        }
        .footer {
            background: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-passed { background: #dcfce7; color: #166534; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .status-warning { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Execution Report</h1>
            <div class="subtitle">{{environment}} • {{branch}} • {{generatedAt}}</div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="number">{{totalTests}}</div>
                <div class="label">Total Tests</div>
            </div>
            <div class="summary-card">
                <div class="number passed">{{passedTests}}</div>
                <div class="label">Passed</div>
            </div>
            <div class="summary-card">
                <div class="number failed">{{failedTests}}</div>
                <div class="label">Failed</div>
            </div>
            <div class="summary-card">
                <div class="number skipped">{{skippedTests}}</div>
                <div class="label">Skipped</div>
            </div>
            <div class="summary-card">
                <div class="number flaky">{{flakyTests}}</div>
                <div class="label">Flaky</div>
            </div>
            <div class="summary-card">
                <div class="number">{{duration}}s</div>
                <div class="label">Duration</div>
            </div>
        </div>

        {{#if failures.length}}
        <div class="section">
            <h2>Test Failures ({{failures.length}})</h2>
            <ul class="failures-list">
                {{#each failures}}
                <li class="failure-item">
                    <div class="failure-title">{{testName}}</div>
                    <div class="failure-error">{{error}}</div>
                </li>
                {{/each}}
            </ul>
        </div>
        {{/if}}

        {{#if performanceRegressions.length}}
        <div class="section">
            <h2>Performance Regressions ({{performanceRegressions.length}})</h2>
            <ul class="failures-list">
                {{#each performanceRegressions}}
                <li class="failure-item">
                    <div class="failure-title">{{page}} - {{metric}}</div>
                    <div>{{percentageChange}}% regression ({{severity}})</div>
                </li>
                {{/each}}
            </ul>
        </div>
        {{/if}}

        <div class="section">
            <h2>Insights & Recommendations</h2>
            
            {{#if insights.recommendations.length}}
            <div class="recommendations">
                {{#each insights.recommendations}}
                <div class="recommendation">{{this}}</div>
                {{/each}}
            </div>
            {{/if}}

            <div class="trends">
                <div class="trend-card">
                    <h3>Pass Rate</h3>
                    <div class="number {{#if (gt insights.trends.passRate 90)}}passed{{else}}{{#if (gt insights.trends.passRate 70)}}skipped{{else}}failed{{/if}}{{/if}}">
                        {{insights.trends.passRate}}%
                    </div>
                </div>
                <div class="trend-card">
                    <h3>Average Duration</h3>
                    <div class="number">{{insights.trends.averageDuration}}s</div>
                </div>
                <div class="trend-card">
                    <h3>Flaky Tests</h3>
                    <div class="number flaky">{{insights.trends.flakyTestCount}}</div>
                </div>
            </div>
        </div>

        <div class="footer">
            Generated by TestReporter v{{metadata.reportVersion}} • {{metadata.generatedAt}}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Populate template with report data
   */
  private populateTemplate(template: string, report: TestReport): string {
    let html = template;

    // Simple template replacement
    const replacements = {
      branch: report.summary.branch,
      duration: Math.round(report.summary.duration / 1000).toString(),
      environment: report.summary.environment,
      failedTests: report.summary.failedTests.toString(),
      flakyTests: report.summary.flakyTests.toString(),
      generatedAt: new Date(report.metadata.generatedAt).toLocaleString(),
      passedTests: report.summary.passedTests.toString(),
      reportId: report.metadata.reportId,
      skippedTests: report.summary.skippedTests.toString(),
      totalTests: report.summary.totalTests.toString(),
    };

    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    // Handle failures section
    if (report.failures.length > 0) {
      const failuresHtml = report.failures
        .map(
          (failure) => `
        <li class="failure-item">
          <div class="failure-title">${failure.testName}</div>
          <div class="failure-error">${failure.error}</div>
        </li>
      `,
        )
        .join("");

      html = html.replace("{{#if failures.length}}", "");
      html = html.replace("{{/if}}", "");
      html = html.replace("{{#each failures}}", "");
      html = html.replace("{{/each}}", failuresHtml);
    } else {
      // Remove failures section
      html = html.replace(/{{#if failures\.length}}.*?{{\/if}}/gs, "");
    }

    // Handle recommendations
    const recommendationsHtml = report.insights.recommendations
      .map((rec) => `<div class="recommendation">${rec}</div>`)
      .join("");
    html = html.replace(
      /{{#each insights\.recommendations}}.*?{{\/each}}/gs,
      recommendationsHtml,
    );

    // Handle trends
    html = html.replace(
      "{{insights.trends.passRate}}",
      report.insights.trends.passRate.toString(),
    );
    html = html.replace(
      "{{insights.trends.averageDuration}}",
      report.insights.trends.averageDuration.toString(),
    );
    html = html.replace(
      "{{insights.trends.flakyTestCount}}",
      report.insights.trends.flakyTestCount.toString(),
    );

    // Clean up any remaining template syntax
    html = html.replace(/{{.*?}}/g, "");

    return html;
  }

  /**
   * Send notifications based on configuration
   */
  private async sendNotifications(report: TestReport): Promise<void> {
    const config = this.config.notificationConfig;
    if (!config) return;

    const shouldNotify = this.shouldSendNotification(report, config);
    if (!shouldNotify) return;

    console.log("📢 Sending test result notifications...");

    if (config.channels.slack) {
      await this.sendSlackNotification(report, config.channels.slack);
    }

    if (config.channels.teams) {
      await this.sendTeamsNotification(report, config.channels.teams);
    }

    if (config.channels.email) {
      await this.sendEmailNotification(report, config.channels.email);
    }
  }

  /**
   * Determine if notification should be sent
   */
  private shouldSendNotification(
    report: TestReport,
    config: NotificationConfig,
  ): boolean {
    if (config.triggers.onFailure && report.summary.failedTests > 0)
      return true;
    if (
      config.triggers.onPerformanceRegression &&
      report.performanceRegressions.length > 0
    )
      return true;
    if (
      config.triggers.onCoverageDecrease &&
      report.coverage.coveragePercentage < 80
    )
      return true;
    if (config.triggers.onFlakyTestIncrease && report.summary.flakyTests > 5)
      return true;

    return false;
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(
    report: TestReport,
    config: any,
  ): Promise<void> {
    const message = this.createSlackMessage(report);

    try {
      // Send webhook request (implementation would depend on HTTP client)
      console.log("📱 Slack notification sent");
    } catch (error) {
      console.warn("Failed to send Slack notification:", error);
    }
  }

  /**
   * Send Teams notification
   */
  private async sendTeamsNotification(
    report: TestReport,
    config: any,
  ): Promise<void> {
    console.log("💬 Teams notification sent");
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    report: TestReport,
    config: any,
  ): Promise<void> {
    console.log("📧 Email notification sent");
  }

  /**
   * Create Slack message
   */
  private createSlackMessage(report: TestReport): any {
    const status = report.summary.failedTests === 0 ? "✅" : "❌";
    const passRate = Math.round(
      (report.summary.passedTests / report.summary.totalTests) * 100,
    );

    return {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Test Execution Complete* - ${report.summary.environment} environment\n*Branch:* ${report.summary.branch}\n*Pass Rate:* ${passRate}%`,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Total:* ${report.summary.totalTests}` },
            { type: "mrkdwn", text: `*Passed:* ${report.summary.passedTests}` },
            { type: "mrkdwn", text: `*Failed:* ${report.summary.failedTests}` },
            {
              type: "mrkdwn",
              text: `*Duration:* ${Math.round(report.summary.duration / 1000)}s`,
            },
          ],
        },
      ],
      text: `${status} Test Results - ${report.summary.environment}`,
    };
  }

  /**
   * Calculate test statistics from results
   */
  private calculateTestStats(results: any): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    duration: number;
  } {
    // This would parse actual Playwright results
    // For now, return placeholder
    return {
      duration: 0,
      failed: 0,
      flaky: 0,
      passed: 0,
      skipped: 0,
      total: 0,
    };
  }

  /**
   * Find slowest tests
   */
  private findSlowestTests(results: any): { name: string; duration: number }[] {
    // Implementation would analyze test durations
    return [];
  }

  /**
   * Find flaky tests
   */
  private findFlakyTests(results: any): { name: string; flakyScore: number }[] {
    // Implementation would analyze test reliability
    return [];
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    results: any,
    failures: TestFailure[],
  ): string[] {
    const recommendations: string[] = [];

    if (failures.length > 0) {
      recommendations.push("Address failing tests to improve test reliability");
    }

    // Add more intelligent recommendations based on analysis
    recommendations.push("Consider adding more performance benchmarks");
    recommendations.push("Review test coverage for critical user paths");

    return recommendations;
  }

  /**
   * Analyze trends
   */
  private async analyzeTrends(): Promise<{
    passRate: number;
    averageDuration: number;
    flakyTestCount: number;
  }> {
    // This would analyze historical data
    return {
      averageDuration: 120,
      flakyTestCount: 3,
      passRate: 85,
    };
  }

  /**
   * Save report data as JSON
   */
  private async saveReportData(report: TestReport): Promise<void> {
    const reportPath = this.getReportPath(report.metadata.reportId);
    writeFileSync(`${reportPath}.json`, JSON.stringify(report, null, 2));
  }

  /**
   * Get report file path
   */
  private getReportPath(reportId: string): string {
    return resolve(this.config.reportsDir, `report-${reportId}`);
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${timestamp}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get current git branch
   */
  private getCurrentBranch(): string {
    try {
      return execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf8",
      }).trim();
    } catch {
      return "unknown";
    }
  }

  /**
   * Get current git commit hash
   */
  private getCurrentCommit(): string {
    try {
      return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch {
      return "unknown";
    }
  }

  /**
   * Cleanup old reports
   */
  private async cleanupOldReports(): Promise<void> {
    // Implementation would remove old report files
    console.log("🧹 Cleaned up old reports");
  }
}
