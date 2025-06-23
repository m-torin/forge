/**
 * Simplified export test to check basic functionality
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import fs from 'fs/promises';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

describe('Simple Export Tests', () => {
  test('all export files exist', async () => {
    const exportFiles = [
      'client.ts',
      'server.ts',
      'client-next.ts',
      'server-next.ts',
      'server-next-edge.ts',
    ];

    for (const file of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, file);
      try {
        await fs.access(filePath);
        console.log(`✅ ${file} exists`);
      } catch (error) {
        throw new Error(`Export file ${file} does not exist`);
      }
    }
  });

  test('export files have correct basic structure', async () => {
    const checks = [
      { file: 'client.ts', shouldNotContain: ['@opentelemetry', 'server'] },
      { file: 'client-next.ts', shouldNotContain: ['@opentelemetry', 'server'] },
      { file: 'server-next-edge.ts', shouldNotContain: ['@opentelemetry', '@vercel/otel'] },
    ];

    for (const check of checks) {
      const filePath = path.join(PACKAGE_ROOT, check.file);
      const content = await fs.readFile(filePath, 'utf-8');

      for (const forbidden of check.shouldNotContain) {
        const hasStaticImport = new RegExp(`^import.*from.*['"].*${forbidden}.*['"]`, 'gm').test(
          content,
        );
        expect(hasStaticImport).toBe(false);

        if (hasStaticImport) {
          console.error(`❌ ${check.file} contains forbidden import: ${forbidden}`);
        }
      }

      console.log(`✅ ${check.file} passes basic checks`);
    }
  });

  test('edge runtime uses console logging only', async () => {
    const edgeFile = path.join(PACKAGE_ROOT, 'server-next-edge.ts');
    const content = await fs.readFile(edgeFile, 'utf-8');

    // Should have console logging
    expect(content).toContain('console.');

    // Should not have OTEL imports
    expect(content).not.toContain('@opentelemetry');
    expect(content).not.toContain('@vercel/otel');

    console.log('✅ Edge runtime uses console logging correctly');
  });
});
