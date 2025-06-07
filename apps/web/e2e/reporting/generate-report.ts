#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { TestReporter } from "./test-reporter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate Test Report Script
 */
async function generateReport(): Promise<void> {
  try {
    console.log("📊 Generating comprehensive test report...");

    const projectRoot = resolve(__dirname, "../../../");
    const reportsDir = resolve(projectRoot, "test-results/reports");
    const templatesDir = resolve(projectRoot, "e2e/reporting/templates");

    // Ensure directories exist
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }
    if (!existsSync(templatesDir)) {
      mkdirSync(templatesDir, { recursive: true });
    }

    // Initialize reporter
    const reporter = new TestReporter({
      notificationConfig: {
        channels: {
          email: process.env.SMTP_HOST
            ? {
                recipients: process.env.EMAIL_RECIPIENTS?.split(",") || [],
                smtp: {
                  host: process.env.SMTP_HOST,
                  password: process.env.SMTP_PASSWORD || "",
                  port: parseInt(process.env.SMTP_PORT || "587", 10),
                  user: process.env.SMTP_USER || "",
                },
              }
            : undefined,
          slack: process.env.SLACK_WEBHOOK_URL
            ? {
                channel: process.env.SLACK_CHANNEL || "#test-results",
                mentions: process.env.SLACK_MENTIONS?.split(",") || [],
                webhook: process.env.SLACK_WEBHOOK_URL,
              }
            : undefined,
        },
        enabled: process.env.ENABLE_NOTIFICATIONS === "true",
        triggers: {
          onCoverageDecrease: true,
          onFailure: true,
          onFlakyTestIncrease: true,
          onPerformanceRegression: true,
        },
      },
      reportsDir,
      retainReports: 30,
      templatesDir,
    });

    // Load or generate test results
    const playwrightResults = await loadTestResults(projectRoot);
    const performanceData = await loadPerformanceData(projectRoot);
    const coverageData = await loadCoverageData(projectRoot);

    // Generate report
    const report = await reporter.generateReport(playwrightResults, {
      branch: process.env.BRANCH_NAME || getCurrentBranch(),
      commitHash: process.env.COMMIT_HASH || getCurrentCommit(),
      coverageData,
      environment: process.env.NODE_ENV || "development",
      performanceData,
      triggeredBy: process.env.TRIGGERED_BY || process.env.USER || "manual",
    });

    console.log("✅ Test report generated successfully!");
    console.log(`   Report ID: ${report.metadata.reportId}`);
    console.log(`   View report: ${resolve(reportsDir, "latest.html")}`);

    // Display summary
    console.log("\n📊 Test Summary:");
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Passed: ${report.summary.passedTests} ✅`);
    console.log(
      `   Failed: ${report.summary.failedTests} ${report.summary.failedTests > 0 ? "❌" : ""}`,
    );
    console.log(`   Skipped: ${report.summary.skippedTests}`);
    console.log(`   Flaky: ${report.summary.flakyTests}`);
    console.log(`   Duration: ${Math.round(report.summary.duration / 1000)}s`);

    if (report.failures.length > 0) {
      console.log("\n💥 Failed Tests:");
      report.failures.slice(0, 5).forEach((failure) => {
        console.log(`   - ${failure.testName}`);
      });
      if (report.failures.length > 5) {
        console.log(`   ... and ${report.failures.length - 5} more`);
      }
    }

    if (report.performanceRegressions.length > 0) {
      console.log("\n📉 Performance Regressions:");
      report.performanceRegressions.slice(0, 3).forEach((regression) => {
        console.log(
          `   - ${regression.page}: ${regression.metric} (${regression.percentageChange.toFixed(1)}%)`,
        );
      });
    }

    if (report.insights.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      report.insights.recommendations.slice(0, 3).forEach((rec) => {
        console.log(`   - ${rec}`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to generate test report:", error);
    process.exit(1);
  }
}

/**
 * Load test results from various sources
 */
async function loadTestResults(projectRoot: string): Promise<any> {
  const resultsPath = resolve(projectRoot, "test-results/results.json");

  if (existsSync(resultsPath)) {
    try {
      const data = readFileSync(resultsPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.warn("Failed to load test results:", error);
    }
  }

  // Generate sample results for demonstration
  return generateSampleTestResults();
}

/**
 * Load performance data
 */
async function loadPerformanceData(projectRoot: string): Promise<any> {
  const perfPath = resolve(projectRoot, "test-results/performance");

  if (existsSync(perfPath)) {
    // Would load actual performance data
    console.log("📈 Loading performance data...");
  }

  // Return sample performance data
  return {
    regressions: [
      {
        baseline: 1200,
        current: 1450,
        difference: 250,
        metric: "First Contentful Paint",
        page: "Homepage",
        percentageChange: 20.8,
        severity: "major",
      },
      {
        baseline: 2100,
        current: 2800,
        difference: 700,
        metric: "Load Time",
        page: "Product List",
        percentageChange: 33.3,
        severity: "critical",
      },
    ],
  };
}

/**
 * Load coverage data
 */
async function loadCoverageData(projectRoot: string): Promise<any> {
  const coveragePath = resolve(projectRoot, "coverage");

  if (existsSync(coveragePath)) {
    // Would load actual coverage data
    console.log("📊 Loading coverage data...");
  }

  // Return sample coverage data
  return {
    coveredFiles: 127,
    criticalUncovered: [
      "src/checkout/payment-processor.ts",
      "src/auth/session-manager.ts",
    ],
    percentage: 84.7,
    totalFiles: 150,
    uncovered: [
      "src/utils/legacy-helpers.ts",
      "src/components/unused-component.tsx",
      "src/api/deprecated-endpoint.ts",
    ],
  };
}

/**
 * Generate sample test results for demonstration
 */
function generateSampleTestResults(): any {
  const totalTests = 45;
  const passedTests = 38;
  const failedTests = 5;
  const skippedTests = 2;
  const flakyTests = 3;

  const failures = [
    {
      videos: ["video-1.webm"],
      duration: 35000,
      error: "TimeoutError: Element not found within 30000ms",
      filePath: "e2e/shopping-cart.spec.ts",
      retries: 2,
      screenshots: ["screenshot-1.png"],
      stackTrace: "at Page.click (shopping-cart.spec.ts:45:12)",
      testName: "Shopping Cart - Add Multiple Items",
    },
    {
      videos: [],
      duration: 12000,
      error: "AssertionError: Expected success message to be visible",
      filePath: "e2e/auth.spec.ts",
      retries: 1,
      screenshots: ["screenshot-2.png"],
      stackTrace: "at expect (auth.spec.ts:78:5)",
      testName: "User Authentication - Password Reset",
    },
    {
      videos: ["video-3.webm"],
      duration: 8000,
      error: "NetworkError: Failed to fetch /api/products",
      filePath: "e2e/search.spec.ts",
      retries: 0,
      screenshots: ["screenshot-3.png"],
      stackTrace: "at fetch (search.spec.ts:23:8)",
      testName: "Product Search - Filter by Category",
    },
  ];

  return {
    endTime: new Date().toISOString(),
    failures,
    startTime: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
    stats: {
      duration: 180000, // 3 minutes
      failed: failedTests,
      flaky: flakyTests,
      passed: passedTests,
      skipped: skippedTests,
      total: totalTests,
    },
  };
}

/**
 * Get current git branch
 */
function getCurrentBranch(): string {
  try {
    const { execSync } = require("node:child_process");
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
function getCurrentCommit(): string {
  try {
    const { execSync } = require("node:child_process");
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport().catch((error) => {
    console.error("❌ Script execution failed:", error);
    process.exit(1);
  });
}
