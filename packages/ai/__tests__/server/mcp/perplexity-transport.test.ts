import type { MCPClientConfig } from '@/server/mcp/client';
import { mcpTransports } from '@/server/mcp/transports';
import { describe, expect, test } from 'vitest';

describe('perplexity MCP Transport', () => {
  describe('mcpTransports.perplexityAsk', () => {
    test('should create correct Perplexity Ask MCP config', () => {
      const config: MCPClientConfig = mcpTransports.perplexityAsk();

      expect(config).toStrictEqual({
        name: 'perplexity-ask',
        transport: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', 'server-perplexity-ask'],
        },
      });
    });

    test('should return consistent config on multiple calls', () => {
      const config1 = mcpTransports.perplexityAsk();
      const config2 = mcpTransports.perplexityAsk();

      expect(config1).toStrictEqual(config2);
      expect(config1).not.toBe(config2); // Different objects
    });

    test('should have correct transport type for stdio', () => {
      const config = mcpTransports.perplexityAsk();

      expect(config.transport.type).toBe('stdio');
      expect(config.transport.command).toBe('npx');
      expect(config.transport.args).toContain('-y');
      expect(config.transport.args).toContain('server-perplexity-ask');
    });

    test('should use standard MCP client config interface', () => {
      const config = mcpTransports.perplexityAsk();

      // Should have required properties
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('transport');
      expect(config.transport).toHaveProperty('type');

      // Should not have optional SSE properties
      expect(config.transport).not.toHaveProperty('url');
      expect(config.transport).not.toHaveProperty('headers');

      // Should not have optional HTTP properties
      expect(config.transport).not.toHaveProperty('httpUrl');
      expect(config.transport).not.toHaveProperty('sessionId');
    });
  });

  describe('integration with other transports', () => {
    test('should be available alongside other transport methods', () => {
      expect(typeof mcpTransports.perplexityAsk).toBe('function');
      expect(typeof mcpTransports.filesystem).toBe('function');
      expect(typeof mcpTransports.sqlite).toBe('function');
      expect(typeof mcpTransports.git).toBe('function');
      expect(typeof mcpTransports.sse).toBe('function');
      expect(typeof mcpTransports.stdio).toBe('function');
      expect(typeof mcpTransports.http).toBe('function');
    });

    test('should create different configs than other transports', () => {
      const perplexityConfig = mcpTransports.perplexityAsk();
      const filesystemConfig = mcpTransports.filesystem('/tmp');
      const gitConfig = mcpTransports.git('/repo');

      expect(perplexityConfig.name).not.toBe(filesystemConfig.name);
      expect(perplexityConfig.name).not.toBe(gitConfig.name);

      // All should be stdio but with different commands/args
      expect(perplexityConfig.transport.type).toBe('stdio');
      expect(filesystemConfig.transport.type).toBe('stdio');
      expect(gitConfig.transport.type).toBe('stdio');

      expect(perplexityConfig.transport.args).not.toStrictEqual(filesystemConfig.transport.args);
      expect(perplexityConfig.transport.args).not.toStrictEqual(gitConfig.transport.args);
    });

    test('should work in combined configurations', () => {
      const configs = [
        mcpTransports.perplexityAsk(),
        mcpTransports.filesystem('/tmp'),
        mcpTransports.git('/repo'),
      ];

      expect(configs).toHaveLength(3);

      // Each should have unique names
      const names = configs.map(c => c.name);
      expect(new Set(names).size).toBe(3);

      // All should be valid MCP configs
      configs.forEach(config => {
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('transport');
        expect(config.transport).toHaveProperty('type');
        expect(['stdio', 'sse', 'http']).toContain(config.transport.type);
      });
    });
  });

  describe('environment considerations', () => {
    test('should not require environment variables in config', () => {
      // Unlike some MCP servers that need env vars in the config,
      // Perplexity Ask should get PERPLEXITY_API_KEY from the environment
      // when the server starts, not from the transport config
      const config = mcpTransports.perplexityAsk();

      expect(config.transport).not.toHaveProperty('env');
      expect(config.transport).not.toHaveProperty('headers');
      expect(config.transport.args).not.toContain('PERPLEXITY_API_KEY');
    });

    test('should create config that works with MCP client creation', () => {
      const config = mcpTransports.perplexityAsk();

      // This config should be compatible with experimental_createMCPClient
      // when the transport is created from the config
      expect(config.transport.type).toBe('stdio');
      expect(typeof config.transport.command).toBe('string');
      expect(Array.isArray(config.transport.args)).toBeTruthy();
      expect(config.transport.command.length).toBeGreaterThan(0);
    });
  });

  describe('error cases', () => {
    test('should handle function call without arguments', () => {
      // Should not throw when called without args
      expect(() => mcpTransports.perplexityAsk()).not.toThrow();
    });

    test('should return valid config even with extra arguments', () => {
      // Function takes no args, but shouldn't break if called with them
      const config = (mcpTransports.perplexityAsk as any)('extra', 'args');

      expect(config).toStrictEqual({
        name: 'perplexity-ask',
        transport: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', 'server-perplexity-ask'],
        },
      });
    });
  });
});
