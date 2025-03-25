import { describe, expect, it, vi } from 'vitest';
import { webhooks } from '../index';
import { send, getAppPortal } from '../lib/svix';

// Import the mocked modules
vi.mock('../lib/svix', () => ({
  send: vi.fn(),
  getAppPortal: vi.fn(),
}));

describe('Webhooks Module', () => {
  it('exports the send function', () => {
    expect(webhooks.send).toBeDefined();
    expect(webhooks.send).toBe(send);
  });

  it('exports the getAppPortal function', () => {
    expect(webhooks.getAppPortal).toBeDefined();
    expect(webhooks.getAppPortal).toBe(getAppPortal);
  });

  it('has the correct structure', () => {
    expect(Object.keys(webhooks)).toEqual(['send', 'getAppPortal']);
  });

  it('correctly passes through to the svix module', async () => {
    // Mock the send function to return a specific value
    (send as any).mockResolvedValue({
      id: 'msg_test123',
      eventType: 'test.event',
      payload: { data: 'test' },
    });

    // Call the function through the webhooks module
    const result = await webhooks.send('test.event', { data: 'test' });

    // Check that the function was called with the correct parameters
    expect(send).toHaveBeenCalledWith('test.event', { data: 'test' });

    // Check that the result is correct
    expect(result).toEqual({
      id: 'msg_test123',
      eventType: 'test.event',
      payload: { data: 'test' },
    });
  });

  it('correctly passes through to the getAppPortal function', async () => {
    // Mock the getAppPortal function to return a specific value
    (getAppPortal as any).mockResolvedValue({
      url: 'https://app.svix.com/portal/test',
      token: 'test-token',
    });

    // Call the function through the webhooks module
    const result = await webhooks.getAppPortal();

    // Check that the function was called
    expect(getAppPortal).toHaveBeenCalled();

    // Check that the result is correct
    expect(result).toEqual({
      url: 'https://app.svix.com/portal/test',
      token: 'test-token',
    });
  });
});
