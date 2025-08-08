#!/usr/bin/env node
import { execSync } from 'child_process';

// Check if we're in a Vercel build environment
const isVercel = process.env.VERCEL === '1';
const isCI = process.env.CI === '1';
const isProduction = process.env.NODE_ENV === 'production';
const vercelEnv = process.env.VERCEL_ENV;

// Skip Playwright installation in Vercel or CI environments
// unless explicitly requested via INSTALL_PLAYWRIGHT=1
if (isVercel || (isCI && !process.env.INSTALL_PLAYWRIGHT)) {
  console.log('⏭️  Skipping Playwright installation in Vercel/CI environment');
  console.log(`   VERCEL=${process.env.VERCEL}, CI=${process.env.CI}, VERCEL_ENV=${vercelEnv}`);
  process.exit(0);
}

console.log('📦 Installing Playwright browsers...');
try {
  execSync('playwright install --with-deps chromium firefox webkit', {
    stdio: 'inherit'
  });
  console.log('✅ Playwright browsers installed successfully');
} catch (error) {
  console.error('❌ Failed to install Playwright:', error.message);
  // Don't fail the entire install if Playwright fails in development
  if (!isCI && !isProduction) {
    console.log('⚠️  Continuing without Playwright browsers. Run "pnpm playwright:install" manually if needed.');
    process.exit(0);
  }
  process.exit(1);
}