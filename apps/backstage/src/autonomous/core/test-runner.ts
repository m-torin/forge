// Comprehensive test runner for both Vitest and Playwright
import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { type TestFramework, type TestResult, type WorkflowSpecification } from '../types';

export class TestRunner {
  private vitestConfig = 'vitest.config.ts';
  private playwrightConfig = 'playwright.config.ts';
  private maxTestTimeout = 300000; // 5 minutes

  async runAllTests(spec: WorkflowSpecification): Promise<TestResult> {
    console.log('🧪 Running comprehensive test suite...');

    // Run tests in parallel for faster feedback
    const [vitestResults, playwrightResults] = await Promise.all([
      this.runVitest(spec),
      this.runPlaywright(spec),
    ]);

    // Calculate combined metrics
    const summary = {
      duration: Math.max(vitestResults.duration, playwrightResults.duration),
      failedTests: vitestResults.failedTests + playwrightResults.failedTests,
      passedTests: vitestResults.passedTests + playwrightResults.passedTests,
      skippedTests: vitestResults.skippedTests + playwrightResults.skippedTests,
      totalTests: vitestResults.totalTests + playwrightResults.totalTests,
    };

    const allPassed = vitestResults.passed && playwrightResults.passed;

    // Generate performance report
    const performanceMetrics = this.extractPerformanceMetrics(vitestResults, playwrightResults);

    return {
      allPassed,
      coverage: await this.getCoverageReport(),
      performanceMetrics,
      playwright: playwrightResults,
      summary,
      vitest: vitestResults,
    };
  }

  private async runVitest(spec: WorkflowSpecification): Promise<TestFramework> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      // Run Vitest with JSON reporter for structured output
      const vitestArgs = [
        'vitest',
        'run',
        '--reporter=json',
        '--reporter=verbose',
        '--coverage',
        `tests/unit/${spec.name}.test.ts`,
      ];

      console.log('🔬 Running Vitest unit tests...');

      const vitest = spawn('pnpm', vitestArgs, {
        env: {
          ...process.env,
          CI: 'true',
          NODE_ENV: 'test',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      vitest.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;

        // Extract progress information
        if (chunk.includes('✓') || chunk.includes('✗')) {
          process.stdout.write(chunk);
        }
      });

      vitest.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      vitest.on('close', (code) => {
        const duration = Date.now() - startTime;

        try {
          // Parse JSON output
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const results = JSON.parse(jsonMatch[0]);
            resolve(this.parseVitestResults(results, code, duration));
          } else {
            // Fallback parsing if JSON extraction fails
            resolve(this.parseVitestFallback(output, errorOutput, code, duration));
          }
        } catch (error) {
          console.error('Error parsing Vitest output:', error);
          resolve({
            duration,
            failedTests: 1,
            failures: [
              {
                actual: error.message,
                error: 'Failed to parse test output',
                expected: 'Valid test results',
                stack: errorOutput,
                testName: 'Vitest execution',
              },
            ],
            framework: 'vitest',
            passed: false,
            passedTests: 0,
            rawOutput: output + errorOutput,
            skippedTests: 0,
            totalTests: 0,
          });
        }
      });

