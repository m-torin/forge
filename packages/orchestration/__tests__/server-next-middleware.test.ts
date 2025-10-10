import '@repo/qa/vitest/setup/next-app';
import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, vi } from 'vitest';
import { createWorkflowMiddleware } from '../src/server-next';

describe('createWorkflowMiddleware', () => {
  const mockProvider = {
    name: 'test-provider',
    healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
    execute: vi.fn(),
    getExecution: vi.fn(),
    cancelExecution: vi.fn(),
    listExecutions: vi.fn(),
    scheduleWorkflow: vi.fn(),
    unscheduleWorkflow: vi.fn(),
  };

  test('should pass through non-workflow routes without rate limiting', async () => {
    const middleware = await createWorkflowMiddleware({
      provider: mockProvider,
    });

    const request = new NextRequest(new URL('http://localhost/api/other'));
    const result = await middleware.middleware(request);

    expect(result).toBeUndefined(); // Should return undefined to pass through
  });

  test('should pass through workflow routes when rate limiting is disabled', async () => {
    const middleware = await createWorkflowMiddleware({
      provider: mockProvider,
      // No rateLimit config = disabled
    });

    const request = new NextRequest(new URL('http://localhost/api/workflows/test'));
    const result = await middleware.middleware(request);

    expect(result).toBeUndefined(); // Should return undefined to pass through
  });

  test('should apply rate limiting and pass through with headers when under limit', async () => {
    // Mock the rate limiter to return success
    const mockRateLimiter = {
      limit: vi.fn().mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      }),
    };

    // Mock the createRateLimiter function
    vi.doMock('../src/shared/utils/rate-limit', () => ({
      createRateLimiter: vi.fn().mockReturnValue(mockRateLimiter),
      createRateLimitHeaders: vi.fn().mockReturnValue({
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '9',
        'X-RateLimit-Reset': String(Date.now() + 60000),
      }),
    }));

    const middleware = await createWorkflowMiddleware({
      provider: mockProvider,
      rateLimit: {
        maxRequests: 10,
        windowMs: 60000,
      },
    });

    const request = new NextRequest(new URL('http://localhost/api/workflows/test'));
    const result = await middleware.middleware(request);

    expect(result).toBeInstanceOf(NextResponse);

    // Verify it's a NextResponse.next() call (not a regular response)
    const response = result as NextResponse;
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('9');
  });

  test('should block requests when rate limit is exceeded', async () => {
    const mockRateLimiter = {
      limit: vi.fn().mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
        reason: 'Rate limit exceeded',
      }),
    };

    vi.doMock('../src/shared/utils/rate-limit', () => ({
      createRateLimiter: vi.fn().mockReturnValue(mockRateLimiter),
      createRateLimitHeaders: vi.fn().mockReturnValue({
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Date.now() + 60000),
      }),
    }));

    const middleware = await createWorkflowMiddleware({
      provider: mockProvider,
      rateLimit: {
        maxRequests: 10,
        windowMs: 60000,
      },
    });

    const request = new NextRequest(new URL('http://localhost/api/workflows/test'));
    const result = await middleware.middleware(request);

    expect(result).toBeInstanceOf(NextResponse);

    const response = result as NextResponse;
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.error).toBe('Too many requests');
  });
});
