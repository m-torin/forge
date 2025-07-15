#!/usr/bin/env node

/**
 * Unified Coverage Script for pnpm 10 and Turborepo
 * 
 * A single, optimized script that:
 * - Runs tests with coverage using Turborepo's parallel execution
 * - Collects coverage even when tests fail
 * - Displays results in a clean Apps/Packages format
 * - Leverages pnpm 10 and Turborepo optimizations
 * - Uses maximum parallelization for speed
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import { cpus } from 'os';
import { Worker } from 'worker_threads';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(__dirname, '..');

// Detect CPU cores for optimal concurrency
const CPU_COUNT = cpus().length;
const DEFAULT_CONCURRENCY = Math.max(CPU_COUNT, 8).toString();

// Parse command line arguments
const { values: args } = parseArgs({
  options: {
    format: { type: 'string', default: 'console' },
    output: { type: 'string' },
    filter: { type: 'string' },
    concurrency: { type: 'string', default: DEFAULT_CONCURRENCY },
    force: { type: 'boolean', default: false },
    parallel: { type: 'boolean', default: true },
    fast: { type: 'boolean', default: false },
    quiet: { type: 'boolean', default: false },
    'no-wait': { type: 'boolean', default: false },
    'use-cache': { type: 'boolean', default: false },
    streaming: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h' }
  },
  allowPositionals: false
});

if (args.help) {
  console.log(`
Coverage Report Generator - Optimized for Speed

Usage: node scripts/coverage.mjs [options]

Options:
  --format=console|json|summary  Output format (default: console)
  --output=file                  Write report to file
  --filter=pattern               Turbo filter pattern (e.g., "@repo/auth")
  --concurrency=N                Parallel execution limit (default: ${DEFAULT_CONCURRENCY})
  --force                        Force re-run without cache
  --parallel                     Use maximum parallelization (default: true)
  --fast                         Skip detailed parsing, just check coverage exists
  --quiet                        Suppress test output for speed
  --no-wait                      Don't wait for coverage files to settle
  --use-cache                    Use cached coverage data if available
  --streaming                    Show results as they complete
  --help, -h                     Show this help

Examples:
  pnpm coverage                  # Run with auto-detected concurrency (${CPU_COUNT} cores)
  pnpm coverage --fast           # Quick coverage check
  pnpm coverage --quiet          # Minimal output for CI
  pnpm coverage --streaming      # See results as tests complete
  pnpm coverage --use-cache      # Skip tests, use existing coverage
`);
  process.exit(0);
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function color(text, colorName) {
  return args.format === 'json' ? text : `${colors[colorName]}${text}${colors.reset}`;
}

/**
 * Get workspace packages using pnpm 10
 */
