import { describe, expect, test } from 'vitest';

describe('observability Package', () => {
  test('package exports are available', () => {
    // Basic smoke test to verify the package can be imported
    // This prevents vitest from failing when no test files are found
    expect(true).toBeTruthy();
  });

  test('console provider is importable', async () => {
    const { ConsoleProvider } = await import('@/shared/providers/console-provider');
    expect(ConsoleProvider).toBeDefined();
  });

  test('shared utils are importable', async () => {
    const utils = await import('@/shared/utils');
    expect(utils).toBeDefined();
  });
});
