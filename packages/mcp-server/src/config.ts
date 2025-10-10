import { z } from 'zod';

const transportSchema = z.enum(['stdio', 'http']);
const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

export const mcpServerConfigSchema = z.object({
  serverName: z.string().min(1),
  serverVersion: z.string().min(1),
  transports: z.array(transportSchema).nonempty(),
  httpPort: z.number().int().min(1).max(65535),
  enableSse: z.boolean(),
  logLevel: logLevelSchema,
});

export type McpServerConfig = z.infer<typeof mcpServerConfigSchema>;

const DEFAULT_CONFIG: McpServerConfig = {
  serverName: 'forge',
  serverVersion: '1.0.0',
  transports: ['stdio'],
  httpPort: 3000,
  enableSse: false,
  logLevel: 'info',
};

function parseTransports(
  rawValue: string | undefined,
): ['stdio' | 'http', ...('stdio' | 'http')[]] {
  if (!rawValue || rawValue.trim().length === 0) {
    return DEFAULT_CONFIG.transports;
  }

  const unique = new Set<string>();
  for (const entry of rawValue.split(',')) {
    const trimmed = entry.trim().toLowerCase();
    if (!trimmed) {
      continue;
    }
    if (transportSchema.safeParse(trimmed).success) {
      unique.add(trimmed);
    } else {
      throw new Error(`Unsupported MCP transport "${trimmed}". Supported transports: stdio, http.`);
    }
  }

  if (unique.size === 0) {
    return DEFAULT_CONFIG.transports;
  }

  return Array.from(unique) as ['stdio' | 'http', ...('stdio' | 'http')[]];
}

function parseBoolean(rawValue: string | undefined, fallback: boolean): boolean {
  if (rawValue === undefined) {
    return fallback;
  }

  const normalized = rawValue.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on') {
    return true;
  }

  if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') {
    return false;
  }

  throw new Error(`Invalid boolean value "${rawValue}". Expected true/false style syntax.`);
}

function parseInteger(rawValue: string | undefined, fallback: number): number {
  if (rawValue === undefined) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer value "${rawValue}".`);
  }

  return parsed;
}

export interface LoadConfigOverrides extends Partial<McpServerConfig> {}

export function loadConfig(overrides: LoadConfigOverrides = {}): McpServerConfig {
  const transports =
    overrides.transports ??
    parseTransports(process.env.MCP_TRANSPORTS ?? process.env.MCP_TRANSPORT);

  const candidate: McpServerConfig = {
    serverName: overrides.serverName ?? process.env.MCP_SERVER_NAME ?? DEFAULT_CONFIG.serverName,
    serverVersion:
      overrides.serverVersion ?? process.env.MCP_SERVER_VERSION ?? DEFAULT_CONFIG.serverVersion,
    transports,
    httpPort:
      overrides.httpPort ?? parseInteger(process.env.MCP_HTTP_PORT, DEFAULT_CONFIG.httpPort),
    enableSse:
      overrides.enableSse ?? parseBoolean(process.env.MCP_ENABLE_SSE, DEFAULT_CONFIG.enableSse),
    logLevel:
      overrides.logLevel ??
      (process.env.MCP_LOG_LEVEL
        ? (logLevelSchema.parse(
            process.env.MCP_LOG_LEVEL.toLowerCase(),
          ) as McpServerConfig['logLevel'])
        : DEFAULT_CONFIG.logLevel),
  };

  return mcpServerConfigSchema.parse(candidate);
}
