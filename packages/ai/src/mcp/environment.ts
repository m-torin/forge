import { logWarn } from '@repo/observability/server/next';
import type { MCPClientConfig } from './client';
import { mcpTransports } from './transports';

/**
 * Environment variable patterns for MCP server discovery
 */
export interface MCPEnvironmentConfig {
  /** Environment variable prefix for MCP servers (default: 'MCP_') */
  prefix?: string;
  /** Whether to include default servers (filesystem, git, etc.) */
  includeDefaults?: boolean;
  /** Base path for filesystem server (default: process.cwd()) */
  basePath?: string;
}

/**
 * Parsed MCP server configuration from environment
 */
export interface ParsedMCPServer {
  name: string;
  type: 'stdio' | 'sse' | 'http';
  url?: string;
  command?: string;
  args?: string[];
  enabled: boolean;
}

/**
 * Discover MCP servers from environment variables
 *
 * Environment variable format:
 * - MCP_SERVERS=filesystem,git,perplexity  # Enable specific servers
 * - MCP_FILESYSTEM_PATH=/workspace         # Configure filesystem path
 * - MCP_CUSTOM_SQLITE_DB=/data/app.db      # Configure sqlite database
 * - MCP_CUSTOM_SSE_URL=http://example.com  # Configure SSE server
 * - MCP_CUSTOM_HTTP_URL=http://example.com # Configure HTTP server
 */
export function discoverMCPServersFromEnvironment(
  config: MCPEnvironmentConfig = {},
): MCPClientConfig[] {
  const { prefix = 'MCP_', includeDefaults = true, basePath = process.cwd() } = config;

  const servers: MCPClientConfig[] = [];
  const enabledServers = getEnabledServers(prefix);

  // Add default servers if enabled
  if (includeDefaults) {
    if (enabledServers.includes('filesystem')) {
      const fsPath = process.env[`${prefix}FILESYSTEM_PATH`] || basePath;
      servers.push(mcpTransports.filesystem(fsPath));
    }

    if (enabledServers.includes('git')) {
      const gitPath = process.env[`${prefix}GIT_PATH`] || basePath;
      servers.push(mcpTransports.git(gitPath));
    }

    if (enabledServers.includes('perplexity') && process.env.PERPLEXITY_API_KEY) {
      servers.push(mcpTransports.perplexityAsk());
    }

    if (enabledServers.includes('sqlite')) {
      const dbPath = process.env[`${prefix}SQLITE_DB`];
      if (dbPath) {
        servers.push(mcpTransports.sqlite(dbPath));
      }
    }
  }

  // Discover custom servers from environment
  const customServers = discoverCustomServers(prefix, enabledServers);
  servers.push(...customServers);

  return servers;
}

/**
 * Get list of enabled servers from environment
 */
function getEnabledServers(prefix: string): string[] {
  const serversEnv = process.env[`${prefix}SERVERS`];
  if (!serversEnv) {
    return ['filesystem', 'git']; // Default enabled servers
  }

  return serversEnv
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0);
}

/**
 * Discover custom MCP servers from environment variables
 */
function discoverCustomServers(prefix: string, enabledServers: string[]): MCPClientConfig[] {
  const servers: MCPClientConfig[] = [];
  const processed = new Set<string>();

  // Look for custom server definitions
  for (const [envKey, envValue] of Object.entries(process.env)) {
    if (!envKey.startsWith(prefix) || !envValue) continue;

    // Parse pattern: MCP_CUSTOM_<NAME>_<TYPE>

    const match = envKey.match(new RegExp(`^${prefix}CUSTOM_(.+)_(URL|COMMAND|DB)$`));
    if (!match) continue;

    const [, serverName, configType] = match;
    const name = serverName.toLowerCase();

    // Skip if not enabled
    if (!enabledServers.includes(name) && !enabledServers.includes('*')) {
      continue;
    }

    // Skip if already processed
    if (processed.has(name)) continue;
    processed.add(name);

    const server = createCustomServer(prefix, name, configType.toLowerCase(), envValue);
    if (server) {
      servers.push(server);
    }
  }

  return servers;
}

