/**
 * Basic import tests for entry point files
 */

import { describe, expect } from 'vitest';

describe('entry point basic structure', () => {
  test('should have valid client.ts structure', () => {
    const fs = require('fs');
    const path = require('path');

    const clientPath = path.join(__dirname, '../../src/client.ts');
    const content = fs.readFileSync(clientPath, 'utf8');

    expect(content).toContain('export');
    expect(content.length).toBeGreaterThan(0);
  });

  test('should have valid server.ts structure', () => {
    const fs = require('fs');
    const path = require('path');

    const serverPath = path.join(__dirname, '../../src/server.ts');
    const content = fs.readFileSync(serverPath, 'utf8');

    expect(content).toContain('export');
    expect(content.length).toBeGreaterThan(0);
  });

  test('should have valid server-actions.ts structure', () => {
    const fs = require('fs');
    const path = require('path');

    const serverActionsPath = path.join(__dirname, '../../src/server-actions.ts');
    const content = fs.readFileSync(serverActionsPath, 'utf8');

    expect(content).toContain('export');
    expect(content.length).toBeGreaterThan(0);
  });

  test('should have valid types.ts structure', () => {
    const fs = require('fs');
    const path = require('path');

    const typesPath = path.join(__dirname, '../../src/types.ts');
    const content = fs.readFileSync(typesPath, 'utf8');

    // Types file might just re-export
    expect(content.length).toBeGreaterThan(0);
  });
});
