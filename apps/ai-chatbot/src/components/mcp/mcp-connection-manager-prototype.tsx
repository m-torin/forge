'use client';

import { Button } from '#/components/ui/button';
import type { MCPConnection } from '#/lib/mcp/types';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { useDisclosure } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Plus,
  Settings,
  Trash2,
  WifiOff,
} from 'lucide-react';
import * as React from 'react';
import { useCallback, useState } from 'react';

interface MCPConnectionManagerProps {
  onConnectionsChange: (connections: MCPConnection[]) => void;
  className?: string;
}

export function MCPConnectionManager({
  onConnectionsChange,
  className,
}: MCPConnectionManagerProps) {
  const prototypeMode = isPrototypeMode();

  // Mock connections for prototype mode
  const mockConnections: MCPConnection[] = [
    {
      id: 'local-tools',
      name: 'Local Development Tools',
      description: 'Local file system and development utilities',
      transport: 'stdio',
      config: {
        transport: 'stdio',
        name: 'Local Development Tools',
        description: 'Local file system and development utilities',
        command: 'mcp-tools-server',
        args: ['--port', '3001'],
      },
      status: 'connected',
      tools: [
        {
          id: 'local-tools-file-reader',
          name: 'file-reader',
          description: 'Read and analyze files from the local filesystem',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path to read' },
            },
            required: ['path'],
          },
        },
        {
          id: 'local-tools-code-formatter',
          name: 'code-formatter',
          description: 'Format code in various programming languages',
          parameters: {
            type: 'object',
            properties: {
              code: { type: 'string', description: 'Code to format' },
              language: { type: 'string', description: 'Programming language' },
            },
            required: ['code', 'language'],
          },
        },
      ],
      connectedAt: new Date().toISOString(),
      metrics: {
        totalCalls: 45,
        successfulCalls: 43,
        failedCalls: 2,
        averageLatency: 120,
      },
    },
    {
      id: 'web-search',
      name: 'Web Search & Research',
      description: 'Advanced web search and research capabilities',
      transport: 'sse',
      config: {
        transport: 'sse',
        name: 'Web Search & Research',
        description: 'Advanced web search and research capabilities',
        url: 'https://search.example.com/mcp',
        headers: { Authorization: 'Bearer mock-token' },
      },
      status: 'connected',
      tools: [
        {
          id: 'web-tools-web-search',
          name: 'web-search',
          description: 'Search the web for information',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              limit: { type: 'number', description: 'Number of results', default: 10 },
            },
            required: ['query'],
          },
        },
        {
          id: 'web-tools-arxiv-search',
          name: 'arxiv-search',
          description: 'Search academic papers on ArXiv',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              category: { type: 'string', description: 'ArXiv category' },
            },
            required: ['query'],
          },
        },
      ],
      connectedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      metrics: {
        totalCalls: 128,
        successfulCalls: 125,
        failedCalls: 3,
        averageLatency: 850,
      },
    },
    {
      id: 'database',
      name: 'Database Connector',
      description: 'Connect to various database systems',
      transport: 'sse',
      config: {
        transport: 'sse',
        name: 'Database Connector',
        description: 'Connect to various database systems',
        url: 'https://db.internal.com/mcp',
        headers: { Authorization: 'Bearer invalid-token' },
      },
      status: 'error',
      tools: [],
      connectedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      metrics: {
        totalCalls: 5,
        successfulCalls: 0,
        failedCalls: 5,
        averageLatency: 0,
      },
    },
  ];

  const [connections, setConnections] = useState<MCPConnection[]>(
    prototypeMode ? mockConnections : [],
  );
  const [showAddForm, { open: _openAddForm, close: closeAddForm, toggle: toggleAddForm }] =
    useDisclosure();
  const [newConnection, setNewConnection] = useState({
    name: '',
    url: '',
    description: '',
  });
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Connect to an MCP server
  const connectToServer = useCallback(
    async (connectionId: string) => {
      if (prototypeMode) {
        setConnectingId(connectionId);

        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setConnections(prev =>
          prev.map(conn =>
            conn.id === connectionId
              ? { ...conn, status: 'connected', lastConnected: new Date(), error: undefined }
              : conn,
          ),
        );
        setConnectingId(null);
        return;
      }

      // Real connection logic would go here
      logInfo('Connecting to server:', { connectionId });
    },
    [prototypeMode],
  );

  // Disconnect from an MCP server
  const disconnectFromServer = useCallback((connectionId: string) => {
    setConnections(prev =>
      prev.map(conn =>
        conn.id === connectionId ? { ...conn, status: 'disconnected', error: undefined } : conn,
      ),
    );
  }, []);

  // Add new connection
  const addConnection = useCallback(() => {
    if (!newConnection.name || !newConnection.url) return;

    const connection: MCPConnection = {
      id: Date.now().toString(),
      name: newConnection.name,
      description: newConnection.description || 'Custom MCP server',
      transport: newConnection.url.startsWith('http') ? 'sse' : 'stdio',
      config: {
        transport: newConnection.url.startsWith('http') ? 'sse' : 'stdio',
        name: newConnection.name,
        description: newConnection.description || 'Custom MCP server',
        ...(newConnection.url.startsWith('http')
          ? { url: newConnection.url }
          : { command: newConnection.url, args: [] }),
      },
      status: 'disconnected',
      tools: [],
      connectedAt: new Date().toISOString(),
      metrics: {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageLatency: 0,
      },
    };

    setConnections(prev => [...prev, connection]);
    setNewConnection({ name: '', url: '', description: '' });
    closeAddForm();

    if (prototypeMode) {
      // Auto-connect in prototype mode
      setTimeout(() => connectToServer(connection.id), 100);
    }
  }, [newConnection, prototypeMode, connectToServer, closeAddForm]);

  // Remove connection
  const removeConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  }, []);

  // Update parent component
  React.useEffect(() => {
    onConnectionsChange(connections);
  }, [connections, onConnectionsChange]);

  return (
    <div className={cx('space-y-4', className)}>
      {/* Add Connection Button */}
      <Button onClick={toggleAddForm} variant="outline" size="sm" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add MCP Server
      </Button>

      {/* Add Connection Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 rounded-lg border bg-muted/30 p-3"
          >
            <input
              placeholder="Server name"
              value={newConnection.name}
              onChange={e => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded border bg-background p-2 text-sm"
            />
            <input
              placeholder="mcp://localhost:3001"
              value={newConnection.url}
              onChange={e => setNewConnection(prev => ({ ...prev, url: e.target.value }))}
              className="w-full rounded border bg-background p-2 text-sm"
            />
            <input
              placeholder="Description (optional)"
              value={newConnection.description}
              onChange={e => setNewConnection(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded border bg-background p-2 text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={addConnection}
                size="sm"
                className="flex-1"
                disabled={!newConnection.name || !newConnection.url}
              >
                Add Server
              </Button>
              <Button onClick={closeAddForm} variant="outline" size="sm" className="flex-1">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connections List */}
      <div className="space-y-2">
        {connections.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No MCP servers connected.
            {prototypeMode && (
              <div className="mt-2">Add a server above to see prototype functionality!</div>
            )}
          </div>
        ) : (
          connections.map(connection => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              isConnecting={connectingId === connection.id}
              onConnect={() => connectToServer(connection.id)}
              onDisconnect={() => disconnectFromServer(connection.id)}
              onRemove={() => removeConnection(connection.id)}
            />
          ))
        )}
      </div>

      {prototypeMode && connections.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Prototype Mode:</strong> These are mock MCP connections. In production, these
            would connect to real MCP servers providing various tools and capabilities.
          </p>
        </div>
      )}
    </div>
  );
}

