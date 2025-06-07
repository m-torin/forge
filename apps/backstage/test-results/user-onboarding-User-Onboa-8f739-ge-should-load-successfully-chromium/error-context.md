# Test info

- Name: User Onboarding Workflow >> user onboarding page should load successfully
- Location: /Users/torin/repos/new--/forge/apps/backstage/e2e/user-onboarding.spec.ts:26:7

# Error details

```
Error: Performance violations detected:
First Contentful Paint: 3145.149999976158 ms
Time to First Byte: 2806.089999973774 ms
    at withPerformanceMonitoring (/Users/torin/repos/new--/forge/apps/backstage/e2e/utils/performance-monitor.ts:357:13)
    at /Users/torin/repos/new--/forge/apps/backstage/e2e/user-onboarding.spec.ts:27:32
```

# Page snapshot

```yaml
- banner:
  - heading "Backstage Admin" [level=3]
  - button "Dashboard" [expanded]:
    - img
    - paragraph: Dashboard
  - button "Workflows":
    - img
    - paragraph: Workflows
    - img
  - button "PIM":
    - img
    - paragraph: PIM
    - img
  - button "CMS":
    - img
    - paragraph: CMS
    - img
  - button "Guests":
    - img
    - paragraph: Guests
    - img
  - button:
    - img
  - button:
    - img
  - button:
    - img
  - separator
  - button "Admin":
    - text: Admin
    - img
- main:
  - link "Home":
    - /url: /
  - text: ›
  - link "Workflows":
    - /url: /workflows
  - text: ›
  - link "User onboarding":
    - /url: /workflows/user-onboarding
  - heading "User Onboarding Workflow" [level=1]
  - paragraph: Test and manage the automated user onboarding process
  - heading "Workflow Configuration" [level=3]
  - text: User ID
  - textbox "User ID"
  - text: Email Address
  - textbox "Email Address"
  - text: Signup Source
  - textbox "Signup Source": Organic
  - img
  - text: Referral Code (Optional)
  - textbox "Referral Code (Optional)"
  - paragraph: Email Preferences
  - switch "Newsletter subscription" [checked]
  - text: Newsletter subscription
  - switch "Product updates" [checked]
  - text: Product updates
  - switch "Marketing emails"
  - text: Marketing emails
  - heading "Workflow Progress" [level=3]
  - button:
    - img
  - button "Start Onboarding" [disabled]
  - progressbar
  - img
  - paragraph: Create Profile
  - text: pending
  - paragraph: Initialize user profile with defaults
  - img
  - paragraph: Welcome Email
  - text: pending
  - paragraph: Send personalized welcome email
  - img
  - paragraph: Check Referral
  - text: pending
  - paragraph: Validate referral code if provided
  - img
  - paragraph: Setup Workspace
  - text: pending
  - paragraph: Create initial workspace and project
  - img
  - paragraph: Complete Setup
  - text: pending
  - paragraph: Finalize onboarding process
  - separator
  - heading "Workflow Details" [level=4]
  - paragraph: Workflow ID
  - paragraph: user-onboarding
  - paragraph: Version
  - paragraph: 1.0.0
  - paragraph: Max Duration
  - paragraph: 2 minutes
  - paragraph: Critical Steps
  - paragraph: create-user-profile, create-workspace
- alert
```

# Test source

