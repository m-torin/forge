/**
 * MCP Utils Server Implementation
 * Provides MCP server for forge tools using modern McpServer API
 */

import {
  completable,
  type CompleteCallback,
} from '@modelcontextprotocol/sdk/server/completable.js';
import type {
  RegisteredPrompt,
  RegisteredResourceTemplate,
  RegisteredTool,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import {
  createServer,
  type Server as HttpServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { z, type ZodRawShape, type ZodTypeAny } from 'zod';
import { loadConfig, type LoadConfigOverrides, type McpServerConfig } from './config';
import { registerStandardPrompts } from './prompts';
import { registerStandardResources } from './resources';
import {
  CLEANUP_PRIORITIES,
  registerCleanupHandler,
  removeCleanupHandler,
} from './runtime/lifecycle';

// Import all tools
import {
  // Advanced tools - code analysis
  advancedMemoryMonitorTool,
  architectureDetectorTool,
  // Advanced tools - file & batch processing
  batchProcessorTool,
  calculateComplexityTool,
  circularDepsTool,
  // Session & context
  closeSessionTool,
  contextSessionManagerTool,
  dependencyAnalyzerTool,
  extractExportsTool,
  extractFileMetadataTool,
  extractImportsTool,
  fileDiscoveryTool,
  fileStreamingTool,
  initializeSessionTool,
  memoryAwareCacheTool,
  // Memory & performance
  memoryMonitorTool,
  // Utilities
  optimizationEngineTool,
  pathManagerTool,
  patternAnalyzerTool,
  reportGeneratorTool,
  resourceLifecycleManagerTool,
  safeStringifyTool,
  // Dependencies
  workflowOrchestratorTool,
  // Workflow & orchestration
  worktreeManagerTool,
} from './tools';

type CompletionMap = Record<string, CompleteCallback>;

interface BuildOptions {
  completions?: CompletionMap;
}

const TOOL_COMPLETIONS: Record<string, CompletionMap> = {};

/**
 * Convert JSON Schema fragments to Zod shapes for MCP tool registration.
 */
function buildZodSchemaFromJsonSchema(schema: any, options: BuildOptions = {}): ZodTypeAny {
  if (!schema || typeof schema !== 'object') {
    return z.any();
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    const enumValues = schema.enum as unknown[];
    if (enumValues.every((value): value is string => typeof value === 'string')) {
      return z.enum(enumValues as [string, ...string[]]);
    }

    const literalSchemas: ZodTypeAny[] = [];
    let unsupportedLiteral = false;

    for (const value of enumValues) {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
      ) {
        literalSchemas.push(z.literal(value as string | number | boolean | null));
      } else {
        unsupportedLiteral = true;
        break;
      }
    }

    if (!unsupportedLiteral) {
      if (literalSchemas.length === 1) {
        return literalSchemas[0];
      }
      return z.union(literalSchemas as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]);
    }

    return z.any();
  }

  const type = schema.type;

  if (!type) {
    return z.any();
  }

  if (Array.isArray(type)) {
    const variants = type.map(singleType =>
      buildZodSchemaFromJsonSchema(
        {
          ...schema,
          type: singleType,
        },
        options,
      ),
    );

    if (variants.length === 1) {
      return variants[0];
    }

    return z.union(variants as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]);
  }

  switch (type) {
    case 'string':
      return z.string();
    case 'number':
    case 'integer':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'array': {
      const itemSchema = buildZodSchemaFromJsonSchema(schema.items ?? {}, options);
      return z.array(itemSchema);
    }
    case 'object':
      return z.object(buildZodObjectFromJsonSchema(schema, options)).passthrough();
    default:
      return z.any();
  }
}

function buildZodObjectFromJsonSchema(schema: any, options: BuildOptions = {}): ZodRawShape {
  if (!schema || schema.type !== 'object') {
    return {};
  }

  const properties = schema.properties || {};
  const shape: Record<string, ZodTypeAny> = {};
  const completions = options.completions ?? {};

  for (const [key, prop] of Object.entries(properties) as [string, any][]) {
    let zodType = buildZodSchemaFromJsonSchema(prop, options);

    if (prop.description) {
      zodType = zodType.describe(prop.description);
    }

    const isRequired = Array.isArray(schema.required) && schema.required.includes(key);
    if (!isRequired) {
      zodType = zodType.optional();
    }

    if (prop.default !== undefined) {
      zodType = zodType.default(prop.default);
    }

    const completion = completions[key];
    if (completion && zodType instanceof z.ZodString) {
      zodType = completable(zodType as any, completion as any) as unknown as ZodTypeAny;
    }

    shape[key] = zodType;
  }

  return shape;
}

