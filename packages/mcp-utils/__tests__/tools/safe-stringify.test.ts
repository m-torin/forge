/**
 * Tests for safe stringify MCP tools
 */
import { describe, expect } from 'vitest';
import { legacySafeStringifyTool, safeStringifyTool } from '../../src/tools/safe-stringify';

describe('safeStringifyTool', () => {
  test('should have correct tool definition', () => {
    expect(safeStringifyTool.name).toBe('safe_stringify');
    expect(safeStringifyTool.description).toContain('circular reference handling');
    expect(safeStringifyTool.inputSchema).toBeDefined();
    expect(safeStringifyTool.execute).toBeTypeOf('function');
  });

  test('should stringify simple objects', async () => {
    const result = await safeStringifyTool.execute({
      obj: { hello: 'world', number: 42 },
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.result).toBe('{"hello":"world","number":42}');
    expect(parsed.truncated).toBeFalsy();
    expect(parsed.circularRefs).toBe(0);
  });

  test('should handle circular references', async () => {
    const obj: any = { name: 'test' };
    obj.self = obj;

    const result = await safeStringifyTool.execute({ obj });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.circularRefs).toBeGreaterThan(0);
    expect(parsed.result).toContain('name');
    expect(parsed.result).toContain('[Circular');
  });

  test('should respect maxLength option', async () => {
    const largeObj = { data: 'x'.repeat(1000) };

    const result = await safeStringifyTool.execute({
      obj: largeObj,
      maxLength: 50,
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.truncated).toBeTruthy();
    expect(parsed.originalLength).toBeGreaterThan(parsed.finalLength);
  });

  test('should prettify when requested', async () => {
    const obj = { nested: { value: 42 } };

    const result = await safeStringifyTool.execute({
      obj,
      prettify: true,
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.result).toContain('\n');
    expect(parsed.result).toContain('  '); // Indentation
  });

  test('should handle errors gracefully', async () => {
    // Create an object that might cause issues
    const problematicObj = {};
    Object.defineProperty(problematicObj, 'problematic', {
      get() {
        throw new Error('Property access error');
      },
    });

    const result = await safeStringifyTool.execute({ obj: problematicObj });

    expect(result.isError).toBeTruthy();
    expect(result.content[0].text).toContain('error');
  });

  test('should use default options when not provided', async () => {
    const result = await safeStringifyTool.execute({
      obj: { test: 'value' },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toHaveProperty('result');
    expect(parsed).toHaveProperty('truncated');
    expect(parsed).toHaveProperty('circularRefs');
  });
});

describe('legacySafeStringifyTool', () => {
  test('should have correct tool definition', () => {
    expect(legacySafeStringifyTool.name).toBe('legacy_safe_stringify');
    expect(legacySafeStringifyTool.description).toContain('backward compatibility');
    expect(legacySafeStringifyTool.inputSchema).toBeDefined();
    expect(legacySafeStringifyTool.execute).toBeTypeOf('function');
  });

  test('should return simple string result', async () => {
    const result = await legacySafeStringifyTool.execute({
      obj: { hello: 'world' },
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('{"hello":"world"}');
  });

  test('should handle circular references in legacy mode', async () => {
    const obj: any = { name: 'test' };
    obj.self = obj;

    const result = await legacySafeStringifyTool.execute({ obj });

    expect(result.content[0].text).toContain('name');
    expect(result.content[0].text).toContain('[Circular');
  });

  test('should respect maxLength in legacy mode', async () => {
    const largeObj = { data: 'x'.repeat(1000) };

    const result = await legacySafeStringifyTool.execute({
      obj: largeObj,
      maxLength: 50,
    });

    expect(result.content[0].text.length).toBeLessThanOrEqual(100);
    expect(result.content[0].text).toContain('[Truncated');
  });

  test('should handle null and undefined', async () => {
    const nullResult = await legacySafeStringifyTool.execute({ obj: null });
    expect(nullResult.content[0].text).toBe('null');

    const undefinedResult = await legacySafeStringifyTool.execute({ obj: undefined });
    expect(undefinedResult.content[0].text).toBe('"[undefined]"');
  });

  test('should handle errors in legacy mode', async () => {
    const problematicObj = {};
    Object.defineProperty(problematicObj, 'problematic', {
      get() {
        throw new Error('Property access error');
      },
    });

    const result = await legacySafeStringifyTool.execute({ obj: problematicObj });

    expect(result.isError).toBeTruthy();
    expect(result.content[0].text).toContain('error');
  });
});
