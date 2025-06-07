import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Resend SDK
const mockResend = {
  emails: {
    create: vi.fn(),
    send: vi.fn(),
  },
};

const MockResendConstructor = vi.fn().mockImplementation(() => mockResend);

vi.mock('resend', () => ({
  Resend: MockResendConstructor,
}));

// Mock the keys module
const mockKeys = vi.fn();
vi.mock('../keys', () => ({
  keys: mockKeys,
}));

describe('Resend Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Reset warning state
    (global as any).hasLoggedWarning = false;

    // Clear console.warn spy
    vi.clearAllMocks();
  });

  describe('with valid Resend token', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: 're_123456789',
      });
    });

    it('should initialize Resend instance when token is available', async () => {
      const { resend } = await import('../index');

      // Access a property to trigger initialization
      const emails = resend.emails;

      expect(emails).toBe(mockResend.emails);
      expect(MockResendConstructor).toHaveBeenCalledWith('re_123456789');
    });

    it('should reuse same Resend instance on subsequent access', async () => {
      const { resend } = await import('../index');

      const emails1 = resend.emails;
      const emails2 = resend.emails;

      expect(emails1).toBe(emails2);
      expect(MockResendConstructor).toHaveBeenCalledTimes(1);
    });

    it('should provide access to Resend methods', async () => {
      const { resend } = await import('../index');

      expect(resend.emails).toBe(mockResend.emails);
      expect(resend.emails.send).toBe(mockResend.emails.send);
      expect(resend.emails.create).toBe(mockResend.emails.create);
    });

    it('should support email sending', async () => {
      const { resend } = await import('../index');

      const emailData = {
        from: 'noreply@example.com',
        html: '<p>Test content</p>',
        subject: 'Test Email',
        to: 'test@example.com',
      };

      const mockResponse = { data: { id: 'email_123' }, error: null };
      mockResend.emails.send.mockResolvedValue(mockResponse);

      const result = await resend.emails.send(emailData);

      expect(mockResend.emails.send).toHaveBeenCalledWith(emailData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('without Resend token', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        RESEND_FROM: undefined,
        RESEND_TOKEN: undefined,
      });
    });

    it('should log warning once when token is missing', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { resend } = await import('../index');

      // Access a property to trigger the warning
      resend.emails;
      resend.emails; // Second access should not log again

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Resend email service is disabled: Missing RESEND_TOKEN',
      );

      consoleSpy.mockRestore();
    });

    it('should return mock email object when token is missing', async () => {
      const { resend } = await import('../index');

      const emails = resend.emails;

      expect(emails).toBeDefined();
      expect(emails.create).toBeDefined();
      expect(emails.send).toBeDefined();
    });

    it('should return mock response for email sending', async () => {
      const { resend } = await import('../index');

      const result = await resend.emails.send({
        from: 'test@example.com',
        html: '<p>Test</p>',
        subject: 'Test',
        to: 'recipient@example.com',
      });

      expect(result).toEqual({ data: { id: 'mock-email-id' }, error: null });
    });

    it('should return mock response for email create', async () => {
      const { resend } = await import('../index');

      const result = await resend.emails.create({
        from: 'test@example.com',
        html: '<p>Test</p>',
        subject: 'Test',
        to: 'recipient@example.com',
      });

      expect(result).toEqual({ data: { id: 'mock-email-id' }, error: null });
    });

    it('should return undefined for unsupported properties', async () => {
      const { resend } = await import('../index');

      const unsupportedProperty = (resend as any).unsupportedProperty;

      expect(unsupportedProperty).toBeUndefined();
    });

    it('should not initialize Resend instance when token is missing', async () => {
      const { resend } = await import('../index');

      // Access properties
      resend.emails;

      expect(MockResendConstructor).not.toHaveBeenCalled();
    });
  });

  describe('empty string token', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: '',
      });
    });

    it('should treat empty string as missing token', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { resend } = await import('../index');

      resend.emails;

      expect(consoleSpy).toHaveBeenCalledWith(
        'Resend email service is disabled: Missing RESEND_TOKEN',
      );
      expect(MockResendConstructor).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('proxy behavior', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: 're_123456789',
      });
    });

    it('should lazily initialize Resend instance', async () => {
      const { resend } = await import('../index');

      // Resend should not be called until we access a property
      expect(MockResendConstructor).not.toHaveBeenCalled();

      // Access a property to trigger initialization
      resend.emails;

      expect(MockResendConstructor).toHaveBeenCalledWith('re_123456789');
    });

    it('should only initialize Resend once', async () => {
      const { resend } = await import('../index');

      // Access multiple properties
      resend.emails;
      resend.emails;
      (resend as any).apiKeys; // Access another property

      expect(MockResendConstructor).toHaveBeenCalledTimes(1);
    });

    it('should forward all property access to Resend instance', async () => {
      const { resend } = await import('../index');

      // Mock additional properties
      (mockResend as any).apiKeys = { list: vi.fn() };
      (mockResend as any).audiences = { create: vi.fn() };

      expect(resend.emails).toBe(mockResend.emails);
      expect((resend as any).apiKeys).toBe((mockResend as any).apiKeys);
      expect((resend as any).audiences).toBe((mockResend as any).audiences);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: 're_123456789',
      });
    });

    it('should propagate Resend API errors', async () => {
      const { resend } = await import('../index');

      const error = new Error('Invalid API key');
      mockResend.emails.send.mockRejectedValue(error);

      await expect(
        resend.emails.send({
          from: 'test@example.com',
          html: '<p>Test</p>',
          subject: 'Test',
          to: 'recipient@example.com',
        }),
      ).rejects.toThrow('Invalid API key');
    });

    it('should handle Resend constructor errors', async () => {
      MockResendConstructor.mockImplementationOnce(() => {
        throw new Error('Invalid token format');
      });

      const { resend } = await import('../index');

      expect(() => resend.emails).toThrow('Invalid token format');
    });

    it('should handle keys function errors', async () => {
      mockKeys.mockImplementation(() => {
        throw new Error('Keys configuration error');
      });

      const { resend } = await import('../index');

      expect(() => resend.emails).toThrow('Keys configuration error');
    });
  });
});
