import * as fs from "fs/promises";
import * as path from "path";

import { expect } from "@playwright/test";

import type { Locator, Page } from "@playwright/test";

export interface VisualTestOptions {
  animations?: "disabled" | "allow"; // How to handle animations
  maxDiffPixels?: number; // Maximum number of different pixels
  // Screenshot options
  threshold?: number; // Pixel difference threshold (0-1)

  // Responsive options
  viewports?: { width: number; height: number; name: string }[];

  clip?: { x: number; y: number; width: number; height: number }; // Area to screenshot
  // Element options
  mask?: Locator[]; // Elements to mask in screenshot

  generateDiff?: boolean; // Generate diff images on failure
  // Comparison options
  updateBaselines?: boolean; // Update baseline images
}

export interface VisualTestResult {
  baselinePath: string;
  diffPath?: string;
  imagePath: string;
  passed: boolean;
  pixelDifference?: number;
  threshold: number;
}

const DEFAULT_VIEWPORTS = [
  { width: 1920, name: "desktop", height: 1080 },
  { width: 1366, name: "laptop", height: 768 },
  { width: 768, name: "tablet", height: 1024 },
  { width: 375, name: "mobile", height: 667 },
];

export class VisualTester {
  private page: Page;
  private baselineDir: string;
  private outputDir: string;
  private testName: string;

  constructor(page: Page, testName: string) {
    this.page = page;
    this.testName = testName.replace(/[^a-zA-Z0-9-_]/g, "-");
    this.baselineDir = path.join(
      process.cwd(),
      "e2e",
      "screenshots",
      "baselines",
    );
    this.outputDir = path.join(process.cwd(), "test-results", "visual-tests");
  }

  /**
   * Take a screenshot and compare with baseline
   */
  async compareScreenshot(
    name: string,
    options: VisualTestOptions = {},
  ): Promise<VisualTestResult> {
    const {
      animations = "disabled",
      clip,
      generateDiff = true,
      mask = [],
      maxDiffPixels = 1000,
      threshold = 0.01,
      updateBaselines = process.env.UPDATE_SCREENSHOTS === "true",
    } = options;

    // Disable animations for consistent screenshots
    if (animations === "disabled") {
      await this.disableAnimations();
    }

    // Wait for page to be stable
    await this.waitForStability();

    const screenshotName = `${this.testName}-${name}`;
    const baselinePath = path.join(this.baselineDir, `${screenshotName}.png`);
    const actualPath = path.join(
      this.outputDir,
      `${screenshotName}-actual.png`,
    );
    const diffPath = path.join(this.outputDir, `${screenshotName}-diff.png`);

    // Ensure directories exist
    await fs.mkdir(this.baselineDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });

    // Take screenshot
    const screenshotOptions = {
      animations: animations === "disabled" ? "disabled" : undefined,
      clip,
      mask,
    } as const;

    const screenshot = await this.page.screenshot(screenshotOptions);
    await fs.writeFile(actualPath, screenshot);

    // If updating baselines, copy actual to baseline
    if (updateBaselines) {
      await fs.writeFile(baselinePath, screenshot);
      return {
        baselinePath,
        imagePath: actualPath,
        passed: true,
        threshold,
      };
    }

    // Check if baseline exists
    let baselineExists = false;
    try {
      await fs.access(baselinePath);
      baselineExists = true;
    } catch {
      // Baseline doesn't exist, create it
      await fs.writeFile(baselinePath, screenshot);
      console.log(`📸 Created new baseline: ${baselinePath}`);
      return {
        baselinePath,
        imagePath: actualPath,
        passed: true,
        threshold,
      };
    }