function getWorkspacePackages() {
  try {
    const output = execSync('pnpm list -r --json --depth -1', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    const packages = JSON.parse(output);
    
    return packages
      .filter(pkg => pkg.path && pkg.name && !pkg.name.includes('node_modules'))
      .map(pkg => ({
        name: pkg.name,
        path: pkg.path,
        isApp: pkg.path.includes('/apps/'),
        hasTests: hasTestConfiguration(pkg.path)
      }))
      .toSorted((a, b) => {
        // Sort apps first, then packages
        if (a.isApp !== b.isApp) return a.isApp ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  } catch (error) {
    console.error('Failed to get workspace packages:', error.message);
    return [];
  }
}

/**
 * Check if package has test configuration
 */
function hasTestConfiguration(packagePath) {
  return ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs', 
          'jest.config.js', 'jest.config.ts']
    .some(file => existsSync(join(packagePath, file)));
}

/**
 * Read coverage data from package
 */
function readCoverageData(packagePath) {
  // Fast mode - just check if coverage exists
  if (args.fast) {
    const coverageDir = join(packagePath, 'coverage');
    if (existsSync(coverageDir)) {
      return { lines: -1, functions: -1, statements: -1, branches: -1 }; // Placeholder for "has coverage"
    }
    return null;
  }

  // Try coverage-summary.json first (preferred)
  const coverageSummaryPath = join(packagePath, 'coverage', 'coverage-summary.json');
  
  if (existsSync(coverageSummaryPath)) {
    try {
      const data = JSON.parse(readFileSync(coverageSummaryPath, 'utf8'));
      
      if (data.total) {
        return {
          lines: Math.round(data.total.lines.pct),
          functions: Math.round(data.total.functions.pct),
          statements: Math.round(data.total.statements.pct),
          branches: Math.round(data.total.branches.pct)
        };
      }
    } catch (error) {
      // Continue to try coverage-final.json
    }
  }
  
  // Try coverage-final.json as fallback
  const coverageFinalPath = join(packagePath, 'coverage', 'coverage-final.json');
  
  if (existsSync(coverageFinalPath)) {
    try {
      const data = JSON.parse(readFileSync(coverageFinalPath, 'utf8'));
      
      // Calculate totals from all files
      let totalLines = 0, coveredLines = 0;
      let totalFunctions = 0, coveredFunctions = 0;
      let totalStatements = 0, coveredStatements = 0;
      let totalBranches = 0, coveredBranches = 0;
      
      for (const file of Object.values(data)) {
        if (file.s) {
          const statements = Object.values(file.s);
          totalStatements += statements.length;
          coveredStatements += statements.filter(count => count > 0).length;
        }
        
        if (file.f) {
          const functions = Object.values(file.f);
          totalFunctions += functions.length;
          coveredFunctions += functions.filter(count => count > 0).length;
        }
        
        if (file.b) {
          const branches = Object.values(file.b).flat();
          totalBranches += branches.length;
          coveredBranches += branches.filter(count => count > 0).length;
        }
        
        // Lines are derived from statement map
        if (file.statementMap) {
          const lineNumbers = new Set();
          const coveredLineNumbers = new Set();
          
          Object.entries(file.statementMap).forEach(([key, loc]) => {
            const line = loc.start.line;
            lineNumbers.add(line);
            if (file.s[key] > 0) {
              coveredLineNumbers.add(line);
            }
          });
          
          totalLines += lineNumbers.size;
          coveredLines += coveredLineNumbers.size;
        }
      }
      
      // Calculate percentages
      return {
        lines: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0,
        functions: totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) : 0,
        statements: totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0,
        branches: totalBranches > 0 ? Math.round((coveredBranches / totalBranches) * 100) : 0
      };
    } catch (error) {
      // Silently ignore parse errors
    }
  }
  
  return null;
}

/**
 * Read coverage data from multiple packages in parallel
 */
async function readCoverageDataParallel(packages) {
  const BATCH_SIZE = Math.ceil(packages.length / CPU_COUNT);
  const batches = [];
  
  for (let i = 0; i < packages.length; i += BATCH_SIZE) {
    batches.push(packages.slice(i, i + BATCH_SIZE));
  }
  
  const results = await Promise.all(
    batches.map(async (batch) => {
      return batch.map(pkg => ({
        ...pkg,
        coverage: readCoverageData(pkg.path)
      }));
    })
  );
  
  return results.flat();
}

/**
 * Run tests with coverage using Turborepo
 */
async function runCoverage() {
  const startTime = Date.now();
  
  // Remove header output for clean terminal display
  
  // Get packages early for caching check
  const packages = getWorkspacePackages();
  
  // Use cached data if requested
  if (args['use-cache']) {
    const results = await readCoverageDataParallel(packages);
    displayResults(results);
    return;
  }
  
  // Build Turbo command
  let turboCommand = 'pnpm turbo run test:coverage';
  
  // Add flags for resilient coverage collection
  turboCommand += ' --continue'; // Continue even if some tasks fail
  turboCommand += ` --concurrency=${args.concurrency}`;
  
  // Add parallel flag for maximum speed
  if (args.parallel) {
    turboCommand += ' --parallel';
  }
  
  // Add log order for better output
  if (args.quiet || args.streaming) {
    turboCommand += ' --log-order=stream';
  } else {
    turboCommand += ' --log-order=grouped';
  }
  
  if (args.filter) {
    turboCommand += ` --filter="${args.filter}"`;
  }
  
  if (args.force) {
    turboCommand += ' --force';
  }
  
  // Set environment variables for consistent coverage output
  const env = {
    ...process.env,
    CI: 'true',
    FORCE_COLOR: '0',
    NODE_ENV: 'test',
    VITEST_BAIL: 'false', // Don't stop on first failure
    VITEST_PASS_WITH_NO_TESTS: 'true',
    VITEST_COVERAGE_ENABLED: 'true',
    VITEST_COVERAGE_CLEAN: 'true',
    VITEST_COVERAGE_REPORTER: 'json,json-summary',
    VITEST_COVERAGE_REPORT_ON_FAILURE: 'true',
    VITEST_COVERAGE_THRESHOLDS_LINES: '0',
    VITEST_COVERAGE_THRESHOLDS_FUNCTIONS: '0',
    VITEST_COVERAGE_THRESHOLDS_BRANCHES: '0',
    VITEST_COVERAGE_THRESHOLDS_STATEMENTS: '0'
  };
  
  try {
    execSync(turboCommand, {
      cwd: repoRoot,
      stdio: 'pipe', // Always pipe to suppress test output
      env
    });
  } catch (error) {
    // Continue even if tests fail - we still want coverage data
    // Suppress any error output that might contain coverage JSON data
    if (!args.quiet) {
      console.error('Some tests failed, but continuing with coverage collection...');
    }
  }
  
  // Wait for coverage files to be written (unless --no-wait)
  if (!args['no-wait']) {
    await new Promise(resolve => setTimeout(resolve, args.fast ? 200 : 1000));
  }
  
  // Collect coverage data in parallel
  const results = await readCoverageDataParallel(packages);
  
  // Display results
  displayResults(results);
  
  // Write output file if requested
  if (args.output) {
    const outputData = args.format === 'json' 
      ? JSON.stringify(formatJsonOutput(results), null, 2)
      : formatConsoleOutput(results);
    writeFileSync(args.output, outputData);
  }
}

/**
 * Display results in the requested format
 */
function displayResults(results) {
  if (args.format === 'json') {
    console.log(JSON.stringify(formatJsonOutput(results), null, 2));
  } else if (args.format === 'summary') {
    displaySummary(results);
  } else {
    displayConsoleReport(results);
  }
}

/**
 * Display full console report
 */
function displayConsoleReport(results) {
  const apps = results.filter(r => r.isApp);
  const packages = results.filter(r => !r.isApp);
  
  // Apps section
  const appsWithTests = apps.filter(app => app.hasTests);
  if (appsWithTests.length > 0) {
    console.log('Apps:');
    appsWithTests.forEach(app => {
      if (app.coverage && (!args.fast || app.coverage.lines !== -1)) {
        console.log(`• ${app.name}: ${app.coverage.lines}% lines, ${app.coverage.functions}% functions`);
      } else {
        console.log(`• ${app.name}: N/A`);
      }
    });
    console.log();
  }
  
  // Packages section
  const packagesWithTests = packages.filter(pkg => pkg.hasTests);
  if (packagesWithTests.length > 0) {
    console.log('Packages:');
    packagesWithTests.forEach(pkg => {
      if (pkg.coverage && (!args.fast || pkg.coverage.lines !== -1)) {
        console.log(`• ${pkg.name}: ${pkg.coverage.lines}% lines, ${pkg.coverage.functions}% functions`);
      } else {
        console.log(`• ${pkg.name}: N/A`);
      }
    });
  }
}

/**
 * Display summary format
 */
function displaySummary(results) {
  const withCoverage = results.filter(r => r.coverage);
  const avgLines = withCoverage.length > 0
    ? Math.round(withCoverage.reduce((sum, r) => sum + r.coverage.lines, 0) / withCoverage.length)
    : 0;
  
  console.log(`Total: ${results.length} | With Coverage: ${withCoverage.length} | Average: ${avgLines}%`);
}

/**
 * Format JSON output
 */
function formatJsonOutput(results) {
  return {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      withCoverage: results.filter(r => r.coverage).length,
      withTests: results.filter(r => r.hasTests).length
    },
    apps: results.filter(r => r.isApp).map(formatPackageResult),
    packages: results.filter(r => !r.isApp).map(formatPackageResult),
    metadata: {
      pnpmVersion: getPnpmVersion(),
      turboVersion: getTurboVersion(),
      nodeVersion: process.version
    }
  };
}