/**
 * Normalize tool execution results to the modern MCP schema.
 */
function wrapToolResponse(result: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent: {
    success: boolean;
    result: unknown;
    error?: string;
    metadata?: unknown;
  };
  isError?: boolean;
} {
  const toolResponse =
    result && typeof result === 'object' ? (result as Record<string, unknown>) : undefined;

  const content = Array.isArray(toolResponse?.content)
    ? (toolResponse!.content as Array<{ type: string; text: string }>)
    : [];

  const structuredFromTool =
    toolResponse && 'structuredContent' in toolResponse
      ? (toolResponse as { structuredContent?: unknown }).structuredContent
      : undefined;

  const parsedContent =
    typeof structuredFromTool !== 'undefined'
      ? structuredFromTool
      : extractStructuredPayload(content);
  const metadata = toolResponse?.metadata;

  let successFlag: boolean;
  if (typeof toolResponse?.success === 'boolean') {
    successFlag = toolResponse.success;
  } else if (typeof toolResponse?.isError === 'boolean') {
    successFlag = !toolResponse.isError;
  } else if (
    parsedContent &&
    typeof parsedContent === 'object' &&
    'success' in parsedContent &&
    typeof (parsedContent as Record<string, unknown>).success === 'boolean'
  ) {
    successFlag = Boolean((parsedContent as Record<string, unknown>).success);
  } else {
    successFlag = true;
  }

  const errorMessage =
    typeof toolResponse?.error === 'string'
      ? toolResponse.error
      : !successFlag && parsedContent && typeof parsedContent === 'object'
        ? (parsedContent as Record<string, unknown>).error?.toString()
        : undefined;

  const normalized = {
    success: successFlag,
    result: parsedContent,
    ...(errorMessage ? { error: errorMessage } : {}),
    ...(typeof metadata !== 'undefined' ? { metadata } : {}),
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(normalized, null, 2),
      },
    ],
    structuredContent: normalized,
    ...(successFlag ? {} : { isError: true }),
  };
}

