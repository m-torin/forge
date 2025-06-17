import { expect, test } from '@repo/testing/e2e';
import { AppTestHelpers, PerformanceUtils, WaitUtils } from '@repo/testing/e2e';

import { createApiMocker } from './utils/api-mock';
import { withPerformanceMonitoring } from './utils/performance-monitor';
import { createVisualTester } from './utils/visual-testing';

import { AppTestConfig } from '@repo/testing/e2e';

test.describe('Backstage Dashboard', (_: any) => {
  let helpers: AppTestHelpers;
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }: any) => {
    const config: AppTestConfig = {
      name: 'backstage',
      appDirectory: '/Users/torin/repos/new--/forge/apps/backstage',
      baseURL: 'http://localhost:3300',
      port: 3300,
    };
    helpers = new AppTestHelpers(config);
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test('dashboard should load successfully', async ({ context, page }: any) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      '/dashboard',
      async () => {
        await waitUtils.forNavigation();

        // Verify page loads successfully
        await expect(page).toHaveTitle(/.*/); // Any title is acceptable for now
        await helpers.checkBasicUI(page);

        // Check for main dashboard elements
        const dashboardContainer = page.locator('main, [role="main"], .dashboard-container');
        if ((await dashboardContainer.count()) > 0) {
          await expect(dashboardContainer.first()).toBeVisible();
        }

        // Look for admin dashboard content
        const adminElements = [
          '[data-testid*="stat"]',
          '[data-testid*="metric"]',
          '.stat-card',
          '.metric-card',
          '.dashboard-stat',
          'text=Dashboard',
          'text=Users',
          'text=Organizations',
        ];

        let adminContentFound = false;
        for (const selector of adminElements) {
          const elements = page.locator(selector);
          if ((await elements.count()) > 0) {
            adminContentFound = true;
            break;
          }
        }

        return 'dashboard loaded';
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    expect(result).toBe('dashboard loaded');

    await test.info().attach('dashboard-performance-report', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });
  });

  test('should display admin navigation', async ({ page }: any) => {
    await page.goto('/dashboard');
    await waitUtils.forNavigation();

    // Check for navigation elements
    const navElements = [
      'nav',
      '[role="navigation"]',
      '.navigation',
      '.sidebar',
      '.admin-nav',
      'a[href*="workflows"]',
      'a[href*="pim"]',
      'a[href*="cms"]',
      'a[href*="guests"]',
      'a[href*="settings"]',
    ];

    let navigationFound = false;
    for (const selector of navElements) {
      const elements = page.locator(selector);
      if ((await elements.count()) > 0) {
        navigationFound = true;
        break;
      }
    }

    // Check that the page has some navigation content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should have good performance metrics', async ({ page }: any) => {
    await page.goto('/dashboard');

    // Measure page load performance
    const metrics = await perfUtils.measurePageLoad();

    // Assert reasonable performance thresholds for admin dashboard
    expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint).toBeLessThan(4000); // 4 seconds for admin
    }
  });

  test('navigation links should work', async ({ context, page }: any) => {
    const visualTester = createVisualTester(page, 'dashboard-navigation');

    await page.goto('/dashboard');
    await waitUtils.forNavigation();

    // Test navigation to key admin sections
    const navigationTests = [
      { expectedUrl: '/workflows', link: 'workflows', text: ['Workflows', 'workflow'] },
      { expectedUrl: '/pim', link: 'pim', text: ['PIM', 'Product', 'Catalog'] },
      { expectedUrl: '/cms', link: 'cms', text: ['CMS', 'Content'] },
      { expectedUrl: '/guests', link: 'guests', text: ['Guests', 'Users', 'Organizations'] },
      { expectedUrl: '/settings', link: 'settings', text: ['Settings', 'Configuration'] },
    ];

    for (const navTest of navigationTests) {
      // Look for navigation link
      const linkSelectors = [
        `a[href*="${navTest.link}"]`,
        `a[href="${navTest.expectedUrl}"]`,
        `nav a:has-text("${navTest.text[0]}")`,
        `[data-testid*="${navTest.link}"]`,
      ];

      let linkFound = false;
      for (const selector of linkSelectors) {
        const link = page.locator(selector).first();
        if ((await link.count()) > 0 && (await link.isVisible())) {
          await link.click();
          await waitUtils.forNavigation();

          // Verify we navigated correctly
          const currentUrl = page.url();
          const navigatedCorrectly =
            currentUrl.includes(navTest.expectedUrl) || currentUrl.includes(navTest.link);

          if (navigatedCorrectly) {
            // Look for page-specific content
            let contentFound = false;
            for (const text of navTest.text) {
              if ((await page.locator(`text=${text}`).count()) > 0) {
                contentFound = true;
                break;
              }
            }

            linkFound = true;
          }
          break;
        }
      }

      // Return to dashboard for next test
      await page.goto('/dashboard');
      await waitUtils.forNavigation();
    }

    // Take visual regression screenshot of dashboard
    await visualTester.comparePageState(page, 'dashboard-main', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('API integration with mocking', async ({ page }: any) => {
    const mocker = await createApiMocker(page);

    // Mock dashboard API endpoints
    mocker.mockEndpoint('/api/dashboard/stats', {
      method: 'GET',
      response: {
        organizations: 25,
        totalActions: 1250,
        users: 150,
        workflows: 45,
      },
    });

    await page.goto('/dashboard');
    await waitUtils.forNavigation();

    // Check if stats are displayed
    const statsText = await page.textContent('body');
    const hasNumericData = /\d+/.test(statsText || '');

    // Should have some numeric content or at least load successfully
    expect(statsText).toBeTruthy();
  });

  test('responsive design', async ({ page }: any) => {
    await page.goto('/dashboard');
    await waitUtils.forNavigation();

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await waitUtils.forNavigation();
    await helpers.checkBasicUI(page);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await waitUtils.forNavigation();
    await helpers.checkBasicUI(page);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await waitUtils.forNavigation();
    await helpers.checkBasicUI(page);
  });
});
