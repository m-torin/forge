/**
 * Tests for shared header utilities
 */

import { describe, expect } from 'vitest';

describe('header utilities', () => {
  describe('createApiKeyHeaders', () => {
    test('should create headers with API key authorization', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const apiKey = 'test-api-key-123';
      const headers = headersModule.createApiKeyHeaders(apiKey);

      expect(headers).toStrictEqual({
        Authorization: 'Bearer test-api-key-123',
        'Content-Type': 'application/json',
      });
    });

    test('should handle empty API key', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const headers = headersModule.createApiKeyHeaders('');

      expect(headers).toStrictEqual({
        Authorization: 'Bearer ',
        'Content-Type': 'application/json',
      });
    });

    test('should handle API key with special characters', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const apiKey = 'test-key_with.special-chars123';
      const headers = headersModule.createApiKeyHeaders(apiKey);

      expect(headers).toStrictEqual({
        Authorization: 'Bearer test-key_with.special-chars123',
        'Content-Type': 'application/json',
      });
    });

    test('should handle long API key', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const apiKey = 'a'.repeat(100);
      const headers = headersModule.createApiKeyHeaders(apiKey);

      expect(headers).toStrictEqual({
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      });
    });
  });

  describe('createBearerHeaders', () => {
    test('should create headers with bearer token authorization', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const token = 'jwt-token-abc123';
      const headers = headersModule.createBearerHeaders(token);

      expect(headers).toStrictEqual({
        Authorization: 'Bearer jwt-token-abc123',
        'Content-Type': 'application/json',
      });
    });

    test('should handle empty token', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const headers = headersModule.createBearerHeaders('');

      expect(headers).toStrictEqual({
        Authorization: 'Bearer ',
        'Content-Type': 'application/json',
      });
    });

    test('should handle JWT token format', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const headers = headersModule.createBearerHeaders(token);

      expect(headers).toStrictEqual({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
    });

    test('should handle numeric token', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const token = '123456789';
      const headers = headersModule.createBearerHeaders(token);

      expect(headers).toStrictEqual({
        Authorization: 'Bearer 123456789',
        'Content-Type': 'application/json',
      });
    });

    test('should handle token with spaces', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const token = 'token with spaces';
      const headers = headersModule.createBearerHeaders(token);

      expect(headers).toStrictEqual({
        Authorization: 'Bearer token with spaces',
        'Content-Type': 'application/json',
      });
    });
  });

  describe('createJsonHeaders', () => {
    test('should create basic JSON headers', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const headers = headersModule.createJsonHeaders();

      expect(headers).toStrictEqual({
        'Content-Type': 'application/json',
      });
    });

    test('should always return the same headers object structure', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const headers1 = headersModule.createJsonHeaders();
      const headers2 = headersModule.createJsonHeaders();

      expect(headers1).toStrictEqual(headers2);
      expect(headers1).toStrictEqual({
        'Content-Type': 'application/json',
      });
    });

    test('should be compatible with Headers constructor', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const headers = headersModule.createJsonHeaders();
      const webHeaders = new Headers(headers);

      expect(webHeaders.get('Content-Type')).toBe('application/json');
    });

    test('should be compatible with fetch requests', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const headers = headersModule.createJsonHeaders();

      // This would be used like: fetch(url, { headers })
      expect((headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });
  });

  describe('header utility integration', () => {
    test('should create distinct header objects', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const apiHeaders = headersModule.createApiKeyHeaders('api-key');
      const bearerHeaders = headersModule.createBearerHeaders('bearer-token');
      const jsonHeaders = headersModule.createJsonHeaders();

      expect((apiHeaders as Record<string, string>).Authorization).toBe('Bearer api-key');
      expect((bearerHeaders as Record<string, string>).Authorization).toBe('Bearer bearer-token');
      expect((jsonHeaders as Record<string, string>).Authorization).toBeUndefined();

      // All should have JSON content type
      expect((apiHeaders as Record<string, string>)['Content-Type']).toBe('application/json');
      expect((bearerHeaders as Record<string, string>)['Content-Type']).toBe('application/json');
      expect((jsonHeaders as Record<string, string>)['Content-Type']).toBe('application/json');
    });

    test('should be compatible with modern fetch API', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const headers = headersModule.createBearerHeaders('test-token');

      // Verify the headers work with fetch
      const request = new Request('http://example.com', {
        method: 'POST',
        headers,
        body: JSON.stringify({ test: true }),
      });

      expect(request.headers.get('Authorization')).toBe('Bearer test-token');
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    test('should handle header merging', async () => {
      const headersModule = await import('../../src/shared/utils/headers');

      const baseHeaders = headersModule.createJsonHeaders();
      const customHeaders = {
        ...baseHeaders,
        'X-Custom-Header': 'custom-value',
        'X-Request-ID': 'req-123',
      };

      expect(customHeaders).toStrictEqual({
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
        'X-Request-ID': 'req-123',
      });
    });
  });
});
