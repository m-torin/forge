// MCP component exports
export { MCPConnectionManager } from './connection-manager';
export { MCPActivityLog } from './mcp-activity-log';
export { MCPConnectionManager as MCPConnectionManagerPrototype } from './mcp-connection-manager-prototype';
export { MCPDisplay } from './mcp-display';
export { MCPMarketplace } from './mcp-marketplace';
export { MCPPermissionManager, PermissionRequestModal } from './mcp-permission-manager';
export { MCPSidebar } from './mcp-sidebar';
export { MCPStatusBar } from './mcp-status-bar';
export { MCPToolDiscovery } from './mcp-tool-discovery';
export { MCPToolsPanel as MCPTools } from './mcp-tools';
export type { MCPTool } from './mcp-tools';

// Phase 3 MCP UI Components - Real Connection Status
export {
  McpConnectionStatusComponent,
  useMcpConnectionStatus,
  type McpConnectionStatus,
} from './connection-status';

export { McpFeatureBadge, McpFeatureIndicator } from './feature-indicator';

export { McpNotifications, useMcpNotifications } from './notifications';
