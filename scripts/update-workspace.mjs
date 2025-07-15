#!/usr/bin/env node
/**
 * Workspace Update Script for pnpm monorepo
 *
 * This script automates dependency maintenance in a pnpm workspace,
 * leveraging pnpm 10's advanced features for monorepo management:
 *
 * 1. Validates we're in a pnpm workspace
 * 2. Updates PNPM to the latest version via corepack
 * 3. Fixes any formatting issues in pnpm-workspace.yaml (adding quotes to scoped packages)
 * 4. Updates pnpm-workspace.yaml catalog dependencies to their latest versions
 * 5. Fixes any malformed catalog references (like catalog:package-name)
 * 6. Ensures all package.json files in apps/ and packages/ use catalog references where available
 * 7. Fixes any catalog references that don't exist in the catalog
 * 8. Runs pnpm install to synchronize all packages
 * 9. Runs pnpm audit --fix to update security vulnerabilities in the workspace
 * 10. Updates non-catalog dependencies to their latest versions using pnpm 10 features
 * 11. Verifies all packages can be packed correctly (unless --no-verify is specified)
 *
 * Usage:
 *   pnpm bump-deps [--help] [--silent] [--no-verify]
 *
 * Benefits of pnpm catalogs in monorepos:
 * - Reduces duplication in package.json files
 * - Makes dependency upgrades easier (change once in workspace)
 * - Reduces git merge conflicts in package.json files
 * - Ensures consistent versions across the monorepo
 *
 * Package verification:
 * By default, all packages are verified with 'pnpm pack' to ensure they can be
 * properly packaged and published. This helps catch issues with package.json
 * files that might prevent successful publishing. Use --no-verify to skip.
 */

import { exec, execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { exit } from 'process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper function to find all package.json files recursively (platform-agnostic)
function findPackageJsonFiles(dir = '.', files = [], isRoot = true) {
  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);

      // Skip node_modules, hidden directories, and services (git submodules)
      if (entry === 'node_modules' || entry.startsWith('.') || entry === 'services') {
        continue;
      }

      // If we're at the root level, only process apps/, packages/, and package.json
      if (isRoot && entry !== 'apps' && entry !== 'packages' && entry !== 'package.json') {
        continue;
      }

      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          findPackageJsonFiles(fullPath, files, false);
        } else if (entry === 'package.json') {
          files.push(fullPath);
        }
      } catch (err) {
        // Skip files/directories that can't be accessed (broken symlinks, etc.)
        console.log(`  ⚠️  Skipping inaccessible path: ${fullPath}`);
      }
    }
  } catch (err) {
    console.error(`  ❌ Error reading directory ${dir}: ${err.message}`);
  }

  return files;
}

// Helper function to safely parse JSON while preserving formatting info
function parseJsonPreserveFormat(content) {
  // Store the original formatting
  const lines = content.split('\n');
  const hasTrailingNewline = content.endsWith('\n');
  const indentMatch = content.match(/^(\s*)"[^"]+":/m);
  const indent = indentMatch ? indentMatch[1] : '  ';

  return {
    data: JSON.parse(content),
    format: {
      indent,
      hasTrailingNewline,
      lineEndings: content.includes('\r\n') ? '\r\n' : '\n',
    },
  };
}

// Helper function to stringify JSON with preserved formatting
function stringifyWithFormat(data, format) {
  const json = JSON.stringify(data, null, format.indent);
  return format.hasTrailingNewline ? json + format.lineEndings : json;
}