function extractStructuredPayload(content: Array<{ type: string; text: string }>): unknown {
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  const primary = content.find(item => item.type === 'text') ?? content[0];
  const text = typeof primary?.text === 'string' ? primary.text.trim() : '';

  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const CLEANUP_HANDLER_NAME = 'mcp-utils-server-shutdown';

const STANDARD_TOOL_OUTPUT_SCHEMA = {
  success: z.boolean(),
  error: z.string().optional(),
  result: z.any().optional(),
  metadata: z.any().optional(),
} as const;

type ManagedTransport = {
  kind: 'stdio' | 'http';
  summary: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export default class MCPUtilsServer {
  private readonly server: McpServer;
  private readonly config: McpServerConfig;
  private readonly toolHandles = new Map<string, RegisteredTool>();
  private readonly resourceTemplateHandles: RegisteredResourceTemplate[] = [];
  private resourceCount = 0;
  private readonly promptHandles: RegisteredPrompt[] = [];
  private activeTransports: ManagedTransport[] = [];
  private lifecycleRegistered = false;

  constructor(overrides: LoadConfigOverrides = {}) {
    this.config = loadConfig(overrides);
    this.server = new McpServer({
      name: this.config.serverName,
      version: this.config.serverVersion,
    });

    this.registerTools();
    this.registerResources();
    this.registerPrompts();
  }

  private registerTools() {
    // ========================================
    // BASIC TOOLS
    // ========================================

    // Safe stringify utility
    this.registerToolDefinition(safeStringifyTool);

    // ========================================
    // ADVANCED TOOLS
    // ========================================

    // File & Batch Processing (4 tools)
    this.registerToolDefinition(batchProcessorTool);
    this.registerToolDefinition(fileDiscoveryTool);
    this.registerToolDefinition(fileStreamingTool);
    this.registerToolDefinition(pathManagerTool);

    // Code Analysis (6 tools)
    this.registerToolDefinition(extractImportsTool);
    this.registerToolDefinition(extractExportsTool);
    this.registerToolDefinition(calculateComplexityTool);
    this.registerToolDefinition(extractFileMetadataTool);
    this.registerToolDefinition(patternAnalyzerTool);
    this.registerToolDefinition(architectureDetectorTool);

    // Dependencies (2 tools)
    this.registerToolDefinition(dependencyAnalyzerTool);
    this.registerToolDefinition(circularDepsTool);

    // Memory & Performance (3 tools)
    this.registerToolDefinition(memoryMonitorTool);
    this.registerToolDefinition(advancedMemoryMonitorTool);
    this.registerToolDefinition(memoryAwareCacheTool);

    // Workflow & Orchestration (3 tools)
    this.registerToolDefinition(workflowOrchestratorTool);
    this.registerToolDefinition(worktreeManagerTool);
    this.registerToolDefinition(resourceLifecycleManagerTool);

    // Session & Context (3 tools)
    this.registerToolDefinition(initializeSessionTool);
    this.registerToolDefinition(closeSessionTool);
    this.registerToolDefinition(contextSessionManagerTool);

    // Utilities (2 tools)
    this.registerToolDefinition(reportGeneratorTool);
    this.registerToolDefinition(optimizationEngineTool);
  }

  private registerResources() {
    const { resourceCount, templateHandles } = registerStandardResources(this.server, this.config);
    this.resourceCount += resourceCount + templateHandles.length;
    this.resourceTemplateHandles.push(...templateHandles);
  }

  private registerPrompts() {
    const { promptHandles } = registerStandardPrompts(this.server);
    this.promptHandles.push(...promptHandles);
  }

  /**
   * Register a tool from an existing descriptor by normalizing its schemas and output.
   */
  private registerToolDefinition(tool: any): RegisteredTool {
    const completionOverrides = TOOL_COMPLETIONS[tool.name] ?? {};
    const inputSchema = buildZodObjectFromJsonSchema(tool.inputSchema, {
      completions: completionOverrides,
    });
    const outputSchema = STANDARD_TOOL_OUTPUT_SCHEMA;

    const registeredTool = this.server.registerTool(
      tool.name,
      {
        title: this.formatTitle(tool.name),
        description: tool.description || `MCP utility tool: ${tool.name}`,
        // TODO: replace casts once @modelcontextprotocol/sdk exposes a helper to coerce JSON Schema → ZodRawShape
        inputSchema: inputSchema as any,
        outputSchema: outputSchema as any,
        ...(tool.annotations ? { annotations: tool.annotations } : {}),
      },
      async (args: any) => {
        try {
          const result = await tool.execute(args, this.server);
          return wrapToolResponse(result);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: false,
                  error: errorMessage,
                }),
              },
            ],
            structuredContent: {
              success: false,
              error: errorMessage,
            },
            isError: true,
          };
        }
      },
    );

    this.toolHandles.set(tool.name, registeredTool);
    return registeredTool;
  }

  /**
   * Convert snake_case tool names to Title Case for display
   */
  private formatTitle(name: string): string {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async start(): Promise<void> {
    const transports = this.createTransports();

    this.activeTransports = transports;
    for (const managed of transports) {
      await managed.start();
    }

    this.registerLifecycle();
    this.logStartup();

    if (this.toolHandles.size > 0) {
      this.server.sendToolListChanged();
    }

    if (this.resourceCount > 0) {
      this.server.sendResourceListChanged();
    }

    if (this.promptHandles.length > 0) {
      this.server.sendPromptListChanged();
    }
  }

  async stop(): Promise<void> {
    if (this.activeTransports.length === 0 && !this.lifecycleRegistered) {
      return;
    }

    try {
      await this.server.close();
    } catch (error) {
      console.error('[MCP] Error while closing server:', error);
    }

    for (const managed of this.activeTransports) {
      try {
        await managed.stop();
      } catch (error) {
        console.error(`[MCP] Error while stopping transport "${managed.summary}":`, error);
      }
    }

    this.activeTransports = [];
    removeCleanupHandler(CLEANUP_HANDLER_NAME);
    this.lifecycleRegistered = false;
  }

  private createTransports(): ManagedTransport[] {
    const transports: ManagedTransport[] = [];
    const supportedTransports = new Set(['stdio', 'http']);

    const unsupported = this.config.transports.filter(
      transport => !supportedTransports.has(transport),
    );
    if (unsupported.length > 0) {
      throw new Error(`Unsupported transports configured: ${unsupported.join(', ')}.`);
    }

    if (this.config.transports.includes('stdio')) {
      const transport = new StdioServerTransport();
      transports.push({
        kind: 'stdio',
        summary: 'stdio',
        start: async () => {
          await this.server.connect(transport);
        },
        stop: async () => {
          const maybeClose = (transport as unknown as { close?: () => unknown }).close;
          if (typeof maybeClose === 'function') {
            const closeResult = maybeClose.call(transport);
            if (closeResult instanceof Promise) {
              await closeResult;
            }
          }
        },
      });
    }

    if (this.config.transports.includes('http')) {
      transports.push(createHttpTransportManager(this.server, this.config));
    }

    return transports;
  }

  private registerLifecycle() {
    if (this.lifecycleRegistered) {
      return;
    }

    registerCleanupHandler(
      CLEANUP_HANDLER_NAME,
      async () => {
        await this.stop();
      },
      CLEANUP_PRIORITIES.DEFAULT,
    );

    this.lifecycleRegistered = true;
  }

  private logStartup() {
    const transportSummary =
      this.activeTransports.map(({ summary }) => summary).join(', ') || 'none';
    console.error(`MCP Utils server running (v${this.config.serverVersion})`);
    console.error(`Server name: ${this.config.serverName}`);
    console.error(`Active transports: ${transportSummary}`);
    console.error(`Log level: ${this.config.logLevel}`);
  }
}

