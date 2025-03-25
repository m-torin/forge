#!/bin/bash
# Find all __tests__/setup.ts files with window.matchMedia without type check
for file in $(find ../../packages -name "__tests__/setup.ts" -exec grep -l "Object.defineProperty(window" {} \;); do
  if ! grep -q "typeof window !== 'undefined'" $file; then
    echo "Adding window existence check to $file"
    sed -i '' 's/\/\/ Mock window.matchMedia/\/\/ Mock window.matchMedia (only in browser-like environments)\nif (typeof window !== '\''undefined'\'') {/g' $file
    sed -i '' 's/}));\n/}));\n}/g' $file
  fi
done

# Also fix setup-tests.ts files
for file in $(find ../../packages -name "setup-tests.ts" -exec grep -l "Object.defineProperty(window" {} \;); do
  if ! grep -q "typeof window !== 'undefined'" $file; then
    echo "Adding window existence check to $file"
    sed -i '' 's/\/\/ Mock window.matchMedia/\/\/ Mock window.matchMedia (only in browser-like environments)\nif (typeof window !== '\''undefined'\'') {/g' $file
    sed -i '' 's/}));\n/}));\n}/g' $file
  fi
done

echo "Fixes applied"
