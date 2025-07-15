#!/usr/bin/env node

/**
 * Collect coverage data for all packages and apps
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Find all packages and apps with test scripts
function findTestableProjects() {
  const packages = [];

  // Check packages directory
  const packagesDir = join(rootDir, 'packages');
  if (existsSync(packagesDir)) {
    const dirs = execSync('ls -d packages/*/', { cwd: rootDir, encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    dirs.forEach(dir => {
      const packageJsonPath = join(rootDir, dir, 'package.json');
      if (existsSync(packageJsonPath)) {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        if (pkg.scripts && (pkg.scripts.test || pkg.scripts['test:coverage'])) {
          packages.push({
            name: pkg.name || basename(dir),
            path: dir,
            type: 'package',
          });
        }
      }
    });
  }

  // Check apps directory
  const appsDir = join(rootDir, 'apps');
  if (existsSync(appsDir)) {
    const dirs = execSync('ls -d apps/*/', { cwd: rootDir, encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    dirs.forEach(dir => {
      const packageJsonPath = join(rootDir, dir, 'package.json');
      if (existsSync(packageJsonPath)) {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        if (pkg.scripts && (pkg.scripts.test || pkg.scripts['test:coverage'])) {
          packages.push({
            name: pkg.name || basename(dir),
            path: dir,
            type: 'app',
          });
        }
      }
    });
  }

  return packages;
}

// Run coverage for a single project
function runCoverage(project) {
  console.log(`
📊 Collecting coverage for ${project.name}...`);

  try {
    // Use the qa test coverage script if available
    const qaScriptPath = join(rootDir, 'packages/qa/scripts/test-coverage.mjs');
    const command = existsSync(qaScriptPath) ? `node ${qaScriptPath}` : 'pnpm test --coverage';

    const output = execSync(command, {
      cwd: join(rootDir, project.path),
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, CI: 'true' },
    });

    // Parse coverage from output
    const coverageMatch = output.match(
      /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/,
    );

    if (coverageMatch) {
      return {
        ...project,
        coverage: {
          statements: parseFloat(coverageMatch[1]),
          branches: parseFloat(coverageMatch[2]),
          functions: parseFloat(coverageMatch[3]),
          lines: parseFloat(coverageMatch[4]),
          average: (parseFloat(coverageMatch[1]) + parseFloat(coverageMatch[4])) / 2,
        },
      };
    }

    // Check for no coverage reported
    if (output.includes('No coverage information')) {
      return {
        ...project,
        coverage: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
          average: 0,
        },
        note: 'No coverage data',
      };
    }

    return {
      ...project,
      coverage: null,
      error: 'Could not parse coverage',
    };
  } catch (error) {
    // Try to parse coverage even from failed output
    const output = error.stdout || error.output?.toString() || '';
    const coverageMatch = output.match(
      /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/,
    );

    if (coverageMatch) {
      return {
        ...project,
        coverage: {
          statements: parseFloat(coverageMatch[1]),
          branches: parseFloat(coverageMatch[2]),
          functions: parseFloat(coverageMatch[3]),
          lines: parseFloat(coverageMatch[4]),
          average: (parseFloat(coverageMatch[1]) + parseFloat(coverageMatch[4])) / 2,
        },
      };
    }

    return {
      ...project,
      coverage: null,
      error: error.message?.split('\n')[0] || 'Test failed',
    };
  }
}

// Main execution
async function main() {
  console.log('🔍 Finding testable projects...');
  const projects = findTestableProjects();
  console.log(`Found ${projects.length} projects with tests
`);

  const results = [];

  // Run coverage for each project
  for (const project of projects) {
    const result = runCoverage(project);
    results.push(result);
  }

  // Sort by average coverage (worst to best)
  const sorted = results.sort((a, b) => {
    const aAvg = a.coverage?.average || -1;
    const bAvg = b.coverage?.average || -1;
    return aAvg - bAvg;
  });

  // Display results
  console.log('\n\n📈 COVERAGE REPORT (Worst to Best)\n');
  console.log('='.repeat(80));
  console.log('Package/App                          | Lines  | Stmts  | Funcs  | Branch | Avg');
  console.log('='.repeat(80));

  sorted.forEach(result => {
    const name = result.name.padEnd(35);
    const type = result.type === 'app' ? '📱' : '📦';

    if (result.coverage) {
      const { lines, statements, functions, branches, average } = result.coverage;
      const avgColor = average < 30 ? '🔴' : average < 50 ? '🟡' : average < 80 ? '🟢' : '✅';

      console.log(
        `${type} ${name} | ${lines.toFixed(1).padStart(5)}% | ${statements.toFixed(1).padStart(5)}% | ${functions.toFixed(1).padStart(5)}% | ${branches.toFixed(1).padStart(5)}% | ${avgColor} ${average.toFixed(1)}%`,
      );
    } else {
      console.log(
        `${type} ${name} | ${'-'.padStart(5)}  | ${'-'.padStart(5)}  | ${'-'.padStart(5)}  | ${'-'.padStart(5)}  | ❌ ${result.error || 'No data'}`,
      );
    }
  });

  console.log('='.repeat(80));

  // Summary statistics
  const withCoverage = sorted.filter(r => r.coverage);
  if (withCoverage.length > 0) {
    const avgCoverage =
      withCoverage.reduce((sum, r) => sum + r.coverage.average, 0) / withCoverage.length;
    const below50 = withCoverage.filter(r => r.coverage.average < 50).length;
    const above80 = withCoverage.filter(r => r.coverage.average >= 80).length;

    console.log('\n📊 Summary:');
    console.log(`   Total projects: ${projects.length}`);
    console.log(`   With coverage: ${withCoverage.length}`);
    console.log(`   Average coverage: ${avgCoverage.toFixed(1)}%`);
    console.log(`   Below 50%: ${below50} projects`);
    console.log(`   Above 80%: ${above80} projects`);
  }
}

main().catch(console.error);
