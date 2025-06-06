# Test info

- Name: Web App >> should display the homepage content
- Location: /Users/torin/repos/new--/forge/apps/web/e2e/app.spec.ts:31:7

# Error details

```
Error: page.goto: Test timeout of 10000ms exceeded.
Call log:
  - navigating to "http://localhost:3200/", waiting until "load"

    at /Users/torin/repos/new--/forge/apps/web/e2e/app.spec.ts:32:16
```

# Test source

```ts
   1 | import { test, expect } from '@repo/testing/e2e';
   2 | import { AppTestHelpers, WaitUtils, PerformanceUtils } from '@repo/testing/e2e';
   3 | import type { AppTestConfig } from '@repo/testing/e2e';
   4 |
   5 | test.describe('Web App', () => {
   6 |   let helpers: AppTestHelpers;
   7 |   let waitUtils: WaitUtils;
   8 |   let perfUtils: PerformanceUtils;
   9 |
  10 |   test.beforeEach(async ({ page }) => {
  11 |     const config: AppTestConfig = {
  12 |       name: 'web',
  13 |       appDirectory: '/Users/torin/repos/new--/forge/apps/web',
  14 |       baseURL: 'http://localhost:3200',
  15 |       port: 3200,
  16 |     };
  17 |     helpers = new AppTestHelpers(config);
  18 |     waitUtils = new WaitUtils(page);
  19 |     perfUtils = new PerformanceUtils(page);
  20 |   });
  21 |
  22 |   test('app should load successfully', async ({ page }) => {
  23 |     await page.goto('/');
  24 |     await waitUtils.forNavigation();
  25 |
  26 |     // The web app should respond with a 200 status
  27 |     await expect(page).toHaveTitle(/.*/); // Any title is acceptable for now
  28 |     await helpers.checkBasicUI(page);
  29 |   });
  30 |
  31 |   test('should display the homepage content', async ({ page }) => {
> 32 |     await page.goto('/');
     |                ^ Error: page.goto: Test timeout of 10000ms exceeded.
  33 |
  34 |     // Wait for the page to load and check for any content
  35 |     await waitUtils.forNavigation();
  36 |
  37 |     // Check that the page has some content
  38 |     const bodyText = await page.textContent('body');
  39 |     expect(bodyText).toBeTruthy();
  40 |   });
  41 |
  42 |   test('should have good performance metrics', async ({ page }) => {
  43 |     await page.goto('/');
  44 |
  45 |     // Measure page load performance
  46 |     const metrics = await perfUtils.measurePageLoad();
  47 |
  48 |     // Assert reasonable performance thresholds
  49 |     expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds
  50 |     if (metrics.firstContentfulPaint > 0) {
  51 |       expect(metrics.firstContentfulPaint).toBeLessThan(3000); // 3 seconds
  52 |     }
  53 |   });
  54 |
  55 |   test('health check endpoint should be accessible', async ({ page }) => {
  56 |     const response = await page.request.get('/api/health');
  57 |     expect(response.ok()).toBeTruthy();
  58 |   });
  59 | });
```
