/**
 * Example edge runtime testing for Vitest
 * This demonstrates how to test edge runtime code
 */

import { describe, expect } from 'vitest';
import {
  createMockHeaders,
  createMockRequest,
  createMockResponse,
  edgeRuntimeHelpers,
  simulateNetworkDelay,
} from '../setup/edge-runtime';

describe('edge Runtime Examples', () => {
  describe('environment Detection', () => {
    test('should detect edge runtime environment', () => {
      expect(edgeRuntimeHelpers.testEdgeRuntime()).toBeTruthy();
      expect(process.env.NEXT_RUNTIME).toBe('edge');
      expect(process.env.VITEST_EDGE_RUNTIME).toBe('true');
    });

    test('should have Web APIs available', () => {
      expect(edgeRuntimeHelpers.testWebApi('fetch')).toBeTruthy();
      expect(edgeRuntimeHelpers.testWebApi('Request')).toBeTruthy();
      expect(edgeRuntimeHelpers.testWebApi('Response')).toBeTruthy();
      expect(edgeRuntimeHelpers.testWebApi('Headers')).toBeTruthy();
      expect(edgeRuntimeHelpers.testWebApi('URL')).toBeTruthy();
      expect(edgeRuntimeHelpers.testWebApi('URLSearchParams')).toBeTruthy();
    });

    test('should not have Node.js APIs available', () => {
      expect(edgeRuntimeHelpers.testNodeModule('fs')).toBeFalsy();
      expect(edgeRuntimeHelpers.testNodeModule('path')).toBeFalsy();
      expect(edgeRuntimeHelpers.testNodeModule('os')).toBeFalsy();
      expect(edgeRuntimeHelpers.testNodeModule('child_process')).toBeFalsy();
    });
  });

  describe('web API Testing', () => {
    test('should work with fetch', async () => {
      const response = await fetch('https://api.example.com/data');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toStrictEqual({ success: true });
    });

    test('should work with Request and Response', () => {
      const request = createMockRequest('https://example.com/api', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(request.url).toBe('https://example.com/api');
      expect(request.method).toBe('POST');
      expect(request.headers.get('Content-Type')).toBe('application/json');

      const response = createMockResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    test('should work with Headers', () => {
      const headers = createMockHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
      });

      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe('Bearer token123');
      expect(headers.has('Content-Type')).toBeTruthy();
      expect(headers.has('NonExistent')).toBeFalsy();

      headers.set('X-Custom', 'value');
      expect(headers.get('X-Custom')).toBe('value');

      headers.delete('Authorization');
      expect(headers.has('Authorization')).toBeFalsy();
    });

    test('should work with URL and URLSearchParams', () => {
      const url = new URL('https://example.com/api?param1=value1&param2=value2');

      expect(url.hostname).toBe('example.com');
      expect(url.pathname).toBe('/api');
      expect(url.searchParams.get('param1')).toBe('value1');
      expect(url.searchParams.get('param2')).toBe('value2');

      const params = new URLSearchParams('param1=value1&param2=value2');
      expect(params.get('param1')).toBe('value1');
      expect(params.get('param2')).toBe('value2');

      params.append('param3', 'value3');
      expect(params.get('param3')).toBe('value3');
    });
  });

  describe('middleware Testing', () => {
    test('should test middleware function', async () => {
      const middleware = edgeRuntimeHelpers.createMockMiddleware(req => {
        const url = new URL(req.url);

        if (url.pathname === '/protected') {
          const auth = req.headers.get('Authorization');
          if (!auth) {
            return new Response('Unauthorized', { status: 401 });
          }
        }

        return new Response('OK', { status: 200 });
      });

      // Test without auth
      const unauthedRequest = createMockRequest('https://example.com/protected');
      const unauthedResponse = await middleware(unauthedRequest);
      expect(unauthedResponse.status).toBe(401);

      // Test with auth
      const authedRequest = createMockRequest('https://example.com/protected', {
        headers: { Authorization: 'Bearer token123' },
      });
      const authedResponse = await middleware(authedRequest);
      expect(authedResponse.status).toBe(200);
    });

    test('should test request rewriting', async () => {
      const middleware = edgeRuntimeHelpers.createMockMiddleware(req => {
        const url = new URL(req.url);

        if (url.pathname.startsWith('/old-path')) {
          const newUrl = url.toString().replace('/old-path', '/new-path');
          return Response.redirect(newUrl, 301);
        }

        return new Response('OK', { status: 200 });
      });

      const request = createMockRequest('https://example.com/old-path/page');
      const response = await middleware(request);

      expect(response.status).toBe(301);
      expect(response.headers.get('Location')).toBe('https://example.com/new-path/page');
    });

    test('should test geo-location handling', async () => {
      const middleware = edgeRuntimeHelpers.createMockMiddleware(req => {
        const country = req.headers.get('CF-IPCountry') || 'US';

        if (country === 'US') {
          return new Response('Welcome to US site', { status: 200 });
        } else {
          return new Response('Welcome to international site', { status: 200 });
        }
      });

      // Test US request
      const usRequest = createMockRequest('https://example.com/', {
        headers: { 'CF-IPCountry': 'US' },
      });
      const usResponse = await middleware(usRequest);
      const usText = await usResponse.text();
      expect(usText).toBe('Welcome to US site');

      // Test international request
      const intlRequest = createMockRequest('https://example.com/', {
        headers: { 'CF-IPCountry': 'DE' },
      });
      const intlResponse = await middleware(intlRequest);
      const intlText = await intlResponse.text();
      expect(intlText).toBe('Welcome to international site');
    });
  });

  describe('aPI Route Testing', () => {
    test('should test GET API route', async () => {
      const apiRoute = edgeRuntimeHelpers.createMockApiRoute(req => {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
          return new Response('Missing ID', { status: 400 });
        }

        return Response.json({ id, name: `User ${id}` });
      });

      const request = createMockRequest('https://example.com/api/users?id=123');
      const response = await apiRoute(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toStrictEqual({ id: '123', name: 'User 123' });
    });

    test('should test POST API route', async () => {
      const apiRoute = edgeRuntimeHelpers.createMockApiRoute(async req => {
        if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }

        const body = await req.json();

        if (!body.name) {
          return new Response('Missing name', { status: 400 });
        }

        return Response.json({
          id: Math.random().toString(36).substring(7),
          name: body.name,
          created: new Date().toISOString(),
        });
      });

      const request = createMockRequest('https://example.com/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe' }),
      });

      const response = await apiRoute(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('John Doe');
      expect(data).toHaveProperty('created');
    });

    test('should test API route with validation', async () => {
      const apiRoute = edgeRuntimeHelpers.createMockApiRoute(async req => {
        const body = await req.json();

        // Simple validation
        if (!body.email || !body.email.includes('@')) {
          return new Response('Invalid email', { status: 400 });
        }

        if (!body.name || body.name.length < 2) {
          return new Response('Name must be at least 2 characters', { status: 400 });
        }

        return Response.json({ success: true, user: body });
      });

      // Test invalid email
      const invalidEmailRequest = createMockRequest('https://example.com/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email', name: 'John' }),
      });

      const invalidEmailResponse = await apiRoute(invalidEmailRequest);
      expect(invalidEmailResponse.status).toBe(400);

      // Test invalid name
      const invalidNameRequest = createMockRequest('https://example.com/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'john@example.com', name: 'J' }),
      });

      const invalidNameResponse = await apiRoute(invalidNameRequest);
      expect(invalidNameResponse.status).toBe(400);

      // Test valid request
      const validRequest = createMockRequest('https://example.com/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'john@example.com', name: 'John Doe' }),
      });

      const validResponse = await apiRoute(validRequest);
      expect(validResponse.status).toBe(200);

      const data = await validResponse.json();
      expect(data.success).toBeTruthy();
      expect(data.user.email).toBe('john@example.com');
    });
  });

  describe('edge Function Testing', () => {
    test('should test edge function with external API', async () => {
      const edgeFunction = edgeRuntimeHelpers.createMockEdgeFunction(async req => {
        await simulateNetworkDelay(100); // Simulate API call delay

        const url = new URL(req.url);
        const query = url.searchParams.get('q');

        if (!query) {
          return new Response('Missing query parameter', { status: 400 });
        }

        // Mock external API response
        const mockApiResponse = {
          query,
          results: [
            { id: 1, title: `Result 1 for ${query}` },
            { id: 2, title: `Result 2 for ${query}` },
          ],
        };

        return Response.json(mockApiResponse);
      });

      const request = createMockRequest('https://example.com/search?q=test');
      const response = await edgeFunction(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.query).toBe('test');
      expect(data.results).toHaveLength(2);
      expect(data.results[0].title).toBe('Result 1 for test');
    });

    test('should test edge function with caching', async () => {
      const cache = new Map();

      const edgeFunction = edgeRuntimeHelpers.createMockEdgeFunction(async req => {
        const url = new URL(req.url);
        const cacheKey = url.pathname + url.search;

        // Check cache
        if (cache.has(cacheKey)) {
          return new Response(cache.get(cacheKey), {
            status: 200,
            headers: { 'X-Cache': 'HIT' },
          });
        }

        // Simulate expensive operation
        await simulateNetworkDelay(200);

        const result = JSON.stringify({
          data: 'expensive computation result',
          timestamp: new Date().toISOString(),
        });

        // Store in cache
        cache.set(cacheKey, result);

        return new Response(result, {
          status: 200,
          headers: { 'X-Cache': 'MISS' },
        });
      });

      const request = createMockRequest('https://example.com/expensive-operation');

      // First request - cache miss
      const firstResponse = await edgeFunction(request);
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.headers.get('X-Cache')).toBe('MISS');

      // Second request - cache hit
      const secondResponse = await edgeFunction(request);
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.headers.get('X-Cache')).toBe('HIT');

      // Verify same data
      const firstData = await firstResponse.json();
      const secondData = await secondResponse.json();
      expect(firstData).toStrictEqual(secondData);
    });
  });

  describe('buffer and Stream Testing', () => {
    test('should work with Buffer polyfill', () => {
      const buffer = Buffer.from('hello world');
      expect(Buffer.isBuffer(buffer)).toBeTruthy();

      const string = buffer.toString();
      expect(string).toBe('hello world');
    });

    test('should work with ReadableStream', async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue('chunk 1');
          controller.enqueue('chunk 2');
          controller.close();
        },
      });

      const reader = stream.getReader();
      const chunks = [];

      let result = await reader.read();
      while (!result.done) {
        chunks.push(result.value);
        result = await reader.read();
      }

      expect(chunks).toStrictEqual(['chunk 1', 'chunk 2']);
    });

    test('should work with WritableStream', async () => {
      const chunks: string[] = [];

      const stream = new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
      });

      const writer = stream.getWriter();
      await writer.write('chunk 1');
      await writer.write('chunk 2');
      await writer.close();

      expect(chunks).toStrictEqual(['chunk 1', 'chunk 2']);
    });
  });

  describe('error Handling', () => {
    test('should handle Node.js module imports gracefully', async () => {
      const edgeFunction = edgeRuntimeHelpers.createMockEdgeFunction(async req => {
        try {
          // This should throw an error in edge runtime
          const fs = await import('fs');
          return new Response('Should not reach here', { status: 500 });
        } catch (error) {
          return new Response('Node.js modules not available', { status: 501 });
        }
      });

      const request = createMockRequest('https://example.com/test');
      const response = await edgeFunction(request);

      expect(response.status).toBe(501);

      const text = await response.text();
      expect(text).toBe('Node.js modules not available');
    });

    test('should handle edge runtime limitations', async () => {
      const edgeFunction = edgeRuntimeHelpers.createMockEdgeFunction(async req => {
        // Test limitations
        const limitations = [];

        if (typeof require === 'undefined') {
          limitations.push('require not available');
        }

        if (typeof __dirname === 'undefined') {
          limitations.push('__dirname not available');
        }

        if (typeof process === 'undefined' || !process.version) {
          limitations.push('limited process object');
        }

        return Response.json({
          runtime: 'edge',
          limitations,
        });
      });

      const request = createMockRequest('https://example.com/limitations');
      const response = await edgeFunction(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.runtime).toBe('edge');
      expect(data.limitations).toContain('require not available');
    });
  });
});