// Helper function to compare semantic versions (including prereleases and build metadata)
function semverCompare(a, b) {
  // Remove build metadata (everything after +)
  const cleanA = a.split('+')[0];
  const cleanB = b.split('+')[0];

  // Parse versions into components
  const parseVersion = v => {
    const prereleaseSplit = v.split('-');
    const versionParts = prereleaseSplit[0].split('.').map(Number);
    const prerelease = prereleaseSplit[1] ? prereleaseSplit[1].split('.') : null;

    return {
      major: versionParts[0] || 0,
      minor: versionParts[1] || 0,
      patch: versionParts[2] || 0,
      prerelease,
    };
  };

  const vA = parseVersion(cleanA);
  const vB = parseVersion(cleanB);

  // Compare major.minor.patch
  if (vA.major !== vB.major) return vA.major - vB.major;
  if (vA.minor !== vB.minor) return vA.minor - vB.minor;
  if (vA.patch !== vB.patch) return vA.patch - vB.patch;

  // If one has prerelease and the other doesn't, the one without prerelease is greater
  if (vA.prerelease && !vB.prerelease) return -1;
  if (!vA.prerelease && vB.prerelease) return 1;
  if (!vA.prerelease && !vB.prerelease) return 0;

  // Both have prereleases, compare the prerelease identifiers
  const minLength = Math.min(vA.prerelease.length, vB.prerelease.length);

  for (let i = 0; i < minLength; i++) {
    const partA = vA.prerelease[i];
    const partB = vB.prerelease[i];

    // If both parts are numbers, compare numerically
    const numA = parseInt(partA, 10);
    const numB = parseInt(partB, 10);

    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
      continue;
    }

    // If one is a number and the other is a string, number is less
    if (!isNaN(numA) && isNaN(numB)) return -1;
    if (isNaN(numA) && !isNaN(numB)) return 1;

    // Both are strings, compare alphabetically
    const stringCompare = partA.localeCompare(partB);
    if (stringCompare !== 0) return stringCompare;
  }

  // If we get here, all compared parts are equal, so compare by length
  return vA.prerelease.length - vB.prerelease.length;
}

// Helper function to find the latest version from an array of versions
function findLatestVersion(versions) {
  return versions.sort((a, b) => semverCompare(a, b)).pop();
}

// Helper function to check if version a is greater than version b
function semverGt(a, b) {
  return semverCompare(a, b) > 0;
}

// Command line flags
const HELP_FLAG = process.argv.includes('--help');
const SILENT_FLAG = process.argv.includes('--silent');
const NO_VERIFY_FLAG = process.argv.includes('--no-verify');

// NPM query cache to avoid repeated network calls
const npmVersionCache = new Map();

// Backup storage for rollback capability
const fileBackups = new Map();

// Lock file to prevent concurrent runs
const LOCK_FILE = '.workspace-update.lock';

// Default configuration
const DEFAULT_CONFIG = {
  versionPrefix: '^', // Default to caret ranges
  preserveRanges: true, // Try to preserve existing version range style
  parallelLimit: 5, // Limit concurrent NPM queries
  timeout: 30000, // 30 second timeout for NPM queries
};

// Usage help
if (HELP_FLAG) {
  console.log(`
PNPM Workspace Updater

Usage:
  pnpm bump-deps [options]

Options:
  --help            Show this help message
  --silent          Hide non-essential output
  --no-verify       Skip verification of packages with 'pnpm pack'

This script performs the following operations in order:
1. Validates we're in a pnpm workspace
2. Updates PNPM to the latest version via corepack
3. Fixes any formatting issues in pnpm-workspace.yaml (adding quotes to scoped packages)
4. Updates pnpm-workspace.yaml catalog dependencies to their latest versions
5. Fixes any malformed catalog references (like catalog:package-name)
6. Ensures all package.json files in apps/ and packages/ use catalog references where available
7. Fixes any catalog references that don't exist in the catalog
8. Runs pnpm install to synchronize all packages
9. Runs pnpm audit --fix to update security vulnerabilities in the workspace
10. Updates non-catalog dependencies to their latest versions using advanced pnpm 10 features
11. Verifies all packages can be packed correctly (unless --no-verify is specified)
  `);
  exit(0);
}

