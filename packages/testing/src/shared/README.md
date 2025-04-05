# Shared Testing Utilities

This directory contains framework-agnostic utilities and constants that can be
used by both Vitest and Cypress.

## Directory Structure

```
shared/
├── constants/       # Shared constants
│   ├── config.ts    # Configuration constants
│   └── test-values.ts # Test values
├── presets/         # Shared presets
│   └── vitest.ts    # Vitest presets
└── utils/           # Shared utilities
    ├── dom.ts       # DOM utilities
    ├── mock.ts      # Mock utilities
    └── test.ts      # Test utilities
```

## Usage

### Importing Shared Utilities

```typescript
// Import specific utilities
import { formatTestId, dataTestIdSelector } from "@repo/testing/shared/utils";

// Import specific constants
import { testEnvVars, testUser } from "@repo/testing/shared/constants";

// Import specific presets
import { basePreset, reactPreset } from "@repo/testing/shared/presets/vitest";

// Import all shared utilities
import * as shared from "@repo/testing/shared";
```

### DOM Utilities

```typescript
import {
  formatTestId,
  dataTestIdSelector,
  ariaLabelSelector,
} from "@repo/testing/shared/utils";

// Format a string as a test ID
const testId = formatTestId("Submit Button"); // 'test-submit-button'

// Create a data-testid selector
const selector = dataTestIdSelector("submit-button"); // '[data-testid="submit-button"]'

// Create an aria-label selector
const ariaSelector = ariaLabelSelector("Submit"); // '[aria-label="Submit"]'
```

### Test Utilities

```typescript
import { createTestCases, waitForCondition } from "@repo/testing/shared/utils";

// Create test cases
const testCases = createTestCases([
  { input: 1, expected: 2, description: "adds 1" },
  { input: 2, expected: 3, description: "adds 1" },
]);

// Wait for a condition
await waitForCondition(() => document.querySelector(".loaded") !== null);
```

### Mock Utilities

```typescript
import {
  createMockResponse,
  createStorageMock,
} from "@repo/testing/shared/utils";

// Create a mock response
const response = createMockResponse({
  status: 200,
  body: { data: "test" },
});

// Create a mock storage
const storage = createStorageMock();
storage.setItem("key", "value");
```

### Constants

```typescript
import {
  testEnvVars,
  testUser,
  testAdmin,
  testDates,
} from "@repo/testing/shared/constants";

// Use test environment variables
process.env.CLERK_SECRET_KEY = testEnvVars.CLERK_SECRET_KEY;

// Use test user data
const user = testUser;

// Use test admin data
const admin = testAdmin;

// Use test dates
const now = testDates.now;
```

### Presets

```typescript
import { basePreset, reactPreset } from "@repo/testing/shared/presets/vitest";

// Create a Vitest configuration
export default basePreset({
  // Custom configuration
});

// Create a React-specific Vitest configuration
export default reactPreset({
  // Custom configuration
});
```
