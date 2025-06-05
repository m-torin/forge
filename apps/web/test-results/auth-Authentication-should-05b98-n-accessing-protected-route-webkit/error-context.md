# Test info

- Name: Authentication >> should redirect to sign in when accessing protected route
- Location: /Users/torin/repos/new--/forge/apps/web/e2e/auth.spec.ts:47:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /sign-in/
Received string:  "http://localhost:3200/dashboard"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html>…</html>
      - unexpected value "http://localhost:3200/dashboard"

    at /Users/torin/repos/new--/forge/apps/web/e2e/auth.spec.ts:52:24
```

# Page snapshot

```yaml
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- link "Next.js 15.4.0-canary.66 (stale) Webpack":
  - /url: https://nextjs.org/docs/messages/version-staleness
  - img
  - text: Next.js 15.4.0-canary.66 (stale) Webpack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Stack Trace":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools":
    - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
    - img
  - paragraph: "Module build failed: UnhandledSchemeError: Reading from \"node:fs\" is not handled by plugins (Unhandled scheme)."
  - img
  - text: node:fs
  - button "Open in editor":
    - img
  - text: "Module build failed: UnhandledSchemeError: Reading from \"node:fs\" is not handled by plugins (Unhandled scheme). Webpack supports \"data:\" and \"file:\" URIs by default. You may need an additional plugin to handle \"node:\" URIs."
- contentinfo:
  - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { AppTestHelpers } from '@repo/testing/playwright';
   3 | import { authTestHelpers } from '@repo/testing/auth-helpers';
   4 |
   5 | test.describe('Authentication', () => {
   6 |   let helpers: AppTestHelpers;
   7 |
   8 |   test.beforeEach(async ({ page }) => {
   9 |     helpers = new AppTestHelpers(page);
  10 |   });
  11 |
  12 |   test('should show sign in page', async ({ page }) => {
  13 |     await page.goto('/sign-in');
  14 |     
  15 |     // Check for sign in form elements
  16 |     await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  17 |     await expect(page.getByLabel(/email/i)).toBeVisible();
  18 |     await expect(page.getByLabel(/password/i)).toBeVisible();
  19 |     await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  20 |   });
  21 |
  22 |   test('should show sign up page', async ({ page }) => {
  23 |     await page.goto('/sign-up');
  24 |     
  25 |     // Check for sign up form elements
  26 |     await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  27 |     await expect(page.getByLabel(/email/i)).toBeVisible();
  28 |     await expect(page.getByLabel(/password/i)).toBeVisible();
  29 |   });
  30 |
  31 |   test('should navigate between sign in and sign up', async ({ page }) => {
  32 |     await page.goto('/sign-in');
  33 |     
  34 |     // Click on sign up link
  35 |     const signUpLink = page.getByRole('link', { name: /sign up/i });
  36 |     await signUpLink.click();
  37 |     
  38 |     await expect(page).toHaveURL(/sign-up/);
  39 |     
  40 |     // Navigate back to sign in
  41 |     const signInLink = page.getByRole('link', { name: /sign in/i });
  42 |     await signInLink.click();
  43 |     
  44 |     await expect(page).toHaveURL(/sign-in/);
  45 |   });
  46 |
  47 |   test('should redirect to sign in when accessing protected route', async ({ page }) => {
  48 |     // Attempt to access a protected route
  49 |     await page.goto('/dashboard');
  50 |     
  51 |     // Should be redirected to sign in
> 52 |     await expect(page).toHaveURL(/sign-in/);
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  53 |   });
  54 |
  55 |   test('should handle sign in with test user', async ({ page }) => {
  56 |     const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
  57 |     const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword';
  58 |     
  59 |     await page.goto('/sign-in');
  60 |     
  61 |     // Fill in credentials
  62 |     await page.fill('input[type="email"]', testEmail);
  63 |     await page.fill('input[type="password"]', testPassword);
  64 |     
  65 |     // Submit form
  66 |     await page.getByRole('button', { name: /sign in/i }).click();
  67 |     
  68 |     // Wait for navigation or error message
  69 |     await page.waitForLoadState('networkidle');
  70 |     
  71 |     // Check if sign in was successful (adjust based on your app's behavior)
  72 |     // This might need to be customized based on your app's actual behavior
  73 |   });
  74 | });
```