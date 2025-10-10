import { describe, expect, test, vi } from 'vitest';
import { registerStandardPrompts } from '../../src/prompts';
import { registerStandardResources } from '../../src/resources';

describe('prompts and resources registration', () => {
  test('registerStandardPrompts registers and generates messages', () => {
    const calls: any[] = [];
    let capturedCb: any;
    const server = {
      registerPrompt: vi.fn((name: string, opts: any, cb: any) => {
        calls.push({ name, opts });
        capturedCb = cb;
        return { id: name } as any;
      }),
    } as any;

    const res = registerStandardPrompts(server);
    expect(res.promptCount).toBeGreaterThan(0);
    expect(calls[0].name).toBe('tool-discovery-brief');
    // zod schema is passed through; just ensure present
    expect(calls[0].opts.argsSchema).toBeDefined();

    // Invoke the prompt factory to cover message generation paths
    const out1 = capturedCb({});
    const out2 = capturedCb({ audience: 'engineer' });
    expect(out1.messages?.[0]?.content?.text).toContain('general audience');
    expect(out2.messages?.[0]?.content?.text).toContain('engineer');
  });

  test('registerStandardResources registers runtime-config and tool-catalog', async () => {
    const regCalls: any[] = [];
    const server = {
      registerResource: vi.fn((name: string, uri: string, _meta: any, handler: any) => {
        regCalls.push({ name, uri, handler });
        return { id: name } as any;
      }),
      registerResourceTemplate: vi.fn(),
    } as any;

    const res = registerStandardResources(server, {
      serverName: 'x',
      serverVersion: '1',
      transports: ['stdio'],
      httpPort: 1234,
      enableSse: false,
      logLevel: 'info',
    });

    expect(res.resourceCount).toBe(2);
    expect(regCalls.map(c => c.name)).toEqual(['runtime-config', 'tool-catalog']);

    // Execute handler to ensure it returns JSON content
    const cfgResp = await regCalls[0].handler(new URL('forge://config/runtime'));
    const cfgObj = JSON.parse(cfgResp.contents[0].text);
    expect(cfgObj.name).toBe('x');

    const toolsResp = await regCalls[1].handler(new URL('forge://catalog/tools'));
    const tools = JSON.parse(toolsResp.contents[0].text);
    expect(Array.isArray(tools)).toBeTruthy();
  });
});
