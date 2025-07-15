import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod/v4';
// application errors placeholder - using base Error class
class ApplicationAIError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApplicationAIError';
  }
}

/**
 * AI SDK v5 native write helper for execution framework
 */
function writeExecutionData(writer: UIMessageStreamWriter, data: any) {
  const typeMap: Record<string, string> = {
    tool_execution_start: 'data-tool-execution-start',
    tool_execution_end: 'data-tool-execution-end',
    tool_execution_error: 'error',
  };

  const v5Type = typeMap[data.type] || `data-${data.type}`;

  if (v5Type === 'error') {
    writer.write({
      type: 'error',
      errorText: (data.content || data)?.toString() || 'Unknown error',
    } as any);
  } else if (v5Type.startsWith('data-')) {
    writer.write({ type: v5Type as any, data: data.content || data } as any);
  } else {
    writer.write({ type: v5Type as any, ...data } as any);
  }
}

/**
 * Comprehensive tool execution framework for AI applications
 * Provides patterns for tool creation, execution, security, and lifecycle management
 */

/**
 * Tool execution context with enhanced capabilities
 */
export interface ToolExecutionContext {
  /** User information */
  user?: {
    id: string;
    type?: string;
    permissions?: string[];
  };

  /** Session information */
  session?: {
    id: string;
    [key: string]: any;
  };

  /** Execution environment */
  environment?: 'development' | 'production' | 'test';

  /** Data stream for real-time updates */
  dataStream?: UIMessageStreamWriter;

  /** Abort signal for cancellation */
  signal?: AbortSignal;

  /** Custom context data */
  [key: string]: any;
}

/**
 * Tool security configuration
 */
export interface ToolSecurityConfig {
  /** Required permissions to execute tool */
  requiredPermissions?: string[];

  /** Rate limiting configuration */
  rateLimit?: {
    maxCallsPerMinute?: number;
    maxCallsPerHour?: number;
    maxCallsPerDay?: number;
  };

  /** Input validation rules */
  inputValidation?: {
    maxStringLength?: number;
    allowedFileExtensions?: string[];
    blockedPatterns?: RegExp[];
  };

  /** Execution constraints */
  constraints?: {
    maxExecutionTime?: number; // ms
    maxMemoryUsage?: number; // bytes
    requiresAuth?: boolean;
  };
}

/**
 * Tool lifecycle hooks
 */
export interface ToolLifecycleHooks<TParams = any, TResult = any> {
  /** Called before validation */
  beforeValidation?: (params: TParams, context: ToolExecutionContext) => void | Promise<void>;

  /** Called after validation, before execution */
  beforeExecute?: (params: TParams, context: ToolExecutionContext) => void | Promise<void>;

  /** Called after successful execution */
  afterExecute?: (
    result: TResult,
    params: TParams,
    context: ToolExecutionContext,
  ) => void | Promise<void>;

  /** Called on error */
  onError?: (error: Error, params: TParams, context: ToolExecutionContext) => void | Promise<void>;

  /** Called after completion (success or failure) */
  afterComplete?: (context: ToolExecutionContext) => void | Promise<void>;
}

/**
 * Tool metadata for discovery and documentation
 */
export interface ToolMetadata {
  /** Tool category */
  category: string;

  /** Tags for organization */
  tags: string[];

  /** Version */
  version: string;

  /** Whether the tool is experimental */
  experimental?: boolean;

  /** Whether the tool is deprecated */
  deprecated?: boolean;

  /** Usage examples */
  examples?: Array<{
    description: string;
    params: any;
    expectedResult?: any;
  }>;

  /** Related tools */
  relatedTools?: string[];
}

/**
 * Enhanced tool definition
 */
export interface ToolDefinition<TParams extends z.ZodTypeAny = z.ZodTypeAny, TResult = any> {
  /** Tool name */
  name: string;

  /** Tool description */
  description: string;

  /** Parameter schema */
  parameters: TParams;

