#!/usr/bin/env node

/**
 * CLI script to run typecheck, lint, and tests in sequence
 * Usage: pnpm check or node scripts/check.mjs
 */

import { spawn } from 'node:child_process';
import { exit } from 'node:process';

const COMMANDS = [
  {
    name: 'TypeScript Check',
    command: 'pnpm',
    args: ['typecheck'],
    description: 'Running TypeScript checking across all packages...'
  },
  {
    name: 'Lint',
    command: 'pnpm', 
    args: ['lint'],
    description: 'Running ESLint and Prettier across all packages...'
  },
  {
    name: 'Tests',
    command: 'pnpm',
    args: ['test'],
    description: 'Running tests across all packages...'
  }
];

function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 ${description}`);
    console.log(`📝 Command: ${command} ${args.join(' ')}\n`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${description.replace('Running', 'Completed')} successfully!\n`);
        resolve();
      } else {
        console.log(`\n❌ ${description.replace('Running', 'Failed')} with exit code ${code}\n`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`\n❌ Error running command: ${error.message}\n`);
      reject(error);
    });
  });
}

async function runAllChecks() {
  console.log('🚀 Starting comprehensive checks...\n');
  
  let failed = false;
  
  for (const { name, command, args, description } of COMMANDS) {
    try {
      await runCommand(command, args, description);
    } catch (error) {
      console.error(`\n💥 ${name} failed:`, error.message);
      failed = true;
      break; // Stop on first failure
    }
  }
  
  if (failed) {
    console.log('\n🛑 Checks failed. Please fix the issues above and try again.\n');
    exit(1);
  } else {
    console.log('🎉 All checks passed successfully!\n');
    exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Checks interrupted by user');
  exit(1);
});

runAllChecks().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  exit(1);
});