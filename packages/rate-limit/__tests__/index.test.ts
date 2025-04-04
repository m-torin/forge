import { describe, expect, it, vi } from 'vitest';
import { redis, createRateLimiter, slidingWindow } from '../index';

// Simple tests that verify exports exist
describe('Rate Limit Package', () => {
  it('exports a redis client', () => {
    expect(redis).toBeDefined();
  });

  it('exports createRateLimiter function', () => {
    expect(createRateLimiter).toBeDefined();
    expect(typeof createRateLimiter).toBe('function');
  });

  it('exports slidingWindow function', () => {
    expect(slidingWindow).toBeDefined();
    expect(typeof slidingWindow).toBe('function');
  });
});
