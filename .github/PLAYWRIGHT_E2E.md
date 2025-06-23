# Playwright E2E Tests in GitHub Actions

This document describes the GitHub Actions workflows that run Playwright E2E integration tests for
the Forge monorepo.

## Overview

We have multiple workflows to ensure comprehensive testing while maintaining fast feedback:

1. **Quick E2E Tests** (`ci-doppler.yml`) - Fast tests on PRs
2. **Full E2E Integration** (`e2e-integration.yml`) - Comprehensive tests on pushes
3. **Workers-Specific E2E** (`e2e-workers.yml`) - Dedicated workers testing

## Workflows

### 1. Quick E2E Tests (`ci-doppler.yml`)

**When it runs:**

- On pull requests to `main`, `master`, `develop`
- Part of the main CI pipeline

**What it does:**

- **Fast execution** (20 min timeout)
- **Chromium only** for speed
- **All three apps** (backstage, web, workers)
- **Mock services** for consistency
- **PostgreSQL database** service

**Environment:**

- Uses Doppler for secrets
- Mocks AI, Stripe, email, analytics
- Test database with PostgreSQL service

### 2. Full E2E Integration (`e2e-integration.yml`)

**When it runs:**

- On pushes to `main`, `master`, `develop`
- On PRs affecting app or testing code
- Manual trigger with app selection

**What it does:**

- **Comprehensive testing** (30 min per app)
- **Multiple browsers** (Chromium + Firefox)
- **Parallel execution** by app
- **Full service stack** (PostgreSQL, Redis for workers)
- **Detailed reporting** with artifacts

**Features:**

- **Manual dispatch** - Choose specific apps to test
- **Path-based triggers** - Only runs when relevant code changes
- **Service dependencies** - Database and Redis services
- **Artifact collection** - Reports and videos on failure
- **Summary reporting** - Combined results from all apps

### 3. Workers-Specific E2E (`e2e-workers.yml`)

**When it runs:**

- On changes to workers app or related packages
- Focused on workers-specific functionality

**What it does:**

- **Workers-only testing** with deep integration
- **QStash integration** for workflow testing
- **AI and vector services** with mocking
- **Workflow-specific validation**

## App-Specific Configuration

### Backstage App (Port 3300)

```yaml
services:
  postgres: # Admin operations need database
environment:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
  BETTER_AUTH_SECRET: test_secret_key_for_e2e_tests_only
  NEXT_PUBLIC_APP_URL: http://localhost:3300
  MOCK_STRIPE: true
  MOCK_EMAIL: true
```

### Web App (Port 3200)

```yaml
services:
  postgres: # User authentication and data
environment:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
  BETTER_AUTH_SECRET: test_secret_key_for_e2e_tests_only
  NEXT_PUBLIC_APP_URL: http://localhost:3200
  NEXT_LOCALE: en
  MOCK_ANALYTICS: true
  MOCK_EMAIL: true
```

### Workers App (Port 3400)

```yaml
services:
  postgres: # Workflow persistence
  redis: # Caching and queues
environment:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
  QSTASH_URL: http://localhost:8080
  UPSTASH_REDIS_REST_URL: redis://localhost:6379
  MOCK_AI: true
  MOCK_VECTOR_DB: true
  SKIP_INTEGRATION_TESTS: true
```

## Browser Support

### Quick Tests (PR)

- **Chromium only** - For speed and fast feedback

### Full Tests (Push)

- **Chromium** - Primary browser for compatibility
- **Firefox** - Alternative engine testing
- **Mobile viewports** - Responsive design validation

## Test Artifacts

### Success Artifacts

- **HTML Reports** - Visual test results with screenshots
- **Test Screenshots** - Visual validation captures
- **JSON Results** - Programmatic test data

### Failure Artifacts

- **Video Recordings** - Browser sessions on failure
- **Full Screenshots** - Page captures at failure point
- **Trace Files** - Playwright debugging traces
- **Console Logs** - Browser and app logs

## Environment Variables

### Required Secrets

```yaml
secrets:
  TURBO_TOKEN: # Turborepo cache acceleration
  DOPPLER_SERVICE_TOKEN_TEST: # Test environment secrets
  DOPPLER_SERVICE_TOKEN_BUILD: # Build environment secrets
```

### Test Environment

