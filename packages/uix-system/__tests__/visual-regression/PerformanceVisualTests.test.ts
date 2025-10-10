/**
 * Performance-Focused Visual Regression Tests
 *
 * Tests components under performance stress conditions:
 * - Large datasets and virtual scrolling
 * - Animation performance and frame rates
 * - Memory usage during complex interactions
 * - Render performance with many components
 * - Bundle size impact on visual loading states
 */

import { expect, Page, test } from '@playwright/test';
import { navigateToStory, setTheme } from './visual-regression-helpers';

interface PerformanceTestConfig {
  component: string;
  story: string;
  scenario: string;
  expectedBehavior: string;
  performanceMetrics: string[];
}

const PERFORMANCE_SCENARIOS: PerformanceTestConfig[] = [
  {
    component: 'RelationshipCombobox',
    story: 'LargeDataset',
    scenario: 'virtual-scrolling',
    expectedBehavior: 'Smooth scrolling through 1000+ items',
    performanceMetrics: ['FCP', 'LCP', 'CLS', 'FID'],
  },
  {
    component: 'LoadingSpinner',
    story: 'Variants',
    scenario: 'animation-performance',
    expectedBehavior: '60fps animation with minimal CPU usage',
    performanceMetrics: ['animation-fps', 'cpu-usage'],
  },
  {
    component: 'FormValidation',
    story: 'ComplexValidationScenario',
    scenario: 'form-interaction',
    expectedBehavior: 'Responsive validation without blocking UI',
    performanceMetrics: ['input-delay', 'validation-time'],
  },
  {
    component: 'AccessibleFormField',
    story: 'ComplexForm',
    scenario: 'many-fields',
    expectedBehavior: 'Fast rendering with 20+ form fields',
    performanceMetrics: ['render-time', 'memory-usage'],
  },
];

// Utility function to measure Web Vitals
async function measureWebVitals(page: Page) {
  return await page.evaluate(() => {
    return new Promise(resolve => {
      const metrics: Record<string, number> = {};

      // Measure FCP (First Contentful Paint)
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          metrics.FCP = fcp.startTime;
        }
      }).observe({ entryTypes: ['paint'] });

      // Measure LCP (Largest Contentful Paint)
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        metrics.LCP = lcp.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure CLS (Cumulative Layout Shift)
      let cumulativeLayoutShift = 0;
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShift += entry.value;
          }
        });
        metrics.CLS = cumulativeLayoutShift;
      }).observe({ entryTypes: ['layout-shift'] });

      // Return metrics after a delay to collect data
      setTimeout(() => resolve(metrics), 2000);
    });
  });
}

// Animation performance testing
async function measureAnimationPerformance(page: Page) {
  return await page.evaluate(() => {
    return new Promise(resolve => {
      const frameTimings: number[] = [];
      let frameCount = 0;
      let startTime = performance.now();

      function measureFrame() {
        const currentTime = performance.now();
        frameTimings.push(currentTime - startTime);
        startTime = currentTime;
        frameCount++;

        if (frameCount < 60) {
          // Measure 60 frames (1 second at 60fps)
          requestAnimationFrame(measureFrame);
        } else {
          const avgFrameTime = frameTimings.reduce((a, b) => a + b) / frameTimings.length;
          const fps = 1000 / avgFrameTime;
          const droppedFrames = frameTimings.filter(time => time > 16.67).length; // >60fps threshold

          resolve({
            averageFPS: fps,
            droppedFrames,
            frameTimings: frameTimings.slice(0, 10), // Sample of frame timings
          });
        }
      }

      requestAnimationFrame(measureFrame);
    });
  });
}

// Memory usage monitoring
async function measureMemoryUsage(page: Page) {
  return await page.evaluate(() => {
    const perf = performance as any;
    if (perf.memory) {
      return {
        usedJSHeapSize: perf.memory.usedJSHeapSize,
        totalJSHeapSize: perf.memory.totalJSHeapSize,
        jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
      };
    }
    return { error: 'Memory API not available' };
  });
}

