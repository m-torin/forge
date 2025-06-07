import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment variables
const mockCreateEnv = vi.fn();
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: mockCreateEnv,
}));

describe('Email Keys Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = 'noreply@example.com';
      process.env.RESEND_TOKEN = 're_123456789';
    });

    it('should require valid Resend keys in production', async () => {
      mockCreateEnv.mockReturnValue({
        RESEND_FROM: 'noreply@example.com',
        RESEND_TOKEN: 're_123456789',
      });

      const { keys } = await import('../keys');
      const result = keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          RESEND_FROM: 'noreply@example.com',
          RESEND_TOKEN: 're_123456789',
        },
        server: {
          RESEND_FROM: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodString',
            }),
          }),
          RESEND_TOKEN: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodString',
            }),
          }),
        },
      });

      expect(result.RESEND_FROM).toBe('noreply@example.com');
      expect(result.RESEND_TOKEN).toBe('re_123456789');
    });

    it('should validate email format for RESEND_FROM in production', async () => {
      const { keys } = await import('../keys');

      // The actual validation happens in @t3-oss/env-nextjs
      // We just verify our schema configuration is correct
      keys();

      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_FROM).toBeDefined();

      // Check that it's an email validation schema
      const fromSchema = call.server.RESEND_FROM;
      expect(fromSchema._def.checks).toEqual(
        expect.arrayContaining([expect.objectContaining({ kind: 'email' })]),
      );
    });

    it('should validate token format for RESEND_TOKEN in production', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_TOKEN).toBeDefined();

      // Check that it validates startsWith 're_'
      const tokenSchema = call.server.RESEND_TOKEN;
      expect(tokenSchema._def.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'startsWith',
            value: 're_',
          }),
        ]),
      );
    });
  });

  describe('development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.RESEND_FROM = 'dev@example.com';
      process.env.RESEND_TOKEN = 're_dev_123456789';
    });

    it('should make keys optional in development', async () => {
      mockCreateEnv.mockReturnValue({
        RESEND_FROM: 'dev@example.com',
        RESEND_TOKEN: 're_dev_123456789',
      });

      const { keys } = await import('../keys');
      const result = keys();

      expect(result.RESEND_FROM).toBe('dev@example.com');
      expect(result.RESEND_TOKEN).toBe('re_dev_123456789');
    });

    it('should handle missing keys in development', async () => {
      process.env.RESEND_FROM = undefined;
      process.env.RESEND_TOKEN = undefined;

      mockCreateEnv.mockReturnValue({
        RESEND_FROM: undefined,
        RESEND_TOKEN: undefined,
      });

      const { keys } = await import('../keys');
      const result = keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          RESEND_FROM: undefined,
          RESEND_TOKEN: undefined,
        },
        server: {
          RESEND_FROM: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
          RESEND_TOKEN: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
      });

      expect(result.RESEND_FROM).toBeUndefined();
      expect(result.RESEND_TOKEN).toBeUndefined();
    });
  });

  describe('production with missing required env vars', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      // Missing required env vars
      process.env.RESEND_FROM = undefined;
      process.env.RESEND_TOKEN = undefined;
    });

    it('should make keys optional when env vars are missing in production', async () => {
      mockCreateEnv.mockReturnValue({
        RESEND_FROM: undefined,
        RESEND_TOKEN: undefined,
      });

      const { keys } = await import('../keys');
      const result = keys();

      // When hasRequiredEnvVars is false, keys become optional even in production
      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          RESEND_FROM: undefined,
          RESEND_TOKEN: undefined,
        },
        server: {
          RESEND_FROM: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
          RESEND_TOKEN: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
      });

      expect(result.RESEND_FROM).toBeUndefined();
      expect(result.RESEND_TOKEN).toBeUndefined();
    });
  });

  describe('environment variable validation', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = 'test@example.com';
      process.env.RESEND_TOKEN = 're_test_123456789';
    });

    it('should validate email format', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];
      const fromSchema = call.server.RESEND_FROM;

      // The schema should validate email format
      expect(fromSchema._def.checks).toEqual(
        expect.arrayContaining([expect.objectContaining({ kind: 'email' })]),
      );
    });

    it('should validate token prefix', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];
      const tokenSchema = call.server.RESEND_TOKEN;

      // The schema should validate that the token starts with 're_'
      expect(tokenSchema._def.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'startsWith',
            value: 're_',
          }),
        ]),
      );
    });
  });

  describe('runtime environment mapping', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.RESEND_FROM = 'test@example.com';
      process.env.RESEND_TOKEN = 're_test_123456789';
    });

    it('should map environment variables correctly', async () => {
      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          RESEND_FROM: 'test@example.com',
          RESEND_TOKEN: 're_test_123456789',
        },
        server: expect.any(Object),
      });
    });

    it('should handle undefined environment variables', async () => {
      process.env.RESEND_FROM = undefined;
      process.env.RESEND_TOKEN = undefined;

      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          RESEND_FROM: undefined,
          RESEND_TOKEN: undefined,
        },
        server: expect.any(Object),
      });
    });

    it('should handle empty string environment variables', async () => {
      process.env.RESEND_FROM = '';
      process.env.RESEND_TOKEN = '';

      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          RESEND_FROM: undefined,
          RESEND_TOKEN: undefined,
        },
        server: expect.any(Object),
      });
    });
  });

  describe('configuration logic', () => {
    it('should determine requireInProduction correctly for production with keys', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = 'prod@example.com';
      process.env.RESEND_TOKEN = 're_prod_123';

      const { keys } = await import('../keys');
      keys();

      // Should require keys in production when they exist
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_FROM._def.typeName).not.toBe('ZodOptional');
      expect(call.server.RESEND_TOKEN._def.typeName).not.toBe('ZodOptional');
    });

    it('should determine requireInProduction correctly for production without keys', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = undefined;
      process.env.RESEND_TOKEN = undefined;

      const { keys } = await import('../keys');
      keys();

      // Should make keys optional in production when they don't exist
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_FROM._def.typeName).toBe('ZodOptional');
      expect(call.server.RESEND_TOKEN._def.typeName).toBe('ZodOptional');
    });

    it('should determine requireInProduction correctly for development', async () => {
      process.env.NODE_ENV = 'development';
      process.env.RESEND_FROM = 'dev@example.com';
      process.env.RESEND_TOKEN = 're_dev_123';

      const { keys } = await import('../keys');
      keys();

      // Should make keys optional in development regardless of existence
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_FROM._def.typeName).toBe('ZodOptional');
      expect(call.server.RESEND_TOKEN._def.typeName).toBe('ZodOptional');
    });

    it('should handle partial env vars correctly', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = 'test@example.com';
      process.env.RESEND_TOKEN = undefined; // Missing one required var

      const { keys } = await import('../keys');
      keys();

      // Should make keys optional when not all are present
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_FROM._def.typeName).toBe('ZodOptional');
      expect(call.server.RESEND_TOKEN._def.typeName).toBe('ZodOptional');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = 'test@example.com';
      process.env.RESEND_TOKEN = 're_test_123456789';
    });

    it('should propagate createEnv errors', async () => {
      const error = new Error('Invalid environment configuration');
      mockCreateEnv.mockImplementation(() => {
        throw error;
      });

      const { keys } = await import('../keys');

      expect(() => keys()).toThrow('Invalid environment configuration');
    });
  });

  describe('function invocation', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.RESEND_FROM = 'test@example.com';
      process.env.RESEND_TOKEN = 're_test_123456789';

      mockCreateEnv.mockReturnValue({
        RESEND_FROM: 'test@example.com',
        RESEND_TOKEN: 're_test_123456789',
      });
    });

    it('should return a function', async () => {
      const { keys } = await import('../keys');
      expect(typeof keys).toBe('function');
    });

    it('should call createEnv when invoked', async () => {
      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledTimes(1);
    });

    it('should return the result from createEnv', async () => {
      const expectedResult = {
        RESEND_FROM: 'test@example.com',
        RESEND_TOKEN: 're_test_123456789',
      };

      mockCreateEnv.mockReturnValue(expectedResult);

      const { keys } = await import('../keys');
      const result = keys();

      expect(result).toEqual(expectedResult);
    });

    it('should call createEnv every time invoked', async () => {
      const { keys } = await import('../keys');

      keys();
      keys();
      keys();

      expect(mockCreateEnv).toHaveBeenCalledTimes(3);
    });
  });

  describe('hasRequiredEnvVars logic', () => {
    it('should detect when both env vars are present', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = 'test@example.com';
      process.env.RESEND_TOKEN = 're_test_123';

      const { keys } = await import('../keys');
      keys();

      // Both present = requireInProduction = true = not optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_FROM._def.typeName).not.toBe('ZodOptional');
    });

    it('should detect when one env var is missing', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = 'test@example.com';
      process.env.RESEND_TOKEN = undefined;

      const { keys } = await import('../keys');
      keys();

      // One missing = requireInProduction = false = optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_FROM._def.typeName).toBe('ZodOptional');
    });

    it('should detect when both env vars are missing', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_FROM = undefined;
      process.env.RESEND_TOKEN = undefined;

      const { keys } = await import('../keys');
      keys();

      // Both missing = requireInProduction = false = optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.RESEND_FROM._def.typeName).toBe('ZodOptional');
      expect(call.server.RESEND_TOKEN._def.typeName).toBe('ZodOptional');
    });
  });
});
