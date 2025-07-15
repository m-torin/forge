#!/usr/bin/env node
/**
 * Doppler Sync Script for pnpm monorepo
 *
 * This script uploads .env.local files from all apps to Doppler secrets,
 * providing a simpler and more maintainable alternative to the bash loop.
 *
 * Features:
 * - Automatically discovers apps with .env.local files
 * - Provides better error handling and progress reporting
 * - Supports dry-run mode for safety
 * - Uses async operations for better performance
 *
 * Usage:
 *   node scripts/doppler-sync.mjs [--dry-run] [--silent] [--help]
 */

import { execSync } from 'child_process';
import { exit } from 'process';
import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

// Command line flags
const DRY_RUN_FLAG = process.argv.includes('--dry-run');
const SILENT_FLAG = process.argv.includes('--silent');
const HELP_FLAG = process.argv.includes('--help');

// Usage help
if (HELP_FLAG) {
  console.log(`
Doppler Sync Script

Usage:
  node scripts/doppler-sync.mjs [options]

Options:
  --help        Show this help message
  --dry-run     Show what would be uploaded without actually doing it
  --silent      Hide non-essential output

This script finds all apps with .env.local files and uploads them to Doppler.
`);
  exit(0);
}

// Helper function to find apps with .env.local files
function findAppsWithEnvFiles() {
  const appsDir = path.join(process.cwd(), 'apps');
  const appsWithEnv = [];

  if (!existsSync(appsDir)) {
    console.log('⚠️  No apps directory found');
    return appsWithEnv;
  }

  try {
    const appEntries = readdirSync(appsDir);

    for (const appName of appEntries) {
      const appPath = path.join(appsDir, appName);
      
      try {
        const stat = statSync(appPath);
        if (!stat.isDirectory()) continue;

        const envPath = path.join(appPath, '.env.local');
        if (existsSync(envPath)) {
          appsWithEnv.push({
            name: appName,
            path: appPath,
            envFile: envPath
          });
        }
      } catch (err) {
        if (!SILENT_FLAG) {
          console.log(`  ⚠️  Skipping inaccessible app: ${appName}`);
        }
      }
    }
  } catch (err) {
    console.error(`❌ Error reading apps directory: ${err.message}`);
  }

  return appsWithEnv;
}

// Helper function to upload secrets for a single app
async function uploadAppSecrets(app) {
  const { name, path: appPath, envFile } = app;

  if (!SILENT_FLAG) {
    console.log(`📤 Uploading ${name}...`);
  }

  if (DRY_RUN_FLAG) {
    console.log(`  [DRY RUN] Would upload ${envFile} from ${appPath}`);
    return { success: true, app: name };
  }

  try {
    // Change to app directory and run doppler upload
    const command = `cd "${appPath}" && doppler secrets upload .env.local`;
    
    if (!SILENT_FLAG) {
      console.log(`  Running: doppler secrets upload .env.local`);
    }

    execSync(command, { 
      encoding: 'utf-8',
      stdio: SILENT_FLAG ? 'pipe' : 'inherit'
    });

    if (!SILENT_FLAG) {
      console.log(`  ✅ Successfully uploaded ${name}`);
    }

    return { success: true, app: name };
  } catch (error) {
    console.error(`  ❌ Failed to upload ${name}: ${error.message}`);
    return { success: false, app: name, error: error.message };
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Doppler sync');

  if (DRY_RUN_FLAG) {
    console.log('🔍 Running in dry-run mode - no changes will be made');
  }

  // Find all apps with .env.local files
  const appsWithEnv = findAppsWithEnvFiles();

  if (appsWithEnv.length === 0) {
    console.log('✅ No apps with .env.local files found');
    return;
  }

  console.log(`📂 Found ${appsWithEnv.length} app(s) with .env.local files:`);
  appsWithEnv.forEach(app => {
    console.log(`  - ${app.name}`);
  });

  // Upload secrets for each app
  const results = [];
  
  for (const app of appsWithEnv) {
    const result = await uploadAppSecrets(app);
    results.push(result);
  }

  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Successful: ${successful.length}`);
  
  if (failed.length > 0) {
    console.log(`  ❌ Failed: ${failed.length}`);
    failed.forEach(f => {
      console.log(`    - ${f.app}: ${f.error}`);
    });
    exit(1);
  }

  if (DRY_RUN_FLAG) {
    console.log('\n💡 Run without --dry-run to actually upload the secrets');
  } else {
    console.log('\n✨ Doppler sync complete');
  }
}

// Execute main function
main().catch((error) => {
  console.error('❌ Script failed:', error);
  exit(1);
});