    // Compare with baseline using Playwright's visual comparison
    try {
      await expect(screenshot).toMatchSnapshot(`${screenshotName}.png`, {
        maxDiffPixels,
        threshold,
      });

      return {
        baselinePath,
        imagePath: actualPath,
        passed: true,
        threshold,
      };
    } catch (error) {
      // Generate diff image if requested
      let diffGenerated = false;
      if (generateDiff && baselineExists) {
        try {
          // Use Playwright's built-in diff generation
          await expect(screenshot).toMatchSnapshot(`${screenshotName}.png`, {
            maxDiffPixels,
            threshold,
          });
        } catch {
          // Diff should be generated in test-results
          diffGenerated = true;
        }
      }

      return {
        baselinePath,
        diffPath: diffGenerated ? diffPath : undefined,
        imagePath: actualPath,
        passed: false,
        threshold,
      };
    }
  }

  /**
   * Compare screenshot across multiple viewports
   */
  async compareAcrossViewports(
    name: string,
    options: VisualTestOptions = {},
  ): Promise<Record<string, VisualTestResult>> {
    const { viewports = DEFAULT_VIEWPORTS } = options;
    const results: Record<string, VisualTestResult> = {};

    for (const viewport of viewports) {
      await this.page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      // Wait a bit for the page to adjust to new viewport
      await this.page.waitForTimeout(500);

      const result = await this.compareScreenshot(
        `${name}-${viewport.name}`,
        options,
      );
      results[viewport.name] = result;
    }

    return results;
  }

  /**
   * Compare a specific element
   */
  async compareElement(
    locator: Locator,
    name: string,
    options: VisualTestOptions = {},
  ): Promise<VisualTestResult> {
    // Wait for element to be visible
    await locator.waitFor({ state: "visible" });

    // Get element bounding box for clipping
    const boundingBox = await locator.boundingBox();
    if (!boundingBox) {
      throw new Error(`Element not found for locator: ${locator}`);
    }

    return this.compareScreenshot(name, {
      ...options,
      clip: boundingBox,
    });
  }

  /**
   * Compare page at different scroll positions
   */
  async compareScrollPositions(
    name: string,
    positions: { x: number; y: number; name: string }[],
    options: VisualTestOptions = {},
  ): Promise<Record<string, VisualTestResult>> {
    const results: Record<string, VisualTestResult> = {};

    for (const position of positions) {
      await this.page.evaluate(({ x, y }) => {
        window.scrollTo(x, y);
      }, position);

      // Wait for scroll to complete
      await this.page.waitForTimeout(500);
      await this.waitForStability();

      const result = await this.compareScreenshot(
        `${name}-${position.name}`,
        options,
      );
      results[position.name] = result;
    }

    return results;
  }

  /**
   * Compare hover states
   */
  async compareHoverState(
    locator: Locator,
    name: string,
    options: VisualTestOptions = {},
  ): Promise<{ normal: VisualTestResult; hover: VisualTestResult }> {
    // Take normal state screenshot
    const normalResult = await this.compareElement(
      locator,
      `${name}-normal`,
      options,
    );

    // Hover and take screenshot
    await locator.hover();
    await this.page.waitForTimeout(200); // Wait for hover animation
    const hoverResult = await this.compareElement(
      locator,
      `${name}-hover`,
      options,
    );

    return {
      hover: hoverResult,
      normal: normalResult,
    };
  }

  /**
   * Compare form states (empty, filled, error)
   */
  async compareFormStates(
    formLocator: Locator,
    name: string,
    options: VisualTestOptions = {},
  ): Promise<Record<string, VisualTestResult>> {
    const results: Record<string, VisualTestResult> = {};

    // Empty state
    results.empty = await this.compareElement(
      formLocator,
      `${name}-empty`,
      options,
    );

    // Fill form with sample data
    const inputs = formLocator.locator(
      'input[type="text"], input[type="email"], textarea',
    );
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      await input.fill(`Sample data ${i + 1}`);
    }

    // Filled state
    results.filled = await this.compareElement(
      formLocator,
      `${name}-filled`,
      options,
    );

    // Error state (if validation exists)
    const submitButton = formLocator.locator(
      'button[type="submit"], input[type="submit"]',
    );
    if ((await submitButton.count()) > 0) {
      // Clear required fields to trigger validation
      const requiredInputs = formLocator.locator("input[required]");
      const requiredCount = await requiredInputs.count();

      if (requiredCount > 0) {
        for (let i = 0; i < requiredCount; i++) {
          await requiredInputs.nth(i).clear();
        }

        await submitButton.click();
        await this.page.waitForTimeout(500); // Wait for validation messages

        results.error = await this.compareElement(
          formLocator,
          `${name}-error`,
          options,
        );
      }
    }

    return results;
  }

  /**
   * Disable animations for consistent screenshots
   */
  private async disableAnimations(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `,
    });
  }

  /**
   * Wait for page to be visually stable
   */
  private async waitForStability(): Promise<void> {
    // Wait for network to be idle
    await this.page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await this.page.evaluate(() => document.fonts.ready);

    // Wait for images to load
    await this.page.evaluate(() => {
      const images = Array.from(document.images);
      return Promise.all(
        images
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              }),
          ),
      );
    });

    // Small buffer for any remaining rendering
    await this.page.waitForTimeout(200);
  }

  /**
   * Generate visual test report
   */
  static async generateReport(
    results: Record<string, VisualTestResult>,
  ): Promise<void> {
    const reportPath = path.join(
      process.cwd(),
      "test-results",
      "visual-report.html",
    );

    const failedTests = Object.entries(results).filter(
      ([, result]) => !result.passed,
    );
    const passedTests = Object.entries(results).filter(
      ([, result]) => result.passed,
    );

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Visual Regression Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
        .metric-card { background: white; border: 1px solid #e1e5e9; border-radius: 6px; padding: 15px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .passed { color: #1f883d; }
        .failed { color: #d1242f; }
        .test-result { border: 1px solid #e1e5e9; border-radius: 6px; margin: 15px 0; overflow: hidden; }
        .test-header { background: #f6f8fa; padding: 15px; font-weight: bold; }
        .test-images { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 20px; }
        .image-container { text-align: center; }
        .image-container img { max-width: 100%; border: 1px solid #e1e5e9; border-radius: 4px; }
        .image-label { margin: 10px 0; font-weight: 500; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📸 Visual Regression Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="metric-card">
            <div class="metric-value">${Object.keys(results).length}</div>
            <div>Total Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value passed">${passedTests.length}</div>
            <div>Passed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value failed">${failedTests.length}</div>
            <div>Failed</div>
        </div>
    </div>

    ${
      failedTests.length > 0
        ? `
    <h2>❌ Failed Tests</h2>
    ${failedTests
      .map(
        ([name, result]) => `
    <div class="test-result">
        <div class="test-header failed">${name}</div>
        <div class="test-images">
            <div class="image-container">
                <div class="image-label">Baseline</div>
                <img src="${path.relative(path.dirname(reportPath), result.baselinePath)}" alt="Baseline">
            </div>
            <div class="image-container">
                <div class="image-label">Actual</div>
                <img src="${path.relative(path.dirname(reportPath), result.imagePath)}" alt="Actual">
            </div>
            ${
              result.diffPath
                ? `
            <div class="image-container">
                <div class="image-label">Difference</div>
                <img src="${path.relative(path.dirname(reportPath), result.diffPath)}" alt="Difference">
            </div>
            `
                : ""
            }
        </div>
    </div>
    `,
      )
      .join("")}
    `
        : ""
    }

    <h2>✅ Passed Tests</h2>
    <p>${passedTests.length} tests passed visual comparison.</p>
</body>
</html>
    `.trim();

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, html);
    console.log(`📊 Visual test report generated: ${reportPath}`);
  }
}

