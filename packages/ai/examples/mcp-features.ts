/**
 * MCP Support Examples
 * Demonstrates all the MCP features following AI SDK patterns
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

// Import all MCP functionality
import {
  // Core MCP functionality
  createMCPToolsFromConfigs,
  createPooledMCPTools,
  // Edge runtime support
  createSmartMCPTools,
  discoverMCPServersFromEnvironment,
  edgeMCPTransports,
  getGlobalConnectionManager,
  getMCPServers,
  isEdgeRuntime,
  // Error types
  MCPConnectionError,
  // Advanced features
  MCPConnectionManager,
  MCPTransportError,
  mcpTransports,
  validateMCPEnvironment,
  type MCPClientConfig,
} from '../src/server-next';

/**
 * Example 1: Basic MCP usage following AI SDK patterns
 */
export async function basicMCPExample() {
  console.log('🔧 Basic MCP Tools Example');

  // Create MCP client configurations
  const configs: MCPClientConfig[] = [
    mcpTransports.filesystem('./workspace'),
    mcpTransports.git('./'),
  ];

  // If Perplexity API key is available, add web search
  if (process.env.PERPLEXITY_API_KEY) {
    configs.push(mcpTransports.perplexityAsk());
  }

  // Create tools following AI SDK pattern
  const { tools, closeAllClients } = await createMCPToolsFromConfigs(configs, {
    gracefulDegradation: true, // Continue if some servers fail
  });

  console.log(`📦 Loaded ${Object.keys(tools).length} MCP tools`);

  // Use tools with AI model (exact AI SDK pattern)
  const result = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    tools,
    prompt: 'List the files in the current directory and tell me about this project',
    maxSteps: 3,
  });

  console.log('🤖 AI Response:', result.text);
  console.log('⚙️ Tool calls:', result.toolCalls?.length || 0);

  await closeAllClients();

  return result;
}

/**
 * Example 2: Advanced connection pooling and monitoring
 */
export async function connectionPoolingExample() {
  console.log('🔗 Connection Pooling Example');

  // Create connection manager with custom configuration
  const manager = new MCPConnectionManager({
    maxConnections: 5,
    connectionTimeout: 10000,
    healthCheckInterval: 30000,
    retryAttempts: 2,
  });

  // Set up event listeners for monitoring
  manager.on('created', config => {
    console.log(`✅ Created connection: ${config.name}`);
  });

  manager.on('destroyed', config => {
    console.log(`🗑️ Destroyed connection: ${config.name}`);
  });

  manager.on('error', (config, error) => {
    console.warn(`❌ Connection error for ${config.name}:`, error.message);
  });

  manager.on('healthCheck', (config, healthy) => {
    console.log(`🏥 Health check ${config.name}: ${healthy ? 'healthy' : 'unhealthy'}`);
  });

  // Use pooled connections
  const configs: MCPClientConfig[] = [mcpTransports.filesystem('./'), mcpTransports.git('./')];

  const { tools } = await createPooledMCPTools(configs, {
    useGlobalPool: false,
    poolConfig: { maxConnections: 3 },
  });

  // Get connection statistics
  const stats = manager.getStats();
  console.log('📊 Connection Stats:', stats);

  // Perform manual health check
  await manager.performHealthCheck();

  await manager.closeAll();

  return { tools, stats };
}

/**
 * Example 3: Environment-based MCP server discovery
 */
