import { getMCPClient, type MCPToolInvocation } from '#/lib/mcp/client';
import { tool } from 'ai';
import { z } from 'zod/v4';

// Dynamic tool factory for MCP tools
export function createMCPTool(connectionId: string, toolDefinition: any) {
  // Build Zod schema from MCP parameter definitions
  const schemaFields: Record<string, any> = {};

  if (toolDefinition.parameters) {
    for (const param of toolDefinition.parameters) {
      let fieldSchema;

      switch (param.type) {
        case 'string':
          fieldSchema = z.string();
          break;
        case 'number':
          fieldSchema = z.number();
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'object':
          fieldSchema = z.object({});
          break;
        case 'array':
          fieldSchema = z.array(z.any());
          break;
        default:
          fieldSchema = z.any();
      }

      if (param.description) {
        fieldSchema = fieldSchema.describe(param.description);
      }

      if (!param.required) {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[param.name] = fieldSchema;
    }
  }

  const schema = z.object(schemaFields);

  return tool({
    description: toolDefinition.description,
    parameters: schema,
    execute: async args => {
      const client = getMCPClient();

      const invocation: MCPToolInvocation = {
        toolId: toolDefinition.id,
        connectionId,
        parameters: args,
      };

      const result = await client.invokeTool(invocation);

      if (result.status === 'error') {
        throw new Error(result.error || 'Tool execution failed');
      }

      return result.result;
    },
  });
}

// Get all available MCP tools as AI SDK tools
export function getMCPTools() {
  const client = getMCPClient();
  const connections = client.getConnections();
  const tools: Record<string, any> = {};

  for (const connection of connections) {
    if (connection.status !== 'connected') continue;

    for (const toolDef of connection.tools) {
      if (!toolDef.isEnabled) continue;

      const toolKey = `mcp-${connection.id}-${toolDef.id}`;
      tools[toolKey] = createMCPTool(connection.id, toolDef);
    }
  }

  return tools;
}

// Pre-defined MCP tools for common operations
export const mcpWebSearch = tool({
  description: 'Search the web using MCP connection',
  parameters: z.object({
    query: z.string().describe('Search query'),
    limit: z.number().optional().default(5).describe('Maximum number of results'),
  }),
  execute: async ({ query, limit }) => {
    const client = getMCPClient();
    const connections = client.getConnections();

    // Find a connection with web search capability
    const connection = connections.find(
      c => c.status === 'connected' && c.tools.some(t => t.id === 'web-search' && t.isEnabled),
    );

    if (!connection) {
      throw new Error('No MCP connection with web search capability available');
    }

    const result = await client.invokeTool({
      toolId: 'web-search',
      connectionId: connection.id,
      parameters: { query, limit },
    });

    if (result.status === 'error') {
      throw new Error(result.error || 'Web search failed');
    }

    return result.result;
  },
});

export const mcpCodeInterpreter = tool({
  description: 'Execute Python code using MCP connection',
  parameters: z.object({
    code: z.string().describe('Python code to execute'),
    timeout: z.number().optional().default(30000).describe('Execution timeout in milliseconds'),
  }),
  execute: async ({ code, timeout }) => {
    const client = getMCPClient();
    const connections = client.getConnections();

    // Find a connection with code interpreter capability
    const connection = connections.find(
      c =>
        c.status === 'connected' && c.tools.some(t => t.id === 'code-interpreter' && t.isEnabled),
    );

    if (!connection) {
      throw new Error('No MCP connection with code interpreter capability available');
    }

    const result = await client.invokeTool({
      toolId: 'code-interpreter',
      connectionId: connection.id,
      parameters: { code, timeout },
    });

    if (result.status === 'error') {
      throw new Error(result.error || 'Code execution failed');
    }

    return result.result;
  },
});

// Tool result formatter for UI display
export function formatMCPToolResult(toolId: string, result: any): React.ReactNode {
  switch (toolId) {
    case 'web-search':
      if (result.results && Array.isArray(result.results)) {
        return result.results;
      }
      break;

    case 'code-interpreter':
      if (result.output) {
        return `Output: ${result.output}
Exit Code: ${result.exitCode}`;
      }
      break;
  }

  // Default JSON display
  return result;
}
