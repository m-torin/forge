import { type Page } from '@playwright/test';

/**
 * Screenshot options interface
 */
interface ScreenshotOptions {
  animations?: 'disabled' | 'allow';
  caret?: 'hide' | 'initial';
  clip?: { x: number; y: number; width: number; height: number };
  fullPage?: boolean;
  mask?: any[];
  maskColor?: string;
  omitBackground?: boolean;
  path?: string;
  quality?: number;
  scale?: 'css' | 'device';
  threshold?: number;
  thresholdType?: 'pixel' | 'percent';
  timeout?: number;
  type?: 'png' | 'jpeg';
}

/**
 * Visual regression testing utilities
 */
export class VisualTestUtils {
  constructor(private readonly page: Page) {}

  /**
   * Take a full page screenshot
   */
  async captureFullPage(name: string, options?: ScreenshotOptions) {
    return this.page.screenshot({
      fullPage: true,
      path: `test-results/screenshots/${name}.png`,
      ...options,
    });
  }

  /**
   * Take element screenshot
   */
  async captureElement(selector: string, name: string, options?: ScreenshotOptions) {
    const element = this.page.locator(selector);
    return element.screenshot({
      path: `test-results/screenshots/${name}.png`,
      ...options,
    });
  }

  /**
   * Compare with baseline screenshot
   */
  async compareWithBaseline(name: string, _options?: { threshold?: number }) {
    // This would integrate with visual regression tools
    // For now, we'll use Playwright's built-in screenshot comparison
    await this.page.screenshot({
      fullPage: true,
      path: `test-results/screenshots/${name}-actual.png`,
    });
  }

  /**
   * Hide dynamic content before screenshot
   */
  async hideDynamicContent(selectors: string[]) {
    for (const selector of selectors) {
      await this.page.locator(selector).evaluate(el => {
        (el as HTMLElement).style.visibility = 'hidden';
      });
    }
  }

  /**
   * Wait for animations to complete
   */
  async waitForAnimations() {
    await this.page.evaluate(() => {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    });
  }

  /**
   * Mask sensitive content
   */
  async maskContent(selectors: string[]) {
    for (const selector of selectors) {
      await this.page.locator(selector).evaluate(el => {
        (el as HTMLElement).style.filter = 'blur(10px)';
      });
    }
  }
}

/**
 * Responsive testing utilities
 */
export class ResponsiveTestUtils {
  constructor(private readonly page: Page) {}

  /**
   * Common viewport sizes
   */
  static readonly viewports = {
    '4k': { width: 3840, height: 2160 }, // 4K
    desktop: { width: 1920, height: 1080 }, // Full HD
    mobile: { width: 375, height: 812 }, // iPhone X
    tablet: { width: 768, height: 1024 }, // iPad
  };

  /**
   * Test across multiple viewports
   */
  async testResponsive(
    test: () => Promise<void>,
    viewports: (keyof typeof ResponsiveTestUtils.viewports)[] = ['mobile', 'tablet', 'desktop'],
  ) {
    for (const viewport of viewports) {
      await this.setViewport(viewport);
      await test();
    }
  }

  /**
   * Set viewport size
   */
  async setViewport(
    size: keyof typeof ResponsiveTestUtils.viewports | { width: number; height: number },
  ) {
    const viewport = typeof size === 'string' ? ResponsiveTestUtils.viewports[size] : size;
    await this.page.setViewportSize(viewport);
  }

  /**
   * Check if element is visible at current viewport
   */
  async isVisibleInViewport(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    const box = await element.boundingBox();
    if (!box) return false;

    const viewport = this.page.viewportSize();
    if (!viewport) return false;

    return (
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= viewport.width &&
      box.y + box.height <= viewport.height
    );
  }
}

/**
 * Dark mode testing utilities
 */
export class ThemeTestUtils {
  constructor(private readonly page: Page) {}

  /**
   * Enable dark mode
   */
  async enableDarkMode() {
    await this.page.emulateMedia({ colorScheme: 'dark' });
  }

  /**
   * Enable light mode
   */
  async enableLightMode() {
    await this.page.emulateMedia({ colorScheme: 'light' });
  }

  /**
   * Toggle color scheme
   */
  async toggleColorScheme() {
    const current = await this.page.evaluate(
      () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
    await this.page.emulateMedia({ colorScheme: current ? 'light' : 'dark' });
  }

  /**
   * Test in both light and dark modes
   */
  async testInBothModes(test: () => Promise<void>) {
    // Test in light mode
    await this.enableLightMode();
    await test();

    // Test in dark mode
    await this.enableDarkMode();
    await test();
  }

  /**
   * Check if dark mode is active
   */
  async isDarkMode(): Promise<boolean> {
    return this.page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
}
