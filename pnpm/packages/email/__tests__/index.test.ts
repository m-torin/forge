import { describe, expect, it } from 'vitest';
import { resend } from '../index';
import { Resend } from 'resend';

// We don't need to mock these again as they're already mocked in setup.ts
// vi.mock('resend');
// vi.mock('../keys', () => ({
//   keys: vi.fn().mockReturnValue({
//     RESEND_FROM: 'test@example.com',
//     RESEND_TOKEN: 're_test_token',
//   }),
// }));

describe('Email Client', () => {
  it('exports a Resend instance', () => {
    expect(resend).toBeDefined();
    // We can't use toBeInstanceOf because our mock doesn't actually create a real Resend instance
    // Instead, check for the structure we expect
    expect(resend).toHaveProperty('emails');
    expect(resend.emails).toHaveProperty('send');
  });

  it('initializes Resend with the correct token', () => {
    // Check that Resend constructor was called with the correct token
    expect(Resend).toHaveBeenCalledWith('re_test_token');
  });

  it('can send emails', async () => {
    // Call the send method - we don't need to mock it again since it's already mocked in setup.ts
    const result = await resend.emails.send({
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test email content</p>',
    });

    // Check that the send method was called with the correct parameters
    expect(resend.emails.send).toHaveBeenCalledWith({
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test email content</p>',
    });

    // Check the result
    expect(result).toEqual({
      id: 'mock-email-id',
      from: 'test@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Email',
      status: 'success',
    });
  });
});
