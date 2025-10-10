# Foundations Extended Guide

Comprehensive monorepo hygiene, Turborepo optimization, and dependency management patterns.

## Table of Contents

1. [pnpm Workspace Management](#pnpm-workspace-management)
2. [Turborepo Pipeline Optimization](#turborepo-pipeline-optimization)
3. [Dependency Catalog Strategies](#dependency-catalog-strategies)
4. [Cache Performance Tuning](#cache-performance-tuning)
5. [knip Unused Code Detection](#knip-unused-code-detection)
6. [Common Task Workflows](#common-task-workflows)
7. [Anti-Patterns and Solutions](#anti-patterns-and-solutions)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## pnpm Workspace Management

### Pattern 1: Workspace Configuration

**Complete `pnpm-workspace.yaml` setup:**

```yaml
# Root pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'services/*'
  - 'labs/*'

# Dependency catalog for version consistency
catalog:
  # Framework versions
  react: ^19.1.0
  'react-dom': ^19.1.0
  next: ^15.4.0

  # TypeScript ecosystem
  typescript: ^5.7.3
  '@types/node': ^22.10.5
  '@types/react': ^19.0.8
  '@types/react-dom': ^19.0.3

  # Build tools
  turbo: ^2.3.5
  vite: ^6.1.10
  vitest: ^2.1.8

  # Linting & formatting
  eslint: ^9.20.0
  prettier: ^3.4.2

  # Database
  prisma: ^6.2.1
  '@prisma/client': ^6.2.1

  # UI libraries
  '@mantine/core': ^7.20.2
  '@mantine/hooks': ^7.20.2
  '@mantine/form': ^7.20.2

  # Utilities
  zod: ^3.24.1
  date-fns: ^4.1.0

# Overrides for security patches
overrides:
  # Example: Force minimum version for security
  'minimist': '>=1.2.6'
```

### Pattern 2: Package Configuration

**Adding new package to workspace:**

```json
// packages/new-package/package.json
{
  "name": "@repo/new-package",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server.ts",
    "./client": "./src/client.ts"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "catalog:",
    "zod": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "@types/react": "catalog:",
    "eslint": "catalog:",
    "vitest": "catalog:"
  }
}
```

**Package-specific turbo.json:**

```json
// packages/new-package/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
```

### Pattern 3: Workspace Protocol Usage

**Internal package dependencies:**

```json
// ✅ GOOD: Using workspace protocol
{
  "dependencies": {
    "@repo/core-utils": "workspace:*",
    "@repo/uix-system": "workspace:^",  // Match semver range
    "@repo/db-prisma": "workspace:~"    // Match minor version
  }
}

// ❌ BAD: Hardcoded versions
{
  "dependencies": {
    "@repo/core-utils": "^1.0.0"  // Will break workspace linking
  }
}
```

**Benefits of workspace protocol:**
- Packages always use local versions during development
- Published packages get actual version numbers
- pnpm links packages instead of duplicating

### Pattern 4: Catalog Migration

**Before (inconsistent versions):**

```json
// packages/a/package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "zod": "^3.20.0"
  }
}

// packages/b/package.json
{
  "dependencies": {
    "react": "^19.0.0",  // Different version!
    "zod": "^3.22.0"     // Different version!
  }
}
```

**After (catalog versions):**

```yaml
# pnpm-workspace.yaml
catalog:
  react: ^19.1.0
  zod: ^3.24.1
```

```json
// Both packages now use catalog
{
  "dependencies": {
    "react": "catalog:",
    "zod": "catalog:"
  }
}
```

**Migration process:**

```bash
# 1. Add versions to catalog in pnpm-workspace.yaml

# 2. Update all packages to use catalog:
find packages apps -name package.json -exec sed -i '' 's/"react": ".*"/"react": "catalog:"/' {} \;

# 3. Clean and reinstall
pnpm clean && pnpm install

# 4. Verify consistency
pnpm list react
```

---

## Turborepo Pipeline Optimization

### Pattern 1: Task Dependencies

**Root turbo.json with proper dependencies:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "tsconfig.json",
    ".env",
    ".env.local"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "src/**",
        "package.json",
        "tsconfig.json"
      ],
      "outputs": [
        ".next/**",
        "!.next/cache/**",
        "dist/**"
      ],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": [
        "src/**",
        "__tests__/**",
        "vitest.config.ts",
        "package.json"
      ],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "inputs": [
        "src/**",
        "__tests__/**",
        "eslint.config.js",
        ".prettierrc"
      ],
      "cache": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": [
        "src/**",
        "__tests__/**",
        "tsconfig.json",
        "package.json"
      ],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Key concepts:**

- **`^build`**: Caret means "dependencies' build task must complete first"
- **`build`**: No caret means "this package's build task"
- **`dependsOn`**: Task ordering (DAG)
- **`inputs`**: Files that affect cache validity
- **`outputs`**: Files generated by task
- **`cache`**: Whether to cache results
- **`persistent`**: Task runs continuously (dev servers)

### Pattern 2: Cache Hit Rate Optimization

**Analyzing cache performance:**

```bash
# Run build with summary
pnpm turbo run build --summarize

# Output shows:
# Tasks:    3 successful, 3 total
# Cached:   2/3 (66.7%)
# Time:     5.2s (cache saved: 8.1s)
```

**Improving cache hit rate:**

```json
// BEFORE (45% cache hit rate)
{
  "tasks": {
    "build": {
      "inputs": ["**/*"],  // Too broad!
      "outputs": ["dist/**"]
    }
  }
}

// AFTER (87% cache hit rate)
{
  "tasks": {
    "build": {
      "inputs": [
        "src/**/*.{ts,tsx}",  // Only source files
        "package.json",       // Dependency changes
        "tsconfig.json"       // Config changes
        // Excludes: tests, docs, configs
      ],
      "outputs": ["dist/**"]
    }
  }
}
```

**Common cache-busting culprits:**

1. **Including test files in build inputs**
   ```json
   // ❌ BAD: Tests invalidate build cache
   "inputs": ["src/**", "__tests__/**"]

   // ✅ GOOD: Tests separate
   "inputs": ["src/**"]
   ```

2. **Overly broad globs**
   ```json
   // ❌ BAD: Catches everything
   "inputs": ["**/*"]

   // ✅ GOOD: Specific patterns
   "inputs": ["src/**/*.{ts,tsx}", "package.json"]
   ```

3. **Missing outputs**
   ```json
   // ❌ BAD: Incomplete outputs
   "outputs": ["dist/**"]
   // Missing: .next cache, generated types

   // ✅ GOOD: All outputs listed
   "outputs": [
     "dist/**",
     ".next/**",
     "!.next/cache/**",
     "src/generated/**"
   ]
   ```

### Pattern 3: Pipeline Debugging

**Dry run to see execution plan:**

```bash
# See what would run without executing
pnpm turbo run build --dry

# Output shows:
# • Packages in scope: @repo/webapp, @repo/auth, @repo/db-prisma
# • Tasks to Run: 3 build tasks
# • DAG:
#   @repo/db-prisma:build
#   └─ @repo/auth:build
#      └─ @repo/webapp:build
```

**Understanding the DAG:**

```
graph TD
  A[@repo/db-prisma:build] --> B[@repo/auth:build]
  B --> C[@repo/webapp:build]
  D[@repo/core-utils:build] --> B
  D --> C
```

**Common pipeline issues:**

1. **Circular dependencies**
   ```json
   // Package A depends on B
   // Package B depends on A
   // ERROR: Circular dependency detected

   // Solution: Remove circular reference or extract shared code
   ```

2. **Missing dependencies**
   ```bash
   # If webapp:build fails because auth not built:

   # Check webapp/package.json:
   "dependencies": {
     "@repo/auth": "workspace:*"
   }

   # Check webapp/turbo.json:
   {
     "tasks": {
       "build": {
         "dependsOn": ["^build"]  // Must include ^build
       }
     }
   }
   ```

---

## Dependency Catalog Strategies

### Strategy 1: When to Use Catalog

**Use catalog for:**
- ✅ Framework versions (React, Next.js)
- ✅ Shared utilities (Zod, date-fns)
- ✅ Dev tools (TypeScript, ESLint, Vitest)
- ✅ UI libraries (Mantine components)
- ✅ Database clients (Prisma)

**Don't use catalog for:**
- ❌ Package-specific dependencies (one-off libraries)
- ❌ Version-locked dependencies (specific feature requirements)
- ❌ Peer dependencies (let consuming package decide)

**Example:**

```yaml
# pnpm-workspace.yaml catalog
catalog:
  # ✅ Shared across many packages
  react: ^19.1.0
  next: ^15.4.0
  typescript: ^5.7.3

  # ❌ Package-specific (don't add to catalog)
  # stripe: Only used in @repo/payments
  # @aws-sdk/client-s3: Only used in @repo/storage
```

### Strategy 2: Catalog Version Updates

**Safe update process:**

```bash
# 1. Check current versions
pnpm outdated --recursive

# 2. Update catalog version
# pnpm-workspace.yaml
catalog:
  react: ^19.1.0  # Update from ^19.0.0

# 3. Update all packages using catalog
pnpm update react --recursive

# 4. Run full test suite
pnpm test

# 5. Check for breaking changes
git diff pnpm-lock.yaml

# 6. Update code if needed (breaking changes)
# (Delegate to specialists if complex)

# 7. Commit with message
git commit -m "chore: update React to 19.1.0"
```

**Breaking change handling:**

```bash
# Example: Next.js 15.3 → 15.4 with breaking changes

# 1. Read changelog
# https://github.com/vercel/next.js/releases/tag/v15.4.0

# 2. Identify breaking changes
# - New: Server Actions must export async functions
# - Changed: middleware.ts now requires explicit runtime

# 3. Coordinate with specialists
# - stack-next-react: Review server actions
# - stack-auth: Review middleware changes

# 4. Create migration tasks in TodoWrite
TodoWrite:
- Task: Update server actions for Next.js 15.4
- Owner: stack-next-react
- Files: apps/*/app/actions/*.ts
- Acceptance: All actions are async exports

# 5. Test in isolation first
cd apps/webapp
pnpm next build
pnpm test

# 6. Roll out to all apps
pnpm turbo run build test
```

### Strategy 3: Overrides for Security

**Using overrides to patch vulnerabilities:**

```yaml
# pnpm-workspace.yaml
overrides:
  # Force minimum version for CVE-2021-44906
  'minimist': '>=1.2.6'

  # Override transitive dependency
  'json5@<2.2.2': '>=2.2.3'

  # Pin specific package to patched version
  'tough-cookie': '4.1.3'
```

**When to use overrides:**

1. **Security patches**: Dependency has CVE, maintainer hasn't updated
2. **Transitive vulnerabilities**: Direct dep is fine, but its dep is vulnerable
3. **Temporary fixes**: Waiting for proper fix in next release

**Testing overrides:**

```bash
# Verify override applied
pnpm why minimist
# Should show overridden version

# Check for issues
pnpm audit
# Should show vulnerability resolved

# Full test
pnpm turbo run build test lint
```

---

## Cache Performance Tuning

### Tuning 1: Input File Optimization

**Goal: Include only files that actually affect output**

```json
// BEFORE: Over-inclusive inputs (45% hit rate)
{
  "tasks": {
    "build": {
      "inputs": [
        "**/*"  // Includes EVERYTHING
      ]
    }
  }
}

// AFTER: Precise inputs (87% hit rate)
{
  "tasks": {
    "build": {
      "inputs": [
        "src/**/*.{ts,tsx,js,jsx}",  // Source code
        "public/**",                  // Static assets
        "package.json",               // Dependencies
        "tsconfig.json",              // Type config
        "next.config.js"              // Framework config
        // Excludes: README, tests, docs
      ]
    }
  }
}
```

**Testing input changes:**

```bash
# 1. Make change to test file
echo "// test" >> src/__tests__/example.test.ts

# 2. Run build
pnpm turbo run build --filter=webapp

# 3. Check cache hit
# Expected: Cache HIT (test change shouldn't invalidate build)

# 4. Make change to source file
echo "// change" >> src/index.ts

# 5. Run build
pnpm turbo run build --filter=webapp

# 6. Check cache miss
# Expected: Cache MISS (source change should invalidate)
```

### Tuning 2: Output Completeness

**Ensure all generated files are captured:**

```json
{
  "tasks": {
    "build": {
      "outputs": [
        // Next.js
        ".next/**",
        "!.next/cache/**",  // Exclude internal cache

        // TypeScript
        "dist/**",
        "*.d.ts",

        // Generated files
        "src/generated/**",

        // Build artifacts
        "out/**"
      ]
    }
  }
}
```

**Verifying outputs:**

```bash
# 1. Clean build
rm -rf dist .next

# 2. Build with summary
pnpm turbo run build --filter=webapp --summarize

# 3. Check what was cached
cat .turbo/runs/*.json | jq '.execution.cached'

# 4. Verify all outputs present
ls dist .next src/generated
```

### Tuning 3: Remote Caching

**Setup Vercel Remote Cache:**

```bash
# 1. Link project
pnpm turbo link

# 2. Build with remote cache
pnpm turbo run build --remote

# 3. Verify remote cache hit in CI
# CI logs should show: "cache hit (remote)"
```

**Benefits:**
- Team members share cache hits
- CI runs faster (share with local dev)
- Deployment builds reuse CI cache

---

## knip Unused Code Detection

### Usage 1: Basic Unused Code Scan

```bash
# Run knip to find unused exports
pnpm repo:knip

# Example output:
# Unused exports (3)
#   packages/core-utils/src/helpers.ts:
#     - oldHelper (line 45)
#   packages/auth/src/utils.ts:
#     - deprecatedFn (line 120)
#
# Unused dependencies (2)
#   packages/webapp:
#     - lodash (never imported)
```

### Configuration: knip.json

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "workspaces": {
    "apps/*": {
      "entry": [
        "src/app/**/*.{ts,tsx}",
        "src/pages/**/*.{ts,tsx}",
        "next.config.js"
      ],
      "project": ["src/**/*.{ts,tsx}"]
    },
    "packages/*": {
      "entry": ["src/index.ts"],
      "project": ["src/**/*.ts"]
    }
  },
  "ignore": [
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/vitest.config.ts"
  ],
  "ignoreDependencies": [
    "@types/*",  // Type-only imports
    "typescript"
  ]
}
```

### Pattern: Safe Removal Process

```bash
# 1. Run knip
pnpm repo:knip > knip-report.txt

# 2. Review unused exports
cat knip-report.txt

# 3. For each unused export:
#    a) Verify it's truly unused (not dynamic imports)
#    b) Coordinate with owning specialist
#    c) Create TodoWrite task

TodoWrite:
- Task: Remove unused oldHelper in core-utils
- Owner: foundations
- File: packages/core-utils/src/helpers.ts:45
- Verification: knip clean, tests pass

# 4. Remove code
# Edit file to remove export

# 5. Verify
pnpm turbo run build test --filter=@repo/core-utils

# 6. Re-run knip
pnpm repo:knip
# Should no longer report this export

# 7. Commit
git commit -m "chore: remove unused oldHelper from core-utils"
```

### Pattern: False Positive Handling

**Common false positives:**

1. **Dynamic imports**
   ```typescript
   // knip may report as unused if dynamically imported
   export const feature = () => {};

   // But actually used:
   const mod = await import('./feature');
   mod.feature();
   ```

2. **Type-only exports**
   ```typescript
   // May be reported unused if only used in types
   export type User = { ... };

   // Used as type:
   const user: User = { ... };
   ```

3. **Config-driven code**
   ```typescript
   // Exported for plugin system
   export const plugin = { ... };

   // Loaded via config
   plugins: ['./plugin']
   ```

**Solution: Add to knip ignore:**

```json
{
  "ignore": [
    "**/plugins/**",    // Plugin exports
    "**/types.ts",      // Type-only files
    "**/dynamic/**"     // Dynamic imports
  ]
}
```

---

## Common Task Workflows

### Workflow 1: Add New Package

```bash
# 1. Create package directory
mkdir -p packages/new-feature

# 2. Initialize package.json
cat > packages/new-feature/package.json <<EOF
{
  "name": "@repo/new-feature",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "catalog:",
    "zod": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "@types/react": "catalog:",
    "vitest": "catalog:"
  }
}
EOF

# 3. Create turbo.json
cat > packages/new-feature/turbo.json <<EOF
{
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
EOF

# 4. Create source structure
mkdir -p packages/new-feature/src
cat > packages/new-feature/src/index.ts <<EOF
export const hello = () => 'Hello from new-feature!';
EOF

# 5. Create tsconfig.json
cat > packages/new-feature/tsconfig.json <<EOF
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
EOF

# 6. Install dependencies
pnpm install

# 7. Verify package works
pnpm --filter @repo/new-feature build
pnpm --filter @repo/new-feature test

# 8. Run repo health check
pnpm repo:preflight
```

### Workflow 2: Update Catalog Dependency

```bash
# Goal: Update React from 19.0.0 to 19.1.0

# 1. Check current usage
pnpm list react --depth=0

# 2. Read changelog for breaking changes
# https://github.com/facebook/react/releases/tag/v19.1.0

# 3. Update catalog
# Edit pnpm-workspace.yaml:
catalog:
  react: ^19.1.0

# 4. Update all packages
pnpm update react --recursive

# 5. Verify installation
pnpm list react
# All should show 19.1.0

# 6. Build all packages
pnpm turbo run build

# 7. Run full test suite
pnpm turbo run test

# 8. Check for runtime issues
# Start dev servers:
# pnpm --filter webapp dev
# (user-only, don't actually run)

# 9. Commit
git add pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "chore: update React to 19.1.0"
```

### Workflow 3: Optimize Build Cache

```bash
# Goal: Improve cache hit rate from 45% to >80%

# 1. Baseline measurement
pnpm turbo run build --summarize > baseline.json
# Cache hit: 45%

# 2. Analyze current inputs
cat turbo.json | jq '.tasks.build.inputs'
# ["**/*"]  # Too broad!

# 3. Refine inputs
# Edit turbo.json:
{
  "tasks": {
    "build": {
      "inputs": [
        "src/**/*.{ts,tsx}",
        "package.json",
        "tsconfig.json"
      ]
    }
  }
}

# 4. Clear cache and rebuild
rm -rf .turbo
pnpm turbo run build --summarize > optimized.json

# 5. Make test change
echo "// test" >> src/__tests__/example.test.ts

# 6. Rebuild and check cache hit
pnpm turbo run build --summarize
# Expected: Cache HIT (test change doesn't affect build)

# 7. Measure improvement
# Cache hit: 87% ✓ (target met)

# 8. Document in memory
# .claude/memory/foundations-learnings.md:
## [2025-01-15] Turborepo Cache Optimization
**Before**: 45% hit rate, 8min CI builds
**After**: 87% hit rate, 3min CI builds
**Change**: Refined build inputs to exclude test files
```

---

## Anti-Patterns and Solutions

### Anti-Pattern 1: Hardcoded Dependency Versions

**Problem:**

```json
// packages/a/package.json
{
  "dependencies": {
    "react": "^19.0.0"
  }
}

// packages/b/package.json
{
  "dependencies": {
    "react": "^19.1.0"  // Different version!
  }
}
```

**Issues:**
- Version drift across packages
- Larger node_modules (multiple versions)
- Type conflicts
- Harder to update (must update everywhere)

**Solution:**

```yaml
# pnpm-workspace.yaml
catalog:
  react: ^19.1.0
```

```json
// All packages
{
  "dependencies": {
    "react": "catalog:"
  }
}
```

### Anti-Pattern 2: Missing Task Dependencies

**Problem:**

```json
{
  "tasks": {
    "build": {},
    "test": {}  // Doesn't depend on build!
  }
}
```

**Issues:**
- Tests run before code is built
- Intermittent failures
- Cache inefficiency

**Solution:**

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]  // Test after build
    }
  }
}
```

### Anti-Pattern 3: Overly Broad Cache Inputs

**Problem:**

```json
{
  "tasks": {
    "build": {
      "inputs": ["**/*"]  // Everything!
    }
  }
}
```

**Issues:**
- README changes invalidate build cache
- Test changes invalidate build cache
- Cache hit rate <20%

**Solution:**

```json
{
  "tasks": {
    "build": {
      "inputs": [
        "src/**/*.{ts,tsx}",
        "package.json",
        "tsconfig.json"
      ]
    }
  }
}
```

### Anti-Pattern 4: Incorrect Workspace Protocol

**Problem:**

```json
{
  "dependencies": {
    "@repo/core-utils": "^1.0.0"  // Hardcoded version
  }
}
```

**Issues:**
- pnpm doesn't link local package
- Must publish to test changes
- Version mismatches

**Solution:**

```json
{
  "dependencies": {
    "@repo/core-utils": "workspace:*"  // Link local
  }
}
```

---

## Troubleshooting Guide

### Issue: pnpm install fails with "Lockfile is broken"

**Symptom:**
```
ERR_PNPM_LOCKFILE_BROKEN_DEPENDENCY
```

**Solution:**
```bash
# 1. Remove lockfile
rm pnpm-lock.yaml

# 2. Clean node_modules
rm -rf node_modules packages/*/node_modules apps/*/node_modules

# 3. Reinstall
pnpm install

# 4. Verify
pnpm repo:preflight
```

### Issue: Turborepo cache not hitting

**Symptom:**
```
Cache: MISS
Cache: MISS
Cache: MISS
```

**Diagnosis:**
```bash
# Check inputs
cat turbo.json | jq '.tasks.build.inputs'

# Check outputs
cat turbo.json | jq '.tasks.build.outputs'

# Verify files match patterns
ls -la src/**/*.ts
```

**Common causes:**
1. Inputs too broad (include changing files)
2. Outputs incomplete (missing generated files)
3. Global dependencies changed (tsconfig, .env)

**Solution:**
```json
// Refine inputs and outputs
{
  "tasks": {
    "build": {
      "inputs": [
        "src/**/*.{ts,tsx}",  // Specific patterns
        "package.json"
      ],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**"  // Exclude volatile files
      ]
    }
  }
}
```

### Issue: Circular dependency detected

**Symptom:**
```
Error: Circular dependency detected:
  @repo/auth -> @repo/db-prisma -> @repo/auth
```

**Diagnosis:**
```bash
# Find circular references
pnpm madge --circular --extensions ts,tsx packages/*/src
```

**Solution:**

1. **Extract shared code:**
   ```
   @repo/auth -> @repo/db-prisma
         ↑            ↓
         @repo/shared-types
   ```

2. **Use dependency injection:**
   ```typescript
   // Instead of direct import
   import { db } from '@repo/db-prisma';

   // Pass as parameter
   export const authFn = (db: Database) => {};
   ```

3. **Restructure packages:**
   - Move shared types to separate package
   - Use interfaces instead of concrete imports

### Issue: knip reports false positives

**Symptom:**
```
Unused export: myFeature (actually used dynamically)
```

**Solution:**

```json
// knip.json
{
  "ignore": [
    "**/plugins/**",     // Plugin system
    "**/dynamic/**"      // Dynamic imports
  ],
  "ignoreDependencies": [
    "@types/*"           // Type-only
  ]
}
```

### Issue: Package not found after adding to workspace

**Symptom:**
```
Cannot find module '@repo/new-package'
```

**Checklist:**
```bash
# 1. Verify package.json name
cat packages/new-package/package.json | jq .name
# Should be: "@repo/new-package"

# 2. Check workspace includes package
cat pnpm-workspace.yaml
# Should have: packages/*

# 3. Reinstall
pnpm install

# 4. Verify link
ls -la node_modules/@repo/
# Should include: new-package -> ../../packages/new-package

# 5. Check exports
cat packages/new-package/package.json | jq .exports
# Should have valid entry points
```

---

**End of Extended Guide**

For quick reference, see `.claude/agents/foundations.md`
