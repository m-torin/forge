import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SafeStringifier, safeStringifyAdvanced } from '../../src/server/stringify-advanced';

describe('server/stringify-advanced', () => {
  describe('SafeStringifier', () => {
    let stringifier: SafeStringifier;

    beforeEach(() => {
      stringifier = new SafeStringifier({
        maxLength: 1000,
        maxDepth: 10,
        prettify: false,
        includeMetadata: true,
      });
    });

    it('handles Node.js Buffer objects', () => {
      const buffer = Buffer.from('Hello World', 'utf8');
      const result = stringifier.stringify(buffer);

      expect(result.result).toContain('[Buffer: Hello World]');
      expect(result.error).toBeFalsy();
    });

    it('handles long Buffer objects with truncation', () => {
      const longBuffer = Buffer.from('x'.repeat(200), 'utf8');
      const result = stringifier.stringify(longBuffer);

      expect(result.result).toContain('[Buffer:');
      expect(result.result).toContain('...');
    });

    it('handles invalid Buffer encoding gracefully', () => {
      const buffer = Buffer.from([0xff, 0xfe, 0xfd]);
      const result = stringifier.stringify(buffer);

      expect(result.result).toContain('[Buffer:');
      expect(result.error).toBeFalsy();
    });

    it('includes memory usage in metadata', () => {
      const result = stringifier.stringify({ test: 'value' });

      expect(result.metadata).toBeDefined();
      expect(result.metadata!.memoryUsage).toBeGreaterThan(0);
      expect(result.metadata!.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('handles problematic getters without crashing', () => {
      const problematic = {};
      Object.defineProperty(problematic, 'badGetter', {
        get() {
          throw new Error('Getter failed');
        },
        enumerable: false,
      });

      const result = stringifier.stringify({ obj: problematic });
      expect(result.error).toBeFalsy();
    });

    it('handles property access errors gracefully', () => {
      const obj = {};
      Object.defineProperty(obj, 'problematicProp', {
        get() {
          throw new Error('Property access failed');
        },
        enumerable: true,
      });

      const result = stringifier.stringify(obj);
      expect(result.result).toContain('[Property Error:');
      expect(result.error).toBeFalsy();
    });

    it('handles symbol property access errors', () => {
      const sym = Symbol('test');
      const obj = {};
      Object.defineProperty(obj, sym, {
        get() {
          throw new Error('Symbol property access failed');
        },
        enumerable: true,
      });

      const result = stringifier.stringify(obj);
      expect(result.result).toContain('[Symbol Property Error:');
      expect(result.error).toBeFalsy();
    });

    it('respects prettify option', () => {
      const prettyStringifier = new SafeStringifier({ prettify: true });
      const result = prettyStringifier.stringify({ a: 1, b: 2 });

      expect(result.result).toContain('\n');
      expect(result.result).toContain('  ');
    });

    it('respects maxLength setting', () => {
      const shortStringifier = new SafeStringifier({ maxLength: 50 });
      const longObj = { data: 'x'.repeat(1000) };
      const result = shortStringifier.stringify(longObj);

      expect(result.result.length).toBeLessThanOrEqual(65); // 50 + '[Truncated]'.length
      expect(result.metadata!.truncated).toBe(true);
    });

    it('tracks circular references correctly', () => {
      const obj: any = { name: 'parent' };
      obj.child = { parent: obj };
      const result = stringifier.stringify(obj);

      expect(result.metadata!.circularRefs).toBe(1);
      expect(result.result).toContain('[Circular Reference]');
    });

    it('handles errors during stringification', () => {
      // Mock JSON.stringify to fail
      const originalStringify = JSON.stringify;
      vi.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('JSON stringify failed');
      });

      const result = stringifier.stringify({ test: 'value' });

      expect(result.error).toBe(true);
      expect(result.result).toContain('[Stringify Error:');
      expect(result.metadata!.errorType).toBe('Error');

      JSON.stringify = originalStringify;
    });

    it('can override options per call', () => {
      const result = stringifier.stringify(
        { test: 'value' },
        {
          prettify: true,
          maxLength: 20,
          includeMetadata: false,
        },
      );

      expect(result.result).toContain('\n'); // prettify was applied
      expect(result.metadata).toBeUndefined(); // metadata was disabled
    });
  });

  describe('safeStringifyAdvanced', () => {
    it('returns SafeStringifyResult with Node.js metadata', () => {
      const result = safeStringifyAdvanced({ test: 'value' }, { includeMetadata: true });

      expect(result.result).toBe('{"test":"value"}');
      expect(result.content).toBe('{"test":"value"}');
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.memoryUsage).toBeGreaterThan(0);
      expect(result.error).toBeFalsy();
    });

    it('handles Node.js specific types', () => {
      const buffer = Buffer.from('test');
      const result = safeStringifyAdvanced(buffer);

      expect(result.result).toContain('[Buffer: test]');
    });

    it('works without metadata when disabled', () => {
      const result = safeStringifyAdvanced({ test: 'value' }, { includeMetadata: false });

      expect(result.result).toBe('{"test":"value"}');
      expect(result.metadata).toBeUndefined();
    });

    it('handles undefined input like original', () => {
      const result = safeStringifyAdvanced(undefined, { includeMetadata: true });

      expect(result.result).toBe('"[undefined]"');
      expect(result.metadata!.circularRefs).toBe(0);
    });

    it('provides error metadata on failure', () => {
      const originalStringify = JSON.stringify;
      vi.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Stringify failed');
      });

      const result = safeStringifyAdvanced({ test: 'value' }, { includeMetadata: true });

      expect(result.error).toBe(true);
      expect(result.metadata!.errorType).toBe('Error');
      expect(result.metadata!.memoryUsage).toBeGreaterThan(0);

      JSON.stringify = originalStringify;
    });
  });
});
