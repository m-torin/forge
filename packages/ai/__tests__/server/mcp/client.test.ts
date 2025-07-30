import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock AI SDK MCP functions
const mockCreateMCPClient = vi.fn();
const mockStdioTransport = vi.fn();
const mockSSETransport = vi.fn();
const mockHTTPTransport = vi.fn();

vi.mock('ai', () => ({
  experimental_createMCPClient: mockCreateMCPClient,
}));

vi.mock('ai/mcp-stdio', () => ({
  Experimental_StdioMCPTransport: mockStdioTransport,
}));

// Note: ai/mcp-sse and ai/mcp-http may not be available in current AI SDK version
// Using virtual fallback mocks
vi.mock(
  'ai/mcp-sse',
  () => ({
    Experimental_SSEMCPTransport: mockSSETransport,
  }),
  { virtual: true },
);

vi.mock(
  'ai/mcp-http',
  () => ({
    Experimental_HTTPMCPTransport: mockHTTPTransport,
  }),
  { virtual: true },
);

describe('mCP Client', () => {
  let mockTools: Record<string, any>;
  let mockMCPClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock tools
    mockTools = {
      filesystem_read: {
        name: 'filesystem_read',
        description: 'Read a file from the filesystem',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path to read' },
          },
          required: ['path'],
        },
      },
      web_search: {
        name: 'web_search',
        description: 'Search the web using Perplexity',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            count: { type: 'number', description: 'Number of results' },
          },
          required: ['query'],
        },
      },
    };

    // Setup mock MCP client
    mockMCPClient = {
      tools: vi.fn().mockResolvedValue(mockTools),
      close: vi.fn().mockResolvedValue(undefined),
      invoke: vi.fn(),
    };

    mockCreateMCPClient.mockResolvedValue(mockMCPClient);
  });

  afterEach(async () => {
    // Cleanup any open connections
    await mockMCPClient?.close?.().catch(() => {});
  });

  describe('client Creation', () => {
    test('should create MCP client with stdio transport', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'filesystem',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
          args: ['--root', '/tmp'],
        },
      };

      mockStdioTransport.mockReturnValue({
        type: 'stdio',
        command: config.transport.command,
        args: config.transport.args,
      });

      const result = await createMCPClient(config);

      expect(mockStdioTransport).toHaveBeenCalledWith({
        command: 'mcp-filesystem',
        args: ['--root', '/tmp'],
      });
      expect(mockCreateMCPClient).toHaveBeenCalledWith({
        transport: expect.objectContaining({
          type: 'stdio',
          command: 'mcp-filesystem',
        }),
      });
      expect(result.client).toBe(mockMCPClient);
      expect(result.toolSet).toStrictEqual(mockTools);
      expect(result.config).toStrictEqual(config);
    });

    test('should create MCP client with SSE transport', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'perplexity',
        transport: {
          type: 'sse' as const,
          url: 'https://api.perplexity.ai/mcp',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        },
      };

      mockSSETransport.mockReturnValue({
        type: 'sse',
        url: config.transport.url,
        headers: config.transport.headers,
      });

      const result = await createMCPClient(config);

      expect(mockSSETransport).toHaveBeenCalledWith({
        url: 'https://api.perplexity.ai/mcp',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      });
      expect(result.client).toBe(mockMCPClient);
      expect(result.config).toStrictEqual(config);
    });

    test('should create MCP client with HTTP transport', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'custom-server',
        transport: {
          type: 'http' as const,
          httpUrl: 'https://custom-mcp.example.com',
          sessionId: 'session-123',
        },
      };

      mockHTTPTransport.mockReturnValue({
        type: 'http',
        url: config.transport.httpUrl,
        sessionId: config.transport.sessionId,
      });

      const result = await createMCPClient(config);

      expect(mockHTTPTransport).toHaveBeenCalledWith({
        url: 'https://custom-mcp.example.com',
        sessionId: 'session-123',
      });
      expect(result.client).toBe(mockMCPClient);
    });

    test('should handle client creation errors', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'failing-client',
        transport: {
          type: 'stdio' as const,
          command: 'non-existent-command',
        },
      };

      const error = new Error('Command not found');
      mockCreateMCPClient.mockRejectedValue(error);

      await expect(createMCPClient(config)).rejects.toThrow('Command not found');
    });

    test('should validate transport configuration', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const invalidConfig = {
        name: 'invalid',
        transport: {
          type: 'stdio' as const,
          // Missing required command
        },
      };

      await expect(createMCPClient(invalidConfig as any)).rejects.toThrow(
        'Invalid transport configuration',
      );
    });
  });

  describe('tool Discovery', () => {
    test('should discover and return available tools', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'filesystem',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
        },
      };

      const result = await createMCPClient(config);
      const tools = await result.client.tools();

      expect(mockMCPClient.tools).toHaveBeenCalledWith();
      expect(tools).toStrictEqual(mockTools);
      expect(Object.keys(tools)).toContain('filesystem_read');
      expect(Object.keys(tools)).toContain('web_search');
    });

    test('should handle empty tool list', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      mockMCPClient.tools.mockResolvedValue({});

      const config = {
        name: 'empty-server',
        transport: {
          type: 'stdio' as const,
          command: 'empty-mcp',
        },
      };

      const result = await createMCPClient(config);
      const tools = await result.client.tools();

      expect(tools).toStrictEqual({});
    });

    test('should handle tool discovery errors', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const error = new Error('Tool discovery failed');
      mockMCPClient.tools.mockRejectedValue(error);

      const config = {
        name: 'failing-tools',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-failing',
        },
      };

      const result = await createMCPClient(config);

      await expect(result.client.tools()).rejects.toThrow('Tool discovery failed');
    });

    test('should merge tools from multiple sources', async () => {
      const { mergeMCPTools } = await import('#/server/mcp/client');

      const tools1 = {
        filesystem_read: mockTools.filesystem_read,
      };

      const tools2 = {
        web_search: mockTools.web_search,
        database_query: {
          name: 'database_query',
          description: 'Query database',
          parameters: {
            type: 'object',
            properties: {
              sql: { type: 'string' },
            },
          },
        },
      };

      const merged = mergeMCPTools([tools1, tools2]);

      expect(merged).toStrictEqual({
        filesystem_read: mockTools.filesystem_read,
        web_search: mockTools.web_search,
        database_query: tools2.database_query,
      });
    });

    test('should handle tool name conflicts', async () => {
      const { mergeMCPTools } = await import('#/server/mcp/client');

      const tools1 = {
        search: {
          name: 'search',
          description: 'File search',
          source: 'filesystem',
        },
      };

      const tools2 = {
        search: {
          name: 'search',
          description: 'Web search',
          source: 'web',
        },
      };

      const merged = mergeMCPTools([tools1, tools2], { handleConflicts: true });

      expect(merged).toStrictEqual({
        filesystem_search: {
          name: 'filesystem_search',
          description: 'File search',
          source: 'filesystem',
        },
        web_search: {
          name: 'web_search',
          description: 'Web search',
          source: 'web',
        },
      });
    });
  });

  describe('tool Execution', () => {
    test('should execute tools with parameters', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const expectedResult = {
        success: true,
        content: 'File content here...',
      };

      mockMCPClient.invoke.mockResolvedValue(expectedResult);

      const config = {
        name: 'filesystem',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
        },
      };

      const result = await createMCPClient(config);

      const toolResult = await result.client.invoke('filesystem_read', {
        path: '/tmp/test.txt',
      });

      expect(mockMCPClient.invoke).toHaveBeenCalledWith('filesystem_read', {
        path: '/tmp/test.txt',
      });
      expect(toolResult).toStrictEqual(expectedResult);
    });

    test('should handle tool execution errors', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const error = new Error('File not found');
      mockMCPClient.invoke.mockRejectedValue(error);

      const config = {
        name: 'filesystem',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
        },
      };

      const result = await createMCPClient(config);

      await expect(
        result.client.invoke('filesystem_read', {
          path: '/nonexistent/file.txt',
        }),
      ).rejects.toThrow('File not found');
    });

    test('should validate tool parameters', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'filesystem',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
        },
      };

      const result = await createMCPClient(config);

      // Missing required parameter
      await expect(result.client.invoke('filesystem_read', {})).rejects.toThrow(
        'Missing required parameter: path',
      );

      // Invalid parameter type
      await expect(
        result.client.invoke('web_search', {
          query: 123, // Should be string
        }),
      ).rejects.toThrow('Invalid parameter type');
    });
  });

  describe('connection Management', () => {
    test('should properly close client connections', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'filesystem',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
        },
      };

      const result = await createMCPClient(config);
      await result.client.close();

      expect(mockMCPClient.close).toHaveBeenCalledWith();
    });

    test('should handle connection close errors gracefully', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const error = new Error('Connection already closed');
      mockMCPClient.close.mockRejectedValue(error);

      const config = {
        name: 'filesystem',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
        },
      };

      const result = await createMCPClient(config);

      // Should not throw, just log the error
      await expect(result.client.close()).resolves.toBeUndefined();
    });

    test('should implement connection timeout', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      // Mock slow connection establishment
      mockCreateMCPClient.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockMCPClient), 5000)),
      );

      const config = {
        name: 'slow-server',
        transport: {
          type: 'stdio' as const,
          command: 'slow-mcp',
        },
        timeout: 1000, // 1 second timeout
      };

      await expect(createMCPClient(config)).rejects.toThrow('Connection timeout');
    });

    test('should implement connection retry logic', async () => {
      const { createMCPClientWithRetry } = await import('#/server/mcp/client');

      // Fail first two attempts, succeed on third
      mockCreateMCPClient
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(mockMCPClient);

      const config = {
        name: 'unstable-server',
        transport: {
          type: 'stdio' as const,
          command: 'unstable-mcp',
        },
      };

      const result = await createMCPClientWithRetry(config, {
        maxRetries: 3,
        backoffMs: 100,
      });

      expect(mockCreateMCPClient).toHaveBeenCalledTimes(3);
      expect(result.client).toBe(mockMCPClient);
    });
  });

  describe('environment Variable Handling', () => {
    test('should pass environment variables to stdio transport', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'env-aware',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-env',
          env: {
            API_KEY: 'test-key',
            DEBUG: 'true',
          },
        },
      };

      await createMCPClient(config);

      expect(mockStdioTransport).toHaveBeenCalledWith({
        command: 'mcp-env',
        env: {
          API_KEY: 'test-key',
          DEBUG: 'true',
        },
      });
    });

    test('should merge with process environment', async () => {
      const { createMCPClient } = await import('#/server/mcp/client');

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const config = {
        name: 'env-merge',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-merge',
          env: {
            CUSTOM_VAR: 'custom-value',
          },
          inheritEnv: true,
        },
      };

      await createMCPClient(config);

      expect(mockStdioTransport).toHaveBeenCalledWith({
        command: 'mcp-merge',
        env: expect.objectContaining({
          NODE_ENV: 'test',
          CUSTOM_VAR: 'custom-value',
        }),
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('error Recovery', () => {
    test('should implement graceful degradation', async () => {
      const { ResilientMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'unreliable',
        transport: {
          type: 'stdio' as const,
          command: 'unreliable-mcp',
        },
        fallback: {
          enabled: true,
          tools: {
            fallback_search: {
              name: 'fallback_search',
              description: 'Fallback search when MCP unavailable',
              handler: vi.fn().mockResolvedValue({ results: [] }),
            },
          },
        },
      };

      const error = new Error('MCP server unavailable');
      mockCreateMCPClient.mockRejectedValue(error);

      const client = new ResilientMCPClient(config);
      const tools = await client.tools();

      expect(tools).toStrictEqual(config.fallback.tools);
    });

    test('should implement circuit breaker pattern', async () => {
      const { CircuitBreakerMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'circuit-test',
        transport: {
          type: 'stdio' as const,
          command: 'failing-mcp',
        },
      };

      const client = new CircuitBreakerMCPClient(config, {
        failureThreshold: 3,
        resetTimeoutMs: 5000,
      });

      const error = new Error('Service unavailable');
      mockMCPClient.invoke.mockRejectedValue(error);

      // First few calls should attempt the operation
      await expect(client.invoke('test_tool', {})).rejects.toThrow('Service unavailable');
      await expect(client.invoke('test_tool', {})).rejects.toThrow('Service unavailable');
      await expect(client.invoke('test_tool', {})).rejects.toThrow('Service unavailable');

      // Circuit should now be open
      await expect(client.invoke('test_tool', {})).rejects.toThrow('Circuit breaker is open');
    });
  });

  describe('performance and Monitoring', () => {
    test('should track tool execution metrics', async () => {
      const { MetricsMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'metrics-test',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-metrics',
        },
      };

      const client = new MetricsMCPClient(config);

      mockMCPClient.invoke.mockResolvedValue({ success: true });

      await client.invoke('test_tool', { param: 'value' });
      await client.invoke('test_tool', { param: 'value2' });

      const metrics = client.getMetrics();

      expect(metrics.toolInvocations.test_tool.count).toBe(2);
      expect(metrics.toolInvocations.test_tool.successCount).toBe(2);
      expect(metrics.toolInvocations.test_tool.totalTime).toBeGreaterThan(0);
    });

    test('should measure tool execution latency', async () => {
      const { MetricsMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'latency-test',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-latency',
        },
      };

      const client = new MetricsMCPClient(config);

      // Simulate slow tool execution
      mockMCPClient.invoke.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ result: 'slow' }), 100)),
      );

      await client.invoke('slow_tool', {});

      const metrics = client.getMetrics();
      expect(metrics.toolInvocations.slow_tool.avgLatency).toBeCloseTo(100, -1);
    });

    test('should track error rates', async () => {
      const { MetricsMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'error-tracking',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-errors',
        },
      };

      const client = new MetricsMCPClient(config);

      // Mix of success and failure
      mockMCPClient.invoke
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Tool error'))
        .mockResolvedValueOnce({ success: true });

      await client.invoke('test_tool', {});
      await expect(client.invoke('test_tool', {})).rejects.toThrow('Tool error');
      await client.invoke('test_tool', {});

      const metrics = client.getMetrics();
      expect(metrics.toolInvocations.test_tool.count).toBe(3);
      expect(metrics.toolInvocations.test_tool.successCount).toBe(2);
      expect(metrics.toolInvocations.test_tool.errorCount).toBe(1);
      expect(metrics.toolInvocations.test_tool.errorRate).toBeCloseTo(0.33, 2);
    });
  });

  describe('edge Runtime Compatibility', () => {
    test('should work in Edge Runtime environment', async () => {
      // Mock Edge Runtime environment
      const originalGlobal = global;
      Object.defineProperty(global, 'EdgeRuntime', { value: '1.0' });

      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'edge-compatible',
        transport: {
          type: 'http' as const, // Only HTTP works in Edge Runtime
          httpUrl: 'https://edge-mcp.example.com',
        },
      };

      const result = await createMCPClient(config);

      expect(result.client).toBe(mockMCPClient);

      // Restore global
      Object.defineProperty(global, 'EdgeRuntime', { value: originalGlobal.EdgeRuntime });
    });

    test('should reject stdio transport in Edge Runtime', async () => {
      // Mock Edge Runtime environment
      Object.defineProperty(global, 'EdgeRuntime', { value: '1.0' });

      const { createMCPClient } = await import('#/server/mcp/client');

      const config = {
        name: 'edge-invalid',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
        },
      };

      await expect(createMCPClient(config)).rejects.toThrow(
        'Stdio transport not supported in Edge Runtime',
      );

      // Restore global
      delete (global as any).EdgeRuntime;
    });
  });
});
