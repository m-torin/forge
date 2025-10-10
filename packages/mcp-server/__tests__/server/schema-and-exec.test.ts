/**
 * Tests for server schema conversion and tool execution normalization
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Import after mocks applied
import { z } from 'zod';
import MCPUtilsServer from '../../src/server';

// Mock external SDK classes used by server.ts before importing the module
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  class McpServer {
    public tools: any[] = [];
    constructor(_info?: any) {}
    registerTool(name: string, opts: any, exec: (args: any) => Promise<any>) {
      const handle = { name, opts, exec };
      this.tools.push(handle);
      return handle as any;
    }
    // Methods called in other code paths; no-ops here
    registerResource() {}
    registerResourceTemplate() {
      return { id: 't', uriTemplate: 'u' };
    }
    registerPrompt() {
      return { id: 'p' };
    }
    sendToolListChanged() {}
    sendResourceListChanged() {}
    sendPromptListChanged() {}
    async connect() {}
    async close() {}
  }
  return { McpServer };
});

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: class {},
}));

vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: class {
    public sessionId?: string;
    public onclose?: () => void;
    public onerror?: (e: unknown) => void;
    async close() {}
    async handleRequest() {}
  },
}));

// Provide a lean set of tools to exercise schema builder and execution wrapper
vi.mock('../../src/tools', () => {
  const basicTool = {
    name: 'my_test_tool',
    description: 'A tool with a rich input schema',
    inputSchema: {
      type: 'object',
      required: ['name', 'count'],
      properties: {
        name: { type: 'string', description: 'User name' },
        count: { type: 'number', description: 'How many' },
        flag: { type: 'boolean', description: 'Toggle' },
        kind: { enum: ['alpha', 'beta', 'gamma'], description: 'Enum of kinds' },
        tags: { type: 'array', items: { type: 'string' } },
        desc: { type: 'string', default: 'n/a', description: 'Optional description' },
        mixed: { type: ['string', 'number'] },
        nested: {
          type: 'object',
          properties: {
            inner: { type: 'integer' },
          },
          required: ['inner'],
        },
      },
    },
    async execute(args: any) {
      // Echo back args for normalization wrapper to serialize
      return { content: [{ type: 'text', text: JSON.stringify({ ok: true, args }) }] };
    },
  };

  const safeStringifyTool = {
    name: 'safe_stringify',
    description: 'placeholder',
    inputSchema: { type: 'object', properties: { obj: {} }, required: ['obj'] },
    async execute() {
      return { content: [{ type: 'text', text: JSON.stringify({ ok: true }) }] };
    },
  };

  return {
    // Many named exports are referenced by server.ts; map them to our test tools
    safeStringifyTool,
    batchProcessorTool: basicTool,
    fileDiscoveryTool: basicTool,
    fileStreamingTool: basicTool,
    pathManagerTool: basicTool,
    calculateComplexityTool: basicTool,
    extractExportsTool: basicTool,
    extractFileMetadataTool: basicTool,
    extractImportsTool: basicTool,
    patternAnalyzerTool: basicTool,
    architectureDetectorTool: basicTool,
    dependencyAnalyzerTool: basicTool,
    circularDepsTool: basicTool,
    memoryMonitorTool: basicTool,
    advancedMemoryMonitorTool: basicTool,
    memoryAwareCacheTool: basicTool,
    workflowOrchestratorTool: basicTool,
    worktreeManagerTool: basicTool,
    resourceLifecycleManagerTool: basicTool,
    initializeSessionTool: basicTool,
    closeSessionTool: basicTool,
    contextSessionManagerTool: basicTool,
    reportGeneratorTool: basicTool,
    optimizationEngineTool: basicTool,
    ALL_TOOLS: ['safe_stringify', 'my_test_tool'],
  };
});

// Keep prompts/resources lightweight
vi.mock('../../src/prompts', () => ({
  registerStandardPrompts: vi.fn(() => ({ promptHandles: [{ id: 'p' }], promptCount: 1 })),
}));
vi.mock('../../src/resources', () => ({
  registerStandardResources: vi.fn(() => ({ templateHandles: [], resourceCount: 1 })),
}));

// Avoid env coupling in config
vi.mock('../../src/config', async orig => {
  const actual = (await (orig as any).default?.()) ?? (await import('../../src/config'));
  return {
    ...(actual as object),
    loadConfig: (overrides: any) => ({
      serverName: 'test',
      serverVersion: '0.0.0-test',
      transports: ['stdio'],
      httpPort: 3999,
      enableSse: false,
      logLevel: 'debug',
      ...(overrides || {}),
    }),
  };
});

describe('mCPUtilsServer schema + execution', () => {
  let instance: MCPUtilsServer;
  let registered: Array<{ name: string; opts: any; exec: (args: any) => Promise<any> }> = [];

  beforeEach(() => {
    instance = new MCPUtilsServer();
    // @ts-expect-error access mocked server internals
    registered = instance['server'].tools ?? [];
    if (!(registered.length > 0)) {
      throw new Error('expected tools to be registered');
    }
  });

  test('converts JSON schema to Zod (object, enums, arrays, unions, defaults)', async () => {
    const tool = registered.find(t => t.name === 'my_test_tool');
    expect(tool).toBeDefined();
    const shape = tool!.opts.inputSchema; // ZodRawShape
    const schema = z.object(shape);

    const parsed = schema.parse({
      name: 'A',
      count: 2,
      flag: true,
      kind: 'alpha',
      tags: ['x', 'y'],
      mixed: 'either',
      nested: { inner: 5 },
    });

    // Optional with default present in shape
    expect(parsed.desc).toBe('n/a');
    expect(parsed.kind).toBe('alpha');
  });

  test('formats tool title from snake_case', () => {
    const safe = registered.find(t => t.name === 'safe_stringify')!;
    expect(safe.opts.title).toBe('Safe Stringify');
  });

  test('normalizes tool execution response via wrapper', async () => {
    const tool = registered.find(t => t.name === 'my_test_tool')!;
    const response = await tool.exec({ name: 'X', count: 1 });
    expect(response).toBeTruthy();
    // should include normalized JSON content
    expect(Array.isArray(response.content)).toBeTruthy();
    const normalized = JSON.parse(response.content[0].text);
    expect(normalized.success).toBeTruthy();
    expect(normalized.result).toBeTypeOf('object');
  });
});