// Function to execute commands and log output
function runCommand(command, silent = SILENT_FLAG) {
  if (!silent) console.log(`🔄 ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    if (!silent) console.log(`✅ Done`);
    return output;
  } catch (error) {
    console.error(`❌ Error: ${command}`);
    console.error(error.message);
    return '';
  }
}

// Helper function to get latest version of a package with caching
async function getLatestVersion(packageName, includePrerelease = false) {
  const cacheKey = `${packageName}:${includePrerelease}`;

  if (npmVersionCache.has(cacheKey)) {
    return npmVersionCache.get(cacheKey);
  }

  try {
    let version;

    if (includePrerelease) {
      // Get all versions including prereleases
      const { stdout } = await execAsync(`npm show ${packageName} versions --json`, {
        encoding: 'utf-8',
      });
      const allVersions = JSON.parse(stdout);
      version = findLatestVersion(allVersions);
    } else {
      // Get latest stable version
      const { stdout } = await execAsync(`npm show ${packageName} version`, {
        encoding: 'utf-8',
      });
      version = stdout.trim();
    }

    npmVersionCache.set(cacheKey, version);
    return version;
  } catch (error) {
    // Package might be private or not exist
    npmVersionCache.set(cacheKey, null);
    return null;
  }
}

// Helper function to get latest prerelease matching a pattern
async function getLatestPrerelease(packageName, prereleaseId) {
  const cacheKey = `${packageName}:pre:${prereleaseId}`;

  if (npmVersionCache.has(cacheKey)) {
    return npmVersionCache.get(cacheKey);
  }

  try {
    const { stdout } = await execAsync(`npm show ${packageName} versions --json`, {
      encoding: 'utf-8',
    });
    const allVersions = JSON.parse(stdout);

    // Filter versions with the same prerelease identifier
    const matchingPrereleases = allVersions.filter(v => v.includes(`-${prereleaseId}`));

    if (matchingPrereleases.length > 0) {
      const latestPrerelease = findLatestVersion(matchingPrereleases);
      npmVersionCache.set(cacheKey, latestPrerelease);
      return latestPrerelease;
    }

    npmVersionCache.set(cacheKey, null);
    return null;
  } catch (error) {
    npmVersionCache.set(cacheKey, null);
    return null;
  }
}

// Function to acquire lock
function acquireLock() {
  if (existsSync(LOCK_FILE)) {
    const lockData = readFileSync(LOCK_FILE, 'utf-8');
    console.error(`❌ Error: Another instance is already running (PID: ${lockData})`);
    console.error('If this is incorrect, delete .workspace-update.lock and try again.');
    exit(1);
  }
  writeFileSync(LOCK_FILE, process.pid.toString());
}

// Function to release lock
function releaseLock() {
  if (existsSync(LOCK_FILE)) {
    rmSync(LOCK_FILE, { force: true });
  }
}

// Function to backup a file
function backupFile(filePath) {
  if (!fileBackups.has(filePath) && existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8');
    fileBackups.set(filePath, content);
  }
}

// Function to restore all backups
function restoreBackups() {
  console.log('🔄 Restoring file backups...');
  for (const [filePath, content] of fileBackups) {
    writeFileSync(filePath, content);
  }
  console.log('✅ Backups restored');
}

// Main function
async function main() {
  console.log('🚀 Starting workspace update');

  // Acquire lock to prevent concurrent runs
  acquireLock();

  // Set up cleanup handlers
  process.on('exit', releaseLock);
  process.on('SIGINT', () => {
    console.log('⚠️  Interrupted, cleaning up...');
    releaseLock();
    process.exit(1);
  });

  try {
    // Step 0: Validate we're in a pnpm workspace
    if (!existsSync('pnpm-workspace.yaml')) {
      console.error('❌ Error: Not in a pnpm workspace directory (pnpm-workspace.yaml not found)');
      console.error('Please run this command from the root of your pnpm workspace.');
      exit(1);
    }

    console.log('✅ Found pnpm-workspace.yaml');

    // Step 1: Upgrade PNPM to latest version using corepack
    console.log('1️⃣  Upgrading PNPM to latest version');
    console.log('Running: corepack use pnpm@latest');
    runCommand('corepack use pnpm@latest');

    // Add a small delay to ensure corepack command completes
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

    // Get PNPM version
    const pnpmVersion = runCommand('pnpm --version', true).trim();
    console.log(`📋  PNPM version: ${pnpmVersion}`);

    // Update the packageManager field in package.json
    runCommand(`pnpm pkg set packageManager=pnpm@${pnpmVersion}`, true);
    console.log(`✅  Updated packageManager to pnpm@${pnpmVersion}`);

    // Step 2: Update workspace catalog and check package.json files
    console.log('2️⃣  Updating catalog entries in pnpm-workspace.yaml');
    await updateCatalogEntries();

    // Step 3: Fix any malformed 'catalog:' references first (before other operations)
    console.log('3️⃣  Checking for and fixing malformed catalog references');
    await fixMalformedCatalogReferences();

    // Step 4: Ensure all package.json files use catalog references
    console.log('4️⃣  Checking package.json files in apps/ and packages/ for catalog references');
    const { catalogEntries } = await checkAndFixPackageJsonFiles();

    // Step 5: Fix package.json files with missing catalog entries
    console.log('5️⃣  Fixing missing catalog references');
    await fixMissingCatalogReferences(catalogEntries);

    // Step 6: Update all dependencies to the latest versions
    console.log('6️⃣  Updating all dependencies to latest versions');

    console.log('📦  First running pnpm install to ensure catalog is synchronized');
    try {
      execSync('pnpm install', { stdio: 'inherit' });
      console.log('✅  Successfully installed dependencies');

      // Update all non-catalog dependencies using the pnpm CLI directly
      console.log('📦  Updating all non-catalog dependencies to their latest versions');
      try {
        // First, use the pnpm audit command which can now update overrides in pnpm-workspace.yaml
        console.log('🔍  Running security audit and fixing vulnerabilities');
        try {
          execSync('pnpm audit --fix', { stdio: 'inherit' });
          console.log('✅  Security audit complete');
        } catch (error) {
          console.log('⚠️  Security audit found issues but will continue with updates');
        }

        // Update recursively with increased concurrency (pnpm 10 feature)
        console.log('📦  Updating dependencies recursively');
        execSync('pnpm -r up --latest', { stdio: 'inherit' });
        console.log('✅  Successfully updated all dependencies to latest versions');

        // By default, verify that all packages can be packed correctly
        // Skip only if --no-verify flag is provided
        if (!NO_VERIFY_FLAG) {
          console.log('📦  Verifying packages can be packed correctly');
          const verifyDir = './.pnpm-pack-verify';
          const logFile = './.pack-output.log';

          try {
            // Create verification directory
            if (!existsSync(verifyDir)) {
              execSync(`mkdir -p ${verifyDir}`, { stdio: 'ignore' });
            }

            // Use a temporary file to capture output but not display it
            execSync(`pnpm -r pack --pack-destination ${verifyDir} > ${logFile} 2>&1`, {
              stdio: ['pipe', 'pipe', 'pipe'],
            });

            // Count the number of packages packed using platform-agnostic method
            const tgzFiles = readdirSync(verifyDir).filter(f => f.endsWith('.tgz'));
            const packCount = tgzFiles.length;

            console.log(`✅  Successfully verified ${packCount} packages`);
          } catch (error) {
            console.error('⚠️  Some packages failed verification');
            console.error(error.message);
            // In case of error, show the log for debugging
            try {
              if (existsSync(logFile)) {
                const errorLog = readFileSync(logFile, 'utf-8');
                console.error('Pack error details:');
                console.error(errorLog);
              }
            } catch (e) {
              // Ignore error reading log
            }
          } finally {
            // Clean up only verification files, not all .tgz files in the project
            console.log('🧹  Cleaning up verification files');
            if (existsSync(verifyDir)) {
              rmSync(verifyDir, { recursive: true, force: true });
            }
            if (existsSync(logFile)) {
              rmSync(logFile, { force: true });
            }
            console.log('✅  Cleanup complete');
          }
        }
      } catch (error) {
        console.error('⚠️  Error updating dependencies:', error.message);
      }
    } catch (error) {
      console.error('⚠️  Error updating dependencies, but workspace changes were successful');
      console.error('Error details:', error.message);
      console.log('\n💡  You can still manually run:');
      console.log('   pnpm install && pnpm up -r');
    }

    // Step 7: Final pass to ensure all catalog references are properly set
    // This needs to happen AFTER pnpm up --latest which may have reverted catalog references
    console.log('7️⃣  Final pass: Ensuring all catalog references are properly set');
    await checkAndFixPackageJsonFiles();

    // Run pnpm install one more time to lock in the catalog references
    console.log('📦  Running final pnpm install to lock catalog references');
    try {
      execSync('pnpm install', { stdio: 'inherit' });
      console.log('✅  Catalog references locked in');
    } catch (error) {
      console.error('⚠️  Error during final install:', error.message);
    }

    console.log('\n✨  Workspace update complete');
  } catch (error) {
    console.error('\n❌ Fatal error during workspace update:', error.message);

    if (fileBackups.size > 0) {
      console.log('\n🔄 Rolling back changes...');
      restoreBackups();
    }

    throw error;
  } finally {
    // Always clean up the lock file
    releaseLock();
  }
}

// Function to fix malformed catalog references
async function fixMalformedCatalogReferences() {
  try {
    const packageJsonFiles = findPackageJsonFiles();
    let fixedReferences = 0;

    for (const packageJsonPath of packageJsonFiles) {
      try {
        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
        const parsed = parseJsonPreserveFormat(packageJsonContent);
        const packageJson = parsed.data;
        let updated = false;

        // Check all dependency sections for 'catalog:pkg' references (which should be just 'catalog:')
        for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
          if (packageJson[section]) {
            for (const [pkg, version] of Object.entries(packageJson[section])) {
              if (
                typeof version === 'string' &&
                version.startsWith('catalog:') &&
                version !== 'catalog:'
              ) {
                packageJson[section][pkg] = 'catalog:';
                updated = true;
                fixedReferences++;
              }
            }
          }
        }

        if (updated) {
          writeFileSync(packageJsonPath, stringifyWithFormat(packageJson, parsed.format));
          console.log(`  📄  Fixed malformed catalog references in ${packageJsonPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${packageJsonPath}: ${error.message}`);
      }
    }

    if (fixedReferences > 0) {
      console.log(`✅  Fixed ${fixedReferences} malformed catalog references`);
    } else {
      console.log('✅  No malformed catalog references found');
    }
  } catch (error) {
    console.error(`Error fixing malformed catalog references: ${error.message}`);
  }
}

// Helper function to parse catalog entry line
function parseCatalogEntry(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Skip onlyBuiltDependencies section
  if (trimmed === 'onlyBuiltDependencies:' || line.includes('onlyBuiltDependencies:')) {
    return null;
  }

  // Match single-quoted, double-quoted, or unquoted package names
  const match = trimmed.match(/^(['"]?)(@?[^'":]+(?:\/[^'":]+)?)(['"]?):\s*(.+)$/);
  if (!match) return null;

  const packageName = match[2];
  const version = match[4].trim();

  return { packageName, version };
}

// Helper function to format catalog entry line
function formatCatalogEntry(packageName, version) {
  // Scoped packages need quotes in YAML
  if (packageName.startsWith('@')) {
    return `  "${packageName}": ${version}`;
  }
  return `  ${packageName}: ${version}`;
}

// Helper function to safely parse YAML catalog section
function parseCatalogSection(yamlContent) {
  // More robust regex that handles end-of-file and various formats
  const catalogMatch = yamlContent.match(/^catalog:\s*\n((?:^\s+[^\n]+\n?)*)/m);

  if (!catalogMatch || !catalogMatch[1]) {
    return null;
  }

  return catalogMatch[1];
}

// Function to update catalog entries in pnpm-workspace.yaml
async function updateCatalogEntries() {
  try {
    // Read workspace yaml directly
    const workspaceYamlPath = path.join(process.cwd(), 'pnpm-workspace.yaml');

    // Backup the file before modifying
    backupFile(workspaceYamlPath);

    let workspaceYaml = readFileSync(workspaceYamlPath, 'utf-8');

    // Extract and preserve the onlyBuiltDependencies section
    const onlyBuiltDependenciesMatch = workspaceYaml.match(
      /^onlyBuiltDependencies:\s*\n((?:^\s+[^\n]+\n?)*)/m,
    );
    const onlyBuiltDependenciesSection = onlyBuiltDependenciesMatch
      ? onlyBuiltDependenciesMatch[0]
      : '';

    // Remove the onlyBuiltDependencies section temporarily
    if (onlyBuiltDependenciesSection) {
      workspaceYaml = workspaceYaml.replace(onlyBuiltDependenciesSection, '');
    }

    // First, let's normalize the workspace YAML by ensuring proper quotes for scoped packages
    const catalogSection = parseCatalogSection(workspaceYaml);
    if (catalogSection) {
      let lines = catalogSection.trim().split('\n');
      let fixed = false;
      const fixedLines = [];

      for (const line of lines) {
        const entry = parseCatalogEntry(line);
        if (!entry) {
          // Preserve original line formatting
          fixedLines.push(line);
          continue;
        }

        // Check if it's a scoped package without quotes in the original line
        if (entry.packageName.startsWith('@') && !line.trim().startsWith('"@')) {
          fixedLines.push(formatCatalogEntry(entry.packageName, entry.version));
          fixed = true;
        } else {
          // Preserve original line formatting
          fixedLines.push(line);
        }
      }

      if (fixed) {
        console.log('🔧  Fixing scoped package names in pnpm-workspace.yaml');
        // Replace the existing catalog section
        const fixedCatalog = `catalog:\n${fixedLines.join('\n')}`;

        // More robust replacement that handles various formats
        workspaceYaml = workspaceYaml.replace(
          /^catalog:\s*\n((?:^\s+[^\n]+\n?)*)$/m,
          `${fixedCatalog}\n`,
        );

        // Write back to file
        writeFileSync(workspaceYamlPath, workspaceYaml);
        console.log('✅  Fixed scoped package names in pnpm-workspace.yaml');
      }
    }

    // Use our safer parsing function to extract catalog entries
    const updatedCatalogSection = parseCatalogSection(workspaceYaml);

    if (!updatedCatalogSection) {
      console.log('⚠️  No catalog section found in pnpm-workspace.yaml');
      return { catalogEntries: {} };
    }

    // Parse the catalog section to get existing entries
    const catalogLines = [];
    const catalogEntries = {};
    let totalUpdates = 0;

    const lines = updatedCatalogSection.trim().split('\n');

    for (const line of lines) {
      const entry = parseCatalogEntry(line);

      if (!entry) {
        // Keep empty lines or comments as-is
        if (line.trim()) {
          catalogLines.push('  ' + line.trim());
        }
        continue;
      }

      const { packageName, version } = entry;

      // Store the current version in catalogEntries
      catalogEntries[packageName] = version;

      try {
        // Check if the version has a prefix
        const prefix = version.startsWith('^') ? '^' : version.startsWith('~') ? '~' : '';
        const currentVersionNumber = version.replace(/[~^]/, '');

        // If the current version is a prerelease (contains '-')
        if (currentVersionNumber.includes('-')) {
          // Extract prerelease identifier (e.g., "canary" from "15.4.0-canary.47")
          const prereleaseMatch = currentVersionNumber.match(/-([^.\d]+)/);
          const prereleaseId = prereleaseMatch ? prereleaseMatch[1] : null;

          if (prereleaseId) {
            const latestPrerelease = await getLatestPrerelease(packageName, prereleaseId);

            if (latestPrerelease && semverGt(latestPrerelease, currentVersionNumber)) {
              // Update to the newer matching prerelease version
              const updatedVersion = `${prefix}${latestPrerelease}`;
              console.log(`  ${packageName}: ${version} → ${updatedVersion} (${prereleaseId})`);
              totalUpdates++;

              // Update catalog
              catalogEntries[packageName] = updatedVersion;
              catalogLines.push(formatCatalogEntry(packageName, updatedVersion));
              continue;
            }
          }

          // If we couldn't find a newer matching prerelease, keep the original line with proper indentation
          catalogLines.push(formatCatalogEntry(packageName, version));
        } else {
          // For regular versions, get the latest stable version
          const latestVersion = await getLatestVersion(packageName, false);

          // If different, update it
          if (latestVersion && semverGt(latestVersion, currentVersionNumber)) {
            const updatedVersion = `${prefix}${latestVersion}`;
            console.log(`  ${packageName}: ${version} → ${updatedVersion}`);
            totalUpdates++;

            // Update the catalogEntries with the new version
            catalogEntries[packageName] = updatedVersion;
            catalogLines.push(formatCatalogEntry(packageName, updatedVersion));
          } else {
            // If the version is the same, keep the original line with proper indentation
            catalogLines.push(formatCatalogEntry(packageName, version));
          }
        }
      } catch (error) {
        // If there's an error, keep the original line with proper indentation
        if (entry) {
          catalogLines.push(formatCatalogEntry(entry.packageName, entry.version));
        } else {
          catalogLines.push(line.trim());
        }
      }
    }

    // Update the workspace YAML file if there were any changes
    if (totalUpdates > 0) {
      // Create the new catalog section
      const newCatalogContent = `catalog:
${catalogLines.join('\n')}`;

      // Replace the existing catalog section or add a new one
      if (parseCatalogSection(workspaceYaml)) {
        // Replace existing catalog section
        workspaceYaml = workspaceYaml.replace(
          /^catalog:\s*\n((?:^\s+[^\n]+\n?)*)$/m,
          newCatalogContent + '\n',
        );
      } else {
        // Add new catalog section at the end
        workspaceYaml = workspaceYaml.trimEnd() + '\n\n' + newCatalogContent + '\n';
      }

      // Restore the onlyBuiltDependencies section if it existed
      if (onlyBuiltDependenciesSection) {
        workspaceYaml = workspaceYaml.trimEnd() + '\n\n' + onlyBuiltDependenciesSection;
      }

      // Write the updated YAML back to the file
      writeFileSync(workspaceYamlPath, workspaceYaml);

      console.log(`✅  Updated ${totalUpdates} catalog entries in pnpm-workspace.yaml`);
    } else {
      console.log('✅  All catalog entries are already at their latest versions');
    }

    return { catalogEntries };
  } catch (error) {
    console.error(`Error updating catalog entries: ${error.message}`);
    return { catalogEntries: {} };
  }
}

// Helper function to validate version string
function isValidVersion(version) {
  if (typeof version !== 'string') return false;

  // Check for special protocols that aren't semver
  const specialProtocols = [
    'workspace:',
    'file:',
    'link:',
    'git+',
    'github:',
    'npm:',
    'http:',
    'https:',
    'catalog:',
  ];
  if (specialProtocols.some(proto => version.startsWith(proto))) {
    return true; // These are valid but not semver
  }

  // Check for version ranges and tags
  const validPatterns = [
    /^[~^]?\d+\.\d+\.\d+/, // Basic semver with optional prefix
    /^[><=]+\s*\d+\.\d+\.\d+/, // Comparison ranges
    /^\d+\.x/, // .x ranges
    /^\*$/, // Wildcard
    /^latest$/, // Tags
  ];

  return validPatterns.some(pattern => pattern.test(version));
}

// Helper function to detect version prefix style
function detectVersionPrefix(packageJson) {
  // Check all dependency sections for existing patterns
  const allVersions = [
    ...Object.values(packageJson.dependencies || {}),
    ...Object.values(packageJson.devDependencies || {}),
    ...Object.values(packageJson.peerDependencies || {}),
  ].filter(v => typeof v === 'string' && /^[~^]?\d+\.\d+\.\d+/.test(v));

  if (allVersions.length === 0) return DEFAULT_CONFIG.versionPrefix;

  // Count prefix usage
  const prefixCounts = { '^': 0, '~': 0, '': 0 };
  allVersions.forEach(v => {
    if (v.startsWith('^')) prefixCounts['^']++;
    else if (v.startsWith('~')) prefixCounts['~']++;
    else prefixCounts['']++;
  });

  // Return most common prefix
  return (
    Object.entries(prefixCounts).sort(([, a], [, b]) => b - a)[0][0] || DEFAULT_CONFIG.versionPrefix
  );
}

// Function to check and fix package.json files to use catalog references
async function checkAndFixPackageJsonFiles() {
  try {
    // Get a list of all package.json files in the workspace
    const packageJsonFiles = findPackageJsonFiles();

    // Get catalog entries from pnpm-workspace.yaml
    const workspaceYamlPath = path.join(process.cwd(), 'pnpm-workspace.yaml');
    const workspaceYaml = readFileSync(workspaceYamlPath, 'utf-8');

    const catalogSection = parseCatalogSection(workspaceYaml);
    const catalogEntries = {};

    if (catalogSection) {
      const lines = catalogSection.trim().split('\n');

      for (const line of lines) {
        const entry = parseCatalogEntry(line);
        if (entry) {
          catalogEntries[entry.packageName] = entry.version;
        }
      }
    }

    // Track package.json files that need to be updated
    let totalUpdates = 0;

    console.log(`  Found ${packageJsonFiles.length} package.json files to check`);
    console.log(`  Catalog entries available: ${Object.keys(catalogEntries).length}`);

    // Log first few catalog entries for debugging
    const catalogSample = Object.entries(catalogEntries).slice(0, 5);
    console.log(`  Sample catalog entries:`);
    catalogSample.forEach(([pkg, version]) => {
      console.log(`    - ${pkg}: ${version}`);
    });

    for (let i = 0; i < packageJsonFiles.length; i++) {
      const packageJsonPath = packageJsonFiles[i];

      try {
        backupFile(packageJsonPath); // Backup before any modifications

        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
        const parsed = parseJsonPreserveFormat(packageJsonContent);
        const packageJson = parsed.data;
        let needsUpdate = false;
        const updates = [];

        // Log current file being processed
        const packageName = packageJson.name || path.basename(path.dirname(packageJsonPath));
        console.log(`  🔍 Checking ${packageName} (${packageJsonPath})`);

        // Check dependencies for catalog usage
        const checkAndUpdateSection = section => {
          if (!packageJson[section]) return;

          for (const [pkg, version] of Object.entries(packageJson[section])) {
            // Skip workspace protocol dependencies
            if (typeof version === 'string' && version.startsWith('workspace:')) {
              continue;
            }

            // Check if the dependency is in the catalog but not using catalog:
            if (
              typeof version === 'string' &&
              !version.startsWith('catalog:') &&
              catalogEntries[pkg]
            ) {
              console.log(
                `    📦 Converting ${pkg}: "${version}" → "catalog:" (catalog has "${catalogEntries[pkg]}")`,
              );
              packageJson[section][pkg] = 'catalog:';
              needsUpdate = true;
              updates.push(pkg);
            } else if (
              typeof version === 'string' &&
              !version.startsWith('catalog:') &&
              !catalogEntries[pkg] &&
              section === 'dependencies'
            ) {
              // Log packages not in catalog for debugging (only for dependencies to reduce noise)
              if (packageJsonPath.includes('webapp')) {
                console.log(`    ⚠️  ${pkg}: "${version}" not in catalog`);
              }
            }
          }
        };

        checkAndUpdateSection('dependencies');
        checkAndUpdateSection('devDependencies');
        checkAndUpdateSection('peerDependencies');

        if (needsUpdate) {
          // Write back to file preserving formatting
          writeFileSync(packageJsonPath, stringifyWithFormat(packageJson, parsed.format));

          let packageName = path.basename(path.dirname(packageJsonPath));
          if (packageJsonPath === './package.json' || packageJsonPath === 'package.json') {
            packageName = 'root';
          }

          console.log(
            `  📄 ${packageName}: Updated ${updates.length} dependencies to use catalog references`,
          );
          totalUpdates += updates.length;
        }
      } catch (error) {
        console.error(`Error processing ${packageJsonPath}: ${error.message}`);
      }
    }

    if (totalUpdates > 0) {
      console.log(`✅  Updated ${totalUpdates} dependencies to use catalog references`);
    } else {
      console.log('✅  All package.json files are already using correct catalog references');
    }

    return { catalogEntries };
  } catch (error) {
    console.error(`Error checking package.json files: ${error.message}`);
    return { catalogEntries: {} };
  }
}

// Function to fix missing catalog references
async function fixMissingCatalogReferences(catalogEntries) {
  try {
    // Get a list of all package.json files in the workspace
    const packageJsonFiles = findPackageJsonFiles();

    let totalFixed = 0;

    for (const packageJsonPath of packageJsonFiles) {
      try {
        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
        const parsed = parseJsonPreserveFormat(packageJsonContent);
        const packageJson = parsed.data;
        let needsUpdate = false;
        const updates = [];

        // Check for catalog references that don't exist in the catalog
        const checkAndFixSection = async section => {
          if (!packageJson[section]) return;

          for (const [pkg, version] of Object.entries(packageJson[section])) {
            if (
              typeof version === 'string' &&
              version.startsWith('catalog:') &&
              !catalogEntries[pkg]
            ) {
              const latestVersion = await getLatestVersion(pkg, false);

              if (latestVersion) {
                // Respect existing version range preferences if we can detect them
                let prefix = '^'; // Default to caret

                // Check if this package uses exact versions elsewhere
                const hasExactVersion = Object.values(packageJson[section] || {})
                  .concat(Object.values(packageJson.dependencies || {}))
                  .concat(Object.values(packageJson.devDependencies || {}))
                  .some(v => typeof v === 'string' && /^\d+\.\d+\.\d+/.test(v));

                if (hasExactVersion || section === 'peerDependencies') {
                  prefix = '';
                }

                packageJson[section][pkg] = `${prefix}${latestVersion}`;
              } else {
                // If we can't get the latest version, use '*'
                packageJson[section][pkg] = '*';
              }

              needsUpdate = true;
              updates.push(pkg);
            }
          }
        };

        await checkAndFixSection('dependencies');
        await checkAndFixSection('devDependencies');
        await checkAndFixSection('peerDependencies');

        if (needsUpdate) {
          // Write back to file preserving formatting
          writeFileSync(packageJsonPath, stringifyWithFormat(packageJson, parsed.format));

          let packageName = path.basename(path.dirname(packageJsonPath));
          if (packageJsonPath === './package.json' || packageJsonPath === 'package.json') {
            packageName = 'root';
          }

          console.log(`  📄 ${packageName}: Fixed ${updates.length} missing catalog references`);
          totalFixed += updates.length;
        }
      } catch (error) {
        console.error(`Error processing ${packageJsonPath}: ${error.message}`);
      }
    }

    if (totalFixed > 0) {
      console.log(`✅  Fixed ${totalFixed} missing catalog references`);
    } else {
      console.log('✅  No missing catalog references found');
    }
  } catch (error) {
    console.error(`Error fixing missing catalog references: ${error.message}`);
  }
}

// Ensure lock file is cleaned up on any exit
process.on('exit', () => {
  releaseLock();
});

process.on('SIGTERM', () => {
  releaseLock();
  process.exit(0);
});

// Execute main function
main().catch(error => {
  console.error('❌ Script failed:', error);
  releaseLock();
  exit(1);
});
