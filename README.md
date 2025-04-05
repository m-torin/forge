# Next-Forge

## Setting up testing in a new package

To set up Vitest in a new package, you can use the `setup-vitest` script from
the `@repo/testing` package:

```bash
# For React packages (default)
pnpm --filter @repo/testing setup-vitest ../path/to/your-package

# For Node.js packages
pnpm --filter @repo/testing setup-vitest ../path/to/your-package node
```

This will create a `vitest.config.mjs` file in your package with the appropriate
configuration.

You may need to create a `__tests__/setup.ts` file for your package-specific
test setup.

## Testing Components

For React component tests, create a file in the `__tests__/components` directory
with a `.test.tsx` extension.

```tsx
import { describe, expect, it } from "vitest";
import { createRender, screen } from "../setup";
import { YourComponent } from "../../components/your-component";

// Create a custom render function
const customRender = createRender();

describe("YourComponent", () => {
  it("renders correctly", () => {
    customRender(<YourComponent />);
    expect(screen.getByText("Some text")).toBeInTheDocument();
  });
});
```

### Setting up Vitest

This repository includes a script to set up Vitest in a package:

```bash
pnpm -F @repo/testing setup-vitest <package-path> <type>
```

Where `<type>` is one of: `react`, `next`, or `node` (defaults to `react`).

This will create a `vitest.config.mjs` file in your package with the appropriate
configuration.