  /** Tool metadata */
  metadata: ToolMetadata;

  /** Security configuration */
  security?: ToolSecurityConfig;

  /** Lifecycle hooks */
  hooks?: ToolLifecycleHooks<z.infer<TParams>, TResult>;

  /** Main execution function */
  execute: (params: z.infer<TParams>, context: ToolExecutionContext) => Promise<TResult> | TResult;
}

/**
 * Tool execution result with metadata
 */
export interface ToolExecutionResult<T = any> {
  success: boolean;
  result?: T;
  error?: Error;
  metadata: {
    executionTime: number;
    toolName: string;
    timestamp: string;
    userId?: string;
  };
}

/**
 * Enhanced tool wrapper with security and lifecycle management
 */
export class Tool<TParams extends z.ZodTypeAny = z.ZodTypeAny, TResult = any> {
  private coreTool: ReturnType<typeof tool>;

  constructor(private definition: ToolDefinition<TParams, TResult>) {
    this.coreTool = this.createCoreTool();
  }

  private createCoreTool(): ReturnType<typeof tool> {
    return tool({
      description: this.definition.description,
      parameters: this.definition.parameters,
      execute: async (params: any, options: any) => {
        const context: ToolExecutionContext = {
          ...options,
          toolName: this.definition.name,
        };

        return this.executeWithLifecycle(params as z.infer<TParams>, context);
      },
    } as any);
  }

  private async executeWithLifecycle(
    params: z.infer<TParams>,
    context: ToolExecutionContext,
  ): Promise<TResult> {
    const startTime = Date.now();

    try {
      // Security checks
      await this.performSecurityChecks(params, context);

      // Before validation hook
      if (this.definition.hooks?.beforeValidation) {
        await this.definition.hooks.beforeValidation(params, context);
      }

      // Additional validation
      await this.validateInput(params, context);

      // Before execute hook
      if (this.definition.hooks?.beforeExecute) {
        await this.definition.hooks.beforeExecute(params, context);
      }

      // Send execution start status if streaming
      if (context.dataStream) {
        writeExecutionData(context.dataStream, {
          type: 'tool_execution_start',
          content: {
            toolName: this.definition.name,
            params: params as any,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Execute with timeout if configured
      let result: TResult;
      const timeout = this.definition.security?.constraints?.maxExecutionTime;

      if (timeout) {
        result = await this.executeWithTimeout(params, context, timeout);
      } else {
        result = await this.definition.execute(params, context);
      }

      // After execute hook
      if (this.definition.hooks?.afterExecute) {
        await this.definition.hooks.afterExecute(result, params, context);
      }

      // Send execution complete status if streaming
      if (context.dataStream) {
        writeExecutionData(context.dataStream, {
          type: 'tool_execution_complete',
          content: {
            toolName: this.definition.name,
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        });
      }

      return result;
    } catch (error) {
      // On error hook
      if (this.definition.hooks?.onError) {
        await this.definition.hooks.onError(error as Error, params, context);
      }

      // Send execution error status if streaming
      if (context.dataStream) {
        writeExecutionData(context.dataStream, {
          type: 'tool_execution_error',
          content: {
            toolName: this.definition.name,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
        });
      }

      throw new ApplicationAIError(
        error instanceof Error ? error.message : 'Tool execution failed',
        'tool_error:tool',
      );
    } finally {
      // After complete hook
      if (this.definition.hooks?.afterComplete) {
        await this.definition.hooks.afterComplete(context);
      }
    }
  }

  private async performSecurityChecks(
    params: z.infer<TParams>,
    context: ToolExecutionContext,
  ): Promise<void> {
    const security = this.definition.security;
    if (!security) return;

    // Check authentication
    if (security.constraints?.requiresAuth && !context.user?.id) {
      throw new ApplicationAIError('unauthorized:tool', 'Authentication required');
    }

    // Check permissions
    if (security.requiredPermissions?.length) {
      const userPermissions = context.user?.permissions || [];
      const hasPermission = security.requiredPermissions.every(perm =>
        userPermissions.includes(perm),
      );

      if (!hasPermission) {
        throw new ApplicationAIError('Insufficient permissions', 'forbidden:tool');
      }
    }
  }

  private async validateInput(
    params: z.infer<TParams>,
    _context: ToolExecutionContext,
  ): Promise<void> {
    const validation = this.definition.security?.inputValidation;
    if (!validation) return;

    // Validate string lengths
    if (validation.maxStringLength) {
      this.validateStringLengths(params, validation.maxStringLength);
    }

    // Check blocked patterns
    if (validation.blockedPatterns?.length) {
      this.checkBlockedPatterns(params, validation.blockedPatterns);
    }
  }

  private validateStringLengths(obj: any, maxLength: number, path = ''): void {
    if (typeof obj === 'string' && obj.length > maxLength) {
      throw new ApplicationAIError(
        'bad_request:tool',
        `String at ${path || 'root'} exceeds maximum length of ${maxLength}`,
      );
    }

    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        this.validateStringLengths(value, maxLength, path ? `${path}.${key}` : key);
      }
    }
  }

  private checkBlockedPatterns(obj: any, patterns: RegExp[]): void {
    const checkString = (str: string) => {
      for (const pattern of patterns) {
        if (pattern.test(str)) {
          throw new ApplicationAIError('bad_request:tool', 'Input contains blocked pattern');
        }
      }
    };

    if (typeof obj === 'string') {
      checkString(obj);
    } else if (typeof obj === 'object' && obj !== null) {
      for (const value of Object.values(obj)) {
        this.checkBlockedPatterns(value, patterns);
      }
    }
  }

  private async executeWithTimeout(
    params: z.infer<TParams>,
    context: ToolExecutionContext,
    timeout: number,
  ): Promise<TResult> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);

      (async () => {
        try {
          const result = await this.executeWithLifecycle(params, context);
          clearTimeout(timer);
          resolve(result);
        } catch (error) {
          clearTimeout(timer);
          reject(error);
        }
      })();
    });
  }

