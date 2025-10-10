/**
 * AI SDK v5 Bash Tool - bash_20241022
 * Implements Anthropic's bash command execution capabilities
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import { tool } from 'ai';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod/v3';

const execAsync = promisify(exec);

/**
 * Bash tool input schema
 */
export const BashToolInputSchema = z.object({
  command: z.string().describe('The bash command to execute'),
  workingDirectory: z.string().optional().describe('Working directory for command execution'),
  timeout: z.number().optional().default(30000).describe('Command timeout in milliseconds'),
  env: z
    .record(z.string(), z.string())
    .optional()
    .describe('Environment variables for the command'),
});

export type BashToolInput = z.infer<typeof BashToolInputSchema>;

/**
 * Bash tool configuration
 */
export interface BashToolConfig {
  /** Enable command execution */
  enableExecution?: boolean;
  /** Allowed command patterns (regex) */
  allowedCommands?: RegExp[];
  /** Denied command patterns (regex) */
  deniedCommands?: RegExp[];
  /** Maximum output size in bytes */
  maxOutputSize?: number;
  /** Default timeout in milliseconds */
  defaultTimeout?: number;
  /** Sandbox mode - simulates commands without executing */
  sandbox?: boolean;
  /** Custom command executor */
  commandExecutor?: (command: string, options: any) => Promise<{ stdout: string; stderr: string }>;
}

/**
 * Default denied commands for security
 */
