# Cypress Testing Utilities

This module provides utilities for Cypress testing in the Next-Forge monorepo.
It includes configuration, commands, and setup utilities for both E2E and
component testing.

## Installation

The Cypress utilities are part of the `@repo/testing` package. To use them, you
need to install Cypress in your project:

```bash
pnpm add -D cypress
```

## Quick Setup

The easiest way to set up Cypress in your project is to use the setup script:

```bash
pnpm exec @repo/testing setup-cypress
```

This will create the necessary directory structure and configuration files for
both E2E and component testing.

## Manual Setup

### E2E Testing

1. Create a `cypress.config.js` file in your project root:

```javascript
import { e2e } from "@repo/testing/cypress";

export default e2e.createE2EConfig({
  // App-specific overrides
  baseUrl: "http://localhost:3000",
  env: {
    // App-specific environment variables
  },
});
```

2. Create a `cypress/support/e2e.ts` file:

```typescript
// Import the shared e2e support file
import "@repo/testing/cypress/e2e/setup";

// Add any app-specific commands or overrides here
```

### Component Testing

1. Create a `cypress.component.config.js` file in your project root:

```javascript
import { component } from "@repo/testing/cypress";

export default component.createComponentConfig({
  // App-specific overrides
  env: {
    // App-specific environment variables
  },
});
```

2. Create a `cypress/support/component.tsx` file:

```typescript
// Import the shared component support file
import "@repo/testing/cypress/component/setup";

// Add any app-specific commands or overrides here
```

## Custom Commands

The package provides several custom commands for Cypress tests:

### Authentication

- `cy.login(email, password)`: Log in a user
- `cy.logout()`: Log out a user
- `cy.bypassLogin(userId)`: Bypass login for tests

### UI Testing

- `cy.getByTestId(testId)`: Get an element by its data-testid attribute
- `cy.setViewport(size)`: Set viewport size to a predefined size or custom
  dimensions

### Component Testing

- `cy.mountWithProviders(component, options)`: Mount a React component with
  common providers

### Network

- `cy.waitForNetworkIdle(timeout)`: Wait for network requests to complete

## Configuration

### E2E Configuration

```javascript
import { e2e } from "@repo/testing/cypress";

export default e2e.createE2EConfig({
  // Your custom configuration here
});
```

### Component Configuration

```javascript
import { component } from "@repo/testing/cypress";

export default component.createComponentConfig({
  // Your custom configuration here
});
```

## Fixtures

The package provides several fixtures for testing:

- `users.json`: Sample user data
- `responses/api-success.json`: Sample API response

You can copy these fixtures to your project using the `copyFixtures` utility:

```javascript
import { scripts } from "@repo/testing/cypress";

scripts.copyFixtures("./path/to/your/project");
```

## Advanced Usage

### Custom Setup

You can customize the setup process by providing options to the `setupCypress`
function:

```javascript
import { scripts } from "@repo/testing/cypress";

scripts.setupCypress("./path/to/your/project", {
  type: "e2e", // 'e2e', 'component', or 'both'
  copyFixtures: true, // Whether to copy fixtures
});
```

### Custom Commands

You can add your own custom commands by creating a file in your
`cypress/support` directory:

```typescript
// cypress/support/commands.ts
import "@repo/testing/cypress/core/commands";

// Add your custom commands here
Cypress.Commands.add("myCustomCommand", () => {
  // Your command implementation
});
```
