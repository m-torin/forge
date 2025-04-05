#!/usr/bin/env node

/**
 * This script updates package.json files across the monorepo to use catalog: references
 * for dependencies that are defined in the catalog section of pnpm-workspace.yaml.
 */

import * as fs from "fs/promises";
import * as path from "path";
import * as process from "process";
import * as yaml from "js-yaml";

// Define types for package.json structure
interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  [key: string]: unknown;
}

// Define types for pnpm-workspace.yaml structure
interface PnpmWorkspace {
  packages?: string[];
  catalog?: Record<string, string>;
}

// Get the root directory of the monorepo
const rootDir = path.resolve(process.cwd(), "..");

async function main(): Promise<void> {
  try {
    // Read the catalog entries from pnpm-workspace.yaml
    const workspaceYaml = await fs.readFile(
      path.join(rootDir, "pnpm-workspace.yaml"),
      "utf8",
    );
    const workspace = yaml.load(workspaceYaml) as PnpmWorkspace;

    if (!workspace.catalog) {
      console.error("No catalog section found in pnpm-workspace.yaml");
      process.exit(1);
    }

    const catalogDependencies = Object.keys(workspace.catalog);
    console.log(`Found ${catalogDependencies.length} dependencies in catalog`);

    // Find all package.json files
    const packageJsonFiles = await findPackageJsonFiles(rootDir);
    console.log(`Found ${packageJsonFiles.length} package.json files`);

    // Update each package.json file
    let totalUpdates = 0;
    for (const filePath of packageJsonFiles) {
      const updates = await updatePackageJson(filePath, catalogDependencies);
      totalUpdates += updates;
    }

    console.log(
      `Updated ${totalUpdates} dependencies to use catalog: references`,
    );
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

async function findPackageJsonFiles(rootDir: string): Promise<string[]> {
  const packageJsonFiles: string[] = [];

  // Helper function to recursively find package.json files
  async function findFiles(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules directories
      if (entry.isDirectory() && entry.name === "node_modules") {
        continue;
      }

      if (entry.isDirectory()) {
        await findFiles(fullPath);
      } else if (entry.name === "package.json") {
        packageJsonFiles.push(fullPath);
      }
    }
  }

  await findFiles(rootDir);
  return packageJsonFiles;
}

async function updatePackageJson(
  filePath: string,
  catalogDependencies: string[],
): Promise<number> {
  // Read the package.json file
  const packageJsonContent = await fs.readFile(filePath, "utf8");
  const packageJson = JSON.parse(packageJsonContent) as PackageJson;

  let updates = 0;

  // Update dependencies
  if (packageJson.dependencies) {
    for (const [dep, version] of Object.entries(packageJson.dependencies)) {
      if (
        catalogDependencies.includes(dep) &&
        !version.startsWith("workspace:") &&
        !version.startsWith("catalog:")
      ) {
        packageJson.dependencies[dep] = "catalog:";
        updates++;
      }
    }
  }

  // Update devDependencies
  if (packageJson.devDependencies) {
    for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
      if (
        catalogDependencies.includes(dep) &&
        !version.startsWith("workspace:") &&
        !version.startsWith("catalog:")
      ) {
        packageJson.devDependencies[dep] = "catalog:";
        updates++;
      }
    }
  }

  // Update peerDependencies
  if (packageJson.peerDependencies) {
    for (const [dep, version] of Object.entries(packageJson.peerDependencies)) {
      if (
        catalogDependencies.includes(dep) &&
        !version.startsWith("workspace:") &&
        !version.startsWith("catalog:")
      ) {
        packageJson.peerDependencies[dep] = "catalog:";
        updates++;
      }
    }
  }

  // Update peerDependenciesMeta
  if (packageJson.peerDependenciesMeta) {
    for (const dep of Object.keys(packageJson.peerDependenciesMeta)) {
      if (
        catalogDependencies.includes(dep) &&
        packageJson.peerDependencies &&
        packageJson.peerDependencies[dep] &&
        !packageJson.peerDependencies[dep].startsWith("workspace:") &&
        !packageJson.peerDependencies[dep].startsWith("catalog:")
      ) {
        // This is just to log that we found a peerDependenciesMeta entry
        // The actual update happens in the peerDependencies section
        console.log(`  Found peerDependenciesMeta for ${dep}`);
      }
    }
  }

  // Only write the file if there were updates
  if (updates > 0) {
    const relativePath = path.relative(rootDir, filePath);
    console.log(`Updating ${relativePath} (${updates} dependencies)`);

    // Write the updated package.json file with proper formatting
    await fs.writeFile(filePath, JSON.stringify(packageJson, null, 2) + "\n");
  }

  return updates;
}

main();