```bash
NODE_ENV=test
CI=true
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test
BETTER_AUTH_SECRET=test_secret_key_for_e2e_tests_only
```

### Service Mocking

```bash
# Quick/consistent testing
MOCK_AI=true
MOCK_STRIPE=true
MOCK_EMAIL=true
MOCK_ANALYTICS=true
MOCK_VECTOR_DB=true
MOCK_WEBHOOKS=true

# Skip heavy operations
SKIP_INTEGRATION_TESTS=true
```

## Triggers and Path Filters

### Automatic Triggers

```yaml
# Full E2E Integration
paths:
  - "apps/backstage/**"
  - "apps/web-legacy/**"
  - "apps/workers/**"
  - "packages/testing/**"
  - "packages/auth/**"
  - "packages/design-system/**"

# Workers-Specific
paths:
  - "apps/workers/**"
  - "packages/orchestration/**"
  - "packages/ai/**"
  - "packages/database/**"
```

### Manual Triggers

```bash
# Test specific apps
gh workflow run e2e-integration.yml -f apps="backstage,web"

# Test single app
gh workflow run e2e-integration.yml -f apps="workers"

# Test all apps (default)
gh workflow run e2e-integration.yml
```

## Performance Optimization

### Caching Strategy

- **pnpm store cache** - Dependency installation
- **Playwright browsers** - Browser binary caching
- **Turbo cache** - Build artifact caching

### Parallel Execution

- **Apps run in parallel** - Independent job execution
- **Browser tests in sequence** - Within each app
- **Service startup** - PostgreSQL/Redis in background

### Timeout Management

- **Quick tests**: 20 minutes
- **Full tests**: 30 minutes per app
- **Service health checks**: 10 second intervals

## Monitoring and Debugging

### Success Monitoring

- **GitHub Actions dashboard** - Workflow status
- **Turbo cache hits** - Build performance
- **Test duration trends** - Performance tracking

### Failure Investigation

1. **Check workflow summary** - Quick failure overview
2. **Download artifacts** - Reports and videos
3. **Review logs** - Step-by-step execution
4. **Local reproduction** - Using same environment

### Common Failure Patterns

- **Port conflicts** - Apps not starting correctly
- **Database connection** - Service startup timing
- **Authentication** - Missing or invalid test credentials
- **Browser crashes** - Memory or timeout issues
- **Asset loading** - Network or file path issues

## Local Testing

### Reproduce CI Environment

```bash
# Set CI environment variables
export CI=true
export NODE_ENV=test
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test

# Start local services
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d -p 6379:6379 redis:7

# Run tests like CI
pnpm test:e2e
```

### Debug Individual Apps

```bash
# Test specific app with UI
cd apps/backstage
pnpm test:e2e:ui

# Test with headed browser
cd apps/web-legacy
pnpm test:e2e:headed

# Test with debug mode
cd apps/workers
pnpm test:e2e:debug
```

## Workflow Updates

### Adding New Apps

1. **Update path filters** in workflow triggers
2. **Add app-specific job** in `e2e-integration.yml`
3. **Configure environment** variables for new app
4. **Update summary reporting** to include new app

### Modifying Test Scope

1. **Path filters** - Control when workflows run
2. **Environment mocking** - Speed up or add realism
3. **Browser coverage** - Balance speed vs coverage
4. **Timeout adjustments** - Based on app complexity

### Service Dependencies

1. **Add service** to workflow YAML
2. **Configure health checks** for reliability
3. **Update environment** variables
4. **Test service connectivity** in app tests

## Best Practices

### Workflow Design

- **Fail fast** - Quick feedback on obvious issues
- **Comprehensive coverage** - Full testing on important branches
- **Parallel execution** - Maximum efficiency
- **Clear artifacts** - Easy debugging

### Test Environment

- **Consistent state** - Predictable test conditions
- **Service mocking** - Reliable external dependencies
- **Minimal data** - Fast test setup and teardown
- **Isolated execution** - No cross-test contamination

### Performance

- **Cache dependencies** - Faster workflow startup
- **Parallel jobs** - Maximize runner utilization
- **Targeted triggers** - Only test affected code
- **Timeout management** - Prevent hanging workflows

### Debugging

- **Rich artifacts** - Videos, screenshots, logs
- **Clear naming** - Easy identification of failures
- **Structured logs** - Searchable error information
- **Local reproduction** - Same environment locally
