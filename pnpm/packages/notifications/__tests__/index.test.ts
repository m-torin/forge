import { describe, expect, it, vi } from 'vitest';

// Mock the modules before importing the module under test
vi.mock('@knocklabs/node', () => ({
  Knock: vi.fn().mockImplementation(() => ({
    users: {},
    workflows: {},
    objects: {},
    messages: {},
    feeds: {},
  })),
}));

vi.mock('../keys', () => ({
  keys: vi.fn().mockReturnValue(() => ({
    KNOCK_SECRET_API_KEY: 'test-knock-secret-api-key',
  })),
}));

// Import the module under test after mocks are set up
import { notifications } from '../index';

describe.skip('Notifications', () => {
  it('provides access to Knock API methods', () => {
    // Check that the notifications object has the expected methods
    expect(notifications.users).toBeDefined();
    expect(notifications.workflows).toBeDefined();
    expect(notifications.objects).toBeDefined();
    expect(notifications.messages).toBeDefined();
    expect(notifications.feeds).toBeDefined();
  });
});