class HttpTransportError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpTransportError';
    this.status = status;
  }
}

function createHttpTransportManager(
  mcpServer: McpServer,
  config: McpServerConfig,
): ManagedTransport {
  const sessionTransports = new Map<string, StreamableHTTPServerTransport>();
  const httpServer: HttpServer = createServer();
  let isListening = false;

  const summarize = `http:${config.httpPort}${config.enableSse ? '+sse' : ''}`;

  const log = (message: string, error?: unknown) => {
    if (error instanceof Error && !(error instanceof HttpTransportError)) {
      console.error(`[MCP][HTTP] ${message}`, error);
      return;
    }
    console.error(`[MCP][HTTP] ${message}`);
  };

  const ensureSessionTransport = async (
    req: IncomingMessage,
    parsedBody: unknown,
  ): Promise<StreamableHTTPServerTransport> => {
    const sessionHeader = req.headers['mcp-session-id'];
    const sessionId = Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader;
    let transport = sessionId ? sessionTransports.get(sessionId) : undefined;

    const initializing = req.method === 'POST' && parsedBody && isInitializeRequest(parsedBody);

    if (!transport) {
      if (!initializing) {
        throw new HttpTransportError(
          400,
          'Invalid or missing MCP session. Send an initialize request first.',
        );
      }

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: !config.enableSse,
        onsessioninitialized: id => {
          sessionTransports.set(id, transport!);
          log(`Session initialized: ${id}`);
        },
        onsessionclosed: id => {
          sessionTransports.delete(id);
          log(`Session closed: ${id}`);
        },
      });

      const currentTransport = transport;
      currentTransport.onclose = () => {
        if (currentTransport.sessionId) {
          sessionTransports.delete(currentTransport.sessionId);
          log(`Session terminated: ${currentTransport.sessionId}`);
        }
      };

      currentTransport.onerror = error => {
        log(`Transport error`, error);
      };

      await mcpServer.connect(currentTransport);
    }

    return transport;
  };

  const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const parsedBody = req.method === 'POST' ? await readJsonBody(req) : undefined;

      const transport = await ensureSessionTransport(req, parsedBody);

      await transport.handleRequest(req, res, parsedBody);
    } catch (error) {
      const statusCode =
        error instanceof HttpTransportError
          ? error.status
          : typeof error === 'object' && error !== null && 'status' in error
            ? Number((error as { status: unknown }).status) || 500
            : 500;
      const message = error instanceof Error ? error.message : 'Internal server error';

      if (!res.headersSent) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' }).end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message,
            },
            id: null,
          }),
        );
      } else {
        res.end();
      }

      log(
        `Request error (${req.method ?? 'UNKNOWN'} ${req.url ?? '/'}): ${message}`,
        error instanceof HttpTransportError ? undefined : error,
      );
    }
  };

  httpServer.on('request', (req, res) => {
    void handleRequest(req, res);
  });

  const start = async () => {
    if (isListening) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        httpServer.off('listening', onListening);
        reject(error);
      };

      const onListening = () => {
        httpServer.off('error', onError);
        isListening = true;
        log(
          `Listening on port ${config.httpPort} (${config.enableSse ? 'SSE' : 'JSON responses'})`,
        );
        resolve();
      };

      httpServer.once('error', onError);
      httpServer.once('listening', onListening);
      httpServer.listen(config.httpPort);
    });

    httpServer.on('error', error => {
      if (isListening) {
        log(`Server error: ${(error as Error).message}`, error);
      }
    });
  };

  const stop = async () => {
    if (isListening) {
      await new Promise<void>((resolve, reject) => {
        httpServer.close(error => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }).catch(error => {
        log(`Error while closing HTTP server: ${(error as Error).message}`, error);
      });
    }

    isListening = false;

    const closeTasks = Array.from(sessionTransports.values()).map(async transport => {
      try {
        await transport.close();
      } catch (error) {
        log(`Error closing session transport`, error);
      }
    });

    await Promise.all(closeTasks);
    sessionTransports.clear();
  };

  return {
    kind: 'http',
    summary: summarize,
    start,
    stop,
  };
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();

  if (raw.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpTransportError(400, 'Invalid JSON payload');
  }
}
