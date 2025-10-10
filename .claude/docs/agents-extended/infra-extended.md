# Infra Extended Guide

Comprehensive infrastructure-as-code, CI/CD pipelines, and deployment orchestration patterns.

## Table of Contents

1. [Terraform Module Patterns](#terraform-module-patterns)
2. [GitHub Actions Optimization](#github-actions-optimization)
3. [Deployment Workflows](#deployment-workflows)
4. [Secret Management](#secret-management)
5. [Environment Configuration](#environment-configuration)
6. [Rollback Strategies](#rollback-strategies)
7. [Anti-Patterns and Solutions](#anti-patterns-and-solutions)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Terraform Module Patterns

### Pattern 1: Vercel Project Module

**Complete Vercel project setup:**

```hcl
# infra/modules/vercel-project/main.tf

terraform {
  required_version = ">= 1.6"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

variable "project_name" {
  type        = string
  description = "Project name (e.g., forge-webapp)"
}

variable "environment" {
  type        = string
  description = "Environment (production, staging, preview)"
  validation {
    condition     = contains(["production", "staging", "preview"], var.environment)
    error_message = "Environment must be production, staging, or preview"
  }
}

variable "env_vars" {
  type = map(object({
    value     = string
    sensitive = bool
  }))
  description = "Environment variables for the project"
  sensitive   = true
}

resource "vercel_project" "app" {
  name      = "${var.project_name}-${var.environment}"
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "agrippan/forge-forge"
  }

  build_command    = "pnpm turbo run build --filter=${var.project_name}"
  output_directory = "apps/${var.project_name}/.next"
  install_command  = "pnpm install --frozen-lockfile"

  environment = [
    for key, config in var.env_vars : {
      key       = key
      value     = config.value
      target    = [var.environment == "production" ? "production" : "preview"]
      sensitive = config.sensitive
    }
  ]
}

resource "vercel_project_domain" "app" {
  project_id = vercel_project.app.id
  domain     = var.environment == "production" ? "app.forge.com" : "${var.environment}.forge.com"
}

output "project_id" {
  value = vercel_project.app.id
}

output "deployment_url" {
  value = vercel_project_domain.app.domain
}
```

### Pattern 2: State Management

**Remote state with locking:**

```hcl
# infra/production/backend.tf

terraform {
  backend "s3" {
    bucket         = "forge-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"

    # Assume role for cross-account access
    role_arn = "arn:aws:iam::123456789012:role/TerraformStateAccess"
  }
}

# State locking with DynamoDB
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform State Lock Table"
    Environment = "production"
  }
}
```

**Workspace-based environments:**

```bash
# Create workspaces for different environments
terraform workspace new production
terraform workspace new staging
terraform workspace new preview

# Switch between environments
terraform workspace select production
terraform plan
terraform apply

# List workspaces
terraform workspace list
# * production
#   staging
#   preview
```

### Pattern 3: Variable Management

**Using Doppler with Terraform:**

```hcl
# infra/production/variables.tf

variable "doppler_token" {
  type        = string
  sensitive   = true
  description = "Doppler service token for secret retrieval"
}

data "doppler_secrets" "production" {
  provider = doppler
  project  = "forge"
  config   = "production"
}

# Use secrets in resources
resource "vercel_env_variable" "database_url" {
  project_id = vercel_project.webapp.id
  key        = "DATABASE_URL"
  value      = data.doppler_secrets.production.map["DATABASE_URL"]
  sensitive  = true
  target     = ["production"]
}
```

**Applying with Doppler:**

```bash
# Set Doppler token via environment
export DOPPLER_TOKEN=$(doppler configs tokens create production --plain)

# Or use doppler run
doppler run --config production -- terraform apply

# Verify secrets not exposed
terraform show | grep -i "DATABASE_URL"
# Should show: value = (sensitive value)
```

---

## GitHub Actions Optimization

### Pattern 1: Turborepo CI with Caching

**Optimized workflow with Remote Caching:**

```yaml
# .github/workflows/ci.yml

name: CI
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  quality:
    name: Quality Gates
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # For Turborepo changed file detection

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10.6.3

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Cache Turborepo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm turbo run typecheck --cache-dir=.turbo

      - name: Lint
        run: pnpm turbo run lint --cache-dir=.turbo

      - name: Test
        run: pnpm turbo run test --cache-dir=.turbo

      - name: Build
        run: pnpm turbo run build --cache-dir=.turbo --filter='...[HEAD^1]'  # Only changed packages

      - name: Upload coverage
        if: always()
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
```

### Pattern 2: Scoped Workflow Execution

**Run tests only for changed packages:**

```yaml
# .github/workflows/test-changed.yml

name: Test Changed Packages
on: [pull_request]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            webapp:
              - 'apps/webapp/**'
            auth:
              - 'packages/auth/**'
            db:
              - 'packages/pkgs-databases/**'

  test:
    needs: detect-changes
    if: ${{ needs.detect-changes.outputs.packages != '[]' }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: ${{ fromJSON(needs.detect-changes.outputs.packages) }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run test --filter=${{ matrix.package }}
```

### Pattern 3: Deployment Workflow

**Production deployment with approval:**

```yaml
# .github/workflows/deploy-production.yml

name: Deploy to Production
on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      confirm:
        description: 'Type "DEPLOY" to confirm'
        required: true

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate confirmation
        run: |
          if [ "${{ github.event.inputs.confirm }}" != "DEPLOY" ]; then
            echo "Deployment cancelled: confirmation not provided"
            exit 1
          fi

  deploy:
    needs: validate
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.forge.com
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo run build --filter=webapp

      - name: Deploy to Vercel
        id: deploy
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npx vercel deploy --prod --token=$VERCEL_TOKEN > deployment-url.txt
          echo "url=$(cat deployment-url.txt)" >> $GITHUB_OUTPUT

      - name: Health check
        run: |
          sleep 10  # Wait for deployment to propagate
          response=$(curl -f -s -o /dev/null -w "%{http_code}" https://app.forge.com/api/health)
          if [ "$response" != "200" ]; then
            echo "Health check failed with status $response"
            exit 1
          fi

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment failed! Investigate immediately.'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Deployment Workflows

### Workflow 1: Zero-Downtime Deployment

**Blue-Green deployment pattern:**

```bash
#!/bin/bash
# scripts/deploy-blue-green.sh

set -euo pipefail

ENVIRONMENT="${1:-production}"
PROJECT_ID="${VERCEL_PROJECT_ID}"

echo "🚀 Starting blue-green deployment to $ENVIRONMENT"

# 1. Deploy to staging slot (green)
echo "📦 Deploying to staging slot..."
GREEN_URL=$(vercel deploy --env=$ENVIRONMENT --token=$VERCEL_TOKEN)
echo "Green deployment: $GREEN_URL"

# 2. Run smoke tests against green
echo "🧪 Running smoke tests..."
./scripts/smoke-tests.sh "$GREEN_URL"

# 3. Gradual traffic shift (canary)
echo "🔀 Shifting 10% traffic to green..."
vercel alias set "$GREEN_URL" canary.forge.com --token=$VERCEL_TOKEN

# 4. Monitor for 5 minutes
echo "📊 Monitoring canary deployment..."
sleep 300

# 5. Check error rates
ERROR_RATE=$(curl -s "https://api.sentry.io/0/organizations/forge/projects/webapp/stats/" | jq '.error_rate')
if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
  echo "❌ Error rate too high ($ERROR_RATE), rolling back"
  vercel alias rm canary.forge.com --token=$VERCEL_TOKEN
  exit 1
fi

# 6. Full cutover
echo "✅ Promoting green to production..."
vercel promote "$GREEN_URL" --token=$VERCEL_TOKEN

# 7. Update production alias
vercel alias set "$GREEN_URL" app.forge.com --token=$VERCEL_TOKEN

echo "✅ Deployment complete!"
```

### Workflow 2: Database Migration Coordination

**Safe migration with rollback:**

```bash
#!/bin/bash
# scripts/deploy-with-migration.sh

set -euo pipefail

echo "🗃️  Starting deployment with database migration"

# 1. Backup database
echo "💾 Creating database backup..."
pg_dump "$DATABASE_URL" > "backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"

# 2. Run migrations in transaction
echo "🔄 Running migrations..."
pnpm --filter @repo/db-prisma migrate deploy || {
  echo "❌ Migration failed, restoring backup"
  psql "$DATABASE_URL" < "backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
  exit 1
}

# 3. Deploy application
echo "🚀 Deploying application..."
vercel deploy --prod --token=$VERCEL_TOKEN || {
  echo "❌ Deployment failed, rolling back migration"
  pnpm --filter @repo/db-prisma migrate rollback
  exit 1
}

# 4. Verify deployment
echo "🔍 Verifying deployment..."
./scripts/smoke-tests.sh "https://app.forge.com"

echo "✅ Deployment with migration complete!"
```

---

## Secret Management

### Pattern 1: Doppler Integration

**Pull secrets for local development:**

```bash
# scripts/doppler-pull-all.sh

#!/bin/bash
set -euo pipefail

ENVIRONMENTS=("production" "staging" "preview" "development")
PROJECTS=(
  "apps/webapp"
  "apps/ai-chatbot"
  "apps/backstage"
  "packages/auth"
  "packages/pkgs-databases"
)

for ENV in "${ENVIRONMENTS[@]}"; do
  echo "📥 Pulling secrets for $ENV..."

  for PROJECT in "${PROJECTS[@]}"; do
    cd "$PROJECT"

    # Pull secrets to .env.local
    doppler secrets download \
      --project forge \
      --config "$ENV" \
      --format env \
      --no-file \
      > .env."$ENV".local

    echo "✅ Pulled secrets for $PROJECT ($ENV)"
    cd - > /dev/null
  done
done

echo "🎉 All secrets pulled successfully"
```

### Pattern 2: Secret Rotation

**Rotate secrets safely:**

```bash
#!/bin/bash
# scripts/rotate-secret.sh

set -euo pipefail

SECRET_NAME="$1"
NEW_VALUE="$2"

if [ -z "$SECRET_NAME" ] || [ -z "$NEW_VALUE" ]; then
  echo "Usage: $0 <SECRET_NAME> <NEW_VALUE>"
  exit 1
fi

echo "🔄 Rotating secret: $SECRET_NAME"

# 1. Update in Doppler
echo "📝 Updating Doppler..."
doppler secrets set "$SECRET_NAME=$NEW_VALUE" \
  --project forge \
  --config production

# 2. Update Vercel environment variables via Terraform
echo "🔧 Updating Terraform..."
cd infra/production

terraform init
terraform plan -target="vercel_env_variable.$SECRET_NAME"
terraform apply -target="vercel_env_variable.$SECRET_NAME" -auto-approve

# 3. Trigger redeployment
echo "🚀 Triggering redeployment..."
vercel env pull .env.production.local --token="$VERCEL_TOKEN"
vercel redeploy --prod --token="$VERCEL_TOKEN"

# 4. Verify new secret works
echo "🔍 Verifying secret rotation..."
sleep 30
curl -f https://app.forge.com/api/health || {
  echo "❌ Health check failed, rolling back"
  # Rollback logic here
  exit 1
}

echo "✅ Secret rotated successfully"
```

---

## Environment Configuration

### Pattern 1: Multi-Environment Setup

**Environment-specific Terraform:**

```hcl
# infra/environments/production/main.tf

terraform {
  required_version = ">= 1.6"
}

module "webapp" {
  source = "../../modules/vercel-project"

  project_name = "webapp"
  environment  = "production"

  env_vars = {
    DATABASE_URL = {
      value     = data.doppler_secrets.production.map["DATABASE_URL"]
      sensitive = true
    }
    NEXT_PUBLIC_APP_ENV = {
      value     = "production"
      sensitive = false
    }
    REDIS_URL = {
      value     = data.doppler_secrets.production.map["REDIS_URL"]
      sensitive = true
    }
  }
}

module "ai_chatbot" {
  source = "../../modules/vercel-project"

  project_name = "ai-chatbot"
  environment  = "production"

  env_vars = {
    DATABASE_URL = {
      value     = data.doppler_secrets.production.map["DATABASE_URL"]
      sensitive = true
    }
    OPENAI_API_KEY = {
      value     = data.doppler_secrets.production.map["OPENAI_API_KEY"]
      sensitive = true
    }
  }
}

output "webapp_url" {
  value = module.webapp.deployment_url
}

output "ai_chatbot_url" {
  value = module.ai_chatbot.deployment_url
}
```

### Pattern 2: Environment Promotion

**Promote staging to production:**

```bash
#!/bin/bash
# scripts/promote-to-production.sh

set -euo pipefail

echo "🔼 Promoting staging to production"

# 1. Verify staging is healthy
echo "🔍 Verifying staging..."
./scripts/smoke-tests.sh "https://staging.forge.com"

# 2. Copy environment variables
echo "📋 Copying environment variables..."
doppler secrets download \
  --project forge \
  --config staging \
  --format json > /tmp/staging-secrets.json

# 3. Review differences
echo "📊 Reviewing differences..."
doppler secrets diff \
  --project forge \
  --config-from staging \
  --config-to production

# 4. Prompt for confirmation
read -p "Proceed with promotion? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Promotion cancelled"
  exit 0
fi

# 5. Update production secrets (selective)
# Only update non-sensitive config, not credentials
jq -r 'to_entries[] | select(.key | startswith("NEXT_PUBLIC_")) | "\(.key)=\(.value)"' /tmp/staging-secrets.json | while read -r SECRET; do
  doppler secrets set "$SECRET" \
    --project forge \
    --config production
done

# 6. Deploy to production
echo "🚀 Deploying to production..."
vercel promote $(vercel list --scope=forge staging | tail -n1) --prod

echo "✅ Promotion complete"
```

---

## Rollback Strategies

### Strategy 1: Vercel Instant Rollback

```bash
#!/bin/bash
# scripts/rollback-production.sh

set -euo pipefail

echo "⏪ Rolling back production deployment"

# 1. List recent deployments
echo "📋 Recent deployments:"
vercel list --scope=forge webapp | head -n5

# 2. Get previous production deployment
PREVIOUS_URL=$(vercel list --scope=forge webapp --meta=production | sed -n '2p' | awk '{print $1}')

if [ -z "$PREVIOUS_URL" ]; then
  echo "❌ No previous deployment found"
  exit 1
fi

echo "🔄 Rolling back to: $PREVIOUS_URL"

# 3. Promote previous deployment
vercel promote "$PREVIOUS_URL" --token="$VERCEL_TOKEN"

# 4. Verify rollback
echo "🔍 Verifying rollback..."
sleep 10
curl -f https://app.forge.com/api/health || {
  echo "❌ Rollback health check failed"
  exit 1
}

# 5. Update aliases
vercel alias set "$PREVIOUS_URL" app.forge.com --token="$VERCEL_TOKEN"

echo "✅ Rollback complete"
```

### Strategy 2: Database Rollback

```bash
#!/bin/bash
# scripts/rollback-database.sh

set -euo pipefail

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file.sql>"
  exit 1
fi

echo "⚠️  WARNING: This will restore database from backup"
echo "Backup file: $BACKUP_FILE"
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Rollback cancelled"
  exit 0
fi

# 1. Create safety backup of current state
echo "💾 Creating safety backup..."
pg_dump "$DATABASE_URL" > "backups/pre-rollback-$(date +%Y%m%d-%H%M%S).sql"

# 2. Drop all connections
echo "🔌 Terminating active connections..."
psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'forge' AND pid <> pg_backend_pid();"

# 3. Restore from backup
echo "📥 Restoring from backup..."
psql "$DATABASE_URL" < "$BACKUP_FILE"

# 4. Run any necessary migrations
echo "🔄 Running post-restore migrations..."
pnpm --filter @repo/db-prisma migrate deploy

# 5. Verify database
echo "🔍 Verifying database..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

echo "✅ Database rollback complete"
```

---

## Anti-Patterns and Solutions

### Anti-Pattern 1: Hardcoded Secrets

**Problem:**

```yaml
# ❌ BAD: Secrets in workflow
- name: Deploy
  run: |
    curl -H "Authorization: Bearer sk-1234567890"
```

**Solution:**

```yaml
# ✅ GOOD: Secrets from GitHub Secrets
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: |
    curl -H "Authorization: Bearer $API_KEY"
```

### Anti-Pattern 2: No Caching

**Problem:**

```yaml
# ❌ BAD: No caching (slow CI)
- run: pnpm install
- run: pnpm build
# Takes 5+ minutes every time
```

**Solution:**

```yaml
# ✅ GOOD: Aggressive caching
- uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      .turbo
      **/node_modules
    key: ${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}

- run: pnpm install --frozen-lockfile
- run: pnpm turbo run build --cache-dir=.turbo
# Takes <1 minute with cache
```

### Anti-Pattern 3: Blind Auto-Apply

**Problem:**

```bash
# ❌ BAD: No review
terraform apply -auto-approve
```

**Solution:**

```bash
# ✅ GOOD: Review then apply
terraform plan -out=tfplan
terraform show tfplan

# Review output, then:
terraform apply tfplan
```

### Anti-Pattern 4: No Rollback Plan

**Problem:**

```bash
# ❌ BAD: Deploy and hope
vercel deploy --prod
```

**Solution:**

```bash
# ✅ GOOD: Deploy with rollback
DEPLOYMENT_URL=$(vercel deploy --prod)

# Health check
if ! curl -f "$DEPLOYMENT_URL/api/health"; then
  echo "Deployment failed, rolling back"
  vercel rollback "$PREVIOUS_DEPLOYMENT"
  exit 1
fi
```

---

## Troubleshooting Guide

### Issue: Terraform State Lock

**Symptom:**
```
Error: Error acquiring the state lock
Lock Info:
  ID: 12345678-1234-1234-1234-123456789012
```

**Solution:**

```bash
# 1. Check if lock is stale
terraform force-unlock 12345678-1234-1234-1234-123456789012

# 2. If legitimate lock, wait for it to release
# (someone else is running terraform)

# 3. If emergency, manually remove from DynamoDB
aws dynamodb delete-item \
  --table-name terraform-locks \
  --key '{"LockID": {"S": "forge/production/terraform.tfstate-md5"}}'
```

### Issue: GitHub Actions Cache Miss

**Symptom:**
```
Cache not found for input keys: linux-pnpm-abc123
```

**Diagnosis:**

```yaml
# Check cache key
- name: Debug cache
  run: |
    echo "OS: ${{ runner.os }}"
    echo "Lock hash: ${{ hashFiles('**/pnpm-lock.yaml') }}"
    echo "Key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}"
```

**Solution:**

```yaml
# Ensure key is stable
- uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
```

### Issue: Vercel Deployment Timeout

**Symptom:**
```
Error: Deployment exceeded maximum duration of 10 minutes
```

**Diagnosis:**

```bash
# Check build logs
vercel logs <deployment-url>

# Common causes:
# - node_modules not cached
# - Turborepo cache disabled
# - Running tests during build
```

**Solution:**

```json
// vercel.json
{
  "buildCommand": "pnpm turbo run build --filter=$VERCEL_GIT_REPO_SLUG",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "cacheDirectories": [
    "node_modules",
    ".turbo",
    ".next/cache"
  ]
}
```

### Issue: Secret Not Available After Rotation

**Symptom:**
```
Error: DATABASE_URL is not defined
```

**Diagnosis:**

```bash
# Check Doppler
doppler secrets get DATABASE_URL --project forge --config production

# Check Vercel
vercel env ls --scope=forge

# Check if deployment has new env vars
curl https://app.forge.com/api/debug/env
```

**Solution:**

```bash
# 1. Verify secret in Doppler
doppler secrets set DATABASE_URL=<value> --project forge --config production

# 2. Sync to Vercel via Terraform
cd infra/production
terraform apply -target=vercel_env_variable.database_url

# 3. Redeploy to pick up new secret
vercel redeploy --prod --token=$VERCEL_TOKEN
```

---

**End of Extended Guide**

For quick reference, see `.claude/agents/infra.md`
