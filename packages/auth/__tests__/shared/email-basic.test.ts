import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { EmailUrlData, UserEmailData } from '../../src/shared/email';

vi.mock('@repo/email/server', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@repo/observability', () => ({
  logError: vi.fn(),
}));

describe('email (basic)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sendVerificationEmail forwards minimal data', async () => {
    const { sendVerificationEmail } = await import('../../src/shared/email');
    const data: UserEmailData & EmailUrlData = {
      email: 'user@example.com',
      name: 'User',
      token: 'tok_123',
      url: 'https://example.com/verify?token=tok_123',
    };
    await expect(sendVerificationEmail(data)).resolves.toBeUndefined();

    const server = await import('@repo/email/server');
    expect(server.sendVerificationEmail).toHaveBeenCalledWith({
      name: 'User',
      email: 'user@example.com',
      verificationLink: 'https://example.com/verify?token=tok_123',
    });
  });
});
