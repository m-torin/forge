# E2E Testing with Playwright

This package provides comprehensive E2E testing utilities built on top of Playwright.

## Installation

The testing package is already installed in the monorepo. To use E2E testing in your app:

```bash
# Add Playwright to your app
pnpm add -D @playwright/test

# Install browsers
pnpm playwright install
```

## Quick Start

1. Create `playwright.config.ts` in your app:

```typescript
import { createAppPlaywrightConfig } from '@repo/testing/playwright';

export default createAppPlaywrightConfig({
  name: 'your-app-name',
  appDirectory: __dirname,
  baseURL: 'http://localhost:3000',
  devCommand: 'pnpm dev',
  port: 3000,
});
```

2. Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

3. Create your first test in `e2e/app.spec.ts`:

```typescript
import { test, expect } from '@repo/testing/e2e';

test('app loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
});
```

## Available Utilities

### Core Testing

- `test`, `expect` - Re-exported from Playwright
- `AppTestHelpers` - Basic app testing utilities
- `BetterAuthTestHelpers` - Authentication testing helpers

### Page Objects

- `BasePage` - Base page object class
- `AuthPage` - Authentication page object
- `PageObjectFactory` - Factory for creating page objects
- `WaitUtils` - Advanced waiting strategies

### API Testing

- `APITestUtils` - HTTP request utilities
- `APIAssertions` - Response assertion helpers
- `GraphQLTestUtils` - GraphQL testing utilities

### Data Management

- `TestDataGenerator` - Generate test data with Faker.js
- `TestDataSeeder` - Seed test data
- `StorageUtils` - Local storage and cookie utilities
- `EnvironmentData` - Environment-specific test data

### Visual Testing

- `VisualTestUtils` - Screenshot and visual comparison
- `ResponsiveTestUtils` - Multi-viewport testing
- `ThemeTestUtils` - Light/dark mode testing

### Accessibility

- `AccessibilityTestUtils` - Axe-core integration
- `AccessibilityReporter` - Generate a11y reports
- WCAG compliance checking

### Common Patterns

- `RetryUtils` - Retry flaky operations
- `NetworkUtils` - Request interception and mocking
- `ContextUtils` - Browser context utilities
- `PerformanceUtils` - Performance measurement
- `MultiTabUtils` - Multi-tab testing
- `FileUtils` - File upload/download

## Test Templates

Copy these templates to get started quickly:

- `basic-app.spec.ts` - Basic application tests
- `auth-flow.spec.ts` - Authentication flow tests
- `api-testing.spec.ts` - API endpoint tests
- `accessibility.spec.ts` - Accessibility tests
- `visual-regression.spec.ts` - Visual regression tests

## Example: Complete Auth Test

```typescript
import { test, expect } from '@repo/testing/e2e';
import {
  createAuthHelpers,
  AuthPage,
  PageObjectFactory,
  TestDataGenerator,
  EnvironmentData,
} from '@repo/testing/e2e';

test.describe('Authentication', () => {
  let authHelpers: BetterAuthTestHelpers;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authHelpers = createAuthHelpers(page);
    const factory = new PageObjectFactory(page);
    authPage = factory.createAuthPage();
  });

  test('user can sign up and sign in', async ({ page }) => {
    // Generate test user
    const user = TestDataGenerator.user();

    // Sign up
    await authHelpers.signUpViaUI(user.email, user.password);

    // Verify signed in
    const isAuthenticated = await authHelpers.isAuthenticated();
    expect(isAuthenticated).toBeTruthy();

    // Sign out
    await authHelpers.signOut();

    // Sign in again
    await authHelpers.signInViaUI(user.email, user.password);

    // Check session
    const session = await authHelpers.getSession();
    expect(session).toHaveProperty('email', user.email);
  });
});
```

## Example: API Testing

```typescript
import { test, expect } from '@repo/testing/e2e';
import { APITestUtils, APIAssertions } from '@repo/testing/e2e';

test('API endpoints', async ({ request }) => {
  const api = new APITestUtils(request);

  // Test health check
  const isHealthy = await api.checkHealth();
  expect(isHealthy).toBeTruthy();

  // Test authenticated request
  const profile = await api.authenticatedRequest('GET', '/api/profile', {
    token: 'your-auth-token',
  });

  APIAssertions.assertStatus(profile, 200);
});
```

## Example: Visual Testing

```typescript
import { test, expect } from '@repo/testing/e2e';
import { VisualTestUtils, ResponsiveTestUtils } from '@repo/testing/e2e';

test('visual consistency', async ({ page }) => {
  const visual = new VisualTestUtils(page);
  const responsive = new ResponsiveTestUtils(page);

  // Test across viewports
  await responsive.testResponsive(async () => {
    await page.goto('/');
    await visual.waitForAnimations();
    await expect(page).toHaveScreenshot('homepage.png');
  });
});
```

## Best Practices

1. **Use Page Objects** - Encapsulate page-specific logic
2. **Generate Test Data** - Use TestDataGenerator for unique data
3. **Handle Flaky Tests** - Use RetryUtils for unreliable operations
4. **Test Accessibility** - Include a11y tests in your suite
5. **Visual Regression** - Capture screenshots for UI changes
6. **Clean Up** - Always clean up test data after tests

## Configuration

### Environment Variables

```bash
# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123!@#

# API configuration
TEST_API_URL=http://localhost:3000/api
TEST_ORG_ID=test-org-id

# Visual testing
PERCY_TOKEN=your-percy-token
```

### Playwright Configuration

The `createAppPlaywrightConfig` function accepts:

- `name` - App name for test reports
- `appDirectory` - App directory path
- `baseURL` - Base URL for tests
- `devCommand` - Command to start dev server
- `port` - Port number
- `timeout` - Test timeout (default: 30s)
- `retries` - Number of retries (default: 2)

## Debugging

1. **UI Mode**: `pnpm test:e2e:ui`
2. **Debug Mode**: `pnpm test:e2e:debug`
3. **Headed Mode**: `pnpm test:e2e --headed`
4. **Slow Motion**: `pnpm test:e2e --slow-mo=1000`
5. **Screenshots**: Automatically captured on failure

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Install Playwright
  run: pnpm playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```
