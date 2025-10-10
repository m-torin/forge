/**
 * Tests for stringify utilities
 */
import { beforeEach, describe, expect } from 'vitest';
import { SafeStringifier, safeStringify } from '../../src/utils/stringify';

describe('safeStringify', () => {
  test('should stringify simple objects', () => {
    const obj = { hello: 'world', number: 42 };
    const result = safeStringify(obj);
    expect(result).toBe('{"hello":"world","number":42}');
  });

  test('should handle null and undefined', () => {
    expect(safeStringify(null)).toBe('null');
    expect(safeStringify(undefined)).toBe('"[undefined]"');
  });

  test('should handle primitives', () => {
    expect(safeStringify('hello')).toBe('"hello"');
    expect(safeStringify(42)).toBe('42');
    expect(safeStringify(true)).toBe('true');
    expect(safeStringify(false)).toBe('false');
  });

  test('should handle arrays', () => {
    const arr = [1, 2, 3, 'hello'];
    const result = safeStringify(arr);
    expect(result).toBe('[1,2,3,"hello"]');
  });

  test('should handle circular references', () => {
    const obj: any = { name: 'test' };
    obj.self = obj;

    const result = safeStringify(obj);
    expect(result).toContain('"name":"test"');
    expect(result).toContain('[Circular');
  });

  test.todo('should respect maxLength option');

  test('should handle Date objects', () => {
    const date = new Date('2023-01-01T00:00:00.000Z');
    const result = safeStringify(date);
    expect(result).toContain('2023-01-01');
  });

  test.todo('should handle RegExp objects');

  test.todo('should handle Error objects');

  test.todo('should handle functions');

  test('should handle nested objects', () => {
    const nested = {
      level1: {
        level2: {
          level3: 'deep value',
        },
      },
    };
    const result = safeStringify(nested);
    expect(result).toContain('deep value');
  });
});

describe.todo('safeStringifyAdvanced');

describe('safeStringifier class', () => {
  let stringifier: SafeStringifier;

  beforeEach(() => {
    stringifier = new SafeStringifier({
      maxLength: 1000,
      maxDepth: 10,
      prettify: false,
    });
  });

  test('should create with default options', () => {
    const defaultStringifier = new SafeStringifier();
    expect(defaultStringifier).toBeInstanceOf(SafeStringifier);
  });

  test('should stringify with custom options', () => {
    const obj = { test: 'value' };
    const result = stringifier.stringify(obj);
    expect(result.result).toBe('{"test":"value"}');
  });

  test('should handle complex nested structures', () => {
    const complex = {
      string: 'text',
      number: 42,
      boolean: true,
      null: null,
      undefined: undefined,
      array: [1, 2, 3],
      nested: {
        deep: {
          value: 'found',
        },
      },
      date: new Date('2023-01-01'),
      regex: /test/g,
    };

    const result = stringifier.stringify(complex);
    expect(result.result).toContain('text');
    expect(result.result).toContain('42');
    expect(result.result).toContain('true');
    expect(result.result).toContain('found');
  });

  test('should respect maxDepth setting', () => {
    const shallowStringifier = new SafeStringifier({ maxDepth: 2 });

    const deep = {
      level1: {
        level2: {
          level3: {
            level4: 'too deep',
          },
        },
      },
    };

    const result = shallowStringifier.stringify(deep);
    expect(result.result).not.toContain('too deep');
    expect(result.result).toContain('[Max Depth');
  });

  test('should handle WeakMap and WeakSet', () => {
    const obj = {
      weakMap: new WeakMap(),
      weakSet: new WeakSet(),
    };

    const result = stringifier.stringify(obj);
    expect(result.result).toContain('WeakMap');
    expect(result.result).toContain('WeakSet');
  });

  test('should handle Map and Set', () => {
    const map = new Map([['key', 'value']]);
    const set = new Set([1, 2, 3]);

    const obj = { map, set };
    const result = stringifier.stringify(obj);

    expect(result.result).toContain('key');
    expect(result.result).toContain('value');
    expect(result.result).toContain('[1,2,3]');
  });

  test('should handle symbols', () => {
    const sym = Symbol('test');
    const obj = { [sym]: 'symbol value', regular: 'regular value' };

    const result = stringifier.stringify(obj);
    expect(result.result).toContain('regular value');
    expect(result.result).toContain('Symbol(test)');
  });

  test('should handle Buffer objects', () => {
    const buffer = Buffer.from('hello world', 'utf8');
    const result = stringifier.stringify(buffer);

    expect(result.result).toContain('Buffer');
    expect(result.result).toContain('hello world');
  });
});
