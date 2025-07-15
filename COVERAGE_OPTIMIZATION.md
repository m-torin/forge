# Coverage System for pnpm 10 and Turborepo

This document describes the unified test coverage system optimized for pnpm 10
and Turborepo.

## Overview

The unified coverage system provides:

- **Single script** (`coverage.mjs`) for all coverage operations
- **Resilient collection** - continues even when tests fail
- **Clean output format** - Apps and Packages sections with percentages
- **Turborepo optimized** - parallel execution with smart caching
- **pnpm 10 integration** - fast workspace discovery
- **Minimal configuration** - works out of the box

## Quick Start

```bash
# Run coverage for all packages
pnpm coverage

# Generate JSON report for CI/CD
pnpm coverage:json

# Force re-run (bypass cache)
pnpm coverage:force

# Filter specific packages
pnpm coverage --filter="@repo/auth"

# Custom concurrency
pnpm coverage --concurrency=16
```

## Output Format

```
Apps:
• Studio: 55% lines, 20% functions
• Email: 72% lines, 65% functions
• Docs: N/A (no tests)

Packages:
• @repo/auth: 83% lines, 78% functions
• @repo/database: 91% lines, 88% functions
• @repo/ai: 45% lines, 40% functions

Summary: 15/20 packages with coverage
Average: 68% lines, 62% functions
```

## Architecture

### Single Script Design

The entire coverage system is now a single `coverage.mjs` script that:

1. **Discovers packages** using `pnpm list -r --json` (pnpm 10 feature)
2. **Runs tests** via `turbo run test:coverage --continue`
3. **Collects coverage** from standard `coverage/coverage-summary.json`
   locations
4. **Displays results** in the clean Apps/Packages format

### Turborepo Integration

The `test:coverage` task in `turbo.json`:

```json
{
  "test:coverage": {
    "dependsOn": ["^test:coverage", "@repo/qa#build"],
    "cache": true,
    "inputs": [
      "src/**",
      "*.test.*",
      "*.spec.*",
      "vitest.config.*",
      "__tests__/**"
    ],
    "outputs": ["coverage/**"],
    "env": ["CI", "NODE_ENV", "VITEST_*"]
  }
}
```

### Package Scripts

Each package maintains simple coverage scripts:

```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
}
```

## Key Features

### 1. Resilient Coverage Collection

- **Continues on test failures** - Uses `--continue` flag with Turborepo
- **No threshold failures** - Coverage thresholds set to 0 during collection
- **Environment variables** ensure coverage is generated even on failures:
  ```bash
  VITEST_BAIL=false
  VITEST_PASSWITHNOLLTESTS=true
  VITEST_COVERAGE_REPORT_ON_FAILURE=true
  ```

### 2. Optimized for Turborepo & pnpm 10

- **Fast workspace discovery** - `pnpm list -r --json`
- **Parallel execution** - Configurable concurrency (default: 10)
- **Smart caching** - Turborepo caches test results and coverage
- **Minimal overhead** - Single script, no intermediate files

### 3. Clean Output Format

- Apps and Packages clearly separated
- Shows percentages for lines and functions
- Graceful handling of packages without tests
- Summary statistics at the end

## Command Line Options

```bash
Options:
  --format=console|json|summary  Output format (default: console)
  --output=file                  Write report to file
  --filter=pattern               Turbo filter pattern (e.g., "@repo/auth")
  --concurrency=N                Parallel execution limit (default: 10)
  --force                        Force re-run without cache
  --help, -h                     Show this help
```

## Troubleshooting

### Coverage data not found

- The script continues even if tests fail
- Check `coverage/coverage-summary.json` exists in package
- Verify package has `test:coverage` script

### Performance tuning

- Increase concurrency for faster runs: `--concurrency=16`
- Use Turborepo cache (enabled by default)
- Filter specific packages: `--filter="@repo/auth"`

### Cache issues

- Force re-run: `pnpm coverage:force`
- Clear Turbo cache: `pnpm turbo run test:coverage --force`

## Implementation Details

### Coverage Collection Flow

1. Discovers all packages using pnpm 10's JSON output
2. Runs `turbo run test:coverage --continue` to execute all tests
3. Sets environment variables to ensure coverage on failures
4. Reads coverage from each package's `coverage/coverage-summary.json`
5. Formats and displays results

### Why It Works with Test Failures

- Turborepo's `--continue` flag ensures all packages run
- Vitest's `reportOnFailure: true` generates coverage even on test failures
- Coverage thresholds set to 0 prevent threshold failures
- Environment variables override any blocking behavior
