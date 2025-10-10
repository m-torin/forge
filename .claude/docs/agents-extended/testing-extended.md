# Testing Extended Guide

Comprehensive testing strategies, patterns, and quality enforcement.

## Table of Contents

1. [Vitest Unit & Integration Testing](#vitest-unit--integration-testing)
2. [Playwright E2E Testing](#playwright-e2e-testing)
3. [Storybook Interaction Tests](#storybook-interaction-tests)
4. [Coverage Enforcement](#coverage-enforcement)
5. [Centralized Mocks (@repo/qa)](#centralized-mocks-repoqa)
6. [Flaky Test Diagnosis](#flaky-test-diagnosis)
7. [Anti-Patterns and Solutions](#anti-patterns-and-solutions)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Vitest Unit & Integration Testing

### Pattern 1: Component Testing

**Testing React components with Vitest + Testing Library:**

```typescript
// packages/uix-system/src/components/Button/Button.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Submit</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);

    expect(screen.getByRole('button')).toHaveClass('variant-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('variant-secondary');
  });
});
```

### Pattern 2: Hook Testing

**Testing custom hooks:**

```typescript
// packages/auth/src/hooks/useSession.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { mockSession } from '@repo/qa/fixtures';
import { useSession } from './useSession';

describe('useSession', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useSession());

    expect(result.current.loading).toBe(true);
    expect(result.current.session).toBeNull();
  });

  it('returns session when authenticated', async () => {
    const session = mockSession();
    vi.mocked(getSession).mockResolvedValue(session);

    const { result } = renderHook(() => useSession());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toEqual(session);
    expect(result.current.error).toBeNull();
  });

  it('returns error when authentication fails', async () => {
    const error = new Error('Unauthorized');
    vi.mocked(getSession).mockRejectedValue(error);

    const { result } = renderHook(() => useSession());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.error).toEqual(error);
  });
});
```

### Pattern 3: Server Action Testing

**Testing Next.js server actions:**

```typescript
// apps/webapp/__tests__/actions/auth.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockUser } from '@repo/qa/fixtures';
import { loginAction } from '@/app/actions/auth';

// Mock Next.js modules
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
  })),
}));

// Mock database
vi.mock('@repo/db-prisma/node', () => ({
  createNodeClient: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
    },
  })),
}));

describe('loginAction', () => {
  it('authenticates valid user', async () => {
    const user = mockUser({ email: 'test@example.com' });
    const db = createNodeClient();
    vi.mocked(db.user.findUnique).mockResolvedValue(user);

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const result = await loginAction(formData);

    expect(result.success).toBe(true);
    expect(result.user).toMatchObject({
      id: user.id,
      email: user.email,
    });
  });

  it('rejects invalid credentials', async () => {
    const db = createNodeClient();
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('email', 'wrong@example.com');
    formData.append('password', 'wrongpassword');

    const result = await loginAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });
});
```

---

## Playwright E2E Testing

### Pattern 1: Page Object Model

**Defining page objects:**

```typescript
// apps/webapp/tests/e2e/pages/login.page.ts

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await this.errorMessage.waitFor({ state: 'visible' });
    await expect(this.errorMessage).toContainText(message);
  }
}
```

**Using page objects in tests:**

```typescript
// apps/webapp/tests/e2e/login.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.login('user@example.com', 'password123');

    // Wait for navigation
    await page.waitForURL('/dashboard');

    // Verify dashboard elements
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('invalid credentials show error', async ({ page }) => {
    await loginPage.login('wrong@example.com', 'wrongpass');

    await loginPage.expectError('Invalid email or password');

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('empty form shows validation errors', async ({ page }) => {
    await loginPage.submitButton.click();

    await expect(loginPage.emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Email is required')).toBeVisible();
  });
});
```

### Pattern 2: Authentication State

**Managing authentication across tests:**

```typescript
// apps/webapp/tests/e2e/fixtures/auth.ts

import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

// Extend base test with authenticated state
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');

    // Wait for authentication
    await page.waitForURL('/dashboard');

    // Use authenticated page in test
    await use(page);
  },
});

export { expect };
```

**Using authenticated fixtures:**

```typescript
// apps/webapp/tests/e2e/dashboard.spec.ts

import { test, expect } from './fixtures/auth';

test('user can access dashboard', async ({ authenticatedPage }) => {
  // Already logged in!
  await expect(authenticatedPage).toHaveURL('/dashboard');
  await expect(authenticatedPage.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

test('user can update profile', async ({ authenticatedPage }) => {
  await authenticatedPage.getByRole('link', { name: /profile/i }).click();
  await authenticatedPage.getByLabel('Name').fill('Updated Name');
  await authenticatedPage.getByRole('button', { name: /save/i }).click();

  await expect(authenticatedPage.getByText('Profile updated')).toBeVisible();
});
```

### Pattern 3: API Mocking

**Mocking API responses in E2E tests:**

```typescript
// apps/webapp/tests/e2e/api-mock.spec.ts

import { test, expect } from '@playwright/test';

test('displays error when API fails', async ({ page }) => {
  // Mock API failure
  await page.route('**/api/posts', (route) => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    });
  });

  await page.goto('/posts');

  await expect(page.getByText(/failed to load posts/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
});

test('displays empty state when no posts', async ({ page }) => {
  // Mock empty response
  await page.route('**/api/posts', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ posts: [] }),
    });
  });

  await page.goto('/posts');

  await expect(page.getByText(/no posts yet/i)).toBeVisible();
});
```

---

## Storybook Interaction Tests

### Pattern 1: Component Interaction Testing

**Storybook stories with interaction tests:**

```typescript
// packages/uix-system/src/components/SearchInput/SearchInput.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'Components/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
};

export const WithInteraction: Story = {
  args: {
    placeholder: 'Search users...',
    onSearch: (value) => console.log('Searching for:', value),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find search input
    const input = canvas.getByPlaceholderText('Search users...');

    // Type search query
    await userEvent.type(input, 'john doe');

    // Verify input value
    await expect(input).toHaveValue('john doe');

    // Submit search
    await userEvent.keyboard('{Enter}');

    // Verify search icon shows loading state
    const searchIcon = canvas.getByTestId('search-icon');
    await expect(searchIcon).toHaveAttribute('data-loading', 'true');
  },
};

export const ClearButton: Story = {
  args: {
    placeholder: 'Search...',
    showClearButton: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByPlaceholderText('Search...');
    await userEvent.type(input, 'test query');

    // Clear button should appear
    const clearButton = canvas.getByRole('button', { name: /clear/i });
    await expect(clearButton).toBeVisible();

    // Click clear button
    await userEvent.click(clearButton);

    // Input should be empty
    await expect(input).toHaveValue('');
  },
};
```

### Pattern 2: Form Validation Testing

**Testing form validation in Storybook:**

```typescript
// packages/uix-system/src/components/LoginForm/LoginForm.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { LoginForm } from './LoginForm';

const meta = {
  title: 'Forms/LoginForm',
  component: LoginForm,
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const submitButton = canvas.getByRole('button', { name: /sign in/i });

    // Submit empty form
    await userEvent.click(submitButton);

    // Check validation errors appear
    await expect(canvas.getByText('Email is required')).toBeVisible();
    await expect(canvas.getByText('Password is required')).toBeVisible();

    // Email input should have error state
    const emailInput = canvas.getByLabelText('Email');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  },
};

export const SuccessfulSubmission: Story = {
  args: {
    onSubmit: async (data) => {
      console.log('Login data:', data);
      return { success: true };
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill form
    await userEvent.type(canvas.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'password123');

    // Submit
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);

    // Verify loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveTextContent(/signing in/i);
  },
};
```

---

## Coverage Enforcement

### Pattern 1: Vitest Coverage Configuration

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
```

### Pattern 2: Coverage Reporting Script

```bash
#!/bin/bash
# node scripts/validate.mjs coverage

set -euo pipefail

echo "🧪 Running coverage check..."

# Run tests with coverage
pnpm vitest run --coverage --reporter=json --outputFile=coverage/coverage-summary.json

# Parse coverage results
LINES=$(jq '.total.lines.pct' coverage/coverage-summary.json)
FUNCTIONS=$(jq '.total.functions.pct' coverage/coverage-summary.json)
BRANCHES=$(jq '.total.branches.pct' coverage/coverage-summary.json)
STATEMENTS=$(jq '.total.statements.pct' coverage/coverage-summary.json)

echo "📊 Coverage Results:"
echo "  Lines: $LINES%"
echo "  Functions: $FUNCTIONS%"
echo "  Branches: $BRANCHES%"
echo "  Statements: $STATEMENTS%"

# Check thresholds
THRESHOLD=50

if (( $(echo "$LINES < $THRESHOLD" | bc -l) )); then
  echo "❌ Line coverage below $THRESHOLD%"
  exit 1
fi

if (( $(echo "$FUNCTIONS < $THRESHOLD" | bc -l) )); then
  echo "❌ Function coverage below $THRESHOLD%"
  exit 1
fi

if (( $(echo "$BRANCHES < $THRESHOLD" | bc -l) )); then
  echo "❌ Branch coverage below $THRESHOLD%"
  exit 1
fi

if (( $(echo "$STATEMENTS < $THRESHOLD" | bc -l) )); then
  echo "❌ Statement coverage below $THRESHOLD%"
  exit 1
fi

echo "✅ Coverage gates passed!"
```

---

## Centralized Mocks (@repo/qa)

### Pattern 1: User Fixtures

```typescript
// packages/qa/src/fixtures/user.ts

import { faker } from '@faker-js/faker';
import type { User } from '@repo/db-prisma';

export function mockUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    emailVerified: faker.datatype.boolean(),
    image: faker.image.avatar(),
    ...overrides,
  };
}

export function mockUsers(count: number, overrides?: Partial<User>): User[] {
  return Array.from({ length: count }, () => mockUser(overrides));
}
```

### Pattern 2: Database Mocks

```typescript
// packages/qa/src/mocks/prisma.ts

import { vi } from 'vitest';
import type { PrismaClient } from '@repo/db-prisma';

export function createMockPrismaClient(): PrismaClient {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    post: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  } as unknown as PrismaClient;
}
```

### Pattern 3: Auth Mocks

```typescript
// packages/qa/src/mocks/auth.ts

import { vi } from 'vitest';
import { mockUser, mockSession } from '../fixtures';

export function mockAuthModule() {
  return {
    getSession: vi.fn(async () => mockSession()),
    signIn: vi.fn(async () => ({ success: true })),
    signOut: vi.fn(async () => ({ success: true })),
    getUser: vi.fn(async () => mockUser()),
  };
}

// Usage in tests
vi.mock('@repo/auth/server/next', () => mockAuthModule());
```

---

## Flaky Test Diagnosis

### Diagnosis 1: Race Condition Detection

**Symptoms:**
- Test passes locally but fails in CI
- Test fails intermittently (20-50% failure rate)
- Error messages mention timeouts or "element not found"

**Diagnosis:**

```typescript
// ❌ FLAKY: No explicit wait
test('search results appear', async ({ page }) => {
  await page.goto('/search');
  await page.fill('input[name="query"]', 'test');
  await page.click('button[type="submit"]');

  // Race condition: results might not be loaded yet
  const firstResult = page.locator('.result-item').first();
  await expect(firstResult).toBeVisible();  // ❌ May fail
});

// ✅ STABLE: Explicit wait
test('search results appear', async ({ page }) => {
  await page.goto('/search');
  await page.fill('input[name="query"]', 'test');
  await page.click('button[type="submit"]');

  // Wait for results to load
  await page.waitForResponse((response) =>
    response.url().includes('/api/search') && response.status() === 200
  );

  const firstResult = page.locator('.result-item').first();
  await expect(firstResult).toBeVisible();  // ✅ Reliable
});
```

### Diagnosis 2: Timing-Dependent Assertions

**Problem:**

```typescript
// ❌ FLAKY: Timing-dependent
test('loading indicator disappears', async ({ page }) => {
  await page.goto('/slow-page');

  // Might not see loading indicator if page loads too fast
  await expect(page.getByTestId('loading')).toBeVisible();  // ❌ Flaky
  await expect(page.getByTestId('loading')).not.toBeVisible();
});

// ✅ STABLE: Wait for final state
test('page loads successfully', async ({ page }) => {
  await page.goto('/slow-page');

  // Wait for content to appear (final state)
  await expect(page.getByText('Content loaded')).toBeVisible();
  await expect(page.getByTestId('loading')).not.toBeVisible();
});
```

### Diagnosis 3: Shared State Between Tests

**Problem:**

```typescript
// ❌ FLAKY: Shared database state
describe('User CRUD', () => {
  test('creates user', async () => {
    await createUser({ email: 'test@example.com' });
    // User now exists in database
  });

  test('updates user', async () => {
    // Assumes user exists from previous test!
    const user = await db.user.findUnique({ where: { email: 'test@example.com' } });
    await updateUser(user.id, { name: 'Updated' });  // ❌ Depends on test order
  });
});

// ✅ STABLE: Independent tests
describe('User CRUD', () => {
  test('creates user', async () => {
    await createUser({ email: 'test1@example.com' });
    const user = await db.user.findUnique({ where: { email: 'test1@example.com' } });
    expect(user).toBeDefined();
  });

  test('updates user', async () => {
    // Create user for this test
    const user = await createUser({ email: 'test2@example.com' });
    await updateUser(user.id, { name: 'Updated' });

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated.name).toBe('Updated');
  });
});
```

---

## Anti-Patterns and Solutions

### Anti-Pattern 1: Testing Implementation Details

**Problem:**

```typescript
// ❌ BAD: Testing React internals
import { renderHook } from '@testing-library/react';
import { useState } from 'react';

it('updates count state', () => {
  const { result } = renderHook(() => useState(0));
  const [count, setCount] = result.current;

  act(() => setCount(1));

  expect(result.current[0]).toBe(1);  // Testing useState implementation
});
```

**Solution:**

```typescript
// ✅ GOOD: Testing user behavior
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Counter } from './Counter';

it('increments counter when button clicked', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Anti-Pattern 2: Excessive Mocking

**Problem:**

```typescript
// ❌ BAD: Mocking everything = not testing integration
vi.mock('@repo/db-prisma/node');
vi.mock('@repo/auth/server/next');
vi.mock('@repo/analytics/server');
vi.mock('./user-service');

test('creates user', async () => {
  // All dependencies mocked - not testing real integration
  const result = await createUser({ email: 'test@example.com' });
  expect(result).toBeDefined();
});
```

**Solution:**

```typescript
// ✅ GOOD: Mock external services, test real integration
vi.mock('@repo/analytics/server');  // Only mock external analytics

// Use real database (or test database)
import { createNodeClient } from '@repo/db-prisma/node';
const db = createNodeClient();

test('creates user with analytics', async () => {
  const result = await createUser({ email: 'test@example.com' });

  // Verify user in database (real integration)
  const user = await db.user.findUnique({ where: { id: result.id } });
  expect(user).toBeDefined();

  // Verify analytics called (mocked)
  expect(trackEvent).toHaveBeenCalledWith('user_created', { userId: result.id });
});
```

---

## Troubleshooting Guide

### Issue: Tests pass locally, fail in CI

**Diagnosis:**

```bash
# Check for timing issues
# Run tests multiple times locally
for i in {1..10}; do pnpm test && echo "Pass $i" || echo "Fail $i"; done

# Enable debug mode
DEBUG=pw:api pnpm playwright test

# Check CI-specific environment differences
# - Node version
# - Timezone
# - Available memory
```

**Solution:**

1. Add explicit waits in Playwright tests
2. Increase timeouts for slow CI runners
3. Use `waitForLoadState('networkidle')` before assertions

### Issue: Snapshot tests fail after component update

**Diagnosis:**

```bash
# Review snapshot diff
pnpm vitest -u --reporter=verbose

# Check what changed
git diff **/__snapshots__/*.snap
```

**Solution:**

```bash
# Update snapshots if changes are intentional
pnpm vitest -u

# Commit updated snapshots
git add **/__snapshots__/*.snap
git commit -m "chore: update snapshots after Button style changes"
```

### Issue: Coverage drops unexpectedly

**Diagnosis:**

```bash
# Generate detailed coverage report
pnpm vitest --coverage --reporter=html

# Open coverage report
open coverage/index.html

# Identify uncovered lines
```

**Solution:**

1. Add tests for newly uncovered code
2. Document exception if code is not testable (e.g., error boundaries)
3. Update coverage thresholds if warranted

---

**End of Extended Guide**

For quick reference, see `.claude/agents/testing.md`
