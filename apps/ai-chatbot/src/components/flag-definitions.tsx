/**
 * Embed flag definitions in HTML for offline support
 * This allows the Vercel Toolbar to read flag metadata even when the API is unavailable
 */
export function FlagDefinitions() {
  const flagDefinitions = {
    'mcp-feature-flags-enabled': {
      description: 'Master toggle for all MCP feature flags',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-feature-flags-enabled`,
      options: [
        { value: false, label: 'Disabled' },
        { value: true, label: 'Enabled' },
      ],
    },
    'mcp-enabled': {
      description: 'Enable MCP client using @repo/ai functionality',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-enabled`,
      options: [
        { value: false, label: 'Mock Implementation' },
        { value: true, label: 'Real MCP Client' },
      ],
    },
    'mcp-error-handling-enabled': {
      description: 'Enable AI SDK v5 error handling integration for MCP',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-error-handling-enabled`,
      options: [
        { value: false, label: 'Basic Error Handling' },
        { value: true, label: 'AI SDK v5 Error Handling' },
      ],
    },
    'mcp-stream-lifecycle-enabled': {
      description: 'Enable stream lifecycle management for MCP',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-stream-lifecycle-enabled`,
      options: [
        { value: false, label: 'Basic Stream Management' },
        { value: true, label: 'Full Lifecycle Management' },
      ],
    },
    'mcp-health-monitoring-enabled': {
      description: 'Enable MCP health monitoring and diagnostics',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-health-monitoring-enabled`,
      options: [
        { value: false, label: 'Basic Monitoring' },
        { value: true, label: 'Full Health Diagnostics' },
      ],
    },
    'mcp-graceful-degradation-enabled': {
      description: 'Enable graceful degradation for MCP failures',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-graceful-degradation-enabled`,
      options: [
        { value: false, label: 'Fail Fast' },
        { value: true, label: 'Graceful Fallback' },
      ],
    },
    'mcp-demo-mode-enabled': {
      description: 'Enable MCP demo mode with mock data',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-demo-mode-enabled`,
      options: [
        { value: false, label: 'Production Mode' },
        { value: true, label: 'Demo Mode' },
      ],
    },
    'mcp-connection-pooling-enabled': {
      description: 'Enable MCP connection pooling and optimization',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-connection-pooling-enabled`,
      options: [
        { value: false, label: 'Individual Connections' },
        { value: true, label: 'Connection Pooling' },
      ],
    },
    'mcp-analytics-enabled': {
      description: 'Enable MCP analytics and telemetry',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#mcp-analytics-enabled`,
      options: [
        { value: false, label: 'No Analytics' },
        { value: true, label: 'Full Telemetry' },
      ],
    },
    'rag-enabled': {
      description: 'Enable RAG functionality',
      origin: `${process.env.NEXT_PUBLIC_APP_URL}/#rag-enabled`,
      options: [
        { value: 'disabled', label: 'Disabled' },
        { value: 'mock', label: 'Mock Implementation' },
        { value: 'enabled', label: 'Production RAG' },
      ],
    },
  };

  return (
    <script
      type="application/json"
      data-flag-definitions
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(flagDefinitions),
      }}
    />
  );
}
