#!/usr/bin/env node

/**
 * Quick coverage summary for all packages
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const packages = [
  // Packages
  { name: '@repo/ai', path: 'packages/ai' },
  { name: '@repo/analytics', path: 'packages/analytics' },
  { name: '@repo/auth', path: 'packages/auth' },
  { name: '@repo/database', path: 'packages/database' },
  { name: '@repo/design-system', path: 'packages/design-system' },
  { name: '@repo/email', path: 'packages/email' },
  { name: '@repo/feature-flags', path: 'packages/feature-flags' },
  { name: '@repo/internationalization', path: 'packages/internationalization' },
  { name: '@repo/links', path: 'packages/links' },
  { name: '@repo/notifications', path: 'packages/notifications' },
  { name: '@repo/observability', path: 'packages/observability' },
  { name: '@repo/orchestration', path: 'packages/orchestration' },
  { name: '@repo/payments', path: 'packages/payments' },
  { name: '@repo/qa', path: 'packages/qa' },
  { name: '@repo/scraping', path: 'packages/scraping' },
  { name: '@repo/security', path: 'packages/security' },
  { name: '@repo/seo', path: 'packages/seo' },
  { name: '@repo/storage', path: 'packages/storage' },
  // Apps
  { name: 'ai-chatbot', path: 'apps/ai-chatbot' },
  { name: 'backstage', path: 'apps/backstage' },
  { name: 'docs', path: 'apps/docs' },
  { name: 'email', path: 'apps/email' },
  { name: 'mantine-tailwind-template', path: 'apps/mantine-tailwind-template' },
  { name: 'storybook', path: 'apps/storybook' },
  { name: 'studio', path: 'apps/studio' },
  { name: 'webapp', path: 'apps/webapp' },
];

// Check if package has tests
function hasTests(pkgPath) {
  const packageJsonPath = join(pkgPath, 'package.json');
  if (!existsSync(packageJsonPath)) return false;

  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  return pkg.scripts && (pkg.scripts.test || pkg.scripts['test:coverage']);
}

// Get coverage quickly
function getCoverage(pkg) {
  try {
    // Check if tests exist
    if (!hasTests(pkg.path)) {
      return { ...pkg, coverage: null, note: 'No tests' };
    }

    // Run test with coverage
    const output = execSync(
      'pnpm test --coverage 2>&1 | grep -A1 "All files" || echo "No coverage"',
      {
        cwd: pkg.path,
        encoding: 'utf8',
        shell: true,
        stdio: 'pipe',
      },
    );

    const match = output.match(
      /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/,
    );

    if (match) {
      return {
        ...pkg,
        coverage: {
          statements: parseFloat(match[1]),
          branches: parseFloat(match[2]),
          functions: parseFloat(match[3]),
          lines: parseFloat(match[4]),
          average: (parseFloat(match[1]) + parseFloat(match[4])) / 2,
        },
      };
    }

    return { ...pkg, coverage: null, note: 'No coverage data' };
  } catch (error) {
    // Try to extract coverage from error output
    const errorOutput = error.stdout || '';
    const match = errorOutput.match(
      /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/,
    );

    if (match) {
      return {
        ...pkg,
        coverage: {
          statements: parseFloat(match[1]),
          branches: parseFloat(match[2]),
          functions: parseFloat(match[3]),
          lines: parseFloat(match[4]),
          average: (parseFloat(match[1]) + parseFloat(match[4])) / 2,
        },
      };
    }

    return { ...pkg, coverage: null, error: 'Failed' };
  }
}

// Process packages in batches
async function processBatch(batch) {
  return Promise.all(
    batch.map(
      pkg =>
        new Promise(resolve => {
          setTimeout(() => resolve(getCoverage(pkg)), 0);
        }),
    ),
  );
}

// Main
async function main() {
  console.log('📊 Collecting coverage data...\n');

  const results = [];
  const batchSize = 5;

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < packages.length; i += batchSize) {
    const batch = packages.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(packages.length / batchSize)}...`,
    );
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
  }

  // Sort by coverage (worst to best)
  const sorted = results.sort((a, b) => {
    const aAvg = a.coverage?.average ?? -1;
    const bAvg = b.coverage?.average ?? -1;
    return aAvg - bAvg;
  });

  // Display results
  console.log('\n📈 COVERAGE REPORT (Worst to Best)\n');
  console.log('='.repeat(80));
  console.log('Package/App                          | Lines  | Stmts  | Funcs  | Branch | Avg');
  console.log('='.repeat(80));

  sorted.forEach(result => {
    const name = result.name.padEnd(35);
    const type = result.path.startsWith('apps/') ? '📱' : '📦';

    if (result.coverage) {
      const { lines, statements, functions, branches, average } = result.coverage;
      const avgColor = average < 30 ? '🔴' : average < 50 ? '🟡' : average < 80 ? '🟢' : '✅';

      console.log(
        `${type} ${name} | ${lines.toFixed(1).padStart(5)}% | ${statements.toFixed(1).padStart(5)}% | ${functions.toFixed(1).padStart(5)}% | ${branches.toFixed(1).padStart(5)}% | ${avgColor} ${average.toFixed(1)}%`,
      );
    } else {
      console.log(
        `${type} ${name} | ${'-'.padStart(5)}  | ${'-'.padStart(5)}  | ${'-'.padStart(5)}  | ${'-'.padStart(5)}  | ⚫ ${result.note || result.error || 'No data'}`,
      );
    }
  });

  console.log('='.repeat(80));

  // Summary
  const withCoverage = sorted.filter(r => r.coverage);
  if (withCoverage.length > 0) {
    const avgCoverage =
      withCoverage.reduce((sum, r) => sum + r.coverage.average, 0) / withCoverage.length;
    const below50 = withCoverage.filter(r => r.coverage.average < 50).length;
    const above80 = withCoverage.filter(r => r.coverage.average >= 80).length;

    console.log('\n📊 Summary:');
    console.log(`   Total projects: ${packages.length}`);
    console.log(`   With tests: ${withCoverage.length}`);
    console.log(`   Average coverage: ${avgCoverage.toFixed(1)}%`);
    console.log(
      `   Below 50%: ${below50} projects (${((below50 / withCoverage.length) * 100).toFixed(0)}%)`,
    );
    console.log(
      `   Above 80%: ${above80} projects (${((above80 / withCoverage.length) * 100).toFixed(0)}%)`,
    );
  }
}

main().catch(console.error);
