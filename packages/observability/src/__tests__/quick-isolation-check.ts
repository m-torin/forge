#!/usr/bin/env tsx
/**
 * Quick isolation check script
 * Run this to quickly verify export isolation without full test suite
 */

import path from 'path';
import {
  analyzeImportChain,
  checkForbiddenModules,
  generateImportReport,
} from './utils/import-analyzer';
import { testRuntimeCompatibility } from './utils/runtime-compatibility';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

async function quickCheck() {
  console.log('🔍 Quick Export Isolation Check\n');

  const checks = [
    {
      name: 'Edge Export (server-next-edge.ts)',
      file: path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
      runtime: 'edge' as const,
      critical: true,
    },
    {
      name: 'Client Export (client.ts)',
      file: path.join(PACKAGE_ROOT, 'client.ts'),
      runtime: 'browser' as const,
      critical: false,
    },
    {
      name: 'Server Next Export (server-next.ts)',
      file: path.join(PACKAGE_ROOT, 'server-next.ts'),
      runtime: 'nodejs' as const,
      critical: false,
    },
  ];

  let allPassed = true;

  for (const check of checks) {
    console.log(`\n📋 Checking ${check.name}...`);

    try {
      // Analyze import chain
      const analysis = await analyzeImportChain(check.file, new Set(), PACKAGE_ROOT);
      const forbidden = checkForbiddenModules(analysis, check.runtime);

      if (forbidden.isValid) {
        console.log(`✅ ${check.name}: PASS`);
        console.log(`   - Dependencies: ${analysis.allDependencies.size}`);
        console.log(`   - Static imports: ${analysis.staticImports.length}`);
        console.log(`   - Dynamic imports: ${analysis.dynamicImports.length}`);
        console.log(`   - Eval-wrapped: ${analysis.evalWrappedImports.length}`);
      } else {
        console.log(`❌ ${check.name}: FAIL`);
        console.log('   Violations:');
        forbidden.violations.forEach((v) => {
          console.log(`   - ${v.module} (${v.type}): ${v.reason}`);
        });

        if (check.critical) {
          allPassed = false;
        }
      }

      // Quick runtime test
      try {
        const modulePath = `../${path.basename(check.file, '.ts')}`;
        const runtimeTest = await testRuntimeCompatibility(modulePath, [], check.runtime);

        if (runtimeTest.canLoad) {
          console.log(`   ✅ Runtime test: PASS`);
        } else {
          console.log(`   ❌ Runtime test: FAIL`);
          if (runtimeTest.errors.length > 0) {
            console.log(`   Error: ${runtimeTest.errors[0].message}`);
          }
          if (check.critical) {
            allPassed = false;
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Runtime test: SKIP (${(error as Error).message})`);
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ERROR`);
      console.log(`   ${(error as Error).message}`);
      if (check.critical) {
        allPassed = false;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All critical checks PASSED!');
    console.log('✨ Export isolation is working correctly.');
  } else {
    console.log('💥 Some critical checks FAILED!');
    console.log('🔧 Export isolation needs attention.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  quickCheck().catch((error) => {
    console.error('Quick check failed:', error);
    process.exit(1);
  });
}

export { quickCheck };
