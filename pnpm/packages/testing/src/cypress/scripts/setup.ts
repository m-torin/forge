/**
 * Cypress Setup Script
 *
 * This script sets up a new Cypress project with the Next-Forge configuration.
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Options for setting up Cypress
 */
export interface SetupCypressOptions {
  /**
   * Type of Cypress setup
   * @default 'both'
   */
  type?: 'e2e' | 'component' | 'both';

  /**
   * Whether to copy fixtures
   * @default true
   */
  copyFixtures?: boolean;
}

/**
 * Copy fixtures to an app's cypress directory
 * @param destDir - Destination directory
 * @returns Target directory path
 */
export const copyFixtures = (destDir: string): string => {
  const fixturesDir = path.resolve(__dirname, '../core/fixtures');
  const targetDir = path.join(destDir, 'cypress/fixtures');

  // Create directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy fixtures
  execSync(`cp -r ${fixturesDir}/* ${targetDir}`);

  return targetDir;
};

/**
 * Set up a new Cypress project
 * @param projectDir - Project directory
 * @param options - Setup options
 * @returns Cypress directory path
 */
export const setupCypress = (
  projectDir: string,
  options: SetupCypressOptions = {},
): string => {
  const {
    type = 'both', // 'e2e', 'component', or 'both'
    copyFixtures: shouldCopyFixtures = true,
  } = options;

  // Create cypress directory structure
  const cypressDir = path.join(projectDir, 'cypress');
  if (!fs.existsSync(cypressDir)) {
    fs.mkdirSync(cypressDir, { recursive: true });
  }

  // Create config files
  if (type === 'e2e' || type === 'both') {
    const e2eConfigContent = `
import { e2e } from '@repo/testing/cypress';

export default e2e.createE2EConfig({
  // App-specific overrides
  baseUrl: 'http://localhost:3000',
  env: {
    // App-specific environment variables
  },
});
    `.trim();

    fs.writeFileSync(
      path.join(projectDir, 'cypress.config.js'),
      e2eConfigContent,
    );

    // Create e2e directory
    const e2eDir = path.join(cypressDir, 'e2e');
    if (!fs.existsSync(e2eDir)) {
      fs.mkdirSync(e2eDir, { recursive: true });
    }

    // Create example e2e test
    const exampleE2ETest = `
describe('Basic Navigation', () => {
  it('should navigate to the home page', () => {
    cy.visit('/');
    cy.contains('h1', 'Welcome').should('be.visible');
  });
});
    `.trim();

    fs.writeFileSync(path.join(e2eDir, 'navigation.cy.ts'), exampleE2ETest);
  }

  if (type === 'component' || type === 'both') {
    const componentConfigContent = `
import { component } from '@repo/testing/cypress';

export default component.createComponentConfig({
  // App-specific overrides
  env: {
    // App-specific environment variables
  },
});
    `.trim();

    if (type === 'component') {
      fs.writeFileSync(
        path.join(projectDir, 'cypress.config.js'),
        componentConfigContent,
      );
    } else {
      fs.writeFileSync(
        path.join(projectDir, 'cypress.component.config.js'),
        componentConfigContent,
      );
    }

    // Create component directory
    const componentDir = path.join(cypressDir, 'component');
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    // Create example component test
    const exampleComponentTest = `
import Button from '../../components/Button';

describe('Button Component', () => {
  it('should render correctly', () => {
    cy.mount(<Button>Click me</Button>);
    cy.contains('Click me').should('be.visible');
  });
  
  it('should handle click events', () => {
    const onClick = cy.stub().as('onClick');
    cy.mount(<Button onClick={onClick}>Click me</Button>);
    cy.contains('Click me').click();
    cy.get('@onClick').should('have.been.calledOnce');
  });
});
    `.trim();

    fs.writeFileSync(
      path.join(componentDir, 'Button.cy.tsx'),
      exampleComponentTest,
    );
  }

  // Create support directory and files
  const supportDir = path.join(cypressDir, 'support');
  if (!fs.existsSync(supportDir)) {
    fs.mkdirSync(supportDir, { recursive: true });
  }

  // Create e2e support file
  if (type === 'e2e' || type === 'both') {
    const e2eSupportContent = `
// Import the shared e2e support file
import '@repo/testing/cypress/e2e/setup';

// Add any app-specific commands or overrides here
    `.trim();

    fs.writeFileSync(path.join(supportDir, 'e2e.ts'), e2eSupportContent);
  }

  // Create component support file
  if (type === 'component' || type === 'both') {
    const componentSupportContent = `
// Import the shared component support file
import '@repo/testing/cypress/component/setup';

// Add any app-specific commands or overrides here
    `.trim();

    fs.writeFileSync(
      path.join(supportDir, 'component.tsx'),
      componentSupportContent,
    );
  }

  // Copy fixtures if requested
  if (shouldCopyFixtures) {
    copyFixtures(projectDir);
  }

  return cypressDir;
};

export default {
  setupCypress,
  copyFixtures,
};
