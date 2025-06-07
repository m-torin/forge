import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

/**
 * Configuration for the smart test runner
 */
export interface SmartTestRunnerConfig {
  /** Cache directory for storing test metadata */
  cacheDir: string;
  /** File patterns that should trigger all tests when changed */
  criticalPatterns: string[];
  /** Git repository path */
  gitRepo: string;
  /** Maximum number of parallel workers */
  maxWorkers: number;
  /** Test prioritization weights */
  priorityWeights: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  /** Project root directory */
  projectRoot: string;
  /** Test directory relative to project root */
  testDir: string;
  /** Test file patterns to include */
  testPatterns: string[];
}

/**
 * Test metadata for caching and analysis
 */
export interface TestMetadata {
  averageDuration: number;
  dependencies: string[];
  fileHash: string;
  filePath: string;
  flakyScore: number;
  lastModified: number;
  lastRun: number;
  priority: "critical" | "high" | "medium" | "low";
  successRate: number;
  tags: string[];
}

/**
 * Test execution result
 */
export interface TestResult {
  duration: number;
  errors: string[];
  filePath: string;
  passed: boolean;
  retries: number;
  timestamp: number;
}

/**
 * Smart test execution plan
 */
export interface TestExecutionPlan {
  estimatedDuration: number;
  parallelGroups: string[][];
  reason: "all" | "changed" | "affected" | "failed" | "flaky";
  skippedTests: string[];
  testsToRun: string[];
}

/**
 * Smart Test Runner - Analyzes changes and optimizes test execution
 */
export class SmartTestRunner {
  private config: SmartTestRunnerConfig;
  private cache = new Map<string, TestMetadata>();
  private cacheFilePath: string;

  constructor(config: SmartTestRunnerConfig) {
    this.config = config;
    this.cacheFilePath = resolve(config.cacheDir, "test-metadata.json");
    this.loadCache();
  }

  /**
   * Analyze changed files and create an optimized test execution plan
   */
  async createExecutionPlan(
    options: {
      baseBranch?: string;
      forceAll?: boolean;
      onlyFailed?: boolean;
      includeFlaky?: boolean;
      maxDuration?: number;
    } = {},
  ): Promise<TestExecutionPlan> {
    const {
      baseBranch = "main",
      forceAll = false,
      includeFlaky = false,
      maxDuration,
      onlyFailed = false,
    } = options;

    try {
      // If forcing all tests or only failed tests
      if (forceAll) {
        return this.createFullExecutionPlan();
      }

      if (onlyFailed) {
        return this.createFailedTestsPlan();
      }

      // Get changed files since base branch
      const changedFiles = this.getChangedFiles(baseBranch);

      // Check if any critical files changed (requires running all tests)
      const hasCriticalChanges = this.hasCriticalChanges(changedFiles);

      if (hasCriticalChanges) {
        return this.createFullExecutionPlan("critical changes detected");
      }

      // Find affected tests based on changed files
      const affectedTests = this.findAffectedTests(changedFiles);

      // Add flaky tests if requested
      const testsToRun = includeFlaky
        ? [...affectedTests, ...this.getFlakyTests()]
        : affectedTests;

      // Remove duplicates and prioritize
      const uniqueTests = [...new Set(testsToRun)];
      const prioritizedTests = this.prioritizeTests(uniqueTests);

      // Apply duration limit if specified
      const finalTests = maxDuration
        ? this.limitByDuration(prioritizedTests, maxDuration)
        : prioritizedTests;

      // Create parallel execution groups
      const parallelGroups = this.createParallelGroups(finalTests);

      return {
        estimatedDuration: this.estimateDuration(finalTests),
        parallelGroups,
        reason: affectedTests.length > 0 ? "affected" : "changed",
        skippedTests: this.getAllTests().filter(
          (test) => !finalTests.includes(test),
        ),
        testsToRun: finalTests,
      };
    } catch (error) {
      console.warn(
        "Failed to analyze changes, falling back to full test suite:",
        error,
      );
      return this.createFullExecutionPlan("analysis failed");
    }
  }

