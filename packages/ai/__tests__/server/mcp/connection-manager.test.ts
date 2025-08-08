import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock implementations
const mockMCPClient = {
  tools: vi.fn(),
  invoke: vi.fn(),
  close: vi.fn(),
};

const mockCreateMCPClient = vi.fn().mockResolvedValue(mockMCPClient);

vi.mock('#/server/mcp/client', () => ({
  createMCPClient: mockCreateMCPClient,
}));

describe('mCP Connection Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');
    await MCPConnectionManager.getInstance().closeAll();
  });

  describe('connection Management', () => {
    test('should create and manage multiple MCP connections', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const configs = [
        {
          name: 'filesystem',
          transport: {
            type: 'stdio' as const,
            command: 'mcp-filesystem',
          },
        },
        {
          name: 'perplexity',
          transport: {
            type: 'sse' as const,
            url: 'https://api.perplexity.ai/mcp',
            headers: { Authorization: 'Bearer token' },
          },
        },
      ];

      mockMCPClient.tools.mockResolvedValue({
        filesystem_read: { name: 'filesystem_read' },
        web_search: { name: 'web_search' },
      });

      for (const config of configs) {
        await manager.connect(config);
      }

      const connections = manager.getConnections();
      expect(connections).toHaveLength(2);
      expect(connections.map(c => c.config.name)).toStrictEqual(['filesystem', 'perplexity']);
      expect(mockCreateMCPClient).toHaveBeenCalledTimes(2);
    });

    test('should reuse existing connections', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const config = {
        name: 'filesystem',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-filesystem',
        },
      };

      mockMCPClient.tools.mockResolvedValue({});

      // Connect twice with same config
      const connection1 = await manager.connect(config);
      const connection2 = await manager.connect(config);

      expect(connection1).toBe(connection2);
      expect(mockCreateMCPClient).toHaveBeenCalledTimes(1);
    });

    test('should handle connection failures gracefully', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const config = {
        name: 'failing-server',
        transport: {
          type: 'stdio' as const,
          command: 'non-existent-command',
        },
      };

      const error = new Error('Command not found');
      mockCreateMCPClient.mockRejectedValue(error);

      await expect(manager.connect(config)).rejects.toThrow('Command not found');

      const connections = manager.getConnections();
      expect(connections).toHaveLength(0);
    });

    test('should close specific connections', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const config = {
        name: 'closable',
        transport: {
          type: 'stdio' as const,
          command: 'mcp-closable',
        },
      };

      mockMCPClient.tools.mockResolvedValue({});
      mockMCPClient.close.mockResolvedValue(undefined);

      await manager.connect(config);
      await manager.disconnect('closable');

      expect(mockMCPClient.close).toHaveBeenCalledWith();

      const connections = manager.getConnections();
      expect(connections).toHaveLength(0);
    });

    test('should close all connections', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const configs = [
        { name: 'server1', transport: { type: 'stdio' as const, command: 'mcp1' } },
        { name: 'server2', transport: { type: 'stdio' as const, command: 'mcp2' } },
        { name: 'server3', transport: { type: 'stdio' as const, command: 'mcp3' } },
      ];

      mockMCPClient.tools.mockResolvedValue({});
      mockMCPClient.close.mockResolvedValue(undefined);

      for (const config of configs) {
        await manager.connect(config);
      }

      await manager.closeAll();

      expect(mockMCPClient.close).toHaveBeenCalledTimes(3);

      const connections = manager.getConnections();
      expect(connections).toHaveLength(0);
    });
  });

  describe('tool Discovery and Aggregation', () => {
    test('should aggregate tools from all connections', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const configs = [
        { name: 'filesystem', transport: { type: 'stdio' as const, command: 'mcp-fs' } },
        { name: 'web', transport: { type: 'stdio' as const, command: 'mcp-web' } },
      ];

      // Mock different tools for each connection
      mockCreateMCPClient
        .mockResolvedValueOnce({
          ...mockMCPClient,
          tools: vi.fn().mockResolvedValue({
            filesystem_read: { name: 'filesystem_read', description: 'Read file' },
            filesystem_write: { name: 'filesystem_write', description: 'Write file' },
          }),
        })
        .mockResolvedValueOnce({
          ...mockMCPClient,
          tools: vi.fn().mockResolvedValue({
            web_search: { name: 'web_search', description: 'Search web' },
            web_scrape: { name: 'web_scrape', description: 'Scrape webpage' },
          }),
        });

      for (const config of configs) {
        await manager.connect(config);
      }

      const allTools = await manager.getAllTools();

      expect(allTools).toStrictEqual({
        filesystem_read: { name: 'filesystem_read', description: 'Read file' },
        filesystem_write: { name: 'filesystem_write', description: 'Write file' },
        web_search: { name: 'web_search', description: 'Search web' },
        web_scrape: { name: 'web_scrape', description: 'Scrape webpage' },
      });
    });

    test('should handle tool name conflicts', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const configs = [
        { name: 'server1', transport: { type: 'stdio' as const, command: 'mcp1' } },
        { name: 'server2', transport: { type: 'stdio' as const, command: 'mcp2' } },
      ];

      // Both servers have a 'search' tool
      mockCreateMCPClient
        .mockResolvedValueOnce({
          ...mockMCPClient,
          tools: vi.fn().mockResolvedValue({
            search: { name: 'search', description: 'File search', source: 'filesystem' },
          }),
        })
        .mockResolvedValueOnce({
          ...mockMCPClient,
          tools: vi.fn().mockResolvedValue({
            search: { name: 'search', description: 'Web search', source: 'web' },
          }),
        });

      for (const config of configs) {
        await manager.connect(config);
      }

      const allTools = await manager.getAllTools({ resolveConflicts: true });

      expect(allTools).toStrictEqual({
        server1_search: {
          name: 'server1_search',
          description: 'File search',
          source: 'filesystem',
          originalName: 'search',
          serverId: 'server1',
        },
        server2_search: {
          name: 'server2_search',
          description: 'Web search',
          source: 'web',
          originalName: 'search',
          serverId: 'server2',
        },
      });
    });

    test('should filter tools by capability', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const config = {
        name: 'multi-tool',
        transport: { type: 'stdio' as const, command: 'mcp-multi' },
      };

      mockMCPClient.tools.mockResolvedValue({
        filesystem_read: {
          name: 'filesystem_read',
          capabilities: ['read', 'filesystem'],
        },
        filesystem_write: {
          name: 'filesystem_write',
          capabilities: ['write', 'filesystem'],
        },
        web_search: {
          name: 'web_search',
          capabilities: ['read', 'web'],
        },
      });

      await manager.connect(config);

      const readTools = await manager.getToolsByCapability('read');
      const writeTools = await manager.getToolsByCapability('write');

      expect(Object.keys(readTools)).toStrictEqual(['filesystem_read', 'web_search']);
      expect(Object.keys(writeTools)).toStrictEqual(['filesystem_write']);
    });
  });

  describe('request Routing', () => {
    test('should route tool execution to correct server', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const fsClient = {
        tools: vi.fn().mockResolvedValue({
          filesystem_read: { name: 'filesystem_read' },
        }),
        invoke: vi.fn().mockResolvedValue({ content: 'file content' }),
        close: vi.fn(),
      };

      const webClient = {
        tools: vi.fn().mockResolvedValue({
          web_search: { name: 'web_search' },
        }),
        invoke: vi.fn().mockResolvedValue({ results: ['result1', 'result2'] }),
        close: vi.fn(),
      };

      mockCreateMCPClient.mockResolvedValueOnce(fsClient).mockResolvedValueOnce(webClient);

      await manager.connect({
        name: 'filesystem',
        transport: { type: 'stdio' as const, command: 'mcp-fs' },
      });

      await manager.connect({
        name: 'web',
        transport: { type: 'stdio' as const, command: 'mcp-web' },
      });

      // Execute tools on different servers
      const fsResult = await manager.executeTool('filesystem_read', {
        path: '/test/file.txt',
      });

      const webResult = await manager.executeTool('web_search', {
        query: 'test query',
      });

      expect(fsClient.invoke).toHaveBeenCalledWith('filesystem_read', {
        path: '/test/file.txt',
      });
      expect(webClient.invoke).toHaveBeenCalledWith('web_search', {
        query: 'test query',
      });

      expect(fsResult).toStrictEqual({ content: 'file content' });
      expect(webResult).toStrictEqual({ results: ['result1', 'result2'] });
    });

    test('should handle tool execution errors', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const errorClient = {
        tools: vi.fn().mockResolvedValue({
          failing_tool: { name: 'failing_tool' },
        }),
        invoke: vi.fn().mockRejectedValue(new Error('Tool execution failed')),
        close: vi.fn(),
      };

      mockCreateMCPClient.mockResolvedValue(errorClient);

      await manager.connect({
        name: 'error-server',
        transport: { type: 'stdio' as const, command: 'mcp-error' },
      });

      await expect(manager.executeTool('failing_tool', {})).rejects.toThrow(
        'Tool execution failed',
      );
    });

    test('should handle unknown tool requests', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      await expect(manager.executeTool('unknown_tool', {})).rejects.toThrow(
        'Tool not found: unknown_tool',
      );
    });
  });

  describe('connection Health Monitoring', () => {
    test('should monitor connection health', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const healthyClient = {
        tools: vi.fn().mockResolvedValue({}),
        invoke: vi.fn(),
        close: vi.fn(),
        ping: vi.fn().mockResolvedValue('pong'),
      };

      mockCreateMCPClient.mockResolvedValue(healthyClient);

      await manager.connect({
        name: 'healthy-server',
        transport: { type: 'stdio' as const, command: 'mcp-healthy' },
      });

      const health = await manager.checkHealth();

      expect(health).toStrictEqual({
        'healthy-server': {
          status: 'healthy',
          lastCheck: expect.any(Date),
          responseTime: expect.any(Number),
        },
      });
    });

    test('should detect unhealthy connections', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const unhealthyClient = {
        tools: vi.fn().mockResolvedValue({}),
        invoke: vi.fn(),
        close: vi.fn(),
        ping: vi.fn().mockRejectedValue(new Error('Connection lost')),
      };

      mockCreateMCPClient.mockResolvedValue(unhealthyClient);

      await manager.connect({
        name: 'unhealthy-server',
        transport: { type: 'stdio' as const, command: 'mcp-unhealthy' },
      });

      const health = await manager.checkHealth();

      expect(health).toStrictEqual({
        'unhealthy-server': {
          status: 'unhealthy',
          error: 'Connection lost',
          lastCheck: expect.any(Date),
        },
      });
    });

    test('should automatically reconnect failed connections', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const reconnectingClient = {
        tools: vi.fn().mockResolvedValue({}),
        invoke: vi.fn(),
        close: vi.fn(),
        ping: vi
          .fn()
          .mockRejectedValueOnce(new Error('Connection lost'))
          .mockResolvedValueOnce('pong'),
      };

      mockCreateMCPClient.mockResolvedValue(reconnectingClient);

      const config = {
        name: 'reconnecting-server',
        transport: { type: 'stdio' as const, command: 'mcp-reconnect' },
        autoReconnect: true,
      };

      await manager.connect(config);

      // First health check fails
      let health = await manager.checkHealth();
      expect(health['reconnecting-server'].status).toBe('unhealthy');

      // Wait for auto-reconnect
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second health check succeeds
      health = await manager.checkHealth();
      expect(health['reconnecting-server'].status).toBe('healthy');
    });
  });

  describe('load Balancing', () => {
    test('should load balance requests across multiple servers', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const client1 = {
        tools: vi.fn().mockResolvedValue({
          shared_tool: { name: 'shared_tool' },
        }),
        invoke: vi.fn().mockResolvedValue({ server: 'server1' }),
        close: vi.fn(),
      };

      const client2 = {
        tools: vi.fn().mockResolvedValue({
          shared_tool: { name: 'shared_tool' },
        }),
        invoke: vi.fn().mockResolvedValue({ server: 'server2' }),
        close: vi.fn(),
      };

      mockCreateMCPClient.mockResolvedValueOnce(client1).mockResolvedValueOnce(client2);

      await manager.connect({
        name: 'server1',
        transport: { type: 'stdio' as const, command: 'mcp1' },
      });

      await manager.connect({
        name: 'server2',
        transport: { type: 'stdio' as const, command: 'mcp2' },
      });

      // Execute tool multiple times
      const results = [];
      for (let i = 0; i < 4; i++) {
        const result = await manager.executeToolWithLoadBalancing('shared_tool', {});
        results.push(result.server);
      }

      // Should round-robin between servers
      expect(results).toStrictEqual(['server1', 'server2', 'server1', 'server2']);
    });

    test('should handle server failures in load balancing', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const healthyClient = {
        tools: vi.fn().mockResolvedValue({
          shared_tool: { name: 'shared_tool' },
        }),
        invoke: vi.fn().mockResolvedValue({ server: 'healthy' }),
        close: vi.fn(),
      };

      const failingClient = {
        tools: vi.fn().mockResolvedValue({
          shared_tool: { name: 'shared_tool' },
        }),
        invoke: vi.fn().mockRejectedValue(new Error('Server failed')),
        close: vi.fn(),
      };

      mockCreateMCPClient.mockResolvedValueOnce(healthyClient).mockResolvedValueOnce(failingClient);

      await manager.connect({
        name: 'healthy-server',
        transport: { type: 'stdio' as const, command: 'mcp-healthy' },
      });

      await manager.connect({
        name: 'failing-server',
        transport: { type: 'stdio' as const, command: 'mcp-failing' },
      });

      // All requests should go to healthy server
      const results = [];
      for (let i = 0; i < 3; i++) {
        const result = await manager.executeToolWithLoadBalancing('shared_tool', {});
        results.push(result.server);
      }

      expect(results).toStrictEqual(['healthy', 'healthy', 'healthy']);
    });
  });

  describe('caching and Performance', () => {
    test('should cache tool definitions', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const config = {
        name: 'cacheable',
        transport: { type: 'stdio' as const, command: 'mcp-cache' },
      };

      mockMCPClient.tools.mockResolvedValue({
        cached_tool: { name: 'cached_tool' },
      });

      await manager.connect(config);

      // First call
      const tools1 = await manager.getAllTools();

      // Second call should use cache
      const tools2 = await manager.getAllTools();

      expect(mockMCPClient.tools).toHaveBeenCalledTimes(1);
      expect(tools1).toStrictEqual(tools2);
    });

    test('should invalidate cache when connections change', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const config = {
        name: 'invalidated',
        transport: { type: 'stdio' as const, command: 'mcp-invalidate' },
      };

      mockMCPClient.tools.mockResolvedValue({
        tool1: { name: 'tool1' },
      });

      await manager.connect(config);
      await manager.getAllTools(); // Cache tools

      // Disconnect and reconnect with different tools
      await manager.disconnect('invalidated');

      mockMCPClient.tools.mockResolvedValue({
        tool2: { name: 'tool2' },
      });

      await manager.connect(config);
      const tools = await manager.getAllTools();

      expect(tools).toStrictEqual({
        tool2: { name: 'tool2' },
      });
      expect(mockMCPClient.tools).toHaveBeenCalledTimes(2);
    });
  });

  describe('concurrent Operations', () => {
    test('should handle concurrent connections safely', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const configs = Array.from({ length: 10 }, (_, i) => ({
        name: `concurrent-${i}`,
        transport: { type: 'stdio' as const, command: `mcp-${i}` },
      }));

      mockMCPClient.tools.mockResolvedValue({});

      // Connect all servers concurrently
      const promises = configs.map(config => manager.connect(config));
      await Promise.all(promises);

      const connections = manager.getConnections();
      expect(connections).toHaveLength(10);
    });

    test('should handle concurrent tool executions', async () => {
      const { MCPConnectionManager } = await import('#/server/mcp/connection-manager');

      const manager = MCPConnectionManager.getInstance();

      const config = {
        name: 'concurrent-exec',
        transport: { type: 'stdio' as const, command: 'mcp-concurrent' },
      };

      mockMCPClient.tools.mockResolvedValue({
        concurrent_tool: { name: 'concurrent_tool' },
      });

      let executionCount = 0;
      mockMCPClient.invoke.mockImplementation(async () => {
        const id = ++executionCount;
        await new Promise(resolve => setTimeout(resolve, 50));
        return { executionId: id };
      });

      await manager.connect(config);

      // Execute tool concurrently
      const promises = Array.from({ length: 5 }, () => manager.executeTool('concurrent_tool', {}));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(results.map(r => r.executionId)).toStrictEqual([1, 2, 3, 4, 5]);
    });
  });
});
