#!/usr/bin/env node

/**
 * Workflow Development Feedback Loop Script
 *
 * This script provides continuous feedback for workflow development:
 * 1. Watches for code changes in workflow-related files
 * 2. Runs lint/typecheck to catch issues early
 * 3. Executes workflow-specific e2e tests
 * 4. Provides colored feedback and reports
 * 5. Continues the cycle automatically
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// Run command and return promise
function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', command.split(' ').slice(1), {
      cwd: appRoot,
      stdio: 'pipe',
      shell: true,
      ...options,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject({ stdout, stderr, code, command });
      }
    });
  });
}

// Check if tests are passing
async function runWorkflowTests() {
  logStep('TEST', 'Running workflow e2e tests...');

  try {
    const result = await runCommand('pnpm test:e2e --grep="workflows"');
    logSuccess('All workflow tests passed!');
    return { passed: true, output: result.stdout };
  } catch (error) {
    logError('Workflow tests failed');
    console.log(error.stderr || error.stdout);
    return { passed: false, output: error.stderr || error.stdout };
  }
}

// Run linting and type checking
async function runCodeQuality() {
  logStep('QUALITY', 'Running code quality checks...');

  const checks = [
    { name: 'ESLint', command: 'pnpm lint' },
    { name: 'TypeScript', command: 'pnpm typecheck' },
  ];

  const results = [];

  for (const check of checks) {
    try {
      const result = await runCommand(check.command);
      logSuccess(`${check.name} passed`);
      results.push({ name: check.name, passed: true, output: result.stdout });
    } catch (error) {
      logError(`${check.name} failed`);
      console.log(error.stderr || error.stdout);
      results.push({
        name: check.name,
        passed: false,
        output: error.stderr || error.stdout,
      });
    }
  }

  return results;
}

// Generate feedback report
async function generateReport(qualityResults, testResults) {
  const timestamp = new Date().toISOString();
  const reportDir = path.join(appRoot, 'test-results', 'workflow-reports');

  await fs.mkdir(reportDir, { recursive: true });

  const report = {
    timestamp,
    codeQuality: qualityResults,
    tests: testResults,
    summary: {
      allPassed: qualityResults.every((r) => r.passed) && testResults.passed,
      qualityPassed: qualityResults.every((r) => r.passed),
      testsPassed: testResults.passed,
    },
  };

  // Write JSON report
  await fs.writeFile(
    path.join(reportDir, `workflow-report-${Date.now()}.json`),
    JSON.stringify(report, null, 2),
  );

  // Write human-readable report
  const humanReport = `
Workflow Development Report
Generated: ${new Date(timestamp).toLocaleString()}

=== CODE QUALITY ===
${qualityResults.map((r) => `${r.name}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}`).join('\n')}

=== TESTS ===
Workflow Tests: ${testResults.passed ? '✅ PASSED' : '❌ FAILED'}

=== SUMMARY ===
Overall Status: ${report.summary.allPassed ? '✅ ALL CHECKS PASSED' : '❌ ISSUES FOUND'}

${
  !report.summary.allPassed
    ? `
NEXT STEPS:
${!report.summary.qualityPassed ? '• Fix linting/type errors above' : ''}
${!report.summary.testsPassed ? '• Fix failing tests' : ''}
• Make changes and run 'pnpm workflow:cycle' again
`
    : '• Ready for next development iteration! 🚀'
}
`;

  await fs.writeFile(path.join(reportDir, 'latest-workflow-report.txt'), humanReport);

  return report;
}

// Main feedback loop function
async function runFeedbackCycle() {
  log(
    `\n${colors.bright}${colors.cyan}🔄 Starting Workflow Development Feedback Loop${colors.reset}`,
  );
  log(`${colors.magenta}⏰ ${new Date().toLocaleString()}${colors.reset}\n`);

  try {
    // Step 1: Code Quality
    const qualityResults = await runCodeQuality();

    // Step 2: Tests
    const testResults = await runWorkflowTests();

    // Step 3: Generate Report
    logStep('REPORT', 'Generating feedback report...');
    const report = await generateReport(qualityResults, testResults);

    // Step 4: Provide Feedback
    logStep('FEEDBACK', 'Cycle completed');

    if (report.summary.allPassed) {
      logSuccess('🎉 All checks passed! Ready for next iteration');
      log(`${colors.green}
📋 What you can do next:
• Continue developing workflows
• Run 'pnpm workflow:cycle:watch' for automatic testing
• Run 'pnpm workflow:dev' to start dev server with live testing
${colors.reset}`);
    } else {
      logWarning('Some checks failed - see details above');
      log(`${colors.yellow}
🔧 To fix issues:
• Review the error messages above
• Make necessary code changes
• Run 'pnpm workflow:cycle' again
• Or run 'pnpm workflow:cycle:watch' for automatic re-testing
${colors.reset}`);
    }

    logInfo(`📊 Detailed report saved to: test-results/workflow-reports/`);

    return report.summary.allPassed;
  } catch (error) {
    logError(`Unexpected error in feedback cycle: ${error.message}`);
    return false;
  }
}

// Interactive mode
async function runInteractiveMode() {
  log(`${colors.bright}${colors.blue}🎮 Interactive Workflow Development Mode${colors.reset}\n`);

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function prompt(question) {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }

  while (true) {
    const success = await runFeedbackCycle();

    if (success) {
      const action = await prompt(
        `\n${colors.green}✨ All tests passed! What next?\n${colors.reset}[c]ontinue development / [r]un again / [q]uit: `,
      );

      if (action.toLowerCase() === 'q') {
        break;
      } else if (action.toLowerCase() === 'r') {
        continue;
      } else {
        log(
          `${colors.cyan}💡 Tip: Run 'pnpm workflow:cycle:watch' for automatic testing on file changes${colors.reset}`,
        );
        break;
      }
    } else {
      const action = await prompt(
        `\n${colors.red}❌ Issues found. What next?\n${colors.reset}[f]ix and try again / [r]un again anyway / [q]uit: `,
      );

      if (action.toLowerCase() === 'q') {
        break;
      } else if (action.toLowerCase() === 'f') {
        log(`${colors.yellow}🔧 Make your fixes and press Enter when ready...${colors.reset}`);
        await prompt('');
        continue;
      } else {
        continue;
      }
    }
  }

  rl.close();
  log(`${colors.bright}👋 Happy coding!${colors.reset}`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--interactive') || args.includes('-i')) {
  runInteractiveMode();
} else if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Workflow Development Feedback Loop${colors.reset}

Usage:
  node scripts/workflow-dev-cycle.js [options]

Options:
  -i, --interactive    Run in interactive mode
  -h, --help          Show this help

Examples:
  node scripts/workflow-dev-cycle.js                 # Run once
  node scripts/workflow-dev-cycle.js --interactive   # Interactive mode
  pnpm workflow:cycle                                # Via package.json script
  pnpm workflow:cycle:watch                         # Auto-watch mode
`);
} else {
  runFeedbackCycle().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