  /**
   * Execute tests according to the execution plan
   */
  async executeTests(
    plan: TestExecutionPlan,
    options: {
      reporter?: string;
      outputDir?: string;
      verbose?: boolean;
      dryRun?: boolean;
    } = {},
  ): Promise<TestResult[]> {
    const {
      dryRun = false,
      outputDir = "test-results",
      reporter = "html",
      verbose = false,
    } = options;

    if (dryRun) {
      console.log("Dry run - would execute:", plan.testsToRun);
      return [];
    }

    console.log(
      `Executing ${plan.testsToRun.length} tests in ${plan.parallelGroups.length} parallel groups`,
    );
    console.log(
      `Estimated duration: ${Math.round(plan.estimatedDuration / 1000)}s`,
    );
    console.log(`Reason: ${plan.reason}`);

    const results: TestResult[] = [];
    const startTime = Date.now();

    try {
      // Execute tests in parallel groups
      for (let i = 0; i < plan.parallelGroups.length; i++) {
        const group = plan.parallelGroups[i];
        if (verbose) {
          console.log(
            `Executing group ${i + 1}/${plan.parallelGroups.length}: ${group.length} tests`,
          );
        }

        const groupResults = await this.executeTestGroup(group, {
          groupIndex: i,
          outputDir,
          reporter,
          verbose,
        });

        results.push(...groupResults);

        // Update cache with results
        groupResults.forEach((result) => this.updateTestMetadata(result));
      }

      // Save updated cache
      this.saveCache();

      const totalDuration = Date.now() - startTime;
      const passedTests = results.filter((r) => r.passed).length;

      console.log(
        `Completed ${results.length} tests in ${Math.round(totalDuration / 1000)}s`,
      );
      console.log(
        `Passed: ${passedTests}, Failed: ${results.length - passedTests}`,
      );

      return results;
    } catch (error) {
      console.error("Test execution failed:", error);
      throw error;
    }
  }

  /**
   * Get changed files since base branch
   */
  private getChangedFiles(baseBranch: string): string[] {
    try {
      // Try different branch comparisons, fallback to recent changes
      let gitCommand = `git diff --name-only HEAD~1...HEAD`;

      // Try various branch references in order of preference
      const branchesToTry = [
        baseBranch,
        `origin/${baseBranch}`,
        `letsfindmy/${baseBranch}`,
        "origin/main",
        "letsfindmy/main",
        "origin/master",
        "master",
      ];

      let branchFound = false;
      for (const branch of branchesToTry) {
        try {
          execSync(`git rev-parse ${branch}`, {
            cwd: this.config.gitRepo,
            encoding: "utf8",
            stdio: "pipe",
          });
          gitCommand = `git diff --name-only ${branch}...HEAD`;
          branchFound = true;
          break;
        } catch {
          // Continue to next branch
        }
      }

      if (!branchFound) {
        // Fallback to recent changes or staged/unstaged files
        try {
          const result = execSync("git diff --name-only --staged", {
            cwd: this.config.gitRepo,
            encoding: "utf8",
            stdio: "pipe",
          });
          if (result.trim()) {
            gitCommand = "git diff --name-only --staged";
          } else {
            gitCommand = "git diff --name-only HEAD~3...HEAD";
          }
        } catch {
          gitCommand = "git diff --name-only HEAD~3...HEAD";
        }
      }

      const output = execSync(gitCommand, {
        cwd: this.config.gitRepo,
        encoding: "utf8",
      });

      return output
        .split("\n")
        .filter((line) => line.trim())
        .map((file) => resolve(this.config.gitRepo, file));
    } catch (error) {
      console.warn(
        "Failed to get changed files, using current changes:",
        error,
      );

      // Fallback to staged and unstaged changes
      const staged = execSync("git diff --cached --name-only", {
        cwd: this.config.gitRepo,
        encoding: "utf8",
      });
      const unstaged = execSync("git diff --name-only", {
        cwd: this.config.gitRepo,
        encoding: "utf8",
      });

      return [...staged.split("\n"), ...unstaged.split("\n")]
        .filter((line) => line.trim())
        .map((file) => resolve(this.config.gitRepo, file));
    }
  }