// Connection card component
interface ConnectionCardProps {
  connection: MCPConnection;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRemove: () => void;
}

function StatusIcon({
  connection,
  isConnecting,
}: {
  connection: MCPConnection;
  isConnecting: boolean;
}) {
  if (isConnecting) return <Clock className="h-4 w-4 animate-spin text-yellow-500" />;

  switch (connection.status) {
    case 'connected':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <WifiOff className="h-4 w-4 text-muted-foreground" />;
  }
}

function ConnectionCard({
  connection,
  isConnecting,
  onConnect,
  onDisconnect,
  onRemove,
}: ConnectionCardProps) {
  const [showDetails, { toggle: toggleDetails }] = useDisclosure();

  return (
    <div className="space-y-2 rounded-lg border p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon connection={connection} isConnecting={isConnecting} />
          <div>
            <div className="text-sm font-medium">{connection.name}</div>
            <div className="text-xs text-muted-foreground">
              {connection.config?.url || connection.config?.command || 'Custom transport'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {connection.status === 'connected' ? (
            <Button onClick={onDisconnect} variant="outline" size="sm" className="h-7 px-2 text-xs">
              Disconnect
            </Button>
          ) : connection.status !== 'connecting' ? (
            <Button
              onClick={onConnect}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          ) : null}

          <Button onClick={toggleDetails} variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Settings className="h-3 w-3" />
          </Button>

          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Description */}
      {connection.description && (
        <p className="text-xs text-muted-foreground">{connection.description}</p>
      )}

      {/* Status Information */}
      {connection.status === 'error' && (
        <div className="rounded bg-red-50 p-2 text-xs text-red-500 dark:bg-red-950/20">
          Connection failed - check server configuration
        </div>
      )}

      {/* Tools Summary */}
      {connection.tools.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          <span>{connection.tools.length} tools available</span>
        </div>
      )}

      {/* Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 border-t pt-2"
          >
            <div className="text-xs">
              <span className="text-muted-foreground">Transport:</span> {connection.transport}
            </div>

            <div className="text-xs">
              <span className="text-muted-foreground">Connected:</span>{' '}
              {connection.connectedAt ? new Date(connection.connectedAt).toLocaleString() : 'N/A'}
            </div>

            {/* Metrics */}
            <div className="space-y-1 text-xs">
              <div className="text-muted-foreground">Metrics:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Calls: {connection.metrics?.totalCalls || 0}</div>
                <div>Success: {connection.metrics?.successfulCalls || 0}</div>
                <div>Failed: {connection.metrics?.failedCalls || 0}</div>
                <div>Avg: {connection.metrics?.averageLatency || 0}ms</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
