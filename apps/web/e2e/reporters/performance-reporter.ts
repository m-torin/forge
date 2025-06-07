import * as fs from "fs/promises";
import * as path from "path";

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

interface PerformanceData {
  metrics: Record<string, number>;
  test: string;
  timestamp: string;
  url: string;
  violations: {
    metric: string;
    actual: number;
    threshold: number;
    severity: string;
  }[];
}

class PerformanceReporter implements Reporter {
  private performanceData: PerformanceData[] = [];
  private outputDir: string;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir || "test-results/performance";
  }

  onBegin(config: FullConfig, suite: Suite) {
    console.log(
      `🚀 Starting performance monitoring for ${suite.allTests().length} tests`,
    );
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Extract performance data from test annotations or attachments
    const performanceAnnotations = result.attachments.filter(
      (attachment) =>
        attachment.name.includes("performance") ||
        attachment.name.includes("metrics"),
    );

    performanceAnnotations.forEach((attachment) => {
      try {
        if (attachment.body) {
          const data = JSON.parse(attachment.body.toString());
          this.performanceData.push({
            url: data.url || "unknown",
            metrics: data.metrics || {},
            test: test.title,
            timestamp: new Date().toISOString(),
            violations: data.violations || [],
          });
        }
      } catch (error) {
        console.warn(
          `Failed to parse performance data for test "${test.title}":`,
          error,
        );
      }
    });
  }

  async onEnd(result: FullResult) {
    await this.generatePerformanceReport();

    const violationCount = this.performanceData.reduce(
      (count, data) => count + data.violations.length,
      0,
    );

    if (violationCount > 0) {
      console.log(`⚠️  Found ${violationCount} performance violations`);
    } else {
      console.log("✅ No performance violations detected");
    }

    console.log(
      `📊 Performance report generated at: ${this.outputDir}/performance-report.html`,
    );
  }

  private async generatePerformanceReport() {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Generate JSON report
      const jsonReport = {
        generatedAt: new Date().toISOString(),
        summary: this.generateSummary(),
        tests: this.performanceData,
      };

      await fs.writeFile(
        path.join(this.outputDir, "performance-data.json"),
        JSON.stringify(jsonReport, null, 2),
      );

      // Generate HTML report
      const htmlReport = await this.generateHTMLReport(jsonReport);
      await fs.writeFile(
        path.join(this.outputDir, "performance-report.html"),
        htmlReport,
      );

      // Generate CSV for easy analysis
      const csvReport = this.generateCSVReport();
      await fs.writeFile(
        path.join(this.outputDir, "performance-data.csv"),
        csvReport,
      );
    } catch (error) {
      console.error("Failed to generate performance report:", error);
    }
  }

  private generateSummary() {
    const summary = {
      averageMetrics: {} as Record<string, number>,
      totalTests: this.performanceData.length,
      violationsCount: 0,
      worstPerformers: [] as {
        test: string;
        metric: string;
        value: number;
      }[],
    };

    if (this.performanceData.length === 0) {
      return summary;
    }

    // Calculate violations
    summary.violationsCount = this.performanceData.reduce(
      (count, data) => count + data.violations.length,
      0,
    );

    // Calculate average metrics
    const metricSums: Record<string, { total: number; count: number }> = {};
    const worstPerformers: {
      test: string;
      metric: string;
      value: number;
    }[] = [];

    this.performanceData.forEach((data) => {
      Object.entries(data.metrics).forEach(([metric, value]) => {
        if (!metricSums[metric]) {
          metricSums[metric] = { count: 0, total: 0 };
        }
        metricSums[metric].total += value;
        metricSums[metric].count += 1;

        // Track worst performers
        worstPerformers.push({ metric, test: data.test, value });
      });
    });

    // Calculate averages
    Object.entries(metricSums).forEach(([metric, { count, total }]) => {
      summary.averageMetrics[metric] = Math.round(total / count);
    });

    // Sort and limit worst performers
    summary.worstPerformers = worstPerformers
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return summary;
  }

  private async generateHTMLReport(jsonReport: any): Promise<string> {
    const { summary, tests } = jsonReport;

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .metric-card { background: white; border: 1px solid #e1e5e9; border-radius: 6px; padding: 15px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #0969da; }
        .metric-label { font-size: 12px; color: #656d76; text-transform: uppercase; }
        .violations { background: #fff1f1; border-left: 4px solid #d1242f; padding: 15px; margin: 10px 0; }
        .test-result { border: 1px solid #e1e5e9; border-radius: 6px; margin: 10px 0; overflow: hidden; }
        .test-header { background: #f6f8fa; padding: 15px; font-weight: bold; }
        .test-content { padding: 15px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .metric { text-align: center; padding: 10px; background: #f6f8fa; border-radius: 4px; }
        .violation { background: #fff1f1; padding: 8px; margin: 5px 0; border-radius: 4px; }
        .error { color: #d1242f; }
        .warning { color: #bf8700; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e1e5e9; }
        th { background: #f6f8fa; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Performance Test Report</h1>
        <p>Generated on ${new Date(jsonReport.generatedAt).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="metric-card">
            <div class="metric-value">${summary.totalTests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value ${summary.violationsCount > 0 ? "error" : ""}">${summary.violationsCount}</div>
            <div class="metric-label">Violations</div>
        </div>
        ${Object.entries(summary.averageMetrics)
          .map(
            ([metric, value]) => `
        <div class="metric-card">
            <div class="metric-value">${value}${metric.includes("cls") ? "" : "ms"}</div>
            <div class="metric-label">Avg ${metric.toUpperCase()}</div>
        </div>
        `,
          )
          .join("")}
    </div>

    ${
      summary.violationsCount > 0
        ? `
    <div class="violations">
        <h3>⚠️ Performance Violations Detected</h3>
        <p>Found ${summary.violationsCount} performance violations across ${summary.totalTests} tests.</p>
    </div>
    `
        : ""
    }

    <h2>📊 Test Results</h2>
    ${tests
      .map(
        (test: PerformanceData) => `
    <div class="test-result">
        <div class="test-header">
            ${test.test}
            <small style="color: #656d76; font-weight: normal;">${test.url}</small>
        </div>
        <div class="test-content">
            <div class="metrics-grid">
                ${Object.entries(test.metrics)
                  .map(
                    ([metric, value]) => `
                <div class="metric">
                    <div style="font-size: 18px; font-weight: bold;">${value}${metric.includes("cls") ? "" : "ms"}</div>
                    <div style="font-size: 12px; color: #656d76;">${metric.toUpperCase()}</div>
                </div>
                `,
                  )
                  .join("")}
            </div>
            ${
              test.violations.length > 0
                ? `
            <div style="margin-top: 15px;">
                <strong>Violations:</strong>
                ${test.violations
                  .map(
                    (v) => `
                <div class="violation ${v.severity}">
                    ${v.severity === "error" ? "❌" : "⚠️"} ${v.metric}: ${v.actual}ms (threshold: ${v.threshold}ms)
                </div>
                `,
                  )
                  .join("")}
            </div>
            `
                : ""
            }
        </div>
    </div>
    `,
      )
      .join("")}

    ${
      summary.worstPerformers.length > 0
        ? `
    <h2>🐌 Worst Performers</h2>
    <table>
        <thead>
            <tr>
                <th>Test</th>
                <th>Metric</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            ${summary.worstPerformers
              .map(
                (p) => `
            <tr>
                <td>${p.test}</td>
                <td>${p.metric.toUpperCase()}</td>
                <td>${p.value}ms</td>
            </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>
    `
        : ""
    }
</body>
</html>
    `.trim();
  }

  private generateCSVReport(): string {
    const headers = [
      "Test",
      "URL",
      "LCP",
      "FID",
      "CLS",
      "FCP",
      "TTFB",
      "Load Complete",
      "Violations",
    ];
    const rows = this.performanceData.map((data) => [
      data.test,
      data.url,
      data.metrics.lcp || "",
      data.metrics.fid || "",
      data.metrics.cls || "",
      data.metrics.fcp || "",
      data.metrics.ttfb || "",
      data.metrics.loadComplete || "",
      data.violations.length,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
}

export default PerformanceReporter;
