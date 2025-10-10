#!/usr/bin/env node
/**
 * Test Suite for Validation Scripts
 * Uses Node.js native test runner
 *
 * Usage: node --test validate.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';

describe('Claude-Specific Validation Suite', () => {
  it('should run all Claude validators', () => {
    try {
      const result = execSync('node .claude/scripts/validate-claude.mjs all', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      assert.ok(result.includes('FINAL SUMMARY'), 'Output should include summary');
    } catch (err) {
      // Test passes even if validators fail (testing execution, not validation)
      assert.ok(err.stdout.includes('FINAL SUMMARY'), 'Output should include summary even on failure');
    }
  });

  it('should run individual Claude validators', () => {
    const validators = ['agents', 'commands', 'delegation', 'worktree'];

    for (const validator of validators) {
      try {
        execSync(`node .claude/scripts/validate-claude.mjs ${validator}`, {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        // If it doesn't throw, it executed successfully
        assert.ok(true, `${validator} executed`);
      } catch (err) {
        // Even if validation fails, test passes if command executed
        assert.ok(err.code === 1 || err.code === 0, `${validator} should exit with 0 or 1`);
      }
    }
  });
});

describe('Repository-Wide Validation Suite', () => {
  it('should run all repository validators', () => {
    try {
      const result = execSync('node scripts/validate.mjs all', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      assert.ok(result.includes('FINAL SUMMARY'), 'Output should include summary');
    } catch (err) {
      // Test passes even if validators fail (testing execution, not validation)
      assert.ok(err.stdout.includes('FINAL SUMMARY'), 'Output should include summary even on failure');
    }
  });

  it('should run individual repository validators', () => {
    const validators = ['contamination', 'coverage'];

    for (const validator of validators) {
      try {
        execSync(`node scripts/validate.mjs ${validator}`, {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        // If it doesn't throw, it executed successfully
        assert.ok(true, `${validator} executed`);
      } catch (err) {
        // Even if validation fails, test passes if command executed
        assert.ok(err.code === 1 || err.code === 0, `${validator} should exit with 0 or 1`);
      }
    }
  });

  it('should accept coverage with scope flag', () => {
    try {
      execSync('node scripts/validate.mjs coverage --scope @repo/ai', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      assert.ok(true, 'Coverage command with scope executed');
    } catch (err) {
      // Even if coverage fails, test passes if command executed
      assert.ok(err.code === 1 || err.code === 0, 'Coverage should exit with 0 or 1');
    }
  });
});

describe('Scope Detection Suite', () => {
  it('should detect scope correctly', () => {
    const result = execSync(
      'node scripts/detect-scope.mjs "packages/ai/src/index.ts"',
      { encoding: 'utf-8' }
    ).trim();

    assert.strictEqual(result, '@repo/ai', 'Should detect @repo/ai scope');
  });

  it('should detect webapp scope', () => {
    const result = execSync(
      'node scripts/detect-scope.mjs "apps/webapp/src/app/page.tsx"',
      { encoding: 'utf-8' }
    ).trim();

    assert.strictEqual(result, 'webapp', 'Should detect webapp scope');
  });

  it('should fallback to . for unknown paths', () => {
    const result = execSync(
      'node scripts/detect-scope.mjs "unknown/path/file.ts"',
      { encoding: 'utf-8' }
    ).trim();

    assert.strictEqual(result, '.', 'Should fallback to . for unknown paths');
  });

  it('should handle empty input', () => {
    const result = execSync(
      'node scripts/detect-scope.mjs ""',
      { encoding: 'utf-8' }
    ).trim();

    assert.strictEqual(result, '.', 'Should return . for empty input');
  });

  it('should handle comma-separated paths', () => {
    const result = execSync(
      'node scripts/detect-scope.mjs "packages/ai/src/index.ts,packages/ai/src/utils.ts"',
      { encoding: 'utf-8' }
    ).trim();

    assert.strictEqual(result, '@repo/ai', 'Should detect scope from first matching path');
  });
});
