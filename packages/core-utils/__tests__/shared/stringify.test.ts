import { describe, expect, it } from 'vitest';
import { safeStringify, safeStringifyPure } from '../../src/shared/stringify';

describe('shared/stringify', () => {
  describe('safeStringify', () => {
    it('handles basic types correctly', () => {
      expect(safeStringify('hello')).toBe('"hello"');
      expect(safeStringify(42)).toBe('42');
      expect(safeStringify(true)).toBe('true');
      expect(safeStringify(null)).toBe('null');
      expect(safeStringify(undefined)).toBe('"[undefined]"');
    });

    it('handles objects and arrays', () => {
      expect(safeStringify({ key: 'value' })).toBe('{"key":"value"}');
      expect(safeStringify([1, 2, 3])).toBe('[1,2,3]');
    });

    it('handles circular references', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;
      const result = safeStringify(obj);
      expect(result).toContain('[Circular Reference]');
      expect(result).toContain('test');
    });

    it('handles functions', () => {
      const fn = function namedFn() {};
      const result = safeStringify({ fn });
      expect(result).toContain('[Function: namedFn]');
    });

    it('handles symbols', () => {
      const sym = Symbol('test');
      const result = safeStringify({ sym });
      expect(result).toContain('Symbol(test)');
    });

    it('handles errors', () => {
      const error = new Error('Test error');
      const result = safeStringify(error);
      expect(result).toContain('Test error');
      expect(result).toContain('Error');
    });

    it('handles dates', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      const result = safeStringify(date);
      expect(result).toBe('"2023-01-01T00:00:00.000Z"');
    });

    it('handles regular expressions', () => {
      const regex = /test/gi;
      const result = safeStringify(regex);
      expect(result).toBe('"/test/gi"');
    });

    it('handles Maps', () => {
      const map = new Map([['key', 'value']]);
      const result = safeStringify(map);
      expect(result).toContain('key');
      expect(result).toContain('value');
    });

    it('handles Sets', () => {
      const set = new Set([1, 2, 3]);
      const result = safeStringify(set);
      expect(result).toBe('[1,2,3]');
    });

    it('handles WeakMap and WeakSet', () => {
      const weakMap = new WeakMap();
      const weakSet = new WeakSet();
      expect(safeStringify(weakMap)).toBe('"[WeakMap]"');
      expect(safeStringify(weakSet)).toBe('"[WeakSet]"');
    });

    it('respects max depth limit', () => {
      const deep = { a: { b: { c: { d: { e: 'deep' } } } } };
      const result = safeStringify(deep);
      expect(result).toContain('[Max Depth Exceeded]');
    });

    it('respects max length limit', () => {
      const longString = 'x'.repeat(100000);
      const result = safeStringify(longString, 1000);
      expect(result.length).toBeLessThanOrEqual(1020); // 1000 + '[Truncated]'.length
      expect(result).toContain('[Truncated]');
    });

    it('handles stringify errors gracefully', () => {
      // Create an object that will cause JSON.stringify to fail
      const problematic = {};
      Object.defineProperty(problematic, 'prop', {
        get() {
          throw new Error('Getter error');
        },
        enumerable: true,
      });

      const result = safeStringify(problematic);
      expect(result).toContain('[Stringify Error:');
    });
  });

  describe('safeStringifyPure', () => {
    it('returns result with metadata', () => {
      const result = safeStringifyPure({ test: 'value' });
      expect(result.result).toBe('{"test":"value"}');
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata!.originalLength).toBe(16);
      expect(result.metadata!.truncated).toBe(false);
      expect(result.metadata!.circularRefs).toBe(0);
    });

    it('tracks circular references in metadata', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;
      const result = safeStringifyPure(obj);
      expect(result.metadata!.circularRefs).toBe(1);
    });

    it('handles prettify option', () => {
      const obj = { a: 1, b: 2 };
      const result = safeStringifyPure(obj, { prettify: true });
      expect(result.result).toContain('\n');
      expect(result.result).toContain('  ');
    });

    it('handles custom max length', () => {
      const obj = { data: 'x'.repeat(1000) };
      const result = safeStringifyPure(obj, { maxLength: 50 });
      expect(result.result.length).toBeLessThanOrEqual(65); // 50 + '[Truncated]'.length
      expect(result.metadata!.truncated).toBe(true);
    });

    it('handles custom max depth', () => {
      const deep = { a: { b: { c: 'deep' } } };
      const result = safeStringifyPure(deep, { maxDepth: 2 });
      expect(result.result).toContain('[Max Depth Exceeded]');
    });

    it('handles undefined input', () => {
      const result = safeStringifyPure(undefined);
      expect(result.result).toBe('"[undefined]"');
      expect(result.metadata!.circularRefs).toBe(0);
    });
  });
});
