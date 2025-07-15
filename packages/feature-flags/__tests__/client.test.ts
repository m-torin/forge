import { describe, expect, test } from 'vitest';

describe('client', () => {
  test('exports client functionality', async () => {
    const client = await import('#/client');

    expect(client).toBeDefined();
    expect(typeof client).toBe('object');
  });

  test('exports expected client adapters', async () => {
    const client = await import('#/client');

    // Check for expected exports
    expect(client).toHaveProperty('createPostHogClientAdapter');
    expect(client).toHaveProperty('postHogClientAdapter');
  });

  test('createPostHogClientAdapter is available', async () => {
    const { createPostHogClientAdapter } = await import('#/client');

    expect(createPostHogClientAdapter).toBeDefined();
    expect(typeof createPostHogClientAdapter).toBe('function');
  });

  test('postHogClientAdapter is available', async () => {
    const { postHogClientAdapter } = await import('#/client');

    expect(postHogClientAdapter).toBeDefined();
    expect(typeof postHogClientAdapter).toBe('object');
  });
});