/**
 * Format individual package result
 */
function formatPackageResult(pkg) {
  return {
    name: pkg.name,
    path: pkg.path,
    hasTests: pkg.hasTests,
    coverage: pkg.coverage || null
  };
}

/**
 * Format console output for file writing
 */
function formatConsoleOutput(results) {
  let output = 'Coverage Report\n';
  output += '=================\n\n';
  
  const apps = results.filter(r => r.isApp);
  const packages = results.filter(r => !r.isApp);
  
  if (apps.length > 0) {
    output += 'Apps:\n';
    apps.forEach(app => {
      if (app.coverage) {
        output += `• ${app.name}: ${app.coverage.lines}% lines, ${app.coverage.functions}% functions\n`;
      } else {
        output += `• ${app.name}: N/A\n`;
      }
    });
    output += '\n';
  }
  
  if (packages.length > 0) {
    output += 'Packages:\n';
    packages.forEach(pkg => {
      if (pkg.coverage) {
        output += `• ${pkg.name}: ${pkg.coverage.lines}% lines, ${pkg.coverage.functions}% functions\n`;
      } else {
        output += `• ${pkg.name}: N/A\n`;
      }
    });
  }
  
  return output;
}

/**
 * Get pnpm version
 */
function getPnpmVersion() {
  try {
    return execSync('pnpm --version', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get Turbo version
 */
function getTurboVersion() {
  try {
    const output = execSync('pnpm turbo --version', { encoding: 'utf8' }).trim();
    return output.split('\n')[0];
  } catch {
    return 'unknown';
  }
}

// Run the coverage script
runCoverage().catch(error => {
  // Only show error message, not full stack trace with potentially sensitive info
  if (!args.quiet) {
    console.error(color(`\n❌ Coverage collection failed: ${error.message}`, 'red'));
  }
  process.exit(1);
});