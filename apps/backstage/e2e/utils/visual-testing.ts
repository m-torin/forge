import * as fs from 'fs/promises';
import * as path from 'path';

import { expect, Locator, Page } from '@playwright/test';

export interface VisualTestOptions {
  animations?: 'disabled' | 'allow'; // How to handle animations
  maxDiffPixels?: number; // Maximum number of different pixels
  // Screenshot options
  threshold?: number; // Pixel difference threshold (0-1)

  // Responsive options
  viewports?: { width: number; height: number; name: string }[];

  clip?: { x: number; y: number; width: number; height: number }; // Area to screenshot
  // Element options
  mask?: Locator[]; // Elements to mask in screenshot

  fullPage?: boolean; // Take full page screenshot
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
  { width: 1920, name: 'desktop', height: 1080 },
  { width: 1366, name: 'laptop', height: 768 },
  { width: 768, name: 'tablet', height: 1024 },
  { width: 375, name: 'mobile', height: 667 },
];

export class VisualTester {
  private page: Page;
  private baselineDir: string;
  private outputDir: string;
  private testName: string;

  constructor(page: Page, testName = 'visual-test') {
    this.page = page;
    this.testName = testName.replace(/[^a-zA-Z0-9-_]/g, '-');
    this.baselineDir = path.join(process.cwd(), 'e2e', 'screenshots', 'baselines');
    this.outputDir = path.join(process.cwd(), 'test-results', 'visual-tests');
  }

  /**
   * Take a screenshot and compare with baseline
   */
  async compareScreenshot(
    name: string,
    options: VisualTestOptions = {},
  ): Promise<VisualTestResult> {
    const {
      animations = 'disabled',
      clip,
      fullPage = false,
      generateDiff = true,
      mask = [],
      maxDiffPixels = 1000,
      threshold = 0.01,
      updateBaselines = process.env.UPDATE_SCREENSHOTS === 'true',
    } = options;

    // Disable animations for consistent screenshots
    if (animations === 'disabled') {
      await this.disableAnimations();
    }

    // Wait for page to be stable
    await this.waitForStability();

    const screenshotName = `${this.testName}-${name}`;
    const baselinePath = path.join(this.baselineDir, `${screenshotName}.png`);
    const actualPath = path.join(this.outputDir, `${screenshotName}-actual.png`);
    const diffPath = path.join(this.outputDir, `${screenshotName}-diff.png`);

    // Ensure directories exist
    await fs.mkdir(this.baselineDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });

    // Take screenshot
    const screenshotOptions = {
      animations: animations === 'disabled' ? 'disabled' : undefined,
      clip,
      fullPage,
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
    } catch (error: any) {
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
   * Compare page state for comprehensive testing
   */
  async comparePageState(
    page: Page,
    name: string,
    options: VisualTestOptions = {},
  ): Promise<VisualTestResult> {
    return this.compareScreenshot(name, { ...options, fullPage: true });
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
    await locator.waitFor({ state: 'visible' });

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
   * Disable animations for consistent screenshots
   */
  private async disableAnimations(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important,
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
    await this.page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await this.page.evaluate(() => document.fonts.ready);

    // Wait for images to load
    await this.page.evaluate(() => {
      const images = Array.from(document.images);
      return Promise.all(
        images
          .filter((img: any) => !img.complete)
          .map(
            (img: any) =>
              new Promise((resolve: any) => {
                img.onload = img.onerror = resolve;
              }),
          ),
      );
    });

    // Small buffer for any remaining rendering
    await this.page.waitForTimeout(200);
  }
}

/**
 * Helper function to create a visual tester
 */
export function createVisualTester(page: Page, testName?: string): VisualTester {
  return new VisualTester(page, testName);
}