/**
 * Create custom server configuration
 */
function createCustomServer(
  prefix: string,
  name: string,
  type: string,
  value: string,
): MCPClientConfig | null {
  const envPrefix = `${prefix}CUSTOM_${name.toUpperCase()}_`;

  switch (type) {
    case 'url': {
      // Determine if SSE or HTTP based on URL or explicit type
      const transportType = process.env[`${envPrefix}TYPE`]?.toLowerCase();

      if (transportType === 'sse' || value.includes('/sse')) {
        return {
          name: `custom-${name}`,
          transport: {
            type: 'sse',
            url: value,
            headers: parseHeaders(process.env[`${envPrefix}HEADERS`]),
          },
        };
      } else {
        // Default to HTTP transport
        const sessionId = process.env[`${envPrefix}SESSION_ID`];
        return {
          name: `custom-${name}`,
          transport: {
            type: 'http',
            httpUrl: value,
            sessionId,
          },
        };
      }
    }

    case 'command': {
      const args = process.env[`${envPrefix}ARGS`];
      return {
        name: `custom-${name}`,
        transport: {
          type: 'stdio',
          command: value,
          args: args ? args.split(',').map(arg => arg.trim()) : [],
        },
      };
    }

    case 'db': {
      // Assume SQLite for database paths
      return mcpTransports.sqlite(value);
    }

    default:
      logWarn(`Unknown custom server type: ${type} for server: ${name}`, {
        serverType: type,
        serverName: name,
        operation: 'mcp_environment_config',
      });
      return null;
  }
}

/**
 * Parse headers from environment variable
 */
function parseHeaders(headersStr?: string): Record<string, string> | undefined {
  if (!headersStr) return undefined;

  try {
    return JSON.parse(headersStr);
  } catch {
    // Try simple key=value,key=value format
    const headers: Record<string, string> = {};
    for (const pair of headersStr.split(',')) {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value) {
        headers[key] = value;
      }
    }
    return Object.keys(headers).length > 0 ? headers : undefined;
  }
}

/**
 * Get MCP server configurations with environment discovery
 * This combines explicit configs with environment-discovered servers
 */
export function getMCPServers(
  explicitConfigs: MCPClientConfig[] = [],
  envConfig: MCPEnvironmentConfig = {},
): MCPClientConfig[] {
  const discoveredConfigs = discoverMCPServersFromEnvironment(envConfig);

  // Merge explicit and discovered configs, with explicit taking precedence
  const allConfigs = [...explicitConfigs];
  const explicitNames = new Set(explicitConfigs.map(c => c.name));

  for (const discovered of discoveredConfigs) {
    if (!explicitNames.has(discovered.name)) {
      allConfigs.push(discovered);
    }
  }

  return allConfigs;
}

/**
 * Validate environment configuration and provide helpful error messages
 */
export function validateMCPEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check for required environment variables
  const enabledServers = getEnabledServers('MCP_');

  if (enabledServers.includes('perplexity') && !process.env.PERPLEXITY_API_KEY) {
    errors.push('Perplexity server enabled but PERPLEXITY_API_KEY not set');
  }

  if (enabledServers.includes('sqlite') && !process.env.MCP_SQLITE_DB) {
    warnings.push('SQLite server enabled but MCP_SQLITE_DB not set');
  }

  // Check for filesystem access
  if (enabledServers.includes('filesystem')) {
    const fsPath = process.env.MCP_FILESYSTEM_PATH || process.cwd();
    try {
      require('fs').accessSync(fsPath);
    } catch {
      errors.push(`Filesystem server enabled but path not accessible: ${fsPath}`);
    }
  }

  // Provide recommendations
  if (enabledServers.length === 0) {
    recommendations.push(
      'Consider enabling at least one MCP server via MCP_SERVERS environment variable',
    );
  }

  if (!process.env.MCP_SERVERS) {
    recommendations.push(
      'Set MCP_SERVERS to control which servers are enabled (e.g., MCP_SERVERS=filesystem,git)',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations,
  };
}
