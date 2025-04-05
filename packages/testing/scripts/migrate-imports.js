#!/usr/bin/env node
/**
 * Migration Script for @repo/testing Import Paths
 *
 * This script scans the monorepo for old import patterns and updates them to the new direct import paths.
 *
 * Usage:
 * ```
 * node packages/testing/scripts/migrate-imports.js
 * ```
 */

import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { fileURLToPath } from "url";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the replacements
const replacements = [
  // Vitest replacements
  {
    from: /@repo\/testing\/vitest\/frameworks\/react/g,
    to: "@repo/testing/vitest",
  },
  {
    from: /import \{ react \} from ['"]@repo\/testing\/vitest['"];/g,
    to: "import { render, screen, fireEvent } from '@repo/testing/vitest';",
  },
  {
    from: /const \{ render, screen \} = react;/g,
    to: "// Direct imports now used",
  },
  {
    from: /@repo\/testing\/vitest\/frameworks\/mantine/g,
    to: "@repo/testing/vitest/mantine",
  },
  {
    from: /@repo\/testing\/vitest\/frameworks\/server/g,
    to: "@repo/testing/vitest/server",
  },

  // Cypress replacements
  {
    from: /@repo\/testing\/cypress\/core/g,
    to: "@repo/testing/cypress",
  },
  {
    from: /import \{ core \} from ['"]@repo\/testing\/cypress['"];/g,
    to: "import { createE2EConfig, createComponentConfig } from '@repo/testing/cypress';",
  },
  {
    from: /const \{ createE2EConfig, createComponentConfig \} = core;/g,
    to: "// Direct imports now used",
  },

  // Shared utilities replacements
  {
    from: /@repo\/testing\/shared\/env/g,
    to: "@repo/testing/shared",
  },
  {
    from: /@repo\/testing\/shared\/utils/g,
    to: "@repo/testing/shared",
  },
  {
    from: /@repo\/testing\/shared\/constants/g,
    to: "@repo/testing/shared",
  },
];

// Find all TypeScript files in the monorepo
console.log("Scanning for TypeScript files...");
const files = globSync("**/*.{ts,tsx}", {
  ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  cwd: path.resolve(process.cwd()),
});

console.log(`Found ${files.length} TypeScript files to scan.`);

// Process each file
let totalChanges = 0;
let changedFiles = 0;

files.forEach((file) => {
  const filePath = path.resolve(process.cwd(), file);
  let content = fs.readFileSync(filePath, "utf8");
  let fileChanged = false;
  let fileChanges = 0;

  replacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      fileChanged = true;
      fileChanges++;
      totalChanges++;
    }
  });

  if (fileChanged) {
    fs.writeFileSync(filePath, content);
    changedFiles++;
    console.log(`Updated ${fileChanges} imports in: ${file}`);
  }
});

console.log("\nMigration Summary:");
console.log(`- Scanned ${files.length} files`);
console.log(`- Updated ${changedFiles} files`);
console.log(`- Made ${totalChanges} import replacements`);

if (totalChanges === 0) {
  console.log(
    "\nNo import paths needed to be updated. Your codebase is already using the new import patterns!",
  );
} else {
  console.log(
    "\nImport paths have been updated to use the new direct import patterns.",
  );
  console.log(
    "Please review the changes and run your tests to ensure everything works as expected.",
  );
}