/**
 * Helper function to create a visual tester
 */
export function createVisualTester(page: Page, testName: string): VisualTester {
  return new VisualTester(page, testName);
}

/**
 * Utilities for common visual testing scenarios
 */
export const visualTestHelpers = {
  /**
   * Test responsive design across common breakpoints
   */
  async testResponsiveDesign(
    page: Page,
    testName: string,
    options?: VisualTestOptions,
  ): Promise<Record<string, VisualTestResult>> {
    const tester = new VisualTester(page, testName);
    return tester.compareAcrossViewports("responsive", options);
  },

  /**
   * Test dark/light theme variations
   */
  async testThemeVariations(
    page: Page,
    testName: string,
    options?: VisualTestOptions,
  ): Promise<Record<string, VisualTestResult>> {
    const tester = new VisualTester(page, testName);
    const results: Record<string, VisualTestResult> = {};

    // Test light theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(200);
    results.light = await tester.compareScreenshot("light-theme", options);

    // Test dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(200);
    results.dark = await tester.compareScreenshot("dark-theme", options);

    return results;
  },

  /**
   * Test component states
   */
  async testComponentStates(
    page: Page,
    component: Locator,
    testName: string,
    states: { name: string; setup: () => Promise<void> }[],
    options?: VisualTestOptions,
  ): Promise<Record<string, VisualTestResult>> {
    const tester = new VisualTester(page, testName);
    const results: Record<string, VisualTestResult> = {};

    for (const state of states) {
      await state.setup();
      await page.waitForTimeout(200);
      results[state.name] = await tester.compareElement(
        component,
        state.name,
        options,
      );
    }

    return results;
  },
};