const DEFAULT_DENIED_COMMANDS = [
  /rm\s+-rf\s+\//, // Dangerous rm commands
  /:\(\)\s*{\s*:\|:/, // Fork bomb
  />\/dev\/sda/, // Direct disk access
  /mkfs/, // Format commands
  /dd\s+if=/, // Disk copy that could be destructive
  /chmod\s+777\s+\//, // Dangerous permission changes
  /curl.*\|\s*bash/, // Curl pipe to bash
  /wget.*\|\s*sh/, // Wget pipe to shell
];

/**
 * Create the bash_20241022 tool
 */
export function createBashTool(config: BashToolConfig = {}) {
  const {
    enableExecution = true,
    allowedCommands = [],
    deniedCommands = DEFAULT_DENIED_COMMANDS,
    maxOutputSize = 1024 * 1024, // 1MB default
    defaultTimeout = 30000,
    sandbox = false,
    commandExecutor,
  } = config;

  return tool({
    description: 'Execute bash commands and return output',
    inputSchema: BashToolInputSchema,
    execute: async (input, _options) => {
      const { command, workingDirectory, timeout = defaultTimeout, env } = input;

      logInfo('Bash Tool: Executing command', {
        operation: 'bash_tool_execute',
        metadata: {
          commandLength: command.length,
          hasWorkingDir: !!workingDirectory,
          timeout,
          sandbox,
        },
      });

      // Validate command
      if (!enableExecution) {
        throw new Error('Command execution is disabled');
      }

      // Check denied commands
      for (const pattern of deniedCommands) {
        if (pattern.test(command)) {
          logWarn('Bash Tool: Denied command pattern', {
            operation: 'bash_tool_denied',
            metadata: { pattern: pattern.toString() },
          });
          throw new Error('Command matches denied pattern');
        }
      }

      // Check allowed commands if specified
      if (allowedCommands.length > 0) {
        const isAllowed = allowedCommands.some(pattern => pattern.test(command));
        if (!isAllowed) {
          logWarn('Bash Tool: Command not in allowed list', {
            operation: 'bash_tool_not_allowed',
          });
          throw new Error('Command not in allowed list');
        }
      }

      // Sandbox mode - return simulated results
      if (sandbox) {
        return simulateBashCommand(command);
      }

      try {
        const startTime = Date.now();

        // Execute command
        const { stdout, stderr } = commandExecutor
          ? await commandExecutor(command, {
              cwd: workingDirectory,
              timeout,
              env: { ...process.env, ...env },
            })
          : await execAsync(command, {
              cwd: workingDirectory,
              timeout,
              maxBuffer: maxOutputSize,
              env: { ...process.env, ...env },
            });

        const executionTime = Date.now() - startTime;

        logInfo('Bash Tool: Command completed', {
          operation: 'bash_tool_success',
          metadata: {
            executionTime,
            stdoutSize: stdout.length,
            stderrSize: stderr.length,
          },
        });

        return {
          command,
          stdout: truncateOutput(stdout, maxOutputSize),
          stderr: truncateOutput(stderr, maxOutputSize),
          exitCode: 0,
          executionTime,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        const executionTime = Date.now() - Date.now();

        logError('Bash Tool: Command failed', {
          operation: 'bash_tool_error',
          metadata: {
            exitCode: error.code || -1,
            signal: error.signal,
          },
          error,
        });

        return {
          command,
          stdout: truncateOutput(error.stdout || '', maxOutputSize),
          stderr: truncateOutput(error.stderr || error.message || '', maxOutputSize),
          exitCode: error.code || -1,
          executionTime,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    },
  });
}

/**
 * Truncate output if it exceeds max size
 */
function truncateOutput(output: string, maxSize: number): string {
  if (output.length <= maxSize) {
    return output;
  }

  const truncated = output.slice(0, maxSize);
  return `${truncated}
... (output truncated at ${maxSize} bytes)`;
}

/**
 * Simulate bash command in sandbox mode
 */
function simulateBashCommand(command: string) {
  const simulatedOutputs: Record<string, any> = {
    ls: {
      stdout: 'file1.txt\nfile2.js\ndirectory/',
      stderr: '',
      exitCode: 0,
    },
    pwd: {
      stdout: '/home/user/project',
      stderr: '',
      exitCode: 0,
    },
    echo: {
      stdout: command.replace(/^echo\s+/, ''),
      stderr: '',
      exitCode: 0,
    },
    cat: {
      stdout: 'Simulated file contents',
      stderr: '',
      exitCode: 0,
    },
    grep: {
      stdout: 'matching line 1\nmatching line 2',
      stderr: '',
      exitCode: 0,
    },
  };

  const baseCommand = command.split(' ')[0];
  const result = simulatedOutputs[baseCommand] || {
    stdout: `Simulated output for: ${command}`,
    stderr: '',
    exitCode: 0,
  };

  return {
    command,
    ...result,
    sandbox: true,
    executionTime: Math.random() * 100,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Common bash patterns
 */
export const bashToolPatterns = {
  /**
   * Execute command with retry
   */
  executeWithRetry: async (
    command: string,
    maxRetries: number,
    tool: ReturnType<typeof createBashTool>,
  ) => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await tool.execute?.(
          { command, timeout: 30000 },
          { toolCallId: 'retry', messages: [], abortSignal: new AbortController().signal },
        );
        if (result && result.exitCode === 0) {
          return result;
        }
        lastError = result;
      } catch (error) {
        lastError = error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }

    throw lastError || new Error('Command failed after retries');
  },

  /**
   * Execute command pipeline
   */
  executePipeline: async (commands: string[], tool: ReturnType<typeof createBashTool>) => {
    const results = [];
    let previousOutput = '';

    for (const command of commands) {
      const fullCommand = previousOutput
        ? `echo '${previousOutput.replace(/'/g, "\\'")}' | ${command}`
        : command;

      const result = await tool.execute?.(
        { command: fullCommand, timeout: 30000 },
        { toolCallId: 'chain', messages: [], abortSignal: new AbortController().signal },
      );
      if (!result) {
        throw new Error(`Tool execute returned undefined for: ${command}`);
      }
      results.push(result);

      if (result.exitCode !== 0) {
        throw new Error(`Pipeline failed at: ${command}`);
      }

      previousOutput = result.stdout;
    }

    return {
      commands,
      results,
      finalOutput: previousOutput,
    };
  },

  /**
   * Execute command with environment setup
   */
  executeWithEnvironment: async (
    command: string,
    setupCommands: string[],
    tool: ReturnType<typeof createBashTool>,
  ) => {
    // Execute setup commands
    for (const setup of setupCommands) {
      const result = await tool.execute?.(
        { command: setup, timeout: 30000 },
        { toolCallId: 'setup', messages: [], abortSignal: new AbortController().signal },
      );
      if (!result) {
        throw new Error(`Tool execute returned undefined for setup: ${setup}`);
      }
      if (result.exitCode !== 0) {
        throw new Error(`Setup failed: ${setup}`);
      }
    }

    // Execute main command
    const result = await tool.execute?.(
      { command, timeout: 30000 },
      { toolCallId: 'main', messages: [], abortSignal: new AbortController().signal },
    );
    if (!result) {
      throw new Error(`Tool execute returned undefined for command: ${command}`);
    }
    return result;
  },

  /**
   * Safe file operations
   */
  safeFileOperation: async (
    operation: 'read' | 'write' | 'delete',
    path: string,
    content?: string,
    tool?: ReturnType<typeof createBashTool>,
  ) => {
    if (!tool) {
      throw new Error('Tool required for file operations');
    }

    switch (operation) {
      case 'read':
        const readResult = await tool.execute?.(
          { command: `cat "${path}"`, timeout: 30000 },
          { toolCallId: 'read', messages: [], abortSignal: new AbortController().signal },
        );
        if (!readResult) {
          throw new Error(`Tool execute returned undefined for read: ${path}`);
        }
        return readResult;

      case 'write':
        if (!content) {
          throw new Error('Content required for write operation');
        }
        const writeResult = await tool.execute?.(
          {
            command: `echo '${content.replace(/'/g, "\\'")}' > "${path}"`,
            timeout: 30000,
          },
          { toolCallId: 'write', messages: [], abortSignal: new AbortController().signal },
        );
        if (!writeResult) {
          throw new Error(`Tool execute returned undefined for write: ${path}`);
        }
        return writeResult;

      case 'delete':
        // First check if file exists
        const checkResult = await tool.execute?.(
          {
            command: `test -f "${path}" && echo "exists" || echo "not found"`,
            timeout: 30000,
          },
          { toolCallId: 'check', messages: [], abortSignal: new AbortController().signal },
        );
        if (!checkResult) {
          throw new Error(`Tool execute returned undefined for file check: ${path}`);
        }

        if (checkResult.stdout.trim() === 'exists') {
          const deleteResult = await tool.execute?.(
            { command: `rm "${path}"`, timeout: 30000 },
            { toolCallId: 'delete', messages: [], abortSignal: new AbortController().signal },
          );
          if (!deleteResult) {
            throw new Error(`Tool execute returned undefined for delete: ${path}`);
          }
          return deleteResult;
        }

        return {
          command: `rm "${path}"`,
          stdout: '',
          stderr: 'File not found',
          exitCode: 1,
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },
} as const;

/**
 * Create a secure bash tool with strict limitations
 */
export function createSecureBashTool(customConfig?: Partial<BashToolConfig>) {
  return createBashTool({
    enableExecution: true,
    allowedCommands: [
      /^ls(\s|$)/,
      /^pwd$/,
      /^echo\s/,
      /^cat\s/,
      /^grep\s/,
      /^find\s/,
      /^head\s/,
      /^tail\s/,
      /^wc\s/,
      /^sort\s/,
      /^uniq\s/,
      /^date$/,
      /^whoami$/,
    ],
    deniedCommands: DEFAULT_DENIED_COMMANDS,
    maxOutputSize: 100 * 1024, // 100KB
    defaultTimeout: 5000, // 5 seconds
    ...customConfig,
  });
}
