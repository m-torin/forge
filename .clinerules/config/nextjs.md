# Next.js Configuration

## [NEXT-1] Core Configuration

- **Required**: Yes
- **Summary**: Use standardized Next.js configuration structure.
- **Details**:
  - Use TypeScript for all Next.js configuration files
  - Export configuration as a default export
  - Apply configuration wrappers in a consistent order
  - Use the shared configuration from `@repo/next-config`

## [NEXT-2] Environment Variables

- **Required**: Yes
- **Summary**: Handle environment variables properly in Next.js.
- **Details**:
  - Access environment variables through the validated env object
  - Never use process.env directly in Next.js configuration
  - Define environment validation in `env.ts`
  - See `config/environment.md` for more details

## [NEXT-3] Environment-Specific Config

- **Required**: Yes
- **Summary**: Handle different environments properly.
- **Details**:
  - Use environment variables to conditionally apply configuration
  - Handle test environments explicitly
  - Apply production-only optimizations when appropriate
  - Use separate output directories for different environments

## [NEXT-4] Image Optimization

- **Required**: Yes
- **Summary**: Configure image optimization properly.
- **Details**:
  - Configure `images.domains` or `images.remotePatterns` for external images
  - Use appropriate image formats in `images.formats`
  - Define image optimization settings in next.config.ts

## [NEXT-5] API Routes

- **Required**: No
- **Summary**: Configure API routes with appropriate middleware.
- **Details**:
  - Apply middleware consistently
  - Use rewrites for proxy functionality
  - Secure API routes with appropriate authentication
  - Handle CORS properly for cross-origin requests

## [NEXT-6] Webpack Configuration

- **Required**: No
- **Summary**: Extend webpack configuration properly when needed.
- **Details**:
  - Extend webpack configuration only when necessary
  - Use plugins from shared packages
  - Handle specific module issues with ignoreWarnings
  - Preserve existing webpack configuration properties

## [NEXT-7] Shared Configuration

- **Required**: Yes
- **Summary**: Extend the shared configuration from `@repo/next-config`.
- **Details**:
  - ALL Next.js configurations MUST extend the shared configuration
  - Extend with app-specific settings
  - Keep configuration DRY across applications
  - Import with `import { createConfig } from '@repo/next-config'`

## [NEXT-8] Testing Configuration

- **Required**: Yes
- **Summary**: Configure Next.js for testing environments.
- **Details**:
  - Skip static optimization in test mode
  - Use a separate output directory for test builds
  - Configure for NODE_ENV=test
  - See `testing/standards.md` for more details

## [NEXT-9] ESLint Integration

- **Required**: Yes
- **Summary**: Use Next.js-specific ESLint configuration.
- **Details**:
  - Create an `eslint.config.ts` file in your Next.js app directory
  - Import from `@repo/eslint-config/next`
  - This includes Next.js-specific rules
  - See `code/quality.md` for more details
