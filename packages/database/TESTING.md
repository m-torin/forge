# Database Testing

This document outlines the approach for testing the database package.

## Testing Strategies

The database package uses two primary testing approaches:

1. **Unit Tests**: For testing database models and queries
2. **Integration Tests**: For testing the database client with a real database

## Prismock In-Memory Database Testing

We use [Prismock](https://github.com/morintd/prismock) to create an in-memory database that follows your Prisma schema for fast, isolated unit tests.

### Custom Client Path Support

This project uses custom Prisma client paths:

```prisma
generator client {
    provider = "prisma-client-js"
    output   = "../generated/client-node"
}
```

For custom client paths, we use `createPrismock(Prisma)` rather than direct `PrismockClient` instantiation:

```typescript
import { createPrismock } from "prismock";
import { Prisma } from "../generated/client-node";

// Create a custom Prismock client for our schema
const CustomPrismockClient = createPrismock(Prisma);
```

This ensures that Prismock correctly uses our schema rather than trying to find it in the default location.

### Setting Up Tests

Import the test utilities:

```typescript
import { prismaMock, setupOrmTests } from "../test-utils";
import type { User } from "@prisma/client";

// Initialize the in-memory database for each test
setupOrmTests();
```

### Writing Tests with Prismock

Tests should create actual data and perform real operations against the in-memory database:

```typescript
describe("User model", () => {
  it("should create and find a user", async () => {
    // Create test data
    const userData = {
      id: "user_123",
      email: "test@example.com",
      name: "Test User",
    };

    // Create the user in the in-memory database
    await prismaMock.user.create({
      data: userData,
    });

    // Find the user we created
    const foundUser = await prismaMock.user.findUnique({
      where: { id: "user_123" },
    });

    // Verify the result
    expect(foundUser).toMatchObject(userData);
  });
});
```

### Benefits of In-Memory Testing

- **Fast**: Tests run quickly without external database connections
- **Isolated**: Each test starts with a clean database
- **No Setup**: No need to set up a test database or Docker containers
- **Full Schema**: Tests against your complete Prisma schema
- **Real Operations**: Performs actual database operations for confidence

## Test Organization

Tests are organized by database model:

- `__tests__/prisma/user.test.ts`: User model tests
- `__tests__/prisma/account.test.ts`: Account model tests
- `__tests__/prisma/session.test.ts`: Session model tests
- ...etc.

## Running Tests

To run all tests:

```bash
pnpm test
```

To run a specific test file:

```bash
pnpm test __tests__/prisma/user.test.ts
```

## Best Practices

1. **Test Each Operation**: Create tests for all CRUD operations on each model
2. **Test Relationships**: Include tests for related data models
3. **Use Real Data**: Create realistic test data
4. **Verify Results**: Always verify the results with assertions
5. **Clean Before Each Test**: Each test should start with a clean state