  get name(): string {
    return this.definition.name;
  }

  get metadata(): ToolMetadata {
    return this.definition.metadata;
  }

  get tool(): ReturnType<typeof tool> {
    return this.coreTool;
  }
}

/**
 * Tool execution framework
 */
export class ToolExecutionFramework {
  private tools = new Map<string, Tool>();
  private rateLimiters = new Map<string, RateLimiter>();

  register<TParams extends z.ZodTypeAny, TResult>(
    definition: ToolDefinition<TParams, TResult>,
  ): void {
    const tool = new Tool(definition);
    this.tools.set(definition.name, tool as any);

    // Set up rate limiter if configured
    if (definition.security?.rateLimit) {
      this.rateLimiters.set(definition.name, new RateLimiter(definition.security.rateLimit));
    }
  }

  unregister(name: string): void {
    this.tools.delete(name);
    this.rateLimiters.delete(name);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: string): Tool[] {
    return this.getAll().filter(tool => tool.metadata.category === category);
  }

  getByTags(tags: string[]): Tool[] {
    return this.getAll().filter(tool => tags.some(tag => tool.metadata.tags.includes(tag)));
  }

  async checkRateLimit(toolName: string, userId?: string): Promise<boolean> {
    const limiter = this.rateLimiters.get(toolName);
    if (!limiter || !userId) return true;

    return limiter.check(userId);
  }

