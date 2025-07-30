// Format MCP tool results for display
export function formatMCPToolResult(toolId: string, result: any): any {
  // Handle different tool result types
  switch (toolId) {
    case 'web-search':
    case 'web_search':
      return {
        type: 'web-results',
        data: result.results || result,
      };

    case 'code-interpreter':
    case 'code_interpreter':
      return {
        type: 'code-output',
        data: {
          output: result.output || result.stdout || '',
          exitCode: result.exitCode || result.exit_code || 0,
        },
      };

    default:
      return {
        type: 'json',
        data: result,
      };
  }
}
