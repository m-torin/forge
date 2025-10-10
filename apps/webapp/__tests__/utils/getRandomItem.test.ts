import { getRandomItem } from '@/utils/getRandomItem';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('getRandomItem', () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mathRandomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  test('should return undefined for empty array', () => {
    const result = getRandomItem([]);
    expect(result).toBeUndefined();
  });

  test('should return the only item in single-item array', () => {
    const array = ['single'];
    const result = getRandomItem(array);
    expect(result).toBe('single');
  });

  test('should return first item when Math.random returns 0', () => {
    mathRandomSpy.mockReturnValue(0);
    const array = ['first', 'second', 'third'];
    const result = getRandomItem(array);
    expect(result).toBe('first');
  });

  test('should return last item when Math.random returns close to 1', () => {
    mathRandomSpy.mockReturnValue(0.99999);
    const array = ['first', 'second', 'third'];
    const result = getRandomItem(array);
    expect(result).toBe('third');
  });

  test('should return middle item when Math.random returns 0.5', () => {
    mathRandomSpy.mockReturnValue(0.5);
    const array = ['first', 'second', 'third', 'fourth'];
    const result = getRandomItem(array);
    expect(result).toBe('third');
  });

  test('should work with different data types', () => {
    mathRandomSpy.mockReturnValue(0.3);

    // Numbers
    const numbers = [1, 2, 3, 4, 5];
    const numberResult = getRandomItem(numbers);
    expect(numberResult).toBe(2);

    // Objects
    const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const objectResult = getRandomItem(objects);
    expect(objectResult).toStrictEqual({ id: 1 });

    // Mixed types
    const mixed = [1, 'two', { three: 3 }, [4]];
    const mixedResult = getRandomItem(mixed);
    expect(mixedResult).toBe('two');
  });

  test('should work with boolean array', () => {
    mathRandomSpy.mockReturnValue(0.6);
    const booleans = [true, false, true];
    const result = getRandomItem(booleans);
    expect(result).toBeFalsy();
  });

  test('should work with null and undefined values', () => {
    mathRandomSpy.mockReturnValue(0.25);
    const array = [null, undefined, 'value', null];
    const result = getRandomItem(array);
    expect(result).toBeUndefined();
  });

  test('should return items from all positions over multiple calls', () => {
    const array = ['a', 'b', 'c', 'd'];
    const results = new Set();

    // Mock different random values
    const randomValues = [0, 0.25, 0.5, 0.75, 0.99];
    let callCount = 0;

    mathRandomSpy.mockImplementation(() => {
      const value = randomValues[callCount % randomValues.length];
      callCount++;
      return value;
    });

    // Get random items multiple times
    for (let i = 0; i < 10; i++) {
      results.add(getRandomItem(array));
    }

    // Should have selected multiple different items
    expect(results.size).toBeGreaterThan(1);
  });

  test('should preserve original array', () => {
    const originalArray = [1, 2, 3, 4, 5];
    const arrayCopy = [...originalArray];

    getRandomItem(originalArray);

    expect(originalArray).toStrictEqual(arrayCopy);
    expect(originalArray).toHaveLength(5);
  });

  test('should handle large arrays', () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => i);
    mathRandomSpy.mockReturnValue(0.567);

    const result = getRandomItem(largeArray);
    expect(result).toBe(567);
  });
});
