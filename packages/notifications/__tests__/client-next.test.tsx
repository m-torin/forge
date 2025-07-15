import { describe, expect, test } from 'vitest';

describe('client-next', () => {
  test('exports from client module', async () => {
    const clientNext = await import('../src/client-next');

    expect(clientNext).toBeDefined();
    expect(typeof clientNext).toBe('object');
  });

  test('re-exports expected components', async () => {
    const clientNext = await import('../src/client-next');

    // Check that key exports are available
    expect('NotificationsProvider' in clientNext).toBeTruthy();
    expect('NotificationsTrigger' in clientNext).toBeTruthy();
  });
});
