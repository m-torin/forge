import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Knock at the top level
vi.mock('@knocklabs/node', () => {
  const KnockMock = vi.fn().mockImplementation(() => ({
    notify: vi.fn(),
    users: {
      identify: vi.fn(),
    },
  }));
  return { Knock: KnockMock };
});

describe('@repo/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes Knock with the correct API key', async () => {
    // Import dynamically to ensure mocks are in place
    const { Knock } = await import('@knocklabs/node');
    await import('../index');

    expect(Knock).toHaveBeenCalledWith({ apiKey: 'test-knock-key' });
  });

  it('exports a Knock instance', async () => {
    const { notifications } = await import('../index');
    expect(notifications).toBeDefined();
  });
});
