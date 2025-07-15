#!/usr/bin/env node

/**
 * Test Framework Independent Coverage Display Script
 *
 * Displays test coverage data in a clean table format using cli-table3.
 * Supports multiple test types (unit, UI, browser) with grouped column display.
 *
 * Built for Node.js 22+ with ES2023 features.
 */

import columnify from 'columnify';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

// Use import.meta.dirname for Node 20.11+
const scriptDir = import.meta.dirname ?? new URL('.', import.meta.url).pathname;
const repoRoot = resolve(scriptDir, '../../..');

// Constants
const COVERAGE_THRESHOLDS = {
  high: 80,
  medium: 60,
};

const COVERAGE_LOCATIONS = [
  { dir: 'coverage', type: 'unit' },
  { dir: '.vitest-ui/coverage', type: 'ui' },
  { dir: 'html/coverage', type: 'ui' },
  { dir: 'coverage-browser', type: 'browser' },
];

const TEST_CONFIG_FILES = [
  'vitest.config.ts',
  'vitest.config.js',
  'vitest.config.mjs',
  'jest.config.js',
  'jest.config.ts',
  'playwright.config.ts',
];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

// Parse command line arguments
const { values: args } = parseArgs({
  options: {
    filter: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: false,
});

if (args.help) {
  console.log(`
Coverage Display Tool - Multi-Test Type Support

Usage: node packages/qa/scripts/coverage.mjs [options]

Options:
  --filter=pattern    Filter packages by name pattern
  --help, -h         Show this help

This tool displays coverage data from multiple test types (unit, UI, browser)
in a grouped column format for easy comparison.
`);
  process.exit(0);
}

/**
 * Apply color to text
 * @param {string} text - Text to color
 * @param {keyof typeof colors} colorName - Color name
 * @returns {string} Colored text
 */
function color(text, colorName) {
  return `${colors[colorName]}${text}${colors.reset}`;
}

/**
 * Read and parse JSON file safely
 * @param {string} path - File path
 * @returns {Promise<any|null>} Parsed JSON or null
 */
async function readJsonFile(path) {
  try {
    const content = await readFile(path, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Get workspace packages using pnpm
 * @returns {Array<{name: string, path: string, isApp: boolean, hasTests: boolean}>}
 */
function getWorkspacePackages() {
  try {
    const output = execSync('pnpm list -r --json --depth -1', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    const packages = JSON.parse(output);

    return packages
      .filter(pkg => pkg.path && pkg.name && !pkg.name.includes('node_modules'))
      .filter(pkg => !args.filter || pkg.name.includes(args.filter))
      .map(pkg => ({
        name: pkg.name,
        path: pkg.path,
        isApp: pkg.path.includes('/apps/'),
        hasTests: hasTestConfiguration(pkg.path),
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
 * @param {string} packagePath - Package directory path
 * @returns {boolean}
 */
function hasTestConfiguration(packagePath) {
  return TEST_CONFIG_FILES.some(file => existsSync(join(packagePath, file)));
}

/**
 * Calculate coverage metrics from raw data
 * @param {Object} data - Coverage data object
 * @returns {{lines: number, functions: number, statements: number, branches: number}}
 */
function calculateCoverageMetrics(data) {
  const metrics = {
    lines: { total: 0, covered: 0 },
    functions: { total: 0, covered: 0 },
    statements: { total: 0, covered: 0 },
    branches: { total: 0, covered: 0 },
  };

  for (const file of Object.values(data)) {
    // Statements
    const statements = Object.values(file.s ?? {});
    metrics.statements.total += statements.length;
    metrics.statements.covered += statements.filter(count => count > 0).length;

    // Functions
    const functions = Object.values(file.f ?? {});
    metrics.functions.total += functions.length;
    metrics.functions.covered += functions.filter(count => count > 0).length;

    // Branches
    const branches = Object.values(file.b ?? {}).flat();
    metrics.branches.total += branches.length;
    metrics.branches.covered += branches.filter(count => count > 0).length;

    // Lines (derived from statement map)
    if (file.statementMap) {
      const lineNumbers = new Set();
      const coveredLineNumbers = new Set();

      for (const [key, loc] of Object.entries(file.statementMap)) {
        const line = loc.start.line;
        lineNumbers.add(line);
        if (file.s[key] > 0) {
          coveredLineNumbers.add(line);
        }
      }

      metrics.lines.total += lineNumbers.size;
      metrics.lines.covered += coveredLineNumbers.size;
    }
  }

  // Calculate percentages
  return Object.fromEntries(
    Object.entries(metrics).map(([key, { total, covered }]) => [
      key,
      total > 0 ? Math.round((covered / total) * 100) : 0,
    ]),
  );
}

/**
 * Read and merge worker-based coverage files from .tmp directory
 * @param {string} tmpPath - Path to .tmp directory
 * @returns {Promise<Object|null>} Merged coverage metrics or null
 */
async function readWorkerCoverageFiles(tmpPath) {
  try {
    const files = await readdir(tmpPath);
    const coverageFiles = files.filter(
      file => file.startsWith('coverage-') && file.endsWith('.json'),
    );

    if (coverageFiles.length === 0) {
      return null;
    }

    const mergedData = {};

    for (const file of coverageFiles) {
      const filePath = join(tmpPath, file);
      const data = await readJsonFile(filePath);

      if (data?.result) {
        // V8 coverage format - merge results
        for (const script of data.result) {
          if (script.url && script.functions) {
            mergedData[script.url] = {
              ...mergedData[script.url],
              functions: script.functions,
              url: script.url,
              scriptId: script.scriptId,
            };
          }
        }
      }
    }

    if (Object.keys(mergedData).length === 0) {
      return null;
    }

    // Convert V8 coverage to standard format for calculation
    const standardFormat = {};
    for (const [url, script] of Object.entries(mergedData)) {
      // Extract meaningful file path
      const filePath = url.replace('file://', '');
      if (filePath.includes('node_modules') || filePath.includes('dist/')) {
        continue;
      }

      // Create a simplified coverage object
      standardFormat[filePath] = {
        s: {}, // statements
        f: {}, // functions
        b: {}, // branches
        statementMap: {},
      };

      // Process functions from V8 format
      if (script.functions) {
        script.functions.forEach((func, index) => {
          standardFormat[filePath].f[index] = func.ranges?.[0]?.count || 0;
          if (func.ranges?.[0]) {
            standardFormat[filePath].statementMap[index] = {
              start: { line: Math.floor(func.ranges[0].startOffset / 100) }, // Approximate line
              end: { line: Math.floor(func.ranges[0].endOffset / 100) },
            };
            standardFormat[filePath].s[index] = func.ranges[0].count || 0;
          }
        });
      }
    }

    return calculateCoverageMetrics(standardFormat);
  } catch (error) {
    console.error('Error reading worker coverage files:', error);
    return null;
  }
}

/**
 * Read coverage data from a specific directory
 * @param {string} coveragePath - Coverage directory path
 * @returns {Promise<Object|null>} Coverage metrics or null
 */
async function readCoverageFromDir(coveragePath) {
  // Try coverage-summary.json first (preferred)
  const coverageSummaryPath = join(coveragePath, 'coverage-summary.json');

  if (existsSync(coverageSummaryPath)) {
    const data = await readJsonFile(coverageSummaryPath);
    if (data?.total) {
      return {
        lines: Math.round(data.total.lines.pct),
        functions: Math.round(data.total.functions.pct),
        statements: Math.round(data.total.statements.pct),
        branches: Math.round(data.total.branches.pct),
      };
    }
  }

  // Try coverage-final.json as fallback
  const coverageFinalPath = join(coveragePath, 'coverage-final.json');

  if (existsSync(coverageFinalPath)) {
    const data = await readJsonFile(coverageFinalPath);
    if (data) {
      return calculateCoverageMetrics(data);
    }
  }

  // Try worker coverage files in .tmp directory
  const tmpPath = join(coveragePath, '.tmp');
  if (existsSync(tmpPath)) {
    const workerData = await readWorkerCoverageFiles(tmpPath);
    if (workerData) {
      return workerData;
    }
  }

  return null;
}

/**
 * Read all coverage data from package for different test types
 * @param {string} packagePath - Package directory path
 * @returns {Promise<Object>} Coverage data by test type
 */
async function readAllCoverageData(packagePath) {
  const results = {};

  await Promise.all(
    COVERAGE_LOCATIONS.map(async ({ dir, type }) => {
      const data = await readCoverageFromDir(join(packagePath, dir));
      if (data) {
        results[type] = data;
      }
    }),
  );

  return results;
}

/**
 * Get color for coverage percentage
 * @param {number} percentage - Coverage percentage
 * @returns {keyof typeof colors} Color name
 */
function getCoverageColor(percentage) {
  if (percentage >= COVERAGE_THRESHOLDS.high) return 'green';
  if (percentage >= COVERAGE_THRESHOLDS.medium) return 'yellow';
  return 'red';
}

/**
 * Format coverage percentage with color
 * @param {number|null|undefined} percentage - Coverage percentage
 * @returns {string} Formatted percentage
 */
function formatPercentage(percentage) {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return color('N/A', 'gray');
  }
  return color(`${percentage}%`, getCoverageColor(percentage));
}

/**
 * Get all available test types across all packages
 * @param {Array} packages - Package list
 * @returns {Promise<string[]>} Sorted test types
 */
async function getAvailableTestTypes(packages) {
  const types = new Set();

  await Promise.all(
    packages.map(async pkg => {
      if (pkg.hasTests) {
        const coverage = await readAllCoverageData(pkg.path);
        Object.keys(coverage).forEach(type => types.add(type));
      }
    }),
  );

  return Array.from(types).toSorted();
}

/**
 * Calculate optimal column widths based on content
 * @param {Array} packages - Package list
 * @param {Array} testTypes - Test type list
 * @returns {{package: number, metrics: number[]}}
 */
// eslint-disable-next-line unused-imports/no-unused-vars
function calculateOptimalColumnWidths(packages, testTypes) {
  const maxPackageNameLength = Math.max(
    ...packages.map(pkg => pkg.name.length),
    'Package/App'.length,
  );

  // Cap package column at 30, but allow it to be smaller
  const packageColWidth = Math.min(maxPackageNameLength + 2, 30);

  // Metric columns only need 8 chars (e.g., " 100% ")
  const metricColWidth = 8;

  return {
    package: packageColWidth,
    metrics: Array(testTypes.length * 2).fill(metricColWidth),
  };
}

/**
 * Display coverage data using columnify
 * @param {Array} packages - Package list
 */
async function displayCoverageTable(packages) {
  const testTypes = await getAvailableTestTypes(packages);

  if (testTypes.length === 0) {
    console.log(color('No coverage data found.', 'yellow'));
    console.log('\nTo generate coverage data for all packages:');
    console.log('• Run: ' + color('pnpm coverage:generate', 'green') + ' (from qa package)');
    console.log('• Or from root: ' + color('pnpm coverage', 'green'));
    console.log('\nTo generate coverage for a specific package:');
    console.log('• Unit coverage: ' + color('pnpm test:coverage', 'green'));
    console.log(
      '• UI coverage: ' +
        color('pnpm test:ui --coverage', 'green') +
        ' (run tests in UI mode with coverage)',
    );
    console.log(
      '• Browser coverage: ' + color('pnpm test:browser --coverage', 'green') + ' (if available)',
    );
    console.log('\nThen run ' + color('pnpm coverage', 'green') + ' again to see the results.');
    return;
  }

  // Track coverage by type for summary
  const coverageByType = Object.fromEntries(
    testTypes.map(type => [type, { count: 0, totalLines: 0, totalFunctions: 0 }]),
  );

  // Collect all package data for columnify
  const tableData = [];
  await Promise.all(
    packages.map(async pkg => {
      if (pkg.hasTests) {
        const allCoverage = await readAllCoverageData(pkg.path);
        const row = { 'Package/App': pkg.name };

        testTypes.forEach(type => {
          const coverage = allCoverage[type];
          const typeName = type.charAt(0).toUpperCase() + type.slice(1);

          if (coverage) {
            row[`${typeName} Lines`] = formatPercentage(coverage.lines);
            row[`${typeName} Funcs`] = formatPercentage(coverage.functions);

            // Update summary stats
            coverageByType[type].count++;
            coverageByType[type].totalLines += isNaN(coverage.lines) ? 0 : coverage.lines;
            coverageByType[type].totalFunctions += isNaN(coverage.functions)
              ? 0
              : coverage.functions;
          } else {
            row[`${typeName} Lines`] = color('N/A', 'gray');
            row[`${typeName} Funcs`] = color('N/A', 'gray');
          }
        });

        tableData.push(row);
      }
    }),
  );

  // Display table using columnify
  console.log('\n' + color('Test Coverage Report', 'bold') + '\n');

  console.log(
    columnify(tableData, {
      columnSplitter: ' │ ',
      truncate: false,
      config: {
        'Package/App': {
          minWidth: 28,
          maxWidth: 40,
          truncate: false,
        },
      },
    }),
  );

  // Summary statistics
  const packagesWithTests = packages.filter(pkg => pkg.hasTests);

  console.log(`
${color('Summary:', 'bold')}`);
  console.log(`• Total packages: ${packages.length}`);
  console.log(`• Packages with tests: ${packagesWithTests.length}`);

  // Check if UI coverage is missing
  if (!testTypes.includes('ui') && testTypes.includes('unit')) {
    console.log(
      '\n' + color('💡 Tip:', 'yellow') + ' UI coverage not found. To generate UI coverage:',
    );
    console.log(
      '  • Update package.json: ' + color('"test:ui": "vitest --ui --coverage"', 'green'),
    );
    console.log(
      '  • Configure vitest to use ' +
        color('.vitest-ui/coverage', 'green') +
        ' directory for UI mode',
    );
    console.log(
      '  • Then run: ' +
        color('pnpm test:ui', 'green') +
        ' and check for .vitest-ui/coverage/ directory',
    );
  }

  // Coverage by type
  console.log(`• Coverage by type:`);
  testTypes.forEach(type => {
    const stats = coverageByType[type];
    if (stats.count > 0) {
      const avgLines = Math.round(stats.totalLines / stats.count);
      const avgFunctions = Math.round(stats.totalFunctions / stats.count);
      const typeName = type.charAt(0).toUpperCase() + type.slice(1);
      console.log(
        `  - ${typeName} tests: ${stats.count} packages (avg: ${formatPercentage(avgLines)} lines, ${formatPercentage(avgFunctions)} functions)`,
      );
    }
  });

  console.log();
}

/**
 * Main execution function
 */
async function main() {
  // Check if running as part of the coverage generation command
  const isGenerating = process.argv.includes('--generating');

  if (isGenerating) {
    console.log(color('Coverage generation complete. Displaying results...', 'green'));
    console.log();
  }

  const packages = getWorkspacePackages();

  if (packages.length === 0) {
    console.error('No packages found in workspace');
    process.exit(1);
  }

  await displayCoverageTable(packages);
}

// Run the script
main().catch(error => {
  console.error(color('Error:', 'red'), error.message);
  process.exit(1);
});
