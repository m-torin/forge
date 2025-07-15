/**
 * AI SDK v5 Error Handling Integration Example for MCP
 *
 * This example demonstrates how to use the enhanced MCP error handling
 * that integrates with AI SDK v5 error callbacks and patterns.
 *
 * Key features demonstrated:
 * - onUncaughtError handler integration
 * - onFinish callback with proper cleanup
 * - Stream error handling
 * - AI SDK compatible error types
 * - Graceful degradation patterns
 */

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createMCPToolsForStreamText, type MCPClientConfig } from '../src/server/mcp';

// Example MCP client configurations
const mcpConfigs: MCPClientConfig[] = [
  {
    name: 'perplexity-search',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-perplexity'],
    },
    retry: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      retryableErrors: ['ECONNREFUSED', 'TIMEOUT', 'NETWORK_ERROR'],
    },
    gracefulDegradation: true,
    healthCheck: {
      enabled: true,
      intervalMs: 60000,
      timeoutMs: 5000,
      failureThreshold: 3,
      recoveryThreshold: 2,
    },
  },
  {
    name: 'filesystem-tools',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    },
    gracefulDegradation: true,
  },
];

/**
 * Example 1: Basic AI SDK v5 Error Handling Integration
 */
export async function basicErrorHandlingExample() {
  console.log('🚀 Starting basic AI SDK v5 error handling example...');

  try {
    // Create MCP tools with AI SDK v5 error handling integration
    const { tools, closeAllClients, onUncaughtError, onFinish } =
      await createMCPToolsForStreamText(mcpConfigs);

    console.log(`📋 Loaded ${Object.keys(tools).length} MCP tools:`, Object.keys(tools));

    // Use with streamText and AI SDK v5 error callbacks
    const result = streamText({
      model: openai('gpt-4o'),
      tools: {
        // Your built-in tools
        builtInTool: {
          description: 'A built-in tool for demonstration',
          parameters: { query: { type: 'string' } },
          execute: async ({ query }) => `Built-in result for: ${query}`,
        },
        // MCP tools with error handling
        ...tools,
      },
      prompt:
        'Help me search for information about TypeScript best practices and create a summary file.',

      // AI SDK v5 error handling integration
      onFinish: async event => {
        console.log('✅ Stream finished successfully');
        console.log('📊 Usage:', event.usage);
        console.log('🔧 Tool results:', event.toolResults);

        // Proper MCP cleanup
        await onFinish();
      },

      onError: error => {
        console.error('❌ Stream error occurred:', {
          name: error.name,
          message: error.message,
          cause: error.cause,
        });

        // Emergency cleanup
        try {
          await closeAllClients();
        } catch (cleanupError) {
          console.error('💥 Failed to cleanup after stream error:', cleanupError);
        }
      },

      // AI SDK v5 uncaught error handling
      onUncaughtError: error => {
        console.error('🚨 Uncaught error in AI SDK:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });

        // Delegate to MCP error handler
        onUncaughtError(error);
      },
    });

    // Process the stream
    console.log('📡 Processing stream...');
    for await (const part of result.textStream) {
      process.stdout.write(part);
    }
    console.log('✨ Stream processing complete!');
  } catch (error) {
    console.error('💥 Example failed:', error);
    throw error;
  }
}

/**
 * Example 2: Advanced Error Handling with Recovery
 */
export async function advancedErrorHandlingExample() {
  console.log('🚀 Starting advanced error handling example...');

  // Enhanced config with recovery settings
  const enhancedConfigs: MCPClientConfig[] = mcpConfigs.map(config => ({
    ...config,
    retry: {
      ...config.retry,
      maxAttempts: 5, // More aggressive retry
      retryableErrors: [
        'ECONNREFUSED',
        'ENOTFOUND',
        'TIMEOUT',
        'NETWORK_ERROR',
        'CONNECTION_LOST',
        'RATE_LIMIT',
      ],
    },
  }));

  try {
    const { tools, closeAllClients, onUncaughtError, onFinish } =
      await createMCPToolsForStreamText(enhancedConfigs);

    let recoveryAttempts = 0;
    const maxRecoveryAttempts = 3;

    const performStreamWithRecovery = async (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const result = streamText({
          model: openai('gpt-4o'),
          tools,
          prompt: 'Perform a complex task that might trigger various error conditions.',

          onFinish: async _event => {
            console.log('✅ Stream completed successfully');
            await onFinish();
            resolve();
          },

          onError: async error => {
            console.error(`❌ Stream error (attempt ${recoveryAttempts + 1}):`, error.message);

            // Check if error is recoverable
            const isRecoverable =
              error.message.includes('timeout') ||
              error.message.includes('network') ||
              error.message.includes('rate limit');

            if (isRecoverable && recoveryAttempts < maxRecoveryAttempts) {
              recoveryAttempts++;
              console.log(`🔄 Attempting recovery (${recoveryAttempts}/${maxRecoveryAttempts})...`);

              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 2000 * recoveryAttempts));

              // Retry the operation
              try {
                await performStreamWithRecovery();
                resolve();
              } catch (retryError) {
                reject(retryError);
              }
            } else {
              console.error('💀 Error not recoverable or max attempts reached');
              await closeAllClients();
              reject(error);
            }
          },

          onUncaughtError: error => {
            console.error('🚨 Uncaught error during recovery attempt:', error);
            onUncaughtError(error);
            reject(error);
          },
        });

        // Process stream
        try {
          const stream = await result.textStream;
          for await (const part of stream) {
            process.stdout.write(part);
          }
        } catch (error) {
          reject(error);
        }
      });
    };

    await performStreamWithRecovery();
    console.log('🎉 Advanced error handling example completed successfully!');
  } catch (error) {
    console.error('💥 Advanced example failed:', error);
    throw error;
  }
}