      // Kill process if it takes too long
      setTimeout(() => {
        vitest.kill('SIGTERM');
        resolve({
          duration: this.maxTestTimeout,
          failedTests: 1,
          failures: [
            {
              actual: 'Timeout exceeded',
              error: 'Test timeout',
              expected: `Complete within ${this.maxTestTimeout}ms`,
              stack: '',
              testName: 'Vitest execution',
            },
          ],
          framework: 'vitest',
          passed: false,
          passedTests: 0,
          rawOutput: 'Test execution timed out',
          skippedTests: 0,
          totalTests: 0,
        });
      }, this.maxTestTimeout);
    });
  }

  private async runPlaywright(spec: WorkflowSpecification): Promise<TestFramework> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      // Run Playwright with JSON reporter
      const playwrightArgs = [
        'playwright',
        'test',
        '--reporter=json',
        '--reporter=list',
        `tests/e2e/${spec.name}.e2e.ts`,
      ];

      console.log('🎭 Running Playwright E2E tests...');

      const playwright = spawn('pnpm', playwrightArgs, {
        env: {
          ...process.env,
          CI: 'true',
          HEADLESS: 'true',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      playwright.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;

        // Show test progress
        if (chunk.includes('[') && chunk.includes(']')) {
          process.stdout.write(chunk);
        }
      });

      playwright.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      playwright.on('close', (code) => {
        const duration = Date.now() - startTime;

        try {
          // Parse JSON output
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const results = JSON.parse(jsonMatch[0]);
            resolve(this.parsePlaywrightResults(results, code, duration));
          } else {
            resolve(this.parsePlaywrightFallback(output, errorOutput, code, duration));
          }
        } catch (error) {
          console.error('Error parsing Playwright output:', error);
          resolve({
            duration,
            failedTests: 1,
            failures: [
              {
                actual: error.message,
                error: 'Failed to parse test output',
                expected: 'Valid test results',
                stack: errorOutput,
                testName: 'Playwright execution',
              },
            ],
            framework: 'playwright',
            passed: false,
            passedTests: 0,
            rawOutput: output + errorOutput,
            skippedTests: 0,
            totalTests: 0,
          });
        }
      });

      // Kill process if it takes too long
      setTimeout(() => {
        playwright.kill('SIGTERM');
        resolve({
          duration: this.maxTestTimeout,
          failedTests: 1,
          failures: [
            {
              actual: 'Timeout exceeded',
              error: 'Test timeout',
              expected: `Complete within ${this.maxTestTimeout}ms`,
              stack: '',
              testName: 'Playwright execution',
            },
          ],
          framework: 'playwright',
          passed: false,
          passedTests: 0,
          rawOutput: 'Test execution timed out',
          skippedTests: 0,
          totalTests: 0,
        });
      }, this.maxTestTimeout);
    });
  }

  private parseVitestResults(results: any, exitCode: number, duration: number): TestFramework {
    const testResults = results.testResults || [];
    const allTests = testResults.flatMap((file: any) => file.assertionResults || []);

    const failures = allTests
      .filter((test: any) => test.status === 'failed')
      .map((test: any) => ({
        actual: this.extractActual(test.failureMessages?.[0]),
        error: test.failureMessages?.[0] || 'Unknown error',
        expected: this.extractExpected(test.failureMessages?.[0]),
        stack: test.failureMessages?.join('\n') || '',
        testName: test.fullName || test.title || 'Unknown test',
      }));

    return {
      duration,
      failedTests: results.numFailedTests || failures.length,
      failures,
      framework: 'vitest',
      passed: exitCode === 0 && failures.length === 0,
      passedTests:
        results.numPassedTests || allTests.filter((t: any) => t.status === 'passed').length,
      rawOutput: JSON.stringify(results, null, 2),
      skippedTests:
        results.numPendingTests || allTests.filter((t: any) => t.status === 'skipped').length,
      totalTests: results.numTotalTests || allTests.length,
    };
  }

  private parseVitestFallback(
    output: string,
    errorOutput: string,
    exitCode: number,
    duration: number,
  ): TestFramework {
    // Fallback parsing using regex patterns
    const passMatch = output.match(/(\d+) passed/);
    const failMatch = output.match(/(\d+) failed/);
    const skipMatch = output.match(/(\d+) skipped/);
    const totalMatch = output.match(/(\d+) total/);

    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 0;
    const skipped = skipMatch ? parseInt(skipMatch[1]) : 0;
    const total = totalMatch ? parseInt(totalMatch[1]) : passed + failed + skipped;

    // Extract failure messages
    const failurePattern = /FAIL.*?(?=(?:PASS|FAIL|$))/gs;
    const failureMatches = output.match(failurePattern) || [];

    const failures = failureMatches.map((failure) => ({
      actual: 'Test failed',
      error: this.extractErrorMessage(failure),
      expected: 'Test to pass',
      stack: failure,
      testName: this.extractTestName(failure),
    }));

    return {
      duration,
      failedTests: failed,
      failures,
      framework: 'vitest',
      passed: exitCode === 0 && failed === 0,
      passedTests: passed,
      rawOutput: output + '\n' + errorOutput,
      skippedTests: skipped,
      totalTests: total,
    };
  }

  private parsePlaywrightResults(results: any, exitCode: number, duration: number): TestFramework {
    const suites = results.suites || [];
    const allTests = suites.flatMap(
      (suite: any) => suite.specs?.flatMap((spec: any) => spec.tests || []) || [],
    );

    const failures = allTests
      .filter((test: any) => test.status !== 'passed' && test.status !== 'skipped')
      .map((test: any) => ({
        actual: test.status,
        error: test.error?.message || test.results?.[0]?.error?.message || 'Unknown error',
        expected: 'Test to pass',
        stack: test.error?.stack || test.results?.[0]?.error?.stack || '',
        testName: test.title || 'Unknown test',
      }));

    const passed = allTests.filter((t: any) => t.status === 'passed').length;
    const failed = allTests.filter((t: any) => t.status === 'failed').length;
    const skipped = allTests.filter((t: any) => t.status === 'skipped').length;

    return {
      duration,
      failedTests: failed,
      failures,
      framework: 'playwright',
      passed: exitCode === 0 && failed === 0,
      passedTests: passed,
      rawOutput: JSON.stringify(results, null, 2),
      screenshots: this.extractScreenshots(results),
      skippedTests: skipped,
      totalTests: allTests.length,
    };
  }

  private parsePlaywrightFallback(
    output: string,
    errorOutput: string,
    exitCode: number,
    duration: number,
  ): TestFramework {
    // Fallback parsing for Playwright
    const passMatch = output.match(/(\d+) passed/);
    const failMatch = output.match(/(\d+) failed/);
    const skipMatch = output.match(/(\d+) skipped/);

    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 0;
    const skipped = skipMatch ? parseInt(skipMatch[1]) : 0;

    return {
      duration,
      failedTests: failed,
      failures: [],
      framework: 'playwright',
      passed: exitCode === 0 && failed === 0,
      passedTests: passed,
      rawOutput: output + '\n' + errorOutput,
      skippedTests: skipped,
      totalTests: passed + failed + skipped,
    };
  }

  private extractPerformanceMetrics(vitest: TestFramework, playwright: TestFramework): any {
    return {
      averageTestDuration:
        (vitest.duration + playwright.duration) / (vitest.totalTests + playwright.totalTests),
      e2eTestDuration: playwright.duration,
      slowestTests: this.identifySlowTests(vitest, playwright),
      totalDuration: vitest.duration + playwright.duration,
      unitTestDuration: vitest.duration,
    };
  }

  private identifySlowTests(vitest: TestFramework, playwright: TestFramework): any[] {
    // This would require more detailed timing info from test results
    // For now, return empty array
    return [];
  }

  private async getCoverageReport(): Promise<any> {
    try {
      const coveragePath = join(process.cwd(), 'coverage/coverage-summary.json');
      if (existsSync(coveragePath)) {
        const coverage = JSON.parse(readFileSync(coveragePath, 'utf-8'));
        return {
          branches: coverage.total.branches.pct,
          functions: coverage.total.functions.pct,
          lines: coverage.total.lines.pct,
          statements: coverage.total.statements.pct,
        };
      }
    } catch (error) {
      console.warn('Could not read coverage report:', error);
    }
    return null;
  }

  private extractExpected(failureMessage: string): string {
    const match = failureMessage?.match(/Expected: (.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'Not specified';
  }

  private extractActual(failureMessage: string): string {
    const match = failureMessage?.match(/Received: (.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'Not specified';
  }

  private extractTestName(failure: string): string {
    const match = failure.match(/✗ (.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'Unknown test';
  }

  private extractErrorMessage(failure: string): string {
    const match = failure.match(/Error: (.+?)(?:\n|$)/);
    return match ? match[1].trim() : failure.substring(0, 200);
  }

  private extractScreenshots(results: any): string[] {
    const screenshots: string[] = [];

    // Extract screenshot paths from Playwright results
    const suites = results.suites || [];
    suites.forEach((suite: any) => {
      suite.specs?.forEach((spec: any) => {
        spec.tests?.forEach((test: any) => {
          test.results?.forEach((result: any) => {
            if (result.attachments) {
              result.attachments
                .filter((a: any) => a.name === 'screenshot')
                .forEach((a: any) => screenshots.push(a.path));
            }
          });
        });
      });
    });

    return screenshots;
  }

  // Run specific test file
  async runTestFile(testPath: string, framework: 'vitest' | 'playwright'): Promise<TestFramework> {
    const spec = {
      name:
        testPath
          .split('/')
          .pop()
          ?.replace(/\.(test|e2e)\.ts$/, '') || 'unknown',
    };

    if (framework === 'vitest') {
      return this.runVitest(spec as WorkflowSpecification);
    } else {
      return this.runPlaywright(spec as WorkflowSpecification);
    }
  }

  // Watch mode for development
  async runTestsInWatchMode(spec: WorkflowSpecification): Promise<void> {
    console.log('👀 Starting tests in watch mode...');

    // Run Vitest in watch mode
    const vitestWatch = spawn('pnpm', ['vitest', `tests/unit/${spec.name}.test.ts`], {
      stdio: 'inherit',
    });

    // Handle process termination
    process.on('SIGINT', () => {
      vitestWatch.kill('SIGTERM');
      process.exit(0);
    });
  }
}
