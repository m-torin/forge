/**
 * Tests for safe stringify MCP tools
 */
import { describe, it, expect } from 'vitest';
import { safeStringifyTool, legacySafeStringifyTool } from '../../src/tools/safe-stringify';

describe('safeStringifyTool', () => {
  it('should have correct tool definition', () => {
    expect(safeStringifyTool.name).toBe('safe_stringify');
    expect(safeStringifyTool.description).toContain('circular reference handling');
    expect(safeStringifyTool.inputSchema).toBeDefined();
    expect(safeStringifyTool.execute).toBeTypeOf('function');
  });

  it('should stringify simple objects', async () => {
    const result = await safeStringifyTool.execute({
      obj: { hello: 'world', number: 42 }
    });
    
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.result).toBe('{"hello":"world","number":42}');
    expect(parsed.truncated).toBe(false);
    expect(parsed.circularRefs).toBe(0);
  });

  it('should handle circular references', async () => {
    const obj: any = { name: 'test' };
    obj.self = obj;
    
    const result = await safeStringifyTool.execute({ obj });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.circularRefs).toBeGreaterThan(0);
    expect(parsed.result).toContain('name');
    expect(parsed.result).toContain('[Circular');
  });

  it('should respect maxLength option', async () => {
    const largeObj = { data: 'x'.repeat(1000) };
    
    const result = await safeStringifyTool.execute({
      obj: largeObj,
      maxLength: 50
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.truncated).toBe(true);
    expect(parsed.originalLength).toBeGreaterThan(parsed.finalLength);
  });

  it('should prettify when requested', async () => {
    const obj = { nested: { value: 42 } };
    
    const result = await safeStringifyTool.execute({
      obj,
      prettify: true
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.result).toContain('\n');
    expect(parsed.result).toContain('  '); // Indentation
  });

  it('should handle errors gracefully', async () => {
    // Create an object that might cause issues
    const problematicObj = {};
    Object.defineProperty(problematicObj, 'problematic', {
      get() {
        throw new Error('Property access error');
      }
    });
    
    const result = await safeStringifyTool.execute({ obj: problematicObj });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('error');
  });

  it('should use default options when not provided', async () => {
    const result = await safeStringifyTool.execute({
      obj: { test: 'value' }
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toHaveProperty('result');
    expect(parsed).toHaveProperty('truncated');
    expect(parsed).toHaveProperty('circularRefs');
  });
});

describe('legacySafeStringifyTool', () => {
  it('should have correct tool definition', () => {
    expect(legacySafeStringifyTool.name).toBe('legacy_safe_stringify');
    expect(legacySafeStringifyTool.description).toContain('backward compatibility');
    expect(legacySafeStringifyTool.inputSchema).toBeDefined();
    expect(legacySafeStringifyTool.execute).toBeTypeOf('function');
  });

  it('should return simple string result', async () => {
    const result = await legacySafeStringifyTool.execute({
      obj: { hello: 'world' }
    });
    
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('{"hello":"world"}');
  });

  it('should handle circular references in legacy mode', async () => {
    const obj: any = { name: 'test' };
    obj.self = obj;
    
    const result = await legacySafeStringifyTool.execute({ obj });
    
    expect(result.content[0].text).toContain('name');
    expect(result.content[0].text).toContain('[Circular');
  });

  it('should respect maxLength in legacy mode', async () => {
    const largeObj = { data: 'x'.repeat(1000) };
    
    const result = await legacySafeStringifyTool.execute({
      obj: largeObj,
      maxLength: 50
    });
    
    expect(result.content[0].text.length).toBeLessThanOrEqual(100);
    expect(result.content[0].text).toContain('[Truncated');
  });

  it('should handle null and undefined', async () => {
    const nullResult = await legacySafeStringifyTool.execute({ obj: null });
    expect(nullResult.content[0].text).toBe('null');
    
    const undefinedResult = await legacySafeStringifyTool.execute({ obj: undefined });
    expect(undefinedResult.content[0].text).toBe('"[undefined]"');
  });

  it('should handle errors in legacy mode', async () => {
    const problematicObj = {};
    Object.defineProperty(problematicObj, 'problematic', {
      get() {
        throw new Error('Property access error');
      }
    });
    
    const result = await legacySafeStringifyTool.execute({ obj: problematicObj });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('error');
  });
});