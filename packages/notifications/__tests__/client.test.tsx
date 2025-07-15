import { describe, expect, test } from 'vitest';

describe('client', () => {
  test('exports client components', async () => {
    const client = await import('../src/client');

    expect(client).toBeDefined();
    expect(typeof client).toBe('object');
  });

  test('exports expected components', async () => {
    const client = await import('../src/client');

    // Check that key exports are available
    expect('NotificationsProvider' in client).toBeTruthy();
    expect('NotificationsTrigger' in client).toBeTruthy();
  });
});
