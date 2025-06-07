#!/usr/bin/env node

import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DashboardGenerator } from "./dashboard-generator.js";
import { TestAnalytics } from "./test-analytics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate Analytics Dashboard Script
 */
async function generateDashboard(): Promise<void> {
  try {
    console.log("📊 Generating test analytics dashboard...");

    const projectRoot = resolve(__dirname, "../../../");
    const dataDir = resolve(projectRoot, ".test-cache");
    const outputDir = resolve(projectRoot, "test-results/analytics");

    // Ensure directories exist
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Initialize analytics engine
    const analytics = new TestAnalytics(dataDir);

    // Generate sample data if no data exists
    const sampleData = await generateSampleData();
    if (sampleData.length > 0) {
      analytics.recordExecutions(sampleData);
      console.log(
        `📝 Added ${sampleData.length} sample execution records for demonstration`,
      );
    }

    // Generate dashboard
    const generator = new DashboardGenerator(outputDir);
    generator.generateDashboard(analytics);

    console.log("✅ Analytics dashboard generated successfully!");
    console.log(
      `   View dashboard: ${resolve(outputDir, "test-analytics-dashboard.html")}`,
    );
    console.log("   Open in browser to see interactive charts and insights");
  } catch (error) {
    console.error("❌ Failed to generate analytics dashboard:", error);
    process.exit(1);
  }
}

/**
 * Generate sample test execution data for demonstration
 */
async function generateSampleData(): Promise<any[]> {
  const sampleData = [];
  const testNames = [
    "Homepage - Load Performance",
    "User Authentication - Sign In",
    "Product Search - Filter Results",
    "Shopping Cart - Add Items",
    "Checkout Process - Payment",
    "User Profile - Update Information",
    "Product Detail - Load Images",
    "Navigation - Menu Interaction",
    "Form Validation - Error Handling",
    "Mobile - Responsive Design",
  ];

  const browsers = ["chromium", "firefox", "webkit"];
  const environments = ["development", "staging", "production"];
  const branches = ["main", "feature/checkout", "feature/search", "develop"];

  // Generate data for the last 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);

    // Generate 5-15 test executions per day
    const executionsPerDay = Math.floor(Math.random() * 11) + 5;

    for (let i = 0; i < executionsPerDay; i++) {
      const testName = testNames[Math.floor(Math.random() * testNames.length)];
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const environment =
        environments[Math.floor(Math.random() * environments.length)];
      const branch = branches[Math.floor(Math.random() * branches.length)];

      // Simulate execution time
      const executionTime = new Date(date);
      executionTime.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60),
      );

      // Generate realistic test outcomes
      let status: "passed" | "failed" | "skipped" | "flaky" = "passed";
      let retries = 0;
      let duration = Math.floor(Math.random() * 30000) + 5000; // 5-35 seconds
      let error: string | undefined;

      // Introduce some flaky and failing tests
      const randomOutcome = Math.random();
      if (randomOutcome < 0.05) {
        // 5% failure rate
        status = "failed";
        error = generateRandomError();
        duration *= 0.5; // Failed tests often fail faster
      } else if (randomOutcome < 0.08) {
        // 3% flaky rate
        status = "flaky";
        retries = Math.floor(Math.random() * 3) + 1;
        duration *= 1.5; // Flaky tests take longer due to retries
      } else if (randomOutcome < 0.1) {
        // 2% skip rate
        status = "skipped";
        duration = 0;
      }

      // Some tests are consistently slower
      if (testName.includes("Performance") || testName.includes("Load")) {
        duration *= 2;
      }

      // Mobile tests are often slower
      if (testName.includes("Mobile")) {
        duration *= 1.3;
      }

      sampleData.push({
        branch,
        browser,
        buildId: `build-${Math.floor(Math.random() * 10000)}`,
        commitHash: generateRandomCommitHash(),
        duration,
        endTime: new Date(executionTime.getTime() + duration).toISOString(),
        environment,
        error,
        filePath: `e2e/${testName.toLowerCase().replace(/\s+/g, "-")}.spec.ts`,
        metadata: {
          nodeVersion: "22.0.0",
          os: "linux",
          playwrightVersion: "1.40.0",
        },
        retries,
        startTime: executionTime.toISOString(),
        status,
        tags: generateRandomTags(testName),
        testName,
      });
    }
  }

  return sampleData;
}

/**
 * Generate random error messages
 */
function generateRandomError(): string {
  const errors = [
    "TimeoutError: Element not found within 30000ms",
    'AssertionError: Expected "Welcome" to be visible',
    "NetworkError: Failed to fetch /api/products",
    "ElementNotInteractableError: Element is not clickable",
    'ElementNotFoundError: Selector "button[data-testid=submit]" not found',
    "TimeoutError: Navigation timeout after 30000ms",
    "Error: Page crashed during test execution",
    "AssertionError: Expected pass rate to be > 95%, got 87%",
  ];

  return errors[Math.floor(Math.random() * errors.length)];
}

/**
 * Generate random commit hash
 */
function generateRandomCommitHash(): string {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Generate random tags based on test name
 */
function generateRandomTags(testName: string): string[] {
  const allTags = [
    "smoke",
    "regression",
    "performance",
    "critical",
    "ui",
    "api",
    "mobile",
    "desktop",
  ];
  const tags = ["e2e"]; // All tests get e2e tag

  if (testName.includes("Performance") || testName.includes("Load")) {
    tags.push("performance");
  }
  if (testName.includes("Mobile")) {
    tags.push("mobile");
  }
  if (testName.includes("Authentication") || testName.includes("Checkout")) {
    tags.push("critical");
  }
  if (testName.includes("UI") || testName.includes("Navigation")) {
    tags.push("ui");
  }

  // Add 1-2 random tags
  const remainingTags = allTags.filter((tag) => !tags.includes(tag));
  const numRandomTags = Math.floor(Math.random() * 3);

  for (let i = 0; i < numRandomTags && remainingTags.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * remainingTags.length);
    tags.push(remainingTags.splice(randomIndex, 1)[0]);
  }

  return tags;
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDashboard().catch((error) => {
    console.error("❌ Script execution failed:", error);
    process.exit(1);
  });
}
