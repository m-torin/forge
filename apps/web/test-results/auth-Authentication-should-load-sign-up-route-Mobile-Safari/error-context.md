# Test info

- Name: Authentication >> should load sign-up route
- Location: /Users/torin/repos/new--/forge/apps/web/e2e/auth.spec.ts:40:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 500
Received:   500
    at /Users/torin/repos/new--/forge/apps/web/e2e/auth.spec.ts:43:32
```

# Test source

```ts
   1 | import { test, expect } from '@repo/testing/e2e';
   2 | import {
   3 |   createAuthHelpers,
   4 |   AuthPage,
   5 |   PageObjectFactory,
   6 |   APITestUtils
   7 | } from '@repo/testing/e2e';
   8 | import type { BetterAuthTestHelpers } from '@repo/testing/e2e';
   9 |
  10 | test.describe('Authentication', () => {
  11 |   let authHelpers: BetterAuthTestHelpers;
  12 |   let authPage: AuthPage;
  13 |   let pageFactory: PageObjectFactory;
  14 |   let apiUtils: APITestUtils;
  15 |
  16 |   test.beforeEach(async ({ page, request }) => {
  17 |     authHelpers = createAuthHelpers('http://localhost:3200');
  18 |     pageFactory = new PageObjectFactory(page);
  19 |     authPage = pageFactory.createAuthPage();
  20 |     apiUtils = new APITestUtils(request);
  21 |   });
  22 |
  23 |   test('auth routes should exist', async ({ page }) => {
  24 |     // Test that auth routes are accessible
  25 |     const authRoutes = ['/api/auth/sign-in', '/api/auth/sign-up'];
  26 |
  27 |     for (const route of authRoutes) {
  28 |       const response = await page.request.get(route);
  29 |       // Auth routes should exist, even if they return 405 for GET requests
  30 |       expect(response.status()).toBeLessThan(500);
  31 |     }
  32 |   });
  33 |
  34 |   test('should load sign-in route', async ({ page }) => {
  35 |     const response = await page.goto('/sign-in');
  36 |     // Check that the page loads without server errors
  37 |     expect(response?.status()).toBeLessThan(500);
  38 |   });
  39 |
  40 |   test('should load sign-up route', async ({ page }) => {
  41 |     const response = await page.goto('/sign-up');
  42 |     // Check that the page loads without server errors
> 43 |     expect(response?.status()).toBeLessThan(500);
     |                                ^ Error: expect(received).toBeLessThan(expected)
  44 |   });
  45 |
  46 |   test('should show auth page elements', async ({ page }) => {
  47 |     await page.goto('/sign-in');
  48 |
  49 |     // Check if basic form elements exist (if they're rendered)
  50 |     const emailInput = page.locator('input[type="email"]');
  51 |     const passwordInput = page.locator('input[type="password"]');
  52 |
  53 |     // Only check if elements exist, don't require them to be visible
  54 |     // since the app might not have a sign-in form rendered
  55 |     if (await emailInput.count() > 0) {
  56 |       await expect(emailInput).toBeAttached();
  57 |     }
  58 |
  59 |     if (await passwordInput.count() > 0) {
  60 |       await expect(passwordInput).toBeAttached();
  61 |     }
  62 |   });
  63 |
  64 |   test('health check via API utils', async () => {
  65 |     const isHealthy = await apiUtils.checkHealth();
  66 |     expect(isHealthy).toBeTruthy();
  67 |   });
  68 | });
```
