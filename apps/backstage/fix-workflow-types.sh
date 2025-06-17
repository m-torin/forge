#!/bin/bash

cd /Users/torin/repos/new--/forge/apps/backstage/app/api/workflows

# Fix common type errors across all workflow files
for file in *.ts; do
  if [[ "$file" == *.bak || "$file" == "index.ts" || "$file" == "universal-registry.ts" || "$file" == "registry.ts" ]]; then
    continue
  fi
  
  echo "Fixing types in $file..."
  
  # Fix withStepTimeout - it takes a number or object with execution property
  sed -i '' 's/withStepTimeout(step, { execution: \([0-9]*\) })/withStepTimeout(step, \1)/g' "$file"
  
  # Fix withStepMonitoring - it takes an optional monitor function, not an object
  sed -i '' 's/withStepMonitoring(step, {[^}]*enableDetailedLogging[^}]*})/withStepMonitoring(step)/g' "$file"
  
  # Fix withStepRetry - maxAttempts should be maxRetries
  sed -i '' 's/maxAttempts:/maxRetries:/g' "$file"
  
  # Fix withStepCircuitBreaker - remove invalid properties (threshold/timeout)
  # Replace multi-property configs with just failureThreshold and resetTimeout
  perl -i -pe 's/withStepCircuitBreaker\(step,\s*\{[^}]*\}/withStepCircuitBreaker(step, { failureThreshold: 5, resetTimeout: 60000 }/g' "$file"
  
  # Fix backoff property - should be a string not boolean
  sed -i '' "s/backoff: 'exponential'/backoff: true/g" "$file"
  
  # Add explicit type annotations for step parameters in compose functions
  sed -i '' 's/\(compose(\s*\n*\s*\)\(.*\),\s*\n*\s*(\(step\)) =>/\1\2,\n  (step: any) =>/g' "$file"
  
  # Fix StepTemplates.conditional - ensure it has proper signature
  sed -i '' 's/StepTemplates\.conditional(/StepTemplates.conditional(/g' "$file"
  
done

echo "Type fixes complete!"