#!/bin/bash

# Fix imports in all workflow files
cd /Users/torin/repos/new--/forge/apps/backstage/app/api/workflows

for file in *.ts; do
  if [[ "$file" == *.bak || "$file" == "index.ts" || "$file" == "universal-registry.ts" || "$file" == "registry.ts" ]]; then
    continue
  fi
  
  echo "Fixing $file..."
  
  # Replace the import statement and add missing imports
  sed -i '' "s|from '@repo/orchestration';|from '@repo/orchestration/server/next';|g" "$file"
  
  # Check if withStepCircuitBreaker is used but not imported
  if grep -q "withStepCircuitBreaker" "$file" && ! grep -q "withStepCircuitBreaker," "$file"; then
    # Add withStepCircuitBreaker to imports
    sed -i '' '/^import {/,/^} from '\''@repo\/orchestration\/server\/next'\'';/{
      s/withStepTimeout,/withStepTimeout,\
  withStepCircuitBreaker,/
    }' "$file"
  fi
done

echo "All workflow files have been fixed!"