# Development Workflows

## [FLOW-1] Codebase Exploration

- **Required**: Yes
- **Summary**: Use standardized tools and patterns to explore the codebase.
- **Details**:
  - Use VSCode search tools with specific patterns
  - Use navigation tools: `list_files`, `list_code_definition_names`,
    `read_file`
  - Start with systematic exploration of architecture
  - Examine directory structures first, then delve into specific files

## [FLOW-2] Initial Setup

- **Required**: Yes
- **Summary**: Standard process for setting up the development environment.
- **Details**:
  - Clone the repository: `git clone https://github.com/your-org/forge.git`
  - Install dependencies: `pnpm install`
  - Copy environment files: cp apps/_/.env.example apps/_/.env.local
  - Build core packages: `pnpm --filter @repo/database build`
  - Start development server: `pnpm dev`

## [FLOW-3] Feature Development

- **Required**: Yes
- **Summary**: Follow standardized workflow for feature development.
- **Details**:
  - Create feature branch: `git checkout -b feature/my-new-feature`
  - Explore codebase to understand context
  - Identify affected packages and dependencies
  - Implement changes following package-specific guidelines
  - Test changes: `pnpm --filter @repo/affected-package test`
  - Build affected packages: `pnpm --filter @repo/affected-package build`
  - Create PR with detailed description

## [FLOW-4] Environment Management

- **Required**: Yes
- **Summary**: Standard process for managing environment variables.
- **Details**:
  - Update `.env.example` with documentation
  - Update validation in keys.ts file
  - Update `.env.test` with appropriate test values
  - Document additions in project documentation

## [FLOW-5] Dependency Management

- **Required**: Yes
- **Summary**: Use consistent patterns for managing dependencies.
- **Details**:
  - Package dependency: `pnpm --filter @repo/package-name add dependency-name`
  - Package dev dependency:
    `pnpm --filter @repo/package-name add -D dependency-name`
  - Root dependency: `pnpm add -w dependency-name`
  - Update all dependencies: `pnpm bump-deps`
  - See `packages/dependencies.md` for more details

## [FLOW-6] Testing Workflow

- **Required**: Yes
- **Summary**: Follow standardized testing patterns.
- **Details**:
  - Extend from `@repo/testing` configurations
  - Generate tests: `pnpm generate-tests packages/my-package`
  - Run tests: `pnpm test` or `pnpm --filter @repo/package-name test`
  - See `testing/config.md` for details

## [FLOW-7] Deployment

- **Required**: Yes
- **Summary**: Standard process for deploying applications.
- **Details**:
  - Ensure all tests pass
  - Update version numbers
  - Build: `pnpm build`
  - Deploy to staging for verification
  - Deploy to production
  - Monitor for issues

## [FLOW-8] Troubleshooting

- **Required**: No
- **Summary**: Common troubleshooting steps for development issues.
- **Details**:
  - Build failures: Check dependencies, TypeScript errors, environment variables
  - Test failures: Check test environment, mock services
  - Environment issues: Verify validation and exports
  - Code understanding: Use search tools for component mapping

## [FLOW-9] Task Completion

- **Required**: Yes
- **Summary**: Present structured options after completing tasks.
- **Details**:
  - Present 3-5 distinct, actionable options as a numbered list
  - Include direct follow-ups, next logical steps, diagnostic options
  - Ensure options are specific and actionable
  - See `interaction/patterns.md` for details
