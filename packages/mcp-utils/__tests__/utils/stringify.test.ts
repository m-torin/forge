/**
 * Tests for stringify utilities
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { safeStringify, safeStringifyAdvanced, SafeStringifier } from '../../src/utils/stringify';

describe('safeStringify', () => {
  it('should stringify simple objects', () => {
    const obj = { hello: 'world', number: 42 };
    const result = safeStringify(obj);
    expect(result).toBe('{"hello":"world","number":42}');
  });

  it('should handle null and undefined', () => {
    expect(safeStringify(null)).toBe('null');
    expect(safeStringify(undefined)).toBe('"[undefined]"');
  });

  it('should handle primitives', () => {
    expect(safeStringify('hello')).toBe('"hello"');
    expect(safeStringify(42)).toBe('42');
    expect(safeStringify(true)).toBe('true');
    expect(safeStringify(false)).toBe('false');
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3, 'hello'];
    const result = safeStringify(arr);
    expect(result).toBe('[1,2,3,"hello"]');
  });

  it('should handle circular references', () => {
    const obj: any = { name: 'test' };
    obj.self = obj;
    
    const result = safeStringify(obj);
    expect(result).toContain('"name":"test"');
    expect(result).toContain('[Circular');
  });

  it('should respect maxLength option', () => {
    const largeObj = { data: 'x'.repeat(1000) };
    const result = safeStringify(largeObj, { maxLength: 50 });
    expect(result.length).toBeLessThanOrEqual(100); // Including truncation message
    expect(result).toContain('[Truncated');
  });

  it('should handle Date objects', () => {
    const date = new Date('2023-01-01T00:00:00.000Z');
    const result = safeStringify(date);
    expect(result).toContain('2023-01-01');
  });

  it('should handle RegExp objects', () => {
    const regex = /test/g;
    const result = safeStringify(regex);
    expect(result).toContain('/test/g');
  });

  it('should handle Error objects', () => {
    const error = new Error('Test error');
    const result = safeStringify(error);
    expect(result).toContain('Test error');
  });

  it('should handle functions', () => {
    const fn = function testFunction() { return 'test'; };
    const result = safeStringify(fn);
    expect(result).toContain('[Function: testFunction]');
  });

  it('should handle nested objects', () => {
    const nested = {
      level1: {
        level2: {
          level3: 'deep value'
        }
      }
    };
    const result = safeStringify(nested);
    expect(result).toContain('deep value');
  });
});

describe('safeStringifyAdvanced', () => {
  it('should return structured result', () => {
    const obj = { test: 'value' };
    const result = safeStringifyAdvanced(obj);
    
    expect(result).toHaveProperty('result');
    expect(result).toHaveProperty('truncated');
    expect(result).toHaveProperty('circularRefs');
    expect(result).toHaveProperty('originalLength');
    expect(result).toHaveProperty('finalLength');
    
    expect(result.result).toBe('{"test":"value"}');
    expect(result.truncated).toBe(false);
    expect(result.circularRefs).toBe(0);
  });

  it('should detect circular references', () => {
    const obj: any = { name: 'test' };
    obj.self = obj;
    
    const result = safeStringifyAdvanced(obj);
    expect(result.circularRefs).toBeGreaterThan(0);
  });

  it('should detect truncation', () => {
    const largeObj = { data: 'x'.repeat(1000) };
    const result = safeStringifyAdvanced(largeObj, { maxLength: 50 });
    
    expect(result.truncated).toBe(true);
    expect(result.originalLength).toBeGreaterThan(result.finalLength);
  });

  it('should prettify when requested', () => {
    const obj = { nested: { value: 42 } };
    const result = safeStringifyAdvanced(obj, { prettify: true });
    
    expect(result.result).toContain('\n');
    expect(result.result).toContain('  '); // Indentation
  });
});

describe('SafeStringifier class', () => {
  let stringifier: SafeStringifier;

  beforeEach(() => {
    stringifier = new SafeStringifier({
      maxLength: 1000,
      maxDepth: 10,
      prettify: false
    });
  });

  it('should create with default options', () => {
    const defaultStringifier = new SafeStringifier();
    expect(defaultStringifier).toBeInstanceOf(SafeStringifier);
  });

  it('should stringify with custom options', () => {
    const obj = { test: 'value' };
    const result = stringifier.stringify(obj);
    expect(result.result).toBe('{"test":"value"}');
  });

  it('should handle complex nested structures', () => {
    const complex = {
      string: 'text',
      number: 42,
      boolean: true,
      null: null,
      undefined: undefined,
      array: [1, 2, 3],
      nested: {
        deep: {
          value: 'found'
        }
      },
      date: new Date('2023-01-01'),
      regex: /test/g
    };

    const result = stringifier.stringify(complex);
    expect(result.result).toContain('text');
    expect(result.result).toContain('42');
    expect(result.result).toContain('true');
    expect(result.result).toContain('found');
  });

  it('should respect maxDepth setting', () => {
    const shallowStringifier = new SafeStringifier({ maxDepth: 2 });
    
    const deep = {
      level1: {
        level2: {
          level3: {
            level4: 'too deep'
          }
        }
      }
    };

    const result = shallowStringifier.stringify(deep);
    expect(result.result).not.toContain('too deep');
    expect(result.result).toContain('[Max Depth');
  });

  it('should handle WeakMap and WeakSet', () => {
    const obj = {
      weakMap: new WeakMap(),
      weakSet: new WeakSet()
    };

    const result = stringifier.stringify(obj);
    expect(result.result).toContain('WeakMap');
    expect(result.result).toContain('WeakSet');
  });

  it('should handle Map and Set', () => {
    const map = new Map([['key', 'value']]);
    const set = new Set([1, 2, 3]);
    
    const obj = { map, set };
    const result = stringifier.stringify(obj);
    
    expect(result.result).toContain('key');
    expect(result.result).toContain('value');
    expect(result.result).toContain('[1,2,3]');
  });

  it('should handle symbols', () => {
    const sym = Symbol('test');
    const obj = { [sym]: 'symbol value', regular: 'regular value' };
    
    const result = stringifier.stringify(obj);
    expect(result.result).toContain('regular value');
    expect(result.result).toContain('Symbol(test)');
  });

  it('should handle Buffer objects', () => {
    const buffer = Buffer.from('hello world', 'utf8');
    const result = stringifier.stringify(buffer);
    
    expect(result.result).toContain('Buffer');
    expect(result.result).toContain('hello world');
  });
});