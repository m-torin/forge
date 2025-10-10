import { shuffleArray } from '@/utils/shuffleArray';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('shuffleArray', () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mathRandomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  test('should return empty array when given empty array', () => {
    const result = shuffleArray([]);
    expect(result).toStrictEqual([]);
  });

  test('should return single-item array unchanged', () => {
    const array = ['single'];
    const result = shuffleArray(array);
    expect(result).toStrictEqual(['single']);
  });

  test('should not modify the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];

    shuffleArray(original);

    expect(original).toStrictEqual(originalCopy);
  });

  test('should return array with same elements', () => {
    const array = [1, 2, 3, 4, 5];
    const result = shuffleArray(array);

    expect(result).toHaveLength(array.length);
    expect(result.sort()).toStrictEqual(array.sort());
  });

  test('should shuffle array predictably with mocked random', () => {
    // Mock random to always return 0
    mathRandomSpy.mockReturnValue(0);

    const array = [1, 2, 3, 4, 5];
    const result = shuffleArray(array);

    // With Math.random always returning 0, elements will always swap with index 0
    expect(result).not.toStrictEqual([1, 2, 3, 4, 5]);
  });

  test('should handle array of objects', () => {
    const array = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ];

    const result = shuffleArray(array);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ id: 1, name: 'a' });
    expect(result).toContainEqual({ id: 2, name: 'b' });
    expect(result).toContainEqual({ id: 3, name: 'c' });
  });

  test('should handle array with duplicate values', () => {
    const array = [1, 2, 2, 3, 3, 3];
    const result = shuffleArray(array);

    expect(result).toHaveLength(6);
    expect(result.filter(x => x === 1)).toHaveLength(1);
    expect(result.filter(x => x === 2)).toHaveLength(2);
    expect(result.filter(x => x === 3)).toHaveLength(3);
  });

  test('should handle array with different types', () => {
    const array = [1, 'two', { three: 3 }, [4], null, undefined];
    const result = shuffleArray(array);

    expect(result).toHaveLength(6);
    expect(result).toContain(1);
    expect(result).toContain('two');
    expect(result).toContainEqual({ three: 3 });
    expect(result).toContainEqual([4]);
    expect(result).toContain(null);
    expect(result).toContain(undefined);
  });

  test('should produce different shuffles with different random values', () => {
    const array = [1, 2, 3, 4, 5];

    // First shuffle with specific random sequence
    mathRandomSpy
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.3);

    const result1 = shuffleArray(array);

    // Reset mock and shuffle again with different sequence
    mathRandomSpy.mockReset();
    mathRandomSpy
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.7);

    const result2 = shuffleArray(array);

    // Results should be different (with high probability)
    expect(result1).not.toStrictEqual(result2);
  });

  test('should handle large arrays', () => {
    const largeArray = Array.from({ length: 100 }, (_, i) => i);
    const result = shuffleArray(largeArray);

    expect(result).toHaveLength(100);
    expect(result.sort((a, b) => a - b)).toStrictEqual(largeArray);
  });

  test('should perform Fisher-Yates shuffle correctly', () => {
    // Test the algorithm with predictable random values
    const array = ['a', 'b', 'c', 'd'];

    // Mock random to return values that will swap specific elements
    mathRandomSpy
      .mockReturnValueOnce(0.99) // Will select index 3 (last element)
      .mockReturnValueOnce(0.66) // Will select index 2
      .mockReturnValueOnce(0.33); // Will select index 1

    const result = shuffleArray(array);

    // Verify that the array was shuffled
    expect(result).toHaveLength(4);
    expect(result).not.toStrictEqual(['a', 'b', 'c', 'd']);
  });

  test('should handle two-element array', () => {
    const array = ['first', 'second'];

    // Force a swap
    mathRandomSpy.mockReturnValue(0);

    const result = shuffleArray(array);
    expect(result).toStrictEqual(['second', 'first']);
  });

  test('should preserve array structure for nested arrays', () => {
    const array = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const result = shuffleArray(array);

    expect(result).toHaveLength(3);
    expect(result.flat().sort()).toStrictEqual([1, 2, 3, 4, 5, 6]);
  });
});
