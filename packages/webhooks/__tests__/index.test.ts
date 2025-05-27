import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocks
import { webhooks } from '../index';

// Mocks
vi.mock('../lib/svix', () => ({
  getAppPortal: vi.fn().mockResolvedValue('test-app-portal-url'),
  send: vi.fn().mockResolvedValue({ id: 'test-message-id' }),
}));

describe('@repo/webhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports the required functions', () => {
    expect(webhooks).toHaveProperty('getAppPortal');
    expect(webhooks).toHaveProperty('send');
  });

  it('getAppPortal should return a portal URL', async () => {
    const result = await webhooks.getAppPortal();
    expect(result).toBe('test-app-portal-url');
  });

  it('send should create a webhook event', async () => {
    const eventType = 'test-event';
    const payload = { test: 'data' };

    const result = await webhooks.send(eventType, payload);
    expect(result).toEqual({ id: 'test-message-id' });
  });
});
