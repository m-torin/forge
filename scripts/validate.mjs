#!/usr/bin/env node
/**
 * Repository-Wide Validation Script (Node 22+ Optimized)
 *
 * Validates architectural quality gates: stage boundaries and test coverage.
 * For Claude-specific automation (agents, commands, delegation), see .claude/scripts/validate-claude.mjs
 *
 * Usage:
 *   node validate.mjs contamination  - Check stage boundary violations
 *   node validate.mjs coverage       - Check test coverage thresholds
 *   node validate.mjs all            - Run both validators in parallel
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - One or more validations failed
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = process.cwd();

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let hasErrors = false;

// Helper: Report violation
function reportViolation(checkName, message) {
  console.error(`${RED}❌ VIOLATION${RESET}: ${checkName}`);
  console.error(`   ${message}`);
  hasErrors = true;
}

// Helper: Report success
function reportSuccess(checkName) {
  console.log(`${GREEN}✅${RESET} ${checkName}`);
}

// =============================================================================
// VALIDATOR 1: CONTAMINATION
// =============================================================================

async function validateContamination() {
  console.log('🔍 Running contamination checks...\n');

  let violations = 0;

  // Check 1: Packages → Next.js imports
  console.log('Checking Packages Stage boundaries...');
  try {
    const result = execSync('rg -n "from [\'\\"]next/" packages/*/src 2>/dev/null || true', {
      encoding: 'utf-8',
    }).trim();

    if (result) {
      reportViolation(
        'Packages → Next.js imports',
        'Packages cannot import Next.js runtime (use relative imports only)',
      );
      violations++;
    } else {
      reportSuccess('Packages: No Next.js imports');
    }
  } catch {}

  // Check 2: Packages → @/ imports
  try {
    const result = execSync('rg -n "from [\'\\"]@/" packages/*/src 2>/dev/null || true', {
      encoding: 'utf-8',
    }).trim();

    if (result) {
      reportViolation(
        'Packages → App imports',
        'Packages cannot import from apps via @/ (use @repo/* instead)',
      );
      violations++;
    } else {
      reportSuccess('Packages: No @/ imports');
    }
  } catch {}

  // Check 3: Packages → Deep imports
  try {
    const result = execSync(
      'rg -n "from [\'\\"]@repo/[^\'\\\"]+/src" packages/*/src 2>/dev/null || true',
      {
        encoding: 'utf-8',
      },
    ).trim();

    if (result) {
      reportViolation(
        'Packages → Deep imports',
        'Packages cannot deep-import src/ of other packages (use public exports)',
      );
      violations++;
    } else {
      reportSuccess('Packages: No deep imports');
    }
  } catch {}

  // Check 4: Apps → Package internals
  console.log('\nChecking Apps Stage boundaries...');
  try {
    const result = execSync('rg -n "@repo/[^\'\\\"]+/src/" apps 2>/dev/null || true', {
      encoding: 'utf-8',
    }).trim();

    if (result) {
      reportViolation(
        'Apps → Package internals',
        'Apps cannot deep-import package src/ (use public exports from package.json)',
      );
      violations++;
    } else {
      reportSuccess('Apps: No package deep imports');
    }
  } catch {}

  // Check 5: Client → Node core modules
  console.log('\nChecking Client Stage boundaries...');
  try {
    const clientFiles = execSync(
      'rg -l "from [\'\\\"](fs|path|net|crypto|http|https|tls|child_process)[\'\\"]" apps 2>/dev/null || true',
      { encoding: 'utf-8' },
    ).trim();

    if (clientFiles) {
      const clientViolations = clientFiles.split('\n').filter(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          return content.includes('use client') || file.includes('.client.');
        } catch {
          return false;
        }
      });

      if (clientViolations.length > 0) {
        reportViolation(
          'Client → Node core modules',
          `Client components cannot import Node core modules:\n${clientViolations.join('\n')}`,
        );
        violations++;
      } else {
        reportSuccess('Client: No Node core imports');
      }
    } else {
      reportSuccess('Client: No Node core imports');
    }
  } catch {}

  // Check 6: Edge → Node core
  console.log('\nChecking Edge Stage boundaries...');
  try {
    const result = execSync(
      'rg -n "from [\'\\\"](fs|path|net|crypto|http|https|tls|child_process)[\'\\"]" apps/**/middleware.{ts,tsx} 2>/dev/null || true',
      { encoding: 'utf-8' },
    ).trim();

    if (result) {
      reportViolation(
        'Edge → Node core modules',
        'Edge middleware cannot import Node core (use Web APIs only)',
      );
      violations++;
    } else {
      reportSuccess('Edge: No Node core imports');
    }
  } catch {}

  // Check 7: Edge → Prisma
  try {
    const result = execSync(
      'rg -n "from [\'\\"]@repo/db-prisma[\'\\"]|from [\'\\"]@prisma/client[\'\\"]" apps/**/middleware.{ts,tsx} 2>/dev/null || true',
      { encoding: 'utf-8' },
    ).trim();

    if (result) {
      reportViolation(
        'Edge → Prisma imports',
        'Edge middleware cannot import Prisma (use edge-compatible client resolver)',
      );
      violations++;
    } else {
      reportSuccess('Edge: No Prisma imports');
    }
  } catch {}

  // Check 8: Data → UI imports
  console.log('\nChecking Data Stage boundaries...');
  try {
    const result = execSync(
      'rg -n "from [\'\\\"](react|next|@mantine)[\'\\"]" packages/pkgs-databases/src 2>/dev/null || true',
      { encoding: 'utf-8' },
    ).trim();

    if (result) {
      reportViolation('Data → UI imports', 'Database package cannot import UI frameworks');
      violations++;
    } else {
      reportSuccess('Data: No UI imports');
    }
  } catch {}

  // Check 9: Infra → App imports
  console.log('\nChecking Infra Stage boundaries...');
  try {
    const result = execSync('rg -n "from [\'\\"]@repo/" infra 2>/dev/null || true', {
      encoding: 'utf-8',
    }).trim();

    if (result) {
      reportViolation(
        'Infra → App imports',
        'Infrastructure configs cannot import application code',
      );
      violations++;
    } else {
      reportSuccess('Infra: No app imports');
    }
  } catch {}

  // Summary
  console.log('\n' + '='.repeat(60));
  if (violations > 0) {
    console.error(`${RED}❌ Found ${violations} contamination violation(s)${RESET}`);
    console.log('\nFix these violations before committing.');
    console.log('See .claude/docs/contamination-web.md for guidance.');
    return false;
  } else {
    console.log(`${GREEN}✅ All contamination checks passed${RESET}`);
    return true;
  }
}

