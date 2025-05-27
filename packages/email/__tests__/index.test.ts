import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocks
import { resend } from '../index';

// Mock Resend before importing
vi.mock('resend', () => {
  const mockResend = vi.fn();
  return {
    Resend: mockResend.mockImplementation(() => ({
      emails: {
        send: vi.fn(),
      },
    })),
  };
});

describe('@repo/email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports a Resend instance', () => {
    expect(resend).toBeDefined();
    expect(resend).toHaveProperty('emails');
  });

  it('resend instance has email send method', () => {
    expect(resend.emails).toBeDefined();
    expect(resend.emails.send).toBeDefined();
    expect(typeof resend.emails.send).toBe('function');
  });
});
