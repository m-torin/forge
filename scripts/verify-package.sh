#!/bin/bash
# verify-package.sh - Script to verify package compliance with monorepo standards

# Check if package name is provided
if [ -z "$1" ]; then
  echo "Usage: ./verify-package.sh <package-name>"
  echo "Example: ./verify-package.sh my-package"
  exit 1
fi

PACKAGE=$1
PACKAGE_PATH="packages/$PACKAGE"

# Check if package exists
if [ ! -d "$PACKAGE_PATH" ]; then
  echo "❌ Package $PACKAGE does not exist in packages directory"
  exit 1
fi

echo "🔍 Verifying package: @repo/$PACKAGE"

# Check directory structure
[ ! -d "$PACKAGE_PATH/src" ] && echo "❌ Missing src directory" && EXIT_CODE=1
[ ! -d "$PACKAGE_PATH/__tests__" ] && echo "❌ Missing __tests__ directory" && EXIT_CODE=1
[ ! -f "$PACKAGE_PATH/eslint.config.ts" ] && echo "❌ Missing eslint.config.ts" && EXIT_CODE=1
[ ! -f "$PACKAGE_PATH/src/index.ts" ] && echo "❌ Missing src/index.ts" && EXIT_CODE=1
[ ! -f "$PACKAGE_PATH/__tests__/index.test.ts" ] && echo "❌ Missing __tests__/index.test.ts" && EXIT_CODE=1

# Check package.json
if [ -f "$PACKAGE_PATH/package.json" ]; then
  echo "✓ package.json exists"
  grep -q "\"type\": \"module\"" "$PACKAGE_PATH/package.json" || {
    echo "❌ Missing type:module in package.json"
    EXIT_CODE=1
  }
  grep -q "\"exports\":" "$PACKAGE_PATH/package.json" || {
    echo "❌ Missing exports configuration in package.json"
    EXIT_CODE=1
  }
else
  echo "❌ Missing package.json"
  EXIT_CODE=1
fi

# Check tsconfig.json
if [ -f "$PACKAGE_PATH/tsconfig.json" ]; then
  echo "✓ tsconfig.json exists"
  grep -q "\"noEmit\": true" "$PACKAGE_PATH/tsconfig.json" || {
    echo "❌ Missing noEmit:true in tsconfig.json"
    EXIT_CODE=1
  }
  grep -q "\"module\": \"NodeNext\"" "$PACKAGE_PATH/tsconfig.json" || {
    echo "❌ Missing module:NodeNext in tsconfig.json"
    EXIT_CODE=1
  }
else
  echo "❌ Missing tsconfig.json"
  EXIT_CODE=1
fi

# Check for local Prettier configuration (should not exist)
if [ -f "$PACKAGE_PATH/.prettierrc" ] || [ -f "$PACKAGE_PATH/.prettierrc.js" ] || [ -f "$PACKAGE_PATH/.prettierrc.json" ] || [ -f "$PACKAGE_PATH/.prettierrc.mjs" ]; then
  echo "❌ Local Prettier configuration found (should use root configuration only)"
  EXIT_CODE=1
fi

# Check imports in TypeScript files
echo "Checking imports in TypeScript files..."
IMPORT_ERRORS=0

# Check for file extensions in imports
grep -r "from './" --include="*.ts" --include="*.tsx" "$PACKAGE_PATH" | grep -v ".ts'" | grep -v ".tsx'" | grep -v ".js'" | grep -v ".mjs'" | grep -v ".css'" > /dev/null
if [ $? -eq 0 ]; then
  echo "❌ Found imports without file extensions"
  IMPORT_ERRORS=1
  EXIT_CODE=1
fi

# Check for CommonJS syntax
grep -r "require(" --include="*.ts" --include="*.tsx" "$PACKAGE_PATH" > /dev/null
if [ $? -eq 0 ]; then
  echo "❌ Found CommonJS require() syntax"
  IMPORT_ERRORS=1
  EXIT_CODE=1
fi

grep -r "module.exports" --include="*.ts" --include="*.tsx" "$PACKAGE_PATH" > /dev/null
if [ $? -eq 0 ]; then
  echo "❌ Found CommonJS module.exports syntax"
  IMPORT_ERRORS=1
  EXIT_CODE=1
fi

if [ $IMPORT_ERRORS -eq 0 ]; then
  echo "✓ Import syntax looks good"
fi

# Final result
if [ -z "$EXIT_CODE" ]; then
  echo "✅ Package @repo/$PACKAGE meets basic requirements"
  echo "Run full verification with: pnpm turbo --filter @repo/$PACKAGE typecheck lint test"
else
  echo "❌ Package @repo/$PACKAGE has issues that need to be fixed"
  exit 1
fi
