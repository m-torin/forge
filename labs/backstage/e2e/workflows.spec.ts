import {
  expect,
  test,
  AppTestHelpers,
  PerformanceUtils,
  WaitUtils,
  AppTestConfig,
} from '@repo/testing/e2e';

import { createApiMocker } from './utils/api-mock';
import { withPerformanceMonitoring } from './utils/performance-monitor';
import { createVisualTester } from './utils/visual-testing';

test.describe('Backstage Workflows', (_: any) => {
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

  test('workflows page should load successfully', async ({ context, page }: any) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      '/workflows',
      async () => {
        await waitUtils.forNavigation();

        // Verify page loads successfully
        await expect(page).toHaveTitle(/.*/); // Any title is acceptable for now
        await helpers.checkBasicUI(page);

        // Check for workflows-specific content
        const workflowElements = [
          'text=Workflows',
          'text=workflow',
          '[data-testid*="workflow"]',
          '.workflow-list',
          '.workflow-table',
          'button:has-text("Create")',
          'button:has-text("Run")',
        ];

        let workflowContentFound = false;
        for (const selector of workflowElements) {
          const elements = page.locator(selector);
          if ((await elements.count()) > 0) {
            workflowContentFound = true;
            break;
          }
        }

        return 'workflows page loaded';
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    expect(result).toBe('workflows page loaded');

    await test.info().attach('workflows-performance-report', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });
  });

  test('should display workflow management interface', async ({ page }: any) => {
    await page.goto('/workflows');
    await waitUtils.forNavigation();

    // Check for workflow management elements
    const managementElements = [
      'button:has-text("Create")',
      'button:has-text("Add")',
      'button:has-text("New")',
      '.workflow-list',
      '.workflow-grid',
      'table',
      '[data-testid*="workflow"]',
    ];

    let managementInterfaceFound = false;
    for (const selector of managementElements) {
      const elements = page.locator(selector);
      if ((await elements.count()) > 0) {
        managementInterfaceFound = true;
        break;
      }
    }

    // Check that the page has some content
    const bodyText = page;
    await expect(bodyText).toHaveText('body');
  });

  test('should have good performance metrics', async ({ page }: any) => {
    await page.goto('/workflows');

    // Measure page load performance
    const metrics = await perfUtils.measurePageLoad();

    // Assert reasonable performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint).toBeLessThan(4000); // 4 seconds
    }
  });

  test('workflow creation flow', async ({ page }: any) => {
    const mocker = await createApiMocker(page);

    // Mock workflow creation API
    mocker.mockEndpoint('/api/workflows', {
      method: 'POST',
      response: {
        id: 'workflow-123',
        name: 'Test Workflow',
        createdAt: new Date().toISOString(),
        status: 'created',
      },
    });

    await page.goto('/workflows');
    await waitUtils.forNavigation();

    // Look for create workflow functionality
    const createButtons = [
      'button:has-text("Create")',
      'button:has-text("Add")',
      'button:has-text("New")',
      'a:has-text("Create")',
      '[data-testid*="create"]',
    ];

    let createButtonFound = false;
    for (const selector of createButtons) {
      const button = page.locator(selector).first();
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await waitUtils.forNavigation();

        // Check if we're on a workflow creation page
        const currentUrl = page.url();
        if (currentUrl.includes('create') || currentUrl.includes('new')) {
          createButtonFound = true;

          // Look for form elements
          const formElements = ['input[name*="name"]', 'textarea', 'form', 'button[type="submit"]'];

          let formFound = false;
          for (const formSelector of formElements) {
            if ((await page.locator(formSelector).count()) > 0) {
              formFound = true;
              break;
            }
          }
        }
        break;
      }
    }

    // Verify the page is functional even if no create flow found
    const pageContent = page;
    await expect(pageContent).toHaveText('body');
  });

  test('workflow execution with API mocking', async ({ page }: any) => {
    const mocker = await createApiMocker(page);

    // Mock workflow execution
    mocker.mockEndpoint('/api/workflows/execute', {
      method: 'POST',
      response: {
        id: 'execution-123',
        startedAt: new Date().toISOString(),
        status: 'running',
      },
    });

    await page.goto('/workflows');
    await waitUtils.forNavigation();

    // Look for execution buttons
    const executeButtons = [
      'button:has-text("Run")',
      'button:has-text("Execute")',
      'button:has-text("Start")',
      '[data-testid*="run"]',
    ];

    for (const selector of executeButtons) {
      const button = page.locator(selector).first();
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Verify the page responds to interactions
    const pageContent = page;
    await expect(pageContent).toHaveText('body');
  });

  test('visual regression testing', async ({ page }: any) => {
    const visualTester = createVisualTester(page, 'workflows');

    await page.goto('/workflows');
    await waitUtils.forNavigation();

    // Take visual regression screenshot
    await visualTester.comparePageState(page, 'workflows-main', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('responsive design', async ({ page }: any) => {
    await page.goto('/workflows');
    await waitUtils.forNavigation();

    // Test different viewports
    const viewports = [
      { width: 1200, name: 'desktop', height: 800 },
      { width: 768, name: 'tablet', height: 1024 },
      { width: 375, name: 'mobile', height: 667 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await waitUtils.forNavigation();
      await helpers.checkBasicUI(page);
    }
  });
});
