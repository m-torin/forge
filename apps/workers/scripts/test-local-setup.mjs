#!/usr/bin/env node

/**
 * Test script to verify local development setup for Upstash Workflow
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const requiredEnvVars = [
  'QSTASH_URL',
  'QSTASH_TOKEN',
  'UPSTASH_WORKFLOW_URL'
];

const optionalEnvVars = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

console.log('🔍 Checking Upstash Workflow local development setup...\n');

// Check required environment variables
let hasErrors = false;
console.log('Required Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Not set`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

console.log('\nOptional Environment Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  }
});

// Check if local URLs are correct
if (process.env.QSTASH_URL && !process.env.QSTASH_URL.includes('localhost:8080')) {
  console.log('\n⚠️  Warning: QSTASH_URL should be http://localhost:8080 for local development');
}

if (process.env.UPSTASH_WORKFLOW_URL && !process.env.UPSTASH_WORKFLOW_URL.includes('localhost:3800')) {
  console.log('\n⚠️  Warning: UPSTASH_WORKFLOW_URL should be http://localhost:3800 for local development');
}

// Check if .env.local exists
console.log('\n📄 Checking configuration files...');
const envLocalPath = join(process.cwd(), '.env.local');
const envExamplePath = join(process.cwd(), '.env.local.example');

if (!existsSync(envLocalPath)) {
  console.log('❌ .env.local not found');
  if (existsSync(envExamplePath)) {
    console.log('💡 Tip: Copy .env.local.example to .env.local');
  }
  hasErrors = true;
} else {
  console.log('✅ .env.local exists');
}

// Test QStash CLI availability
console.log('\n🔧 Checking QStash CLI...');
try {
  execSync('npx @upstash/qstash-cli --version', { stdio: 'pipe' });
  console.log('✅ QStash CLI is available');
} catch (error) {
  console.log('❌ QStash CLI not found. Run: pnpm install');
  hasErrors = true;
}

// Check if ports are available
console.log('\n🔌 Checking port availability...');
const checkPort = (port) => {
  try {
    execSync(`lsof -ti:${port}`, { stdio: 'pipe' });
    return false; // Port is in use
  } catch {
    return true; // Port is available
  }
};

const portsToCheck = [
  { port: 3800, name: 'Next.js' },
  { port: 8080, name: 'QStash CLI' }
];

portsToCheck.forEach(({ port, name }) => {
  if (checkPort(port)) {
    console.log(`✅ Port ${port} (${name}) is available`);
  } else {
    console.log(`⚠️  Port ${port} (${name}) is already in use`);
  }
});

// Summary
console.log('\n📋 Summary:');
if (hasErrors) {
  console.log('❌ Setup incomplete. Please fix the issues above.');
  console.log('\n💡 Quick fix:');
  console.log('1. Copy .env.local.example to .env.local');
  console.log('2. Run: pnpm install');
  console.log('3. Configure environment variables');
  process.exit(1);
} else {
  console.log('✅ Local development setup is ready!');
  console.log('\n🚀 Next steps:');
  console.log('1. Run: pnpm dev');
  console.log('2. Open: http://localhost:3800');
  console.log('3. QStash Dashboard: http://localhost:8080');
  console.log('\n📖 Test a workflow:');
  console.log('curl -X POST http://localhost:3800/api/workflow/examples/simple \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"name": "Test", "count": 3}\'');
}