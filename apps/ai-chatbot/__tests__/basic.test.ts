import { describe, expect, test } from 'vitest';

describe('basic Test', () => {
  test('should pass basic test', () => {
    expect(true).toBeTruthy();
  });

  test('should handle basic math', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle strings', () => {
    expect('hello').toBe('hello');
  });
});
