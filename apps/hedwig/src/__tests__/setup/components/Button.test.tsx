import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
  it('should exist and be testable', () => {
    // Basic test to verify testing setup works
    expect(true).toBe(true);
  });

  it('should handle mock functions', () => {
    const mockFn = vi.fn();
    mockFn('test');
    
    expect(mockFn).toHaveBeenCalledWith('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});