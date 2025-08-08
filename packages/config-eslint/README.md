# @repo/eslint-config

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.` (base), `./next`, `./react-package`, `./server`, `./remix`
  - **Utilities**: `./package`, `./types`

- _AI Hints:_

  ```typescript
  // Primary: Comprehensive ESLint configuration with security, testing, accessibility
  // Base: import config from "@repo/eslint-config"
  // Next.js: import config from "@repo/eslint-config/next"
  // React: import config from "@repo/eslint-config/react-package"
  // Server: import config from "@repo/eslint-config/server"
  // ❌ NEVER: Create custom ESLint configs - extend from @repo/eslint-config
  ```

- _Key Features:_
  - **Multi-Environment Support**: Base, Next.js, React, Server, Remix
    configurations
  - **Security Rules**: ESLint security plugin with OWASP guidelines
  - **Testing Integration**: Vitest and Playwright rule sets
  - **Accessibility**: JSX-A11y plugin with comprehensive a11y rules
  - **Import Management**: Import sorting, unused import detection, extension
    handling
  - **TypeScript Integration**: Full TypeScript support with @typescript-eslint
  - **Code Quality**: Perfectionist sorting, promise handling, React hooks

- _Plugin Coverage:_
  - **Core**: @typescript-eslint, import, unused-imports, security
  - **Testing**: vitest, playwright, jest-dom, testing-library
  - **React**: react, react-hooks, jsx-a11y
  - **Quality**: perfectionist, promise, sonarjs
  - **Package Management**: pnpm (workspace validation)

- _Environment Configurations:_

  ```javascript
  // Base configuration (default)
  import config from "@repo/eslint-config";
  export default config;

  // Next.js applications
  import config from "@repo/eslint-config/next";
  export default config;

  // React packages/libraries
  import config from "@repo/eslint-config/react-package";
  export default config;

  // Server-only code
  import config from "@repo/eslint-config/server";
  export default config;
  ```

- _Rule Categories:_
  - **Security**: Detect eval, buffer overflows, CSRF, timing attacks
  - **TypeScript**: Strict type checking, no-non-null-assertion warnings
  - **React**: Hooks rules, JSX best practices, accessibility
  - **Testing**: Vitest/Playwright best practices, assertion preferences
  - **Imports**: Extension handling, no duplicates, first import rule
  - **Code Style**: Single quotes, no console warnings, unused variables

- _Custom Rules:_

  ```typescript
  // Custom rule: no-used-underscore-vars
  // Prevents using variables that start with underscore (convention for unused)
  "no-used-underscore-vars/no-used-underscore-vars": "error"

  // Security rules (OWASP-based)
  "security/detect-eval-with-expression": "error"
  "security/detect-non-literal-require": "error"
  "security/detect-buffer-noassert": "error"
  ```

- _File-Specific Configurations:_
  - **Test Files**: Allow console.log, disable security object injection
    warnings
  - **Config Files**: Allow dev dependencies, no console restrictions
  - **Script Files**: Relaxed security rules for build scripts
  - **Type Definitions**: Allow import duplicates for type merging
  - **Published Packages**: Stricter rules, console warnings only

- _Performance Optimizations:_
  - Import cycle detection disabled (performance)
  - Perfectionist sorting disabled (performance)
  - Production mode optimizations
  - Selective rule application by file pattern

- _Documentation:_ **[ESLint Config Package](../../apps/docs/packages/config/)**
