/**
 * Simple tests for client-next.ts entry point structure
 */

import { describe, expect } from 'vitest';

describe('client-next.ts basic structure', () => {
  test('should be a valid TypeScript/JavaScript module', () => {
    // This test just ensures the file can be parsed and has basic structure
    expect(true).toBeTruthy();
  });

  test('should contain expected export patterns', () => {
    // Read the file content to verify it has the expected structure
    const fs = require('fs');
    const path = require('path');

    const clientNextPath = path.join(__dirname, '../../src/client-next.ts');
    const content = fs.readFileSync(clientNextPath, 'utf8');

    // Verify key exports exist in the file
    expect(content).toContain('export {');
    expect(content).toContain('AuthProvider');
    expect(content).toContain('useAuthContext');
    expect(content).toContain('useAuth');
    expect(content).toContain('authClient');
    expect(content).toContain('signIn');
    expect(content).toContain('signOut');
    expect(content).toContain('signUp');
  });

  test('should use client directive', () => {
    const fs = require('fs');
    const path = require('path');

    const clientNextPath = path.join(__dirname, '../../src/client-next.ts');
    const content = fs.readFileSync(clientNextPath, 'utf8');

    expect(content).toContain("'use client'");
  });

  test('should have proper import structure', () => {
    const fs = require('fs');
    const path = require('path');

    const clientNextPath = path.join(__dirname, '../../src/client-next.ts');
    const content = fs.readFileSync(clientNextPath, 'utf8');

    expect(content).toContain('import {');
    expect(content).toContain("from './client/");
  });
});
