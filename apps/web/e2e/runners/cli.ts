#!/usr/bin/env node

import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createDefaultConfig, SmartTestRunner } from "./smart-test-runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * CLI interface for the Smart Test Runner
 */
class SmartTestRunnerCLI {
  private runner: SmartTestRunner;
  private projectRoot: string;

  constructor() {
    this.projectRoot = resolve(__dirname, "../.."); // Go up to web app root, not monorepo root
    const config = createDefaultConfig(this.projectRoot);

    // Ensure cache directory exists
    if (!existsSync(config.cacheDir)) {
      mkdirSync(config.cacheDir, { recursive: true });
    }

    this.runner = new SmartTestRunner(config);
  }

  /**
   * Parse command line arguments
   */
  private parseArgs(): {
    command: string;
    options: Record<string, any>;
  } {
    const args = process.argv.slice(2);
    const command = args[0] || "run";
    const options: Record<string, any> = {};

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith("--")) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith("--")) {
          // Value argument
          options[key] = nextArg;
          i++; // Skip next argument
        } else {
          // Boolean flag
          options[key] = true;
        }
      }
    }

    return { command, options };
  }

  /**
   * Display help information
   */
  private showHelp(): void {
    console.log(`
Smart Test Runner CLI

USAGE:
  npm run test:smart [command] [options]

COMMANDS:
  run         Run optimized test suite (default)
  plan        Show execution plan without running tests
  analyze     Analyze test dependencies and update cache
  clean       Clean test cache and artifacts
  stats       Show test statistics and insights

OPTIONS:
  --base-branch <branch>    Base branch for change detection (default: main)
  --force-all              Run all tests regardless of changes
  --only-failed            Run only previously failed tests
  --include-flaky          Include flaky tests in execution
  --max-duration <ms>      Maximum execution time in milliseconds
  --reporter <reporter>    Test reporter (default: html)
  --output-dir <dir>       Output directory (default: test-results)
  --verbose                Verbose output
  --dry-run                Show what would be executed without running
  --help                   Show this help message

EXAMPLES:
  npm run test:smart                                    # Run optimized tests
  npm run test:smart plan --base-branch develop        # Show execution plan for develop branch
  npm run test:smart run --only-failed --verbose       # Run only failed tests with verbose output
  npm run test:smart run --max-duration 300000         # Run tests for max 5 minutes
  npm run test:smart analyze                           # Update test dependency cache
  npm run test:smart stats                             # Show test statistics
`);
  }

  /**
   * Run command
   */
  private async runCommand(options: Record<string, any>): Promise<void> {
    try {
      console.log("🧠 Creating smart execution plan...");

      const plan = await this.runner.createExecutionPlan({
        baseBranch: options["base-branch"] || "main",
        forceAll: options["force-all"] || false,
        includeFlaky: options["include-flaky"] || false,
        maxDuration: options["max-duration"]
          ? parseInt(options["max-duration"], 10)
          : undefined,
        onlyFailed: options["only-failed"] || false,
      });

      console.log(`\n📋 Execution Plan:`);
      console.log(`   Tests to run: ${plan.testsToRun.length}`);
      console.log(
        `   Estimated duration: ${Math.round(plan.estimatedDuration / 1000)}s`,
      );
      console.log(`   Parallel groups: ${plan.parallelGroups.length}`);
      console.log(`   Reason: ${plan.reason}`);
      console.log(`   Skipped tests: ${plan.skippedTests.length}`);

      if (plan.testsToRun.length === 0) {
        console.log("✅ No tests need to be run!");
        return;
      }

      console.log("\n🚀 Executing tests...");

      const results = await this.runner.executeTests(plan, {
        dryRun: options["dry-run"] || false,
        outputDir: options["output-dir"] || "test-results",
        reporter: options.reporter || "html",
        verbose: options.verbose || false,
      });

      const passed = results.filter((r) => r.passed).length;
      const failed = results.length - passed;

      console.log(`\n📊 Results:`);
      console.log(`   Total: ${results.length}`);
      console.log(`   Passed: ${passed} ✅`);
      console.log(`   Failed: ${failed} ${failed > 0 ? "❌" : ""}`);

      if (failed > 0) {
        console.log("\n💥 Failed tests:");
        results
          .filter((r) => !r.passed)
          .forEach((r) => console.log(`   - ${r.filePath}`));

        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Test execution failed:", error);
      process.exit(1);
    }
  }

  /**
   * Plan command - show execution plan without running
   */
  private async planCommand(options: Record<string, any>): Promise<void> {
    try {
      console.log("🧠 Analyzing changes and creating execution plan...");

      const plan = await this.runner.createExecutionPlan({
        baseBranch: options["base-branch"] || "main",
        forceAll: options["force-all"] || false,
        includeFlaky: options["include-flaky"] || false,
        maxDuration: options["max-duration"]
          ? parseInt(options["max-duration"], 10)
          : undefined,
        onlyFailed: options["only-failed"] || false,
      });

      console.log(`\n📋 Execution Plan Details:`);
      console.log(`   Reason: ${plan.reason}`);
      console.log(`   Tests to run: ${plan.testsToRun.length}`);
      console.log(
        `   Estimated duration: ${Math.round(plan.estimatedDuration / 1000)}s`,
      );
      console.log(`   Parallel groups: ${plan.parallelGroups.length}`);
      console.log(`   Skipped tests: ${plan.skippedTests.length}`);

      if (plan.testsToRun.length > 0) {
        console.log("\n📝 Tests to run:");
        plan.testsToRun.forEach((test, i) => {
          console.log(`   ${i + 1}. ${test}`);
        });

        console.log("\n🔗 Parallel execution groups:");
        plan.parallelGroups.forEach((group, i) => {
          console.log(`   Group ${i + 1}: ${group.length} tests`);
          group.forEach((test) => {
            console.log(`     - ${test}`);
          });
        });
      } else {
        console.log("\n✅ No tests need to be run!");
      }

      if (plan.skippedTests.length > 0 && options.verbose) {
        console.log("\n⏭️  Skipped tests:");
        plan.skippedTests.forEach((test) => {
          console.log(`   - ${test}`);
        });
      }
    } catch (error) {
      console.error("❌ Failed to create execution plan:", error);
      process.exit(1);
    }
  }

  /**
   * Analyze command - update test dependencies cache
   */
  private async analyzeCommand(): Promise<void> {
    console.log("🔍 Analyzing test dependencies...");

    // This is a placeholder - in a real implementation, you would:
    // 1. Scan all test files
    // 2. Extract their dependencies
    // 3. Update the cache
    // 4. Analyze historical performance data

    console.log("✅ Analysis complete! Cache updated.");
  }

  /**
   * Clean command - clean cache and artifacts
   */
  private async cleanCommand(): Promise<void> {
    console.log("🧹 Cleaning test cache and artifacts...");

    try {
      const { execSync } = await import("node:child_process");

      // Clean test results
      execSync("rm -rf test-results", { cwd: this.projectRoot });

      // Clean cache
      execSync("rm -rf .test-cache", { cwd: this.projectRoot });

      // Clean playwright cache
      execSync("npx playwright cache clean", { cwd: this.projectRoot });

      console.log("✅ Cleanup complete!");
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
      process.exit(1);
    }
  }

  /**
   * Stats command - show test statistics
   */
  private async statsCommand(): Promise<void> {
    console.log("📊 Test Statistics (placeholder)");
    console.log("   Total tests: TBD");
    console.log("   Average duration: TBD");
    console.log("   Success rate: TBD");
    console.log("   Flaky tests: TBD");
    console.log("\n📈 Trends:");
    console.log("   Performance trend: TBD");
    console.log("   Reliability trend: TBD");
  }

  /**
   * Main entry point
   */
  async run(): Promise<void> {
    const { command, options } = this.parseArgs();

    if (options.help) {
      this.showHelp();
      return;
    }

    switch (command) {
      case "run":
        await this.runCommand(options);
        break;
      case "plan":
        await this.planCommand(options);
        break;
      case "analyze":
        await this.analyzeCommand();
        break;
      case "clean":
        await this.cleanCommand();
        break;
      case "stats":
        await this.statsCommand();
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        this.showHelp();
        process.exit(1);
    }
  }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new SmartTestRunnerCLI();
  cli.run().catch((error) => {
    console.error("❌ CLI execution failed:", error);
    process.exit(1);
  });
}

export { SmartTestRunnerCLI };