  /**
   * Check if any critical files have changed
   */
  private hasCriticalChanges(changedFiles: string[]): boolean {
    return changedFiles.some((file) =>
      this.config.criticalPatterns.some((pattern) => file.includes(pattern)),
    );
  }

  /**
   * Find tests affected by changed files
   */
  private findAffectedTests(changedFiles: string[]): string[] {
    const affectedTests = new Set<string>();

    // Direct test file changes
    changedFiles.forEach((file) => {
      const relativePath = relative(this.config.projectRoot, file);

      // If it's a test file itself
      if (this.isTestFile(relativePath)) {
        affectedTests.add(relativePath);
      }

      // Find tests that depend on this file
      this.cache.forEach((metadata, testFile) => {
        if (metadata.dependencies.some((dep) => file.includes(dep))) {
          affectedTests.add(testFile);
        }
      });
    });

    // Add tests based on patterns
    changedFiles.forEach((file) => {
      // If a component changed, run related tests
      if (file.includes("/components/")) {
        const componentName = this.extractComponentName(file);
        this.findTestsByPattern(componentName).forEach((test) =>
          affectedTests.add(test),
        );
      }

      // If a page changed, run page tests
      if (file.includes("/app/") || file.includes("/pages/")) {
        this.findTestsByPattern("pages").forEach((test) =>
          affectedTests.add(test),
        );
      }
    });

    return Array.from(affectedTests);
  }

  /**
   * Get all test files
   */
  private getAllTests(): string[] {
    try {
      const testFiles: string[] = [];

      const findTests = (dir: string) => {
        if (!existsSync(dir)) {
          return [];
        }
        const files = execSync(
          `find ${dir} -name "*.spec.ts" -o -name "*.test.ts"`,
          {
            encoding: "utf8",
          },
        )
          .split("\n")
          .filter(Boolean);

        testFiles.push(
          ...files.map((file) => relative(this.config.projectRoot, file)),
        );
      };

      findTests(resolve(this.config.projectRoot, this.config.testDir));
      return testFiles;
    } catch (error) {
      console.warn("Failed to find test files:", error);
      return [];
    }
  }

  /**
   * Prioritize tests based on criticality and metadata
   */
  private prioritizeTests(tests: string[]): string[] {
    return tests.sort((a, b) => {
      const metaA = this.cache.get(a);
      const metaB = this.cache.get(b);

      if (!metaA && !metaB) return 0;
      if (!metaA) return 1;
      if (!metaB) return -1;

      // Priority weight
      const weightA = this.config.priorityWeights[metaA.priority];
      const weightB = this.config.priorityWeights[metaB.priority];

      if (weightA !== weightB) {
        return weightB - weightA; // Higher weight first
      }

      // Success rate (lower success rate = higher priority for fixing)
      if (metaA.successRate !== metaB.successRate) {
        return metaA.successRate - metaB.successRate;
      }

      // Duration (shorter tests first)
      return metaA.averageDuration - metaB.averageDuration;
    });
  }

  /**
   * Create parallel execution groups
   */
  private createParallelGroups(tests: string[]): string[][] {
    const groups: string[][] = [];
    const maxWorkers = this.config.maxWorkers;

    // Group tests by estimated duration to balance load
    const testDurations = tests.map((test) => ({
      duration: this.cache.get(test)?.averageDuration || 30000, // 30s default
      test,
    }));

    // Sort by duration (longest first for better load balancing)
    testDurations.sort((a, b) => b.duration - a.duration);

    // Initialize groups with estimated durations
    const groupDurations = new Array(maxWorkers).fill(0);
    for (let i = 0; i < maxWorkers; i++) {
      groups[i] = [];
    }

    // Assign tests to groups using greedy algorithm
    testDurations.forEach(({ test }) => {
      const shortestGroupIndex = groupDurations.indexOf(
        Math.min(...groupDurations),
      );
      groups[shortestGroupIndex].push(test);
      groupDurations[shortestGroupIndex] +=
        this.cache.get(test)?.averageDuration || 30000;
    });

    return groups.filter((group) => group.length > 0);
  }

  /**
   * Execute a group of tests
   */
  private async executeTestGroup(
    tests: string[],
    options: {
      reporter: string;
      outputDir: string;
      groupIndex: number;
      verbose: boolean;
    },
  ): Promise<TestResult[]> {
    const { groupIndex, outputDir, reporter, verbose } = options;
    const results: TestResult[] = [];

    const args = [
      "test",
      ...tests,
      "--reporter",
      reporter,
      "--output-dir",
      `${outputDir}/group-${groupIndex}`,
    ];

    if (verbose) {
      console.log(`Running: playwright ${args.join(" ")}`);
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const child = spawn("npx", ["playwright", ...args], {
        cwd: this.config.projectRoot,
        stdio: verbose ? "inherit" : "pipe",
      });

      let output = "";

      if (!verbose) {
        child.stdout?.on("data", (data) => {
          output += data.toString();
        });

        child.stderr?.on("data", (data) => {
          output += data.toString();
        });
      }

      child.on("close", (code) => {
        const duration = Date.now() - startTime;

        // Parse results from output or create basic results
        tests.forEach((test) => {
          results.push({
            duration: duration / tests.length, // Rough estimate
            errors: code === 0 ? [] : ["Test failed"],
            filePath: test,
            passed: code === 0,
            retries: 0,
            timestamp: Date.now(),
          });
        });

        resolve(results);
      });

      child.on("error", reject);
    });
  }

  /**
   * Create execution plan for all tests
   */
  private createFullExecutionPlan(
    reason = "all tests requested",
  ): TestExecutionPlan {
    const allTests = this.getAllTests();
    const prioritizedTests = this.prioritizeTests(allTests);
    const parallelGroups = this.createParallelGroups(prioritizedTests);

    return {
      estimatedDuration: this.estimateDuration(prioritizedTests),
      parallelGroups,
      reason: "all",
      skippedTests: [],
      testsToRun: prioritizedTests,
    };
  }

  /**
   * Create execution plan for previously failed tests
   */
  private createFailedTestsPlan(): TestExecutionPlan {
    const failedTests = Array.from(this.cache.entries())
      .filter(([, meta]) => meta.successRate < 1.0)
      .map(([test]) => test);

    const parallelGroups = this.createParallelGroups(failedTests);

    return {
      estimatedDuration: this.estimateDuration(failedTests),
      parallelGroups,
      reason: "failed",
      skippedTests: this.getAllTests().filter(
        (test) => !failedTests.includes(test),
      ),
      testsToRun: failedTests,
    };
  }

  /**
   * Get flaky tests (low success rate)
   */
  private getFlakyTests(): string[] {
    return Array.from(this.cache.entries())
      .filter(([, meta]) => meta.flakyScore > 0.3)
      .map(([test]) => test);
  }

  /**
   * Limit tests by maximum duration
   */
  private limitByDuration(tests: string[], maxDuration: number): string[] {
    let totalDuration = 0;
    const limitedTests: string[] = [];

    for (const test of tests) {
      const testDuration = this.cache.get(test)?.averageDuration || 30000;
      if (totalDuration + testDuration <= maxDuration) {
        limitedTests.push(test);
        totalDuration += testDuration;
      } else {
        break;
      }
    }

    return limitedTests;
  }

  /**
   * Estimate total duration for tests
   */
  private estimateDuration(tests: string[]): number {
    return tests.reduce((total, test) => {
      return total + (this.cache.get(test)?.averageDuration || 30000);
    }, 0);
  }

  /**
   * Check if file is a test file
   */
  private isTestFile(filePath: string): boolean {
    return this.config.testPatterns.some((pattern) =>
      filePath.includes(pattern),
    );
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.(tsx?|jsx?)$/, "");
  }

  /**
   * Find tests matching a pattern
   */
  private findTestsByPattern(pattern: string): string[] {
    return this.getAllTests().filter((test) =>
      test.toLowerCase().includes(pattern.toLowerCase()),
    );
  }

  /**
   * Update test metadata based on result
   */
  private updateTestMetadata(result: TestResult): void {
    const existing = this.cache.get(result.filePath) || {
      averageDuration: 30000,
      dependencies: [],
      fileHash: "",
      filePath: result.filePath,
      flakyScore: 0,
      lastModified: 0,
      lastRun: 0,
      priority: "medium" as const,
      successRate: 1.0,
      tags: [],
    };

    // Update duration (moving average)
    existing.averageDuration = Math.round(
      existing.averageDuration * 0.8 + result.duration * 0.2,
    );

    // Update success rate
    const totalRuns = Math.max(1, Math.floor(existing.successRate * 10));
    const successfulRuns = Math.floor(existing.successRate * totalRuns);
    const newTotalRuns = totalRuns + 1;
    const newSuccessfulRuns = successfulRuns + (result.passed ? 1 : 0);
    existing.successRate = newSuccessfulRuns / newTotalRuns;

    // Update flaky score based on recent failures and retries
    if (!result.passed || result.retries > 0) {
      existing.flakyScore = Math.min(1.0, existing.flakyScore + 0.1);
    } else {
      existing.flakyScore = Math.max(0, existing.flakyScore - 0.05);
    }

    existing.lastRun = result.timestamp;
    this.cache.set(result.filePath, existing);
  }

  /**
   * Load test metadata cache
   */
  private loadCache(): void {
    try {
      if (existsSync(this.cacheFilePath)) {
        const data = readFileSync(this.cacheFilePath, "utf8");
        const parsed = JSON.parse(data);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn("Failed to load test cache:", error);
      this.cache = new Map();
    }
  }

  /**
   * Save test metadata cache
   */
  private saveCache(): void {
    try {
      const data = Object.fromEntries(this.cache);
      writeFileSync(this.cacheFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn("Failed to save test cache:", error);
    }
  }

  /**
   * Generate file hash for change detection
   */
  private generateFileHash(filePath: string): string {
    try {
      const content = readFileSync(filePath, "utf8");
      return crypto.createHash("md5").update(content).digest("hex");
    } catch (error) {
      return "";
    }
  }

  /**
   * Analyze test dependencies
   */
  async analyzeDependencies(testFile: string): Promise<string[]> {
    try {
      const content = readFileSync(
        resolve(this.config.projectRoot, testFile),
        "utf8",
      );
      const dependencies: string[] = [];

      // Extract import statements
      const importRegex = /import.*from\s+['"](.*?)['"];?/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith("./") || importPath.startsWith("../")) {
          dependencies.push(importPath);
        }
      }

      return dependencies;
    } catch (error) {
      console.warn(`Failed to analyze dependencies for ${testFile}:`, error);
      return [];
    }
  }
}

/**
 * Default configuration for the web app
 */
export const createDefaultConfig = (
  projectRoot: string,
): SmartTestRunnerConfig => {
  // Find git repo root (go up until we find .git directory)
  let gitRepo = projectRoot;
  while (gitRepo !== dirname(gitRepo)) {
    if (existsSync(resolve(gitRepo, ".git"))) {
      break;
    }
    gitRepo = dirname(gitRepo);
  }

  return {
    cacheDir: resolve(projectRoot, ".test-cache"),
    criticalPatterns: [
      "package.json",
      "playwright.config",
      "next.config",
      "middleware.ts",
      "layout.tsx",
      "page.tsx",
      "env.ts",
    ],
    gitRepo,
    maxWorkers: process.env.CI
      ? 2
      : Math.max(1, Math.floor(require("os").cpus().length / 2)),
    priorityWeights: {
      critical: 100,
      high: 75,
      low: 25,
      medium: 50,
    },
    projectRoot,
    testDir: "e2e",
    testPatterns: [".spec.ts", ".test.ts"],
  };
};
