#!/usr/bin/env node

/**
 * Test Generator Script
 *
 * This script generates test files for packages in the monorepo.
 * It creates test files based on templates for different types of files.
 *
 * Usage:
 *   node generate-tests.ts <package-path>
 *
 * Example:
 *   node generate-tests.ts packages/ui
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory and root directory
const currentDir = process.cwd();
const rootDir = path.resolve(currentDir, '../..');

// Get the package path from command line arguments
let packagePath = process.argv[2];

if (!packagePath) {
  console.error('Please provide a package path');
  console.error('Usage: node generate-tests.ts <package-path>');
  process.exit(1);
}

// If the package path is relative to the root directory, make it absolute
if (!path.isAbsolute(packagePath)) {
  packagePath = path.resolve(rootDir, packagePath);
}

// Check if the package exists
if (!fs.existsSync(packagePath)) {
  console.error(`Package path ${packagePath} does not exist`);
  process.exit(1);
}

console.log(`Generating tests for ${packagePath}`);

// Create the __tests__ directory if it doesn't exist
const testsDir = path.join(packagePath, '__tests__');
if (!fs.existsSync(testsDir)) {
  fs.mkdirSync(testsDir);
  console.log(`Created ${testsDir}`);
}

// Create the setup.ts file if it doesn't exist
const setupFile = path.join(testsDir, 'setup.ts');
if (!fs.existsSync(setupFile)) {
  const setupContent = `// Import shared testing setup
import { vi, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@repo/testing/vitest';

// Add package-specific setup here
`;
  fs.writeFileSync(setupFile, setupContent);
  console.log(`Created ${setupFile}`);
}

// Check if the package has a keys.ts file
const keysFile = path.join(packagePath, 'keys.ts');
if (fs.existsSync(keysFile)) {
  // Create a keys.test.ts file if it doesn't exist
  const keysTestFile = path.join(testsDir, 'keys.test.ts');
  if (!fs.existsSync(keysTestFile)) {
    // Read the keys.ts file to extract the environment variables
    const keysContent = fs.readFileSync(keysFile, 'utf8');

    // Extract environment variables from the keys.ts file
    const envVars: string[] = [];
    const envVarRegex = /process\.env\.([A-Z_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = envVarRegex.exec(keysContent)) !== null) {
      envVars.push(match[1]);
    }

    // Generate the test content
    const keysTestContent = `import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { keys } from '../keys';

// We're testing the actual implementation here, not the mock
vi.unmock('../keys');

describe('Environment Keys', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

${envVars
  .map(
    (envVar) => `
  it('handles ${envVar}', () => {
    // Set the environment variable
    process.env.${envVar} = 'test-value';

    // Call the keys function
    const result = keys();

    // Check that the environment variable is returned
    expect(result.${envVar}).toBe('test-value');
  });

  it('handles missing ${envVar}', () => {
    // Delete the environment variable
    delete process.env.${envVar};

    // Call the keys function
    const result = keys();

    // Check that the environment variable is undefined or has a default value
    // Adjust this expectation based on your implementation
    // expect(result.${envVar}).toBeUndefined();
  });
`,
  )
  .join('')}
});
`;

    fs.writeFileSync(keysTestFile, keysTestContent);
    console.log(`Created ${keysTestFile}`);
  }
}

// Check if the package has an index.ts or index.tsx file
const indexFile = fs.existsSync(path.join(packagePath, 'index.tsx'))
  ? path.join(packagePath, 'index.tsx')
  : path.join(packagePath, 'index.ts');

if (fs.existsSync(indexFile)) {
  // Create an index.test.ts or index.test.tsx file if it doesn't exist
  const indexTestFile = indexFile.endsWith('.tsx')
    ? path.join(testsDir, 'index.test.tsx')
    : path.join(testsDir, 'index.test.ts');

  if (!fs.existsSync(indexTestFile)) {
    // Read the index file to extract exports
    const indexContent = fs.readFileSync(indexFile, 'utf8');

    // Extract exports from the index file
    const exports: string[] = [];
    const exportRegex =
      /export\s+(?:const|function|class|type|interface|enum)\s+([A-Za-z0-9_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = exportRegex.exec(indexContent)) !== null) {
      exports.push(match[1]);
    }

    // Also check for re-exports
    const reExportRegex = /export\s+\*\s+from\s+['"](.+)['"]/g;
    const reExports: string[] = [];
    while ((match = reExportRegex.exec(indexContent)) !== null) {
      reExports.push(match[1]);
    }

    // Generate the test content
    const indexTestContent = `import { describe, expect, it } from 'vitest';
import * as exports from '../index';

describe('Package Exports', () => {
  it('exports all expected items', () => {
    // Check that all expected exports are defined
${exports.map((exp) => `    expect(exports.${exp}).toBeDefined();`).join('\n')}
  });

  it('has the correct number of exports', () => {
    // This test will fail if exports are added or removed without updating tests
    expect(Object.keys(exports).length).toBeGreaterThanOrEqual(${exports.length});
  });

${
  reExports.length > 0
    ? `
  it('re-exports from other modules', () => {
    // Check that re-exports are included
    // This is a basic check; you might want to add more specific tests
    expect(Object.keys(exports).length).toBeGreaterThan(${exports.length});
  });
`
    : ''
}
});
`;

    fs.writeFileSync(indexTestFile, indexTestContent);
    console.log(`Created ${indexTestFile}`);
  }
}

// Check for components directory
const componentsDir = path.join(packagePath, 'components');
if (fs.existsSync(componentsDir)) {
  // Create a components directory in __tests__ if it doesn't exist
  const componentsTestDir = path.join(testsDir, 'components');
  if (!fs.existsSync(componentsTestDir)) {
    fs.mkdirSync(componentsTestDir);
    console.log(`Created ${componentsTestDir}`);
  }

  // Get all component files
  const componentFiles = fs
    .readdirSync(componentsDir)
    .filter((file) => file.endsWith('.tsx') || file.endsWith('.jsx'));

  // Create test files for each component
  componentFiles.forEach((componentFile) => {
    const componentName = path.basename(
      componentFile,
      path.extname(componentFile),
    );
    const componentTestFile = path.join(
      componentsTestDir,
      `${componentName}.test.tsx`,
    );

    if (!fs.existsSync(componentTestFile)) {
      const componentTestContent = `import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@repo/testing/vitest';
import { ${componentName} } from '../../components/${componentName}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    // Render the component
    // render(<${componentName} />);

    // Add assertions based on the component's behavior
    // expect(screen.getByText('Example')).toBeInTheDocument();
  });

  // Add more tests based on the component's functionality
});
`;

      fs.writeFileSync(componentTestFile, componentTestContent);
      console.log(`Created ${componentTestFile}`);
    }
  });
}

// Check for hooks directory
const hooksDir = path.join(packagePath, 'hooks');
if (fs.existsSync(hooksDir)) {
  // Create a hooks directory in __tests__ if it doesn't exist
  const hooksTestDir = path.join(testsDir, 'hooks');
  if (!fs.existsSync(hooksTestDir)) {
    fs.mkdirSync(hooksTestDir);
    console.log(`Created ${hooksTestDir}`);
  }

  // Get all hook files
  const hookFiles = fs
    .readdirSync(hooksDir)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'));

  // Create test files for each hook
  hookFiles.forEach((hookFile) => {
    const hookFileName = path.basename(hookFile, path.extname(hookFile));
    // Convert kebab-case to camelCase for the import
    const hookName = hookFileName.replace(
      /-([a-z])/g,
      (_: string, letter: string) => letter.toUpperCase(),
    );
    const hookTestFile = path.join(hooksTestDir, `${hookFileName}.test.tsx`);

    if (!fs.existsSync(hookTestFile)) {
      const hookTestContent = `import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ${hookName} } from '../../hooks/${hookFileName}';

describe('${hookName}', () => {
  it('returns the correct initial state', () => {
    // Render the hook
    // const { result } = renderHook(() => ${hookName}());

    // Add assertions based on the hook's behavior
    // expect(result.current).toBeDefined();
  });

  // Add more tests based on the hook's functionality
});
`;

      fs.writeFileSync(hookTestFile, hookTestContent);
      console.log(`Created ${hookTestFile}`);
    }
  });
}

// Check for utils directory
const utilsDir = path.join(packagePath, 'utils');
if (fs.existsSync(utilsDir)) {
  // Create a utils directory in __tests__ if it doesn't exist
  const utilsTestDir = path.join(testsDir, 'utils');
  if (!fs.existsSync(utilsTestDir)) {
    fs.mkdirSync(utilsTestDir);
    console.log(`Created ${utilsTestDir}`);
  }

  // Get all utility files
  const utilFiles = fs
    .readdirSync(utilsDir)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

  // Create test files for each utility
  utilFiles.forEach((utilFile) => {
    const utilName = path.basename(utilFile, path.extname(utilFile));
    const utilTestFile = path.join(utilsTestDir, `${utilName}.test.ts`);

    if (!fs.existsSync(utilTestFile)) {
      const utilTestContent = `import { describe, it, expect, vi } from 'vitest';
import * as utils from '../../utils/${utilName}';

describe('${utilName} utilities', () => {
  // Add tests for each utility function

  // Example:
  // it('formatData works correctly', () => {
  //   const result = utils.formatData({ key: 'value' });
  //   expect(result).toEqual({ formattedKey: 'value' });
  // });
});
`;

      fs.writeFileSync(utilTestFile, utilTestContent);
      console.log(`Created ${utilTestFile}`);
    }
  });
}

// Check if the package has a vitest.config.mjs file
const vitestConfigFile = path.join(packagePath, 'vitest.config.mjs');
if (!fs.existsSync(vitestConfigFile)) {
  console.log(`Creating vitest.config.mjs for ${packagePath}...`);
  // Determine if the package has React components
  const hasReactComponents =
    fs.existsSync(componentsDir) ||
    (fs.existsSync(indexFile) && indexFile.endsWith('.tsx'));

  // Create a vitest.config.mjs file
  const vitestConfigContent = hasReactComponents
    ? `import { createReactConfig } from '@repo/testing/vitest';
import path from 'path';

export default createReactConfig({
  // Package-specific overrides here
}, __dirname);
`
    : `import { createBaseConfig } from '@repo/testing/vitest';
import path from 'path';

export default createBaseConfig({
  // Package-specific overrides here
}, __dirname);
`;

  fs.writeFileSync(vitestConfigFile, vitestConfigContent);
  console.log(`Created ${vitestConfigFile}`);
}

console.log('Test generation complete!');
