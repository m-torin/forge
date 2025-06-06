# Test info

- Name: Web App >> app should load successfully
- Location: /Users/torin/repos/new--/forge/apps/web/e2e/app.spec.ts:22:7

# Error details

```
Error: locator.waitFor: Test timeout of 10000ms exceeded.
Call log:
  - waiting for locator('body') to be visible
    18 × locator resolved to hidden <body>…</body>

    at AppTestHelpers.checkBasicUI (/Users/torin/repos/new--/forge/packages/testing/playwright.ts:106:16)
    at /Users/torin/repos/new--/forge/apps/web/e2e/app.spec.ts:28:5
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
    - paragraph: 'Module build failed: UnhandledSchemeError: Reading from "node:fs" is not handled by plugins (Unhandled scheme).'
    - img
    - text: node:fs
    - button "Open in editor":
        - img
    - text: 'Module build failed: UnhandledSchemeError: Reading from "node:fs" is not handled by plugins (Unhandled scheme). Webpack supports "data:" and "file:" URIs by default. You may need an additional plugin to handle "node:" URIs.'
- contentinfo:
    - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```

# Test source

```ts
   6 |   /** Base URL where the app runs */
   7 |   baseURL: string;
   8 |   /** Command to start the development server */
   9 |   devCommand?: string;
   10 |   /** Application name for reporting */
   11 |   name: string;
   12 |   /** Port number for the development server */
   13 |   port: number;
   14 | }
   15 |
   16 | /**
   17 |  * Creates a Playwright configuration for a Next.js app
   18 |  */
   19 | export function createAppPlaywrightConfig(appConfig: AppTestConfig): PlaywrightTestConfig {
   20 |   return defineConfig({
   21 |     forbidOnly: !!process.env.CI,
   22 |     fullyParallel: true,
   23 |     projects: [
   24 |       {
   25 |         name: 'chromium',
   26 |         use: { ...devices['Desktop Chrome'] },
   27 |       },
   28 |       {
   29 |         name: 'firefox',
   30 |         use: { ...devices['Desktop Firefox'] },
   31 |       },
   32 |       {
   33 |         name: 'webkit',
   34 |         use: { ...devices['Desktop Safari'] },
   35 |       },
   36 |       // Mobile viewports
   37 |       {
   38 |         name: 'Mobile Chrome',
   39 |         use: { ...devices['Pixel 5'] },
   40 |       },
   41 |       {
   42 |         name: 'Mobile Safari',
   43 |         use: { ...devices['iPhone 12'] },
   44 |       },
   45 |     ],
   46 |     reporter: process.env.CI ? 'html' : 'list',
   47 |     retries: process.env.CI ? 2 : 0,
   48 |     testDir: './e2e',
   49 |     use: {
   50 |       baseURL: appConfig.baseURL,
   51 |       screenshot: 'only-on-failure',
   52 |       trace: 'on-first-retry',
   53 |     },
   54 |     webServer: appConfig.devCommand
   55 |       ? {
   56 |           command: appConfig.devCommand,
   57 |           cwd: appConfig.appDirectory,
   58 |           port: appConfig.port,
   59 |           reuseExistingServer: !process.env.CI,
   60 |         }
   61 |       : undefined,
   62 |     workers: process.env.CI ? 1 : undefined,
   63 |   });
   64 | }
   65 |
   66 | /**
   67 |  * Base test helpers for app testing
   68 |  */
   69 | export class AppTestHelpers {
   70 |   constructor(private config: AppTestConfig) {}
   71 |
   72 |   /**
   73 |    * Wait for the app to be ready
   74 |    */
   75 |   async waitForApp(page: any) {
   76 |     await page.goto('/');
   77 |     await page.waitForLoadState('networkidle');
   78 |   }
   79 |
   80 |   /**
   81 |    * Check if the app is running and accessible
   82 |    */
   83 |   async checkAppHealth(page: any) {
   84 |     const response = await page.goto('/');
   85 |     if (response.status() !== 200) {
   86 |       throw new Error(`App health check failed: ${response.status()}`);
   87 |     }
   88 |     return true;
   89 |   }
   90 |
   91 |   /**
   92 |    * Check for basic UI elements that should be present
   93 |    */
   94 |   async checkBasicUI(page: any) {
   95 |     // Wait for the page to load
   96 |     await page.waitForLoadState('domcontentloaded');
   97 |
   98 |     // Check if there are no major JavaScript errors
   99 |     const errors: string[] = [];
  100 |     page.on('pageerror', (error: Error) => {
  101 |       errors.push(error.message);
  102 |     });
  103 |
  104 |     // Check if basic HTML structure exists
  105 |     const body = await page.locator('body');
> 106 |     await body.waitFor();
      |                ^ Error: locator.waitFor: Test timeout of 10000ms exceeded.
  107 |
  108 |     if (errors.length > 0) {
  109 |       throw new Error(`JavaScript errors found: ${errors.join(', ')}`);
  110 |     }
  111 |
  112 |     return true;
  113 |   }
  114 |
  115 |   /**
  116 |    * Take a screenshot for debugging
  117 |    */
  118 |   async takeScreenshot(page: any, name: string) {
  119 |     await page.screenshot({
  120 |       fullPage: true,
  121 |       path: `./test-results/${this.config.name}-${name}.png`,
  122 |     });
  123 |   }
  124 |
  125 |   /**
  126 |    * Check if authentication is working (if auth routes exist)
  127 |    */
  128 |   async checkAuthRoutes(page: any) {
  129 |     const authRoutes = ['/sign-in', '/sign-up', '/api/auth'];
  130 |     const results: Record<string, number> = {};
  131 |
  132 |     for (const route of authRoutes) {
  133 |       try {
  134 |         const response = await page.goto(route);
  135 |         results[route] = response.status();
  136 |       } catch {
  137 |         results[route] = 0; // Route doesn't exist
  138 |       }
  139 |     }
  140 |
  141 |     return results;
  142 |   }
  143 |
  144 |   /**
  145 |    * Check API health endpoints
  146 |    */
  147 |   async checkAPIHealth(page: any) {
  148 |     const healthRoutes = ['/api/health', '/health'];
  149 |     const results: Record<string, number> = {};
  150 |
  151 |     for (const route of healthRoutes) {
  152 |       try {
  153 |         const response = await page.goto(route);
  154 |         results[route] = response.status();
  155 |       } catch {
  156 |         results[route] = 0; // Route doesn't exist
  157 |       }
  158 |     }
  159 |
  160 |     return results;
  161 |   }
  162 | }
  163 |
  164 | export default createAppPlaywrightConfig;
  165 |
```
