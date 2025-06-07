#!/usr/bin/env node

/**
 * Workflow File Watcher
 *
 * Watches for changes in workflow-related files and automatically runs
 * the feedback cycle when changes are detected.
 */

import chokidar from 'chokidar';
import { spawn } from 'child_process';
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

// Files to watch for workflow development
const watchPatterns = [
  'app/(authenticated)/workflows/**/*.{ts,tsx,js,jsx}',
  'app/api/workflows/**/*.{ts,tsx,js,jsx}',
  'app/workflows/**/*.{ts,tsx,js,jsx}',
  'e2e/workflows.spec.ts',
  'e2e/utils/**/*.{ts,tsx,js,jsx}',
  // Also watch for general API changes that might affect workflows
  'app/api/**/*.{ts,tsx,js,jsx}',
  // Watch for layout and component changes
  'app/(authenticated)/layout.tsx',
  'app/layout.tsx',
];

let isRunning = false;
let debounceTimer = null;

function runFeedbackCycle() {
  if (isRunning) {
    log(`${colors.yellow}⏳ Feedback cycle already running, skipping...${colors.reset}`);
    return;
  }

  isRunning = true;
  log(`${colors.cyan}🔄 File changes detected, running feedback cycle...${colors.reset}`);

  const child = spawn('node', ['scripts/workflow-dev-cycle.js'], {
    cwd: appRoot,
    stdio: 'inherit',
    shell: true,
  });

  child.on('close', (code) => {
    isRunning = false;
    if (code === 0) {
      log(`${colors.green}✅ Feedback cycle completed successfully${colors.reset}`);
    } else {
      log(`${colors.red}❌ Feedback cycle completed with issues${colors.reset}`);
    }
    log(`${colors.blue}👀 Watching for more changes...${colors.reset}\n`);
  });

  child.on('error', (error) => {
    isRunning = false;
    log(`${colors.red}❌ Error running feedback cycle: ${error.message}${colors.reset}`);
  });
}

function debouncedRun() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    runFeedbackCycle();
  }, 1000); // Wait 1 second after last change
}

function startWatcher() {
  log(`${colors.bright}${colors.blue}👀 Starting Workflow Development Watcher${colors.reset}`);
  log(`${colors.magenta}📂 Watching patterns:${colors.reset}`);
  watchPatterns.forEach((pattern) => {
    log(`   • ${pattern}`);
  });
  log(`${colors.yellow}⚡ Changes will trigger automatic feedback cycles${colors.reset}\n`);

  const watcher = chokidar.watch(watchPatterns, {
    cwd: appRoot,
    ignoreInitial: true,
    ignored: [
      '**/node_modules/**',
      '**/test-results/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
    ],
  });

  watcher.on('change', (filePath) => {
    log(`${colors.green}📝 Changed: ${filePath}${colors.reset}`);
    debouncedRun();
  });

  watcher.on('add', (filePath) => {
    log(`${colors.green}➕ Added: ${filePath}${colors.reset}`);
    debouncedRun();
  });

  watcher.on('unlink', (filePath) => {
    log(`${colors.red}🗑️  Deleted: ${filePath}${colors.reset}`);
    debouncedRun();
  });

  watcher.on('error', (error) => {
    log(`${colors.red}❌ Watcher error: ${error.message}${colors.reset}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log(`\n${colors.yellow}🛑 Shutting down watcher...${colors.reset}`);
    watcher.close().then(() => {
      log(`${colors.green}👋 Watcher stopped${colors.reset}`);
      process.exit(0);
    });
  });

  log(
    `${colors.bright}🚀 Watcher started! Make changes to workflow files to trigger feedback cycles.${colors.reset}`,
  );
  log(`${colors.blue}💡 Press Ctrl+C to stop watching${colors.reset}\n`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Workflow Development Watcher${colors.reset}

This script watches for changes in workflow-related files and automatically
runs the feedback cycle when changes are detected.

Usage:
  node scripts/workflow-watcher.js [options]

Options:
  -h, --help          Show this help

Files watched:
  • app/(authenticated)/workflows/**/*
  • app/api/workflows/**/*
  • app/workflows/**/*
  • e2e/workflows.spec.ts
  • e2e/utils/**/*
  • app/api/**/* (general API changes)
  • app/(authenticated)/layout.tsx
  • app/layout.tsx

Examples:
  node scripts/workflow-watcher.js          # Start watching
  pnpm workflow:cycle:watch                # Via package.json script
`);
} else {
  startWatcher();
}
