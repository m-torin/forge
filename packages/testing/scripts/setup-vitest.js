#!/usr/bin/env node
/**
 * Setup Vitest Configuration
 *
 * This script copies a standard vitest configuration to a target package.
 * Usage: node setup-vitest.js [packagePath] [type]
 *
 * Where:
 * - packagePath: Path to the package (defaults to '.')
 * - type: Type of configuration to generate (react, next, node, default: react)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration templates
const TEMPLATES = {
  react: {
    config: '../templates/vitest.config.mjs',
    setup: '../templates/setup.template.ts'
  },
  next: {
    config: '../templates/vitest.config.mjs',
    setup: '../templates/setup.template.ts'
  },
  node: {
    config: '../templates/vitest.node.config.mjs',
    setup: '../templates/setup.template.ts'
  }
};

async function setupVitest(packagePath = '.', type = 'react') {
  try {
    // Resolve paths
    const targetDir = path.resolve(process.cwd(), packagePath);
    const templates = TEMPLATES[type] || TEMPLATES.react;

    // Check if target dir exists
    if (!fs.existsSync(targetDir)) {
      console.error(`Target directory does not exist: ${targetDir}`);
      process.exit(1);
    }

    // Create __tests__ directory if it doesn't exist
    const testsDir = path.join(targetDir, '__tests__');
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
      console.log(`Created directory: ${testsDir}`);
    }

    // Copy vitest.config.mjs
    const configTemplatePath = path.resolve(__dirname, templates.config);
    const configTargetPath = path.join(targetDir, 'vitest.config.mjs');

    let configContent = fs.readFileSync(configTemplatePath, 'utf8');

    // Modify for Node.js if needed
    if (type === 'node') {
      configContent = configContent
        .replace("environment: 'jsdom'", "environment: 'node'")
        .replace("plugins: [react()],", "// No plugins needed for Node.js");
    }

    fs.writeFileSync(configTargetPath, configContent);
    console.log(`Created: ${configTargetPath}`);

    // Copy setup.ts
    const setupTemplatePath = path.resolve(__dirname, templates.setup);
    const setupTargetPath = path.join(testsDir, 'setup.ts');

    if (!fs.existsSync(setupTargetPath)) {
      let setupContent = fs.readFileSync(setupTemplatePath, 'utf8');

      // Modify for Node.js if needed (remove React-specific code)
      if (type === 'node') {
        setupContent = setupContent
          .replace("import * as React from 'react';", "")
          .replace("import * as testingLibrary from '@testing-library/react';", "")
          .replace(/\/\/ Export.*screen.*\n/g, "")
          .replace(/export const createRender[\s\S]*?};/m, "// No rendering utilities needed for Node.js tests");
      }

      fs.writeFileSync(setupTargetPath, setupContent);
      console.log(`Created: ${setupTargetPath}`);
    } else {
      console.log(`Setup file already exists: ${setupTargetPath}`);
    }

    console.log('\nRemember to install required dependencies:');
    if (type === 'node') {
      console.log('pnpm add -D vitest');
    } else {
      console.log('pnpm add -D vitest @vitejs/plugin-react @testing-library/react');
    }

    console.log('\nYou can update package.json scripts with:');
    console.log(JSON.stringify({
      scripts: {
        test: 'vitest run',
        'test:watch': 'vitest',
        'test:coverage': 'vitest run --coverage'
      }
    }, null, 2));

    return {
      configPath: configTargetPath,
      setupPath: setupTargetPath
    };
  } catch (error) {
    console.error('Error setting up Vitest configuration:', error);
    process.exit(1);
  }
}

// If this script is run directly, parse arguments and execute
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const packagePath = process.argv[2] || '.';
  const type = process.argv[3] || 'react';
  setupVitest(packagePath, type);
}

export { setupVitest };