/**
 * Example 3: Error Monitoring and Analytics
 */
export async function errorMonitoringExample() {
  console.log('🚀 Starting error monitoring example...');

  const errorStats = {
    totalErrors: 0,
    recoveredErrors: 0,
    fatalErrors: 0,
    errorTypes: new Map<string, number>(),
  };

  try {
    const { tools, closeAllClients, onUncaughtError, onFinish } =
      await createMCPToolsForStreamText(mcpConfigs);

    // Enhanced error handler with monitoring
    const monitoringUncaughtErrorHandler = (error: Error) => {
      // Update statistics
      errorStats.totalErrors++;
      const errorType = error.name || 'UnknownError';
      errorStats.errorTypes.set(errorType, (errorStats.errorTypes.get(errorType) || 0) + 1);

      // Log error details for monitoring
      console.error('📊 Error Event:', {
        timestamp: new Date().toISOString(),
        errorType,
        message: error.message,
        recoverable: error.message.includes('timeout') || error.message.includes('network'),
        totalErrors: errorStats.totalErrors,
      });

      // Delegate to original handler
      onUncaughtError(error);
    };

    const monitoringFinishHandler = async () => {
      console.log('📈 Final Error Statistics:', {
        totalErrors: errorStats.totalErrors,
        recoveredErrors: errorStats.recoveredErrors,
        fatalErrors: errorStats.fatalErrors,
        errorTypes: Object.fromEntries(errorStats.errorTypes),
        successRate:
          errorStats.totalErrors > 0
            ? (1 - errorStats.fatalErrors / errorStats.totalErrors) * 100
            : 100,
      });

      await onFinish();
    };

    const result = streamText({
      model: openai('gpt-4o'),
      tools,
      prompt:
        'Test various operations that might trigger different error conditions for monitoring.',

      onFinish: monitoringFinishHandler,
      onError: error => {
        errorStats.fatalErrors++;
        console.error('💀 Fatal stream error:', error);
        closeAllClients();
      },
      onUncaughtError: monitoringUncaughtErrorHandler,
    });

    // Process stream with error tracking
    for await (const part of result.textStream) {
      process.stdout.write(part);
    }

    console.log('📊 Error monitoring example completed!');
  } catch (error) {
    errorStats.fatalErrors++;
    console.error('💥 Monitoring example failed:', error);
    throw error;
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  async function runAllExamples() {
    console.log('🎯 Running AI SDK v5 MCP Error Handling Examples');

    try {
      await basicErrorHandlingExample();
      console.log('='.repeat(50));

      await advancedErrorHandlingExample();
      console.log('='.repeat(50));

      await errorMonitoringExample();
      console.log('✅ All examples completed successfully!');
    } catch (error) {
      console.error('💥 Examples failed:', error);
      process.exit(1);
    }
  }

  runAllExamples();
}