  getToolsForExport(context?: ToolExecutionContext): Record<string, ReturnType<typeof tool>> {
    const tools: Record<string, ReturnType<typeof tool>> = {};

    for (const [name, enhancedTool] of this.tools) {
      // Skip deprecated tools unless explicitly requested
      if (enhancedTool.metadata.deprecated && !context?.includeDeprecated) {
        continue;
      }

      // Check permissions if context provided
      if (context?.user && (enhancedTool as any).definition.security?.requiredPermissions) {
        const hasPermission = (enhancedTool as any).definition.security.requiredPermissions.every(
          (perm: string) => context.user?.permissions?.includes(perm),
        );
        if (!hasPermission) continue;
      }

      tools[name] = enhancedTool.tool;
    }

    return tools;
  }
}

/**
 * Simple rate limiter implementation
 */
class RateLimiter {
  private counters = new Map<
    string,
    { minute: number; hour: number; day: number; timestamps: number[] }
  >();

  constructor(
    private config: {
      maxCallsPerMinute?: number;
      maxCallsPerHour?: number;
      maxCallsPerDay?: number;
    },
  ) {}

  check(userId: string): boolean {
    const now = Date.now();
    const counter = this.counters.get(userId) || { minute: 0, hour: 0, day: 0, timestamps: [] };

    // Clean old timestamps
    counter.timestamps = counter.timestamps.filter(ts => now - ts < 86400000); // 24 hours

    // Count calls in different time windows
    const minuteAgo = now - 60000;
    const hourAgo = now - 3600000;
    const dayAgo = now - 86400000;

    counter.minute = counter.timestamps.filter(ts => ts > minuteAgo).length;
    counter.hour = counter.timestamps.filter(ts => ts > hourAgo).length;
    counter.day = counter.timestamps.filter(ts => ts > dayAgo).length;

    // Check limits
    if (this.config.maxCallsPerMinute && counter.minute >= this.config.maxCallsPerMinute) {
      return false;
    }
    if (this.config.maxCallsPerHour && counter.hour >= this.config.maxCallsPerHour) {
      return false;
    }
    if (this.config.maxCallsPerDay && counter.day >= this.config.maxCallsPerDay) {
      return false;
    }

    // Update counter
    counter.timestamps.push(now);
    this.counters.set(userId, counter);

    return true;
  }
}

/**
 * Create an enhanced tool
 */
export function createTool<TParams extends z.ZodTypeAny, TResult>(
  definition: ToolDefinition<TParams, TResult>,
): Tool<TParams, TResult> {
  return new Tool(definition);
}

/**
 * Global tool framework instance
 */
export const globalToolFramework = new ToolExecutionFramework();

/**
 * Common tool patterns
 */
export const ToolPatterns = {
  /**
   * Create a simple query tool
   */
  query: <T>(config: {
    name: string;
    description: string;
    queryFunction: (query: string, options?: any) => Promise<T[]>;
    metadata?: Partial<ToolMetadata>;
  }) => {
    return createTool({
      name: config.name,
      description: config.description,
      parameters: z.object({
        query: z.string().min(1).describe('Search query'),
        limit: z.number().min(1).max(100).default(10).optional(),
      }),
      metadata: {
        category: 'search',
        tags: ['query'],
        version: '1.0.0',
        ...config.metadata,
      },
      execute: async (params: unknown, _context: ToolExecutionContext) => {
        const { query, limit } = params as { query: string; limit?: number };
        const results = await config.queryFunction(query, { limit });
        return {
          query,
          results,
          count: results.length,
        };
      },
    });
  },

  /**
   * Create a data transformation tool
   */
  transform: <TInput, TOutput>(config: {
    name: string;
    description: string;
    parameters: z.ZodSchema<TInput>;
    transform: (input: TInput) => TOutput | Promise<TOutput>;
    metadata?: Partial<ToolMetadata>;
  }) => {
    return createTool({
      name: config.name,
      description: config.description,
      parameters: z.object({
        input: config.parameters,
      }),
      metadata: {
        category: 'transform',
        tags: ['data'],
        version: '1.0.0',
        ...config.metadata,
      },
      execute: async (input: any, _options: any) => {
        const output = await config.transform(input as any);
        return {
          input,
          output,
          transformed: true,
        };
      },
    });
  },
};