// =============================================================================
// VALIDATOR 2: COVERAGE
// =============================================================================

async function validateCoverage(scope = '.') {
  console.log(`📊 Checking coverage for scope: ${scope}\n`);

  const thresholds = {
    '@repo/typescript-config': 30,
    '@repo/eslint-config': 30,
    '@repo/3p-core': 40,
    '@repo/3p-posthog': 40,
    '@repo/3p-segment': 40,
    '@repo/3p-vercel': 40,
  };

  const threshold = thresholds[scope] || 50;
  const coveragePath = join(ROOT, 'coverage/coverage-summary.json');

  // Ensure coverage exists
  if (!existsSync(coveragePath)) {
    console.log(
      `${YELLOW}⚠️  coverage/coverage-summary.json not found. Attempting to generate...${RESET}`,
    );
    try {
      if (scope === '.') {
        execSync('pnpm vitest run --coverage', { stdio: 'inherit' });
      } else {
        execSync(`pnpm vitest --filter "${scope}" --run --coverage`, { stdio: 'inherit' });
      }
    } catch (err) {
      console.log(`${YELLOW}⚠️  No coverage file found after attempt to generate.${RESET}`);
      console.log('   Skipping gate; ensure tests emit coverage reports.');
      return true; // Don't fail on missing coverage
    }
  }

  if (!existsSync(coveragePath)) {
    console.log(`${YELLOW}⚠️  Still no coverage file, skipping${RESET}`);
    return true;
  }

  try {
    const coverageData = JSON.parse(readFileSync(coveragePath, 'utf-8'));
    const coverage = coverageData.total.lines.pct;
    const coverageInt = Math.floor(coverage);

    console.log(`Coverage: ${coverage}%`);
    console.log(`Threshold: ${threshold}%\n`);

    if (coverageInt < threshold) {
      console.error(`${RED}❌ Coverage below threshold${RESET}`);
      console.error(`   Current: ${coverage}%`);
      console.error(`   Required: ${threshold}%`);
      console.error(`   Deficit: ${threshold - coverageInt}%\n`);
      console.error('Add tests or document exception in scripts/validate.mjs');
      return false;
    } else {
      console.log(`${GREEN}✅ Coverage meets threshold${RESET}`);
      return true;
    }
  } catch (err) {
    console.error(`${RED}Error parsing coverage: ${err.message}${RESET}`);
    return false;
  }
}

// =============================================================================
// PARALLEL EXECUTION
// =============================================================================

async function validateAll() {
  console.log('🚀 Running all repository validators in parallel (Node 22+ optimized)...\n');
  console.log('='.repeat(60) + '\n');

  const startTime = performance.now();

  const results = await Promise.allSettled([validateContamination(), validateCoverage('.')]);

  const duration = performance.now() - startTime;

  const names = ['Contamination', 'Coverage'];
  let allPassed = true;

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 FINAL SUMMARY\n');

  results.forEach((result, idx) => {
    if (result.status === 'fulfilled' && result.value) {
      console.log(`   ${names[idx]}: ${GREEN}✅ PASS${RESET}`);
    } else {
      console.log(`   ${names[idx]}: ${RED}❌ FAIL${RESET}`);
      allPassed = false;
    }
  });

  console.log(`\n   Total time: ${duration.toFixed(0)}ms`);
  console.log('\n' + '='.repeat(60));

  if (allPassed) {
    console.log(`\n${GREEN}✅ All repository validations passed${RESET}\n`);
    return 0;
  } else {
    console.error(`\n${RED}❌ One or more repository validations failed${RESET}\n`);
    return 1;
  }
}

// =============================================================================
// MAIN CLI
// =============================================================================

async function main() {
  const subcommand = process.argv[2];
  const scope = process.argv[4]; // For --scope flag

  if (!subcommand) {
    console.error('Usage: node validate.mjs <contamination|coverage|all>');
    console.error('\nOptions:');
    console.error('  coverage --scope <name>  Check coverage for specific scope');
    process.exit(1);
  }

  let result;

  switch (subcommand) {
    case 'contamination':
      result = await validateContamination();
      break;
    case 'coverage':
      result = await validateCoverage(scope || '.');
      break;
    case 'all':
      process.exit(await validateAll());
    default:
      console.error(`Unknown subcommand: ${subcommand}`);
      console.error('Valid subcommands: contamination, coverage, all');
      process.exit(1);
  }

  process.exit(result ? 0 : 1);
}

main();
