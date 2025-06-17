#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

function getPercentageColor(percentage) {
  if (percentage >= 80) return colors.green;
  if (percentage >= 60) return colors.yellow;
  return colors.red;
}

// Find all coverage-final.json files
function findCoverageFiles(dir) {
  const coverageFiles = [];

  function searchDir(currentDir) {
    try {
      const items = readdirSync(currentDir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = join(currentDir, item.name);

        // Skip node_modules and other irrelevant directories
        if (item.isDirectory() && !['node_modules', '.git', 'dist', '.next'].includes(item.name)) {
          searchDir(fullPath);
        } else if (item.name === 'coverage-final.json') {
          coverageFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  searchDir(dir);
  return coverageFiles;
}

// Parse coverage data
function parseCoverageFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Calculate coverage metrics
function calculateCoverage(coverageData) {
  const totals = {
    lines: { total: 0, covered: 0 },
    statements: { total: 0, covered: 0 },
    functions: { total: 0, covered: 0 },
    branches: { total: 0, covered: 0 },
  };

  for (const [filePath, fileData] of Object.entries(coverageData)) {
    // Lines
    const lines = Object.values(fileData.statementMap || {});
    totals.lines.total += lines.length;
    totals.lines.covered += Object.entries(fileData.s || {}).filter(
      ([, count]) => count > 0,
    ).length;

    // Statements
    totals.statements.total += Object.keys(fileData.statementMap || {}).length;
    totals.statements.covered += Object.entries(fileData.s || {}).filter(
      ([, count]) => count > 0,
    ).length;

    // Functions
    totals.functions.total += Object.keys(fileData.fnMap || {}).length;
    totals.functions.covered += Object.entries(fileData.f || {}).filter(
      ([, count]) => count > 0,
    ).length;

    // Branches
    const branches = Object.values(fileData.branchMap || {});
    branches.forEach((branch) => {
      totals.branches.total += branch.locations.length;
    });
    Object.entries(fileData.b || {}).forEach(([, counts]) => {
      totals.branches.covered += counts.filter((count) => count > 0).length;
    });
  }

  return totals;
}

// Main function
function main() {
  console.log('\n' + colorize('📊 Aggregating Code Coverage Results', colors.bright));
  console.log(colorize('─'.repeat(60), colors.gray));

  const coverageFiles = findCoverageFiles(rootDir);

  if (coverageFiles.length === 0) {
    console.log(
      colorize('⚠️  No coverage files found. Run tests with coverage first.', colors.yellow),
    );
    console.log(colorize('   Use: pnpm test:coverage', colors.gray));
    return;
  }

  console.log(`Found ${colorize(coverageFiles.length, colors.cyan)} coverage reports\n`);

  const allCoverage = {};
  const packageCoverage = {};

  // Process each coverage file
  coverageFiles.forEach((file) => {
    const coverage = parseCoverageFile(file);
    if (!coverage) return;

    // Extract package name from path
    const relativePath = file.replace(rootDir, '');
    const packageMatch = relativePath.match(/\/(apps|packages)\/([^/]+)\//);
    const packageName = packageMatch ? `${packageMatch[1]}/${packageMatch[2]}` : 'unknown';

    if (!packageCoverage[packageName]) {
      packageCoverage[packageName] = {};
    }

    // Merge coverage data
    Object.assign(packageCoverage[packageName], coverage);
    Object.assign(allCoverage, coverage);
  });

  // Calculate and display per-package coverage
  console.log(colorize('Package Coverage:', colors.bright));
  console.log(colorize('─'.repeat(60), colors.gray));

  const packageResults = [];

  for (const [packageName, coverage] of Object.entries(packageCoverage)) {
    const metrics = calculateCoverage(coverage);
    const linePercentage =
      metrics.lines.total > 0
        ? ((metrics.lines.covered / metrics.lines.total) * 100).toFixed(2)
        : 0;

    packageResults.push({
      name: packageName,
      percentage: parseFloat(linePercentage),
      metrics,
    });
  }

  // Sort by coverage percentage
  packageResults.sort((a, b) => b.percentage - a.percentage);

  // Display results
  packageResults.forEach(({ name, percentage, metrics }) => {
    const color = getPercentageColor(percentage);
    const bar = '█'.repeat(Math.floor(percentage / 2.5)).padEnd(40, '░');

    console.log(`${name.padEnd(30)} ${colorize(bar, color)} ${colorize(`${percentage}%`, color)}`);
  });

  // Calculate total coverage
  const totalMetrics = calculateCoverage(allCoverage);

  console.log('\n' + colorize('─'.repeat(60), colors.gray));
  console.log(colorize('Overall Coverage Summary:', colors.bright));
  console.log(colorize('─'.repeat(60), colors.gray));

  const metrics = [
    { name: 'Statements', ...totalMetrics.statements },
    { name: 'Branches', ...totalMetrics.branches },
    { name: 'Functions', ...totalMetrics.functions },
    { name: 'Lines', ...totalMetrics.lines },
  ];

  metrics.forEach(({ name, covered, total }) => {
    const percentage = total > 0 ? ((covered / total) * 100).toFixed(2) : 0;
    const color = getPercentageColor(percentage);

    console.log(
      `${name.padEnd(12)}: ${colorize(`${percentage}%`, color)} ` + `(${covered}/${total})`,
    );
  });

  // Overall line coverage
  const overallLinePercentage =
    totalMetrics.lines.total > 0
      ? ((totalMetrics.lines.covered / totalMetrics.lines.total) * 100).toFixed(2)
      : 0;

  console.log('\n' + colorize('─'.repeat(60), colors.gray));
  console.log(
    colorize('Total Line Coverage: ', colors.bright) +
      colorize(`${overallLinePercentage}%`, getPercentageColor(overallLinePercentage)),
  );
  console.log(colorize('─'.repeat(60), colors.gray) + '\n');

  // Exit with error if coverage is below threshold
  const threshold = 80;
  if (parseFloat(overallLinePercentage) < threshold) {
    console.log(colorize(`❌ Coverage is below ${threshold}% threshold`, colors.red));
    process.exit(1);
  } else {
    console.log(colorize(`✅ Coverage meets ${threshold}% threshold`, colors.green));
  }
}

main();
