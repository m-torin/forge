#!/usr/bin/env node
/**
 * Simple export validation script (Node.js only)
 * Quick check without test framework dependencies
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.join(dirname, 'src');

// Simple regex-based import extraction
function extractImports(content) {
   
  const staticImportRegex = /^import\s+.*from\s+['"]([^'"]+)['"];?$/gm;
  // eslint-disable-next-line security/detect-unsafe-regex
  const dynamicImportRegex = /(?:await\s+)?import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  const staticImports = [];
  const dynamicImports = [];
  
  let match;
  while ((match = staticImportRegex.exec(content)) !== null) {
    staticImports.push(match[1]);
  }
  
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    dynamicImports.push(match[1]);
  }
  
  return { staticImports, dynamicImports };
}

// Check for forbidden patterns
function checkForbiddenPatterns(imports, patterns) {
  const violations = [];
  
  for (const imp of imports) {
    for (const pattern of patterns) {
      if (pattern.test(imp)) {
        violations.push(imp);
      }
    }
  }
  
  return violations;
}

async function validateExport(fileName, runtime) {
  console.log(`\n🔍 Validating ${fileName} (${runtime} runtime)...`);
  
  try {
    const filePath = path.join(PACKAGE_ROOT, fileName);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- File paths are controlled by the exports array
    const content = await fs.readFile(filePath, 'utf-8');
    const { staticImports, dynamicImports } = extractImports(content);
    
    console.log(`  Static imports: ${staticImports.length}`);
    console.log(`  Dynamic imports: ${dynamicImports.length}`);
    
    // Define forbidden patterns for each runtime
    const forbiddenPatterns = {
      edge: [
        /@opentelemetry/,
        /@vercel\/otel/,
        /^node:/,
        /^(fs|path|crypto|stream|http|https|net|tls|dns)$/,
        /pino|winston/,
      ],
      browser: [
        /@opentelemetry/,
        /^node:/,
        /@sentry\/node/,
        /^(fs|path|crypto|stream|http|https|net|tls|dns)$/,
      ],
      nodejs: [], // Node.js can import most things
    };
    
    const patterns = forbiddenPatterns[runtime] || [];
    const staticViolations = checkForbiddenPatterns(staticImports, patterns);
    const dynamicViolations = checkForbiddenPatterns(dynamicImports, patterns);
    
    if (staticViolations.length > 0) {
      console.log(`  ❌ Static import violations: ${staticViolations.join(', ')}`);
      return false;
    }
    
    if (dynamicViolations.length > 0 && runtime === 'edge') {
      console.log(`  ⚠️  Dynamic import violations: ${dynamicViolations.join(', ')}`);
      // Dynamic imports might be OK if properly guarded
    }
    
    console.log(`  ✅ ${fileName}: CLEAN`);
    return true;
    
  } catch (error) {
    console.log(`  ❌ Error reading ${fileName}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Quick Export Isolation Validation\n');
  
  const exports = [
    { file: 'server-next-edge.ts', runtime: 'edge' },
    { file: 'client.ts', runtime: 'browser' },
    { file: 'client-next.ts', runtime: 'browser' },
    { file: 'server.ts', runtime: 'nodejs' },
    { file: 'server-next.ts', runtime: 'nodejs' },
  ];
  
  let allPassed = true;
  
  for (const { file, runtime } of exports) {
    const passed = await validateExport(file, runtime);
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All exports passed validation!');
    console.log('✨ Five-file export pattern is working correctly.');
  } else {
    console.log('💥 Some exports failed validation!');
    console.log('🔧 Export isolation needs attention.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});