test.describe('Performance Visual Regression Tests', () => {
  PERFORMANCE_SCENARIOS.forEach(
    ({ component, story, scenario, expectedBehavior, performanceMetrics }) => {
      test.describe(`${component} - ${scenario}`, () => {
        test('Performance baseline - light theme', async ({ page }) => {
          await page.setViewportSize({ width: 1200, height: 800 });
          await navigateToStory(page, component, story);
          await setTheme(page, 'light');

          // Measure initial load performance
          const webVitals = await measureWebVitals(page);
          console.log(`Web Vitals for ${component}-${scenario}:`, webVitals);

          // Take baseline screenshot
          await expect(page).toHaveScreenshot(`${component}-${scenario}-baseline.png`, {
            fullPage: true,
            animations: 'disabled',
            threshold: 0.1,
          });

          // Validate performance expectations
          if (performanceMetrics.includes('FCP')) {
            expect((webVitals as any).FCP).toBeLessThan(2000); // FCP < 2s
          }
          if (performanceMetrics.includes('LCP')) {
            expect((webVitals as any).LCP).toBeLessThan(2500); // LCP < 2.5s
          }
          if (performanceMetrics.includes('CLS')) {
            expect((webVitals as any).CLS).toBeLessThan(0.1); // CLS < 0.1
          }
        });

        test('Performance under load', async ({ page }) => {
          await page.setViewportSize({ width: 1200, height: 800 });
          await navigateToStory(page, component, story);
          await setTheme(page, 'light');

          // Simulate performance stress conditions
          switch (scenario) {
            case 'virtual-scrolling':
              // Test large dataset scrolling
              await page.locator('input').click(); // Open dropdown
              await page.waitForTimeout(300);

              // Scroll through virtual list
              const dropdown = page.locator('[role="listbox"], .mantine-Combobox-dropdown').first();
              for (let i = 0; i < 10; i++) {
                await dropdown.press('ArrowDown');
                await page.waitForTimeout(50);
              }

              // Measure scrolling performance
              const scrollPerformance = await measureAnimationPerformance(page);
              console.log(`Scrolling performance:`, scrollPerformance);
              expect((scrollPerformance as any).averageFPS).toBeGreaterThan(30); // At least 30fps
              break;

            case 'animation-performance':
              // Test animation performance
              const animationPerf = await measureAnimationPerformance(page);
              console.log(`Animation performance:`, animationPerf);
              expect((animationPerf as any).averageFPS).toBeGreaterThan(45); // At least 45fps
              expect((animationPerf as any).droppedFrames).toBeLessThan(5); // Less than 5 dropped frames
              break;

            case 'form-interaction':
              // Test form validation performance
              const inputs = await page.locator('input').all();
              const startTime = Date.now();

              for (let i = 0; i < inputs.length; i++) {
                await inputs[i].fill(`test${i}`);
                await inputs[i].blur();
                await page.waitForTimeout(50);
              }

              const endTime = Date.now();
              const totalTime = endTime - startTime;
              console.log(`Form interaction time: ${totalTime}ms for ${inputs.length} fields`);
              expect(totalTime / inputs.length).toBeLessThan(200); // Less than 200ms per field
              break;

            case 'many-fields':
              // Test rendering performance with many fields
              const renderStartTime = performance.now();
              await page.waitForSelector('input, select, textarea');
              const renderEndTime = performance.now();
              const renderTime = renderEndTime - renderStartTime;
              console.log(`Render time: ${renderTime}ms`);
              expect(renderTime).toBeLessThan(1000); // Less than 1s render time
              break;
          }

          // Take screenshot after performance test
          await expect(page).toHaveScreenshot(`${component}-${scenario}-under-load.png`, {
            fullPage: true,
            animations: 'disabled',
            threshold: 0.2,
          });

          // Measure memory usage
          const memoryUsage = await measureMemoryUsage(page);
          console.log(`Memory usage for ${component}-${scenario}:`, memoryUsage);
        });
      });
    },
  );
});

// Bundle size impact tests
test.describe('Bundle Size Visual Impact Tests', () => {
  test('Lazy loading visual states', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });

    // Test LazyIcon component loading states
    await navigateToStory(page, 'LazyIcon', 'PerformanceOptimization');
    await setTheme(page, 'light');

    // Capture loading state before icons load
    await expect(page).toHaveScreenshot('lazy-icons-loading-state.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.1,
    });

    // Wait for icons to load and capture final state
    await page.waitForFunction(() => {
      const icons = document.querySelectorAll('svg, [data-icon]');
      return Array.from(icons).length > 0;
    });

    await expect(page).toHaveScreenshot('lazy-icons-loaded-state.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.1,
    });
  });

  test('Component loading performance cascade', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });

    // Navigate to complex component story
    await navigateToStory(page, 'FormValidation', 'ComplexValidationScenario');
    await setTheme(page, 'light');

    // Measure cascade loading time
    const loadStartTime = Date.now();
    await page.waitForSelector('input, button, select', { timeout: 10000 });
    const loadEndTime = Date.now();
    const cascadeTime = loadEndTime - loadStartTime;

    console.log(`Component cascade load time: ${cascadeTime}ms`);
    expect(cascadeTime).toBeLessThan(3000); // Less than 3s for complete load

    // Capture final loaded state
    await expect(page).toHaveScreenshot('component-cascade-loaded.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.1,
    });
  });
});

// Stress testing scenarios
test.describe('Stress Test Visual Scenarios', () => {
  test('Maximum viewport stress test', async ({ page }) => {
    // Test with very large viewport
    await page.setViewportSize({ width: 2560, height: 1440 });
    await navigateToStory(page, 'AccessibleFormField', 'ComplexForm');
    await setTheme(page, 'light');

    // Measure render performance at large scale
    const renderMetrics = await measureWebVitals(page);
    console.log('Large viewport render metrics:', renderMetrics);

    await expect(page).toHaveScreenshot('large-viewport-stress.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });

  test('Minimum viewport stress test', async ({ page }) => {
    // Test with very small viewport
    await page.setViewportSize({ width: 320, height: 568 });
    await navigateToStory(page, 'RelationshipCombobox', 'Default');
    await setTheme(page, 'light');

    // Test that components don't break at small sizes
    await page.locator('input').click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('small-viewport-stress.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.3,
    });
  });

  test('Rapid interaction stress test', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'RelationshipCombobox', 'Default');
    await setTheme(page, 'light');

    // Perform rapid interactions
    const input = page.locator('input');
    const startTime = Date.now();

    for (let i = 0; i < 20; i++) {
      await input.fill(`test${i}`);
      await page.waitForTimeout(25); // Rapid typing simulation
      await input.clear();
    }

    const endTime = Date.now();
    const interactionTime = endTime - startTime;
    console.log(`Rapid interaction test time: ${interactionTime}ms`);

    // Component should remain visually stable
    await expect(page).toHaveScreenshot('rapid-interaction-final-state.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });
});

// Network condition simulation
test.describe('Network Performance Visual Tests', () => {
  test('Slow network simulation', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', route => {
      return new Promise(resolve => {
        setTimeout(() => resolve(route.continue()), 100); // 100ms delay
      });
    });

    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'LazyIcon', 'CommonIcons');
    await setTheme(page, 'light');

    // Test loading behavior under slow network
    await expect(page).toHaveScreenshot('slow-network-loading.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });
});
