# Test info

- Name: Web App >> should navigate between pages
- Location: /Users/torin/repos/new--/forge/apps/web/e2e/app.spec.ts:23:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /about/
Received string:  "http://localhost:3200/"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html>…</html>
      - unexpected value "http://localhost:3200/"

    at /Users/torin/repos/new--/forge/apps/web/e2e/app.spec.ts:31:26
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
  - text: "Module build failed: UnhandledSchemeError: Reading from \"node:fs\" is not handled by plugins (Unhandled scheme). Webpack supports \"data:\" and \"file:\" URIs by default. You may need an additional plugin to handle \"node:\" URIs. Import trace for requested module: node:fs"
  - link "../../node_modules/.pnpm/posthog-node@4.18.0/node_modules/posthog-node/lib/node/index.mjs":
    - text: ../../node_modules/.pnpm/posthog-node@4.18.0/node_modules/posthog-node/lib/node/index.mjs
    - img
  - link "../../packages/analytics/src/shared/providers/posthog-flags.ts":
    - text: ../../packages/analytics/src/shared/providers/posthog-flags.ts
    - img
  - link "../../packages/analytics/src/shared/feature-flags/index.ts":
    - text: ../../packages/analytics/src/shared/feature-flags/index.ts
    - img
  - link "../../packages/analytics/src/client.ts":
    - text: ../../packages/analytics/src/client.ts
    - img
  - link "./src/lib/analytics-client.ts":
    - text: ./src/lib/analytics-client.ts
    - img
  - link "./src/contexts/GuestActionsContext.tsx":
    - text: ./src/contexts/GuestActionsContext.tsx
    - img
- contentinfo:
  - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { AppTestHelpers } from '@repo/testing/playwright';
   3 |
   4 | test.describe('Web App', () => {
   5 |   let helpers: AppTestHelpers;
   6 |
   7 |   test.beforeEach(async ({ page }) => {
   8 |     helpers = new AppTestHelpers(page);
   9 |   });
  10 |
  11 |   test('app should load successfully', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     await expect(page).toHaveTitle(/Web App/);
  14 |   });
  15 |
  16 |   test('should display the homepage content', async ({ page }) => {
  17 |     await page.goto('/');
  18 |     
  19 |     // Check for main heading or content that indicates the page loaded
  20 |     await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  21 |   });
  22 |
  23 |   test('should navigate between pages', async ({ page }) => {
  24 |     await page.goto('/');
  25 |     
  26 |     // Add navigation tests based on your app's structure
  27 |     // Example: clicking a link and verifying the new page loads
  28 |     const aboutLink = page.getByRole('link', { name: /about/i });
  29 |     if (await aboutLink.isVisible()) {
  30 |       await aboutLink.click();
> 31 |       await expect(page).toHaveURL(/about/);
     |                          ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  32 |     }
  33 |   });
  34 | });
```