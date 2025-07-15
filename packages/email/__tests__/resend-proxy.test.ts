import { beforeEach, describe, expect, test, vi } from 'vitest';

// Create mocks first
const mockResend = {
  emails: {
    create: vi.fn(),
    send: vi.fn(),
  },
};

const MockResendConstructor = vi.fn(() => mockResend);
const mockSafeEnv = vi.fn();
const mockLogger = {
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
};

// Set global logger mock
(global as any).mockLogger = mockLogger;

// Mock modules
vi.mock('resend', () => ({
  Resend: MockResendConstructor,
}));

vi.mock('../env', () => ({
  safeEnv: mockSafeEnv,
}));

describe('resend Proxy', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Reset module state by clearing cache
    vi.resetModules();

    // Reset warning state
    if ((global as any).emailPackageReset) {
      (global as any).emailPackageReset();
    }

    // Clear mocks
    MockResendConstructor.mockClear();
    mockLogger.warn.mockClear();
    mockSafeEnv.mockClear();
  });

  describe('with valid Resend token', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: 're_123456789',
      });
    });

    test('should initialize Resend instance when token is available', async () => {
      const { resend } = await import('../src/index');

      // Reset the package state after import
      (global as any).emailPackageReset?.();

      // Access a property to trigger initialization
      const emails = resend.emails;

      expect(emails).toBe(mockResend.emails);
      expect(MockResendConstructor).toHaveBeenCalledWith('re_123456789');
    });

    test('should reuse same Resend instance on subsequent access', async () => {
      const { resend } = await import('../src/index');

      const emails1 = resend.emails;
      const emails2 = resend.emails;

      expect(emails1).toBe(emails2);
      expect(MockResendConstructor).toHaveBeenCalledTimes(1);
    });

    test('should provide access to Resend methods', async () => {
      const { resend } = await import('../src/index');

      expect(resend.emails).toBe(mockResend.emails);
      expect(resend.emails.send).toBe(mockResend.emails.send);
      expect(resend.emails.create).toBe(mockResend.emails.create);
    });

    test('should support email sending', async () => {
      const { resend } = await import('../src/index');

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
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('without Resend token', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        RESEND_FROM: undefined,
        RESEND_TOKEN: undefined,
      });
    });

    test('should log warning once when token is missing', async () => {
      const { resend } = await import('../src/index');

      // Access a property to trigger the warning
      resend.emails;
      resend.emails; // Second access should not log again

      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Resend email service disabled - Missing RESEND_TOKEN',
      );
    });

    test('should return mock email object when token is missing', async () => {
      const { resend } = await import('../src/index');

      const emails = resend.emails;

      expect(emails).toBeDefined();
      expect(emails.create).toBeDefined();
      expect(emails.send).toBeDefined();
    });

    test('should return mock response for email sending', async () => {
      const { resend } = await import('../src/index');

      const result = await resend.emails.send({
        from: 'test@example.com',
        html: '<p>Test</p>',
        subject: 'Test',
        to: 'recipient@example.com',
      });

      expect(result).toStrictEqual({ data: { id: 'mock-email-id' }, error: null });
    });

    test('should return mock response for email create', async () => {
      const { resend } = await import('../src/index');

      const result = await resend.emails.create({
        from: 'test@example.com',
        html: '<p>Test</p>',
        subject: 'Test',
        to: 'recipient@example.com',
      });

      expect(result).toStrictEqual({ data: { id: 'mock-email-id' }, error: null });
    });

    test('should return undefined for unsupported properties', async () => {
      const { resend } = await import('../src/index');

      const unsupportedProperty = (resend as any).unsupportedProperty;

      expect(unsupportedProperty).toBeUndefined();
    });

    test('should not initialize Resend instance when token is missing', async () => {
      const { resend } = await import('../src/index');

      // Access properties
      resend.emails;

      expect(MockResendConstructor).not.toHaveBeenCalled();
    });
  });

  describe('empty string token', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: '',
      });
    });

    test('should treat empty string as missing token', async () => {
      const { resend } = await import('../src/index');

      resend.emails;

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Resend email service disabled - Missing RESEND_TOKEN',
      );
      expect(MockResendConstructor).not.toHaveBeenCalled();
    });
  });

  describe('proxy behavior', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: 're_123456789',
      });
    });

    test('should lazily initialize Resend instance', async () => {
      const { resend } = await import('../src/index');

      // Resend should not be called until we access a property
      expect(MockResendConstructor).not.toHaveBeenCalled();

      // Access a property to trigger initialization
      resend.emails;

      expect(MockResendConstructor).toHaveBeenCalledWith('re_123456789');
    });

    test('should only initialize Resend once', async () => {
      const { resend } = await import('../src/index');

      // Access multiple properties
      resend.emails;
      resend.emails;
      (resend as any).apiKeys; // Access another property

      expect(MockResendConstructor).toHaveBeenCalledTimes(1);
    });

    test('should forward all property access to Resend instance', async () => {
      const { resend } = await import('../src/index');

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
      mockSafeEnv.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: 're_123456789',
      });
    });

    test('should propagate Resend API errors', async () => {
      const { resend } = await import('../src/index');

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

    test('should handle Resend constructor errors', async () => {
      MockResendConstructor.mockImplementationOnce(() => {
        throw new Error('Invalid token format');
      });

      const { resend } = await import('../src/index');

      expect(() => resend.emails).toThrow('Invalid token format');
    });

    test('should handle keys function errors', async () => {
      mockSafeEnv.mockImplementation(() => {
        throw new Error('Keys configuration error');
      });

      const { resend } = await import('../src/index');

      expect(() => resend.emails).toThrow('Keys configuration error');
    });
  });
});
