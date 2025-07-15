import { describe, expect, it } from 'vitest';
import { testFunction } from './test-minimal-coverage';

describe('Minimal test', () => {
  it('should test only one function', () => {
    expect(testFunction()).toBe(true);
  });
});