```ts
  257 |           violations.push({
  258 |             actual: value,
  259 |             metric: name,
  260 |             severity: 'warning',
  261 |             threshold: threshold.warning,
  262 |           });
  263 |         }
  264 |       }
  265 |     });
  266 |
  267 |     return violations;
  268 |   }
  269 |
  270 |   async generateReport(url: string): Promise<PerformanceReport> {
  271 |     const metrics = await this.collectMetrics();
  272 |
  273 |     // Try to measure FID if not already captured
  274 |     if (metrics.fid === undefined) {
  275 |       metrics.fid = await this.measureFID();
  276 |     }
  277 |
  278 |     const violations = this.checkThresholds(metrics);
  279 |
  280 |     return {
  281 |       url,
  282 |       metrics,
  283 |       timestamp: new Date().toISOString(),
  284 |       violations,
  285 |     };
  286 |   }
  287 |
  288 |   static formatReport(report: PerformanceReport): string {
  289 |     const lines = [
  290 |       `Performance Report for ${report.url}`,
  291 |       `Generated at: ${report.timestamp}`,
  292 |       '',
  293 |       'Core Web Vitals:',
  294 |       `  LCP: ${report.metrics.lcp?.toFixed(0) || 'N/A'} ms`,
  295 |       `  FID: ${report.metrics.fid?.toFixed(0) || 'N/A'} ms`,
  296 |       `  CLS: ${report.metrics.cls?.toFixed(3) || 'N/A'}`,
  297 |       '',
  298 |       'Other Metrics:',
  299 |       `  FCP: ${report.metrics.fcp?.toFixed(0) || 'N/A'} ms`,
  300 |       `  TTFB: ${report.metrics.ttfb?.toFixed(0) || 'N/A'} ms`,
  301 |       `  DOM Content Loaded: ${report.metrics.domContentLoaded?.toFixed(0) || 'N/A'} ms`,
  302 |       `  Page Load Complete: ${report.metrics.loadComplete?.toFixed(0) || 'N/A'} ms`,
  303 |       '',
  304 |       'Network Metrics:',
  305 |       `  Total Requests: ${report.metrics.totalRequestCount || 0}`,
  306 |       `  Total Size: ${((report.metrics.totalRequestSize || 0) / 1024 / 1024).toFixed(2)} MB`,
  307 |       `  Failed Requests: ${report.metrics.failedRequestCount || 0}`,
  308 |     ];
  309 |
  310 |     if (report.violations && report.violations.length > 0) {
  311 |       lines.push('', 'Performance Violations:');
  312 |       report.violations.forEach((violation) => {
  313 |         const icon = violation.severity === 'error' ? '❌' : '⚠️';
  314 |         lines.push(
  315 |           `  ${icon} ${violation.metric}: ${violation.actual.toFixed(0)} ms (threshold: ${violation.threshold.toFixed(0)} ms)`,
  316 |         );
  317 |       });
  318 |     }
  319 |
  320 |     if (report.metrics.resources && report.metrics.resources.length > 0) {
  321 |       lines.push('', 'Slowest Resources:');
  322 |       report.metrics.resources.slice(0, 5).forEach((resource) => {
  323 |         const name = resource.name.length > 50 ? '...' + resource.name.slice(-47) : resource.name;
  324 |         lines.push(`  ${resource.duration} ms - ${name}`);
  325 |       });
  326 |     }
  327 |
  328 |     return lines.join('\n');
  329 |   }
  330 |
  331 |   reset(): void {
  332 |     this.networkRequests.clear();
  333 |   }
  334 | }
  335 |
  336 | // Helper function to create a performance monitor for a test
  337 | export async function withPerformanceMonitoring<T>(
  338 |   page: Page,
  339 |   context: BrowserContext,
  340 |   url: string,
  341 |   testFn: () => Promise<T>,
  342 |   thresholds?: PerformanceThresholds,
  343 | ): Promise<{ result: T; report: PerformanceReport }> {
  344 |   const monitor = new PerformanceMonitor(page, context, thresholds);
  345 |
  346 |   try {
  347 |     await page.goto(url);
  348 |     const result = await testFn();
  349 |     const report = await monitor.generateReport(url);
  350 |
  351 |     // Log the report
  352 |     console.log(PerformanceMonitor.formatReport(report));
  353 |
  354 |     // Fail the test if there are errors
  355 |     const errors = report.violations?.filter((v) => v.severity === 'error');
  356 |     if (errors && errors.length > 0) {
> 357 |       throw new Error(
      |             ^ Error: Performance violations detected:
  358 |         `Performance violations detected:\n${errors.map((e) => `${e.metric}: ${e.actual} ms`).join('\n')}`,
  359 |       );
  360 |     }
  361 |
  362 |     return { report, result };
  363 |   } finally {
  364 |     monitor.reset();
  365 |   }
  366 | }
  367 |
  368 | // Factory function to create a performance monitor instance
  369 | export function createPerformanceMonitor(thresholds?: PerformanceThresholds) {
  370 |   return {
  371 |     async withPerformanceMonitoring<T>(
  372 |       page: Page,
  373 |       context: BrowserContext,
  374 |       url: string,
  375 |       testFn: () => Promise<T>,
  376 |       overrideThresholds?: PerformanceThresholds,
  377 |     ): Promise<{ result: T; report: PerformanceReport }> {
  378 |       return withPerformanceMonitoring(
  379 |         page,
  380 |         context,
  381 |         url,
  382 |         testFn,
  383 |         overrideThresholds || thresholds,
  384 |       );
  385 |     },
  386 |
  387 |     createInstance(page: Page, context: BrowserContext) {
  388 |       return new PerformanceMonitor(page, context, thresholds);
  389 |     },
  390 |   };
  391 | }
  392 |
```