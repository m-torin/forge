#!/usr/bin/env node

/**
 * Generate Tests for All Packages
 *
 * This script generates test files for all packages in the monorepo.
 * It uses the generate-tests.ts script to generate tests for each package.
 *
 * Usage:
 *   node generate-tests-all.ts
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Get the current directory and root directory
const currentDir = process.cwd();
const rootDir = path.resolve(currentDir, "../..");

// Get all packages in the packages directory
const packagesDir = path.join(rootDir, "packages");
const packages = fs
  .readdirSync(packagesDir)
  .filter((pkg) => fs.statSync(path.join(packagesDir, pkg)).isDirectory());

// Generate tests for each package
packages.forEach((pkg) => {
  const packagePath = path.join("packages", pkg);
  console.log(`Generating tests for ${packagePath}`);
  try {
    execSync(
      `node ${path.join(currentDir, "scripts", "generate-tests.ts")} ${packagePath}`,
      {
        stdio: "inherit",
      },
    );
  } catch (error) {
    console.error(`Error generating tests for ${packagePath}:`, error);
  }
});

console.log("All tests generated!");