export async function environmentDiscoveryExample() {
  console.log('🌍 Environment Discovery Example');

  // Validate environment configuration
  const validation = validateMCPEnvironment();
  if (!validation.isValid) {
    console.warn('⚠️ Environment validation issues:', validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:', validation.warnings);
  }

  if (validation.recommendations.length > 0) {
    console.log('💡 Recommendations:', validation.recommendations);
  }

  // Discover servers from environment
  const discoveredConfigs = discoverMCPServersFromEnvironment({
    prefix: 'MCP_',
    includeDefaults: true,
    basePath: process.cwd(),
  });

  console.log(`🔍 Discovered ${discoveredConfigs.length} MCP servers from environment`);

  // Combine with explicit configurations
  const explicitConfigs: MCPClientConfig[] = [
    mcpTransports.sqlite(':memory:'), // In-memory SQLite for testing
  ];

  const allConfigs = getMCPServers(explicitConfigs, {
    prefix: 'MCP_',
    includeDefaults: true,
  });

  console.log(`📋 Total configurations: ${allConfigs.length}`);

  // Create tools with graceful degradation
  const { tools, closeAllClients } = await createMCPToolsFromConfigs(allConfigs, {
    gracefulDegradation: true,
  });

  await closeAllClients();

  return { discoveredConfigs, allConfigs, tools };
}

/**
 * Example 4: Edge runtime compatibility
 */
export async function edgeRuntimeExample() {
  console.log('⚡ Edge Runtime Example');

  const runtime = isEdgeRuntime() ? 'edge' : 'node';
  console.log(`🏃 Detected runtime: ${runtime}`);

  // Define configurations for both runtimes
  const nodeConfigs: MCPClientConfig[] = [mcpTransports.filesystem('./'), mcpTransports.git('./')];

  const edgeConfigs = [edgeMCPTransports.sse('example-sse', 'https://example.com/mcp/sse')];

  // Smart tool creation that adapts to runtime
  const {
    tools,
    clients,
    closeAllClients,
    runtime: detectedRuntime,
  } = await createSmartMCPTools(nodeConfigs, edgeConfigs, {
    gracefulDegradation: true,
    discoverFromEnvironment: true,
  });

  console.log(`🔧 Created ${Object.keys(tools).length} tools for ${detectedRuntime} runtime`);
  console.log(`🔗 Active clients: ${clients.length}`);

  await closeAllClients();

  return { tools, runtime: detectedRuntime };
}

/**
 * Example 5: Error handling and recovery
 */
export async function errorHandlingExample() {
  console.log('🛡️ Error Handling Example');

  // Test with invalid configurations
  const invalidConfigs: MCPClientConfig[] = [
    {
      name: 'invalid-stdio',
      transport: {
        type: 'stdio',
        command: 'nonexistent-command',
        args: [],
      },
    },
    {
      name: 'invalid-sse',
      transport: {
        type: 'sse',
        url: 'invalid-url',
      },
    },
    mcpTransports.filesystem('./'), // Valid config
  ];

  try {
    // Test with graceful degradation enabled
    const { tools, closeAllClients } = await createMCPToolsFromConfigs(invalidConfigs, {
      gracefulDegradation: true,
    });

    console.log(
      `✅ Graceful degradation: ${Object.keys(tools).length} tools loaded despite errors`,
    );
    await closeAllClients();

    // Test with graceful degradation disabled
    try {
      await createMCPToolsFromConfigs([invalidConfigs[0]], {
        gracefulDegradation: false,
      });
    } catch (error) {
      if (error instanceof MCPConnectionError) {
        console.log('✅ Caught MCPConnectionError:', error.message);
        console.log('  - Client name:', error.clientName);
        console.log('  - Transport type:', error.transportType);
      } else if (error instanceof MCPTransportError) {
        console.log('✅ Caught MCPTransportError:', error.message);
        console.log('  - Transport type:', error.transportType);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Example 6: Production-ready setup with monitoring
 */
export async function productionSetupExample() {
  console.log('🏭 Production Setup Example');

  // Use global connection manager for application-wide connection pooling
  const manager = getGlobalConnectionManager({
    maxConnections: 10,
    connectionTimeout: 15000,
    healthCheckInterval: 60000,
    retryAttempts: 3,
    retryDelay: 2000,
  });

  // Set up comprehensive monitoring
  manager.on('created', config => {
    console.log(`[MCP] Created connection: ${config.name}`);
  });

  manager.on('error', (config, error) => {
    console.error(`[MCP] Error in ${config.name}:`, error.message);
    // In production, send to monitoring service
  });

  manager.on('healthCheck', (config, healthy) => {
    if (!healthy) {
      console.warn(`[MCP] Health check failed for ${config.name}`);
      // In production, alert operations team
    }
  });

  // Environment-based configuration for production
  const configs = getMCPServers([], {
    prefix: 'MCP_',
    includeDefaults: true,
  });

  if (configs.length === 0) {
    console.log('💡 No MCP servers configured. Set MCP_SERVERS environment variable.');
    return { tools: {}, stats: null };
  }

  // Create tools with connection pooling
  const { tools } = await createPooledMCPTools(configs, {
    useGlobalPool: true,
  });

  // Get monitoring data
  const stats = manager.getStats();
  console.log('📊 Production stats:', {
    totalConnections: stats.totalConnections,
    healthyConnections: stats.healthyConnections,
    totalUseCount: stats.totalUseCount,
  });

  return { tools, stats, manager };
}

/**
 * Run all MCP examples
 */
export async function runAllMCPExamples() {
  console.log('🚀 Running All MCP Examples');

  try {
    console.log('1️⃣ Basic MCP Usage');
    await basicMCPExample();
    console.log('' + '='.repeat(60) + '');

    console.log('2️⃣ Connection Pooling');
    await connectionPoolingExample();
    console.log('' + '='.repeat(60) + '');

    console.log('3️⃣ Environment Discovery');
    await environmentDiscoveryExample();
    console.log('' + '='.repeat(60) + '');

    console.log('4️⃣ Edge Runtime Support');
    await edgeRuntimeExample();
    console.log('' + '='.repeat(60) + '');

    console.log('5️⃣ Error Handling');
    await errorHandlingExample();
    console.log('' + '='.repeat(60) + '');

    console.log('6️⃣ Production Setup');
    await productionSetupExample();

    console.log('' + '🎉'.repeat(20));
    console.log('✅ ALL MCP EXAMPLES COMPLETED SUCCESSFULLY');
    console.log('🎉'.repeat(20));
  } catch (error) {
    console.error('❌ Example failed:', error);
    throw error;
  }
}

// Export for testing
export const mcpExamples = {
  basic: basicMCPExample,
  connectionPooling: connectionPoolingExample,
  environmentDiscovery: environmentDiscoveryExample,
  edgeRuntime: edgeRuntimeExample,
  errorHandling: errorHandlingExample,
  productionSetup: productionSetupExample,
  runAll: runAllMCPExamples,
};
