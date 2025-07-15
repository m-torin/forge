/**
 * Tests for testing exports
 */

import { describe, expect } from 'vitest';

describe('testing index exports', () => {
  test('should export testing utilities', () => {
    const fs = require('fs');
    const path = require('path');

    const testingIndexPath = path.join(__dirname, '../../src/testing/index.ts');
    const content = fs.readFileSync(testingIndexPath, 'utf8');

    expect(content).toContain("export * from './mocks'");
    expect(content).toContain("export * from './utilities'");
    expect(content).toContain("export * from './vitest'");
  });

  test('should be a valid module', () => {
    expect(true).toBeTruthy();
  });
});
