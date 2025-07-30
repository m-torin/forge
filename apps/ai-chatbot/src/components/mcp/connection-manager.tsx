'use client';

import { Button } from '#/components/ui/button';
import { createMCPClient } from '#/lib/mcp/client';
import type { MCPConnection, MCPConnectionConfig, MCPTool } from '#/lib/mcp/types';
import { BACKDROP_STYLES, Z_INDEX } from '#/lib/ui-constants';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { logError } from '@repo/observability';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Cloud,
  Code,
  Database,
  Globe,
  Link2,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  Terminal,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface MCPConnectionManagerProps {
  onConnectionsChange: (connections: MCPConnection[]) => void;
  className?: string;
}

export function MCPConnectionManager({
  onConnectionsChange,
  className,
}: MCPConnectionManagerProps) {
  const [connections, setConnections] = useLocalStorage<MCPConnection[]>({
    key: 'mcp-connections',
    defaultValue: [],
  });

  const [isAdding, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, 'connecting' | 'connected' | 'error'>
  >({});

  // Update parent when connections change
  useEffect(() => {
    onConnectionsChange(connections);
  }, [connections, onConnectionsChange]);

  // Connect to a server
  const connectToServer = useCallback(
    async (config: MCPConnectionConfig) => {
      const connectionId = `mcp-${Date.now()}`;

      setConnectionStatus(prev => ({ ...prev, [connectionId]: 'connecting' }));

      try {
        // Create the MCP client based on transport type
        let client: Awaited<ReturnType<typeof createMCPClient>>;

        if (config.transport === 'stdio') {
          if (!config.command) {
            throw new Error('Command is required for stdio transport');
          }
          const { Experimental_StdioMCPTransport } = await import('ai/mcp-stdio');
          client = await createMCPClient({
            transport: new Experimental_StdioMCPTransport({
              command: config.command,
              args: config.args || [],
            }),
          });
        } else if (config.transport === 'sse') {
          if (!config.url) {
            throw new Error('URL is required for SSE transport');
          }
          client = await createMCPClient({
            transport: {
              type: 'sse',
              url: config.url,
              headers: config.headers,
            },
          });
        } else {
          throw new Error('Custom transport not implemented in this demo');
        }

        // Discover tools
        const tools = await client.tools();

        const connection: MCPConnection = {
          id: connectionId,
          name: config.name,
          description: config.description,
          transport: config.transport,
          config,
          status: 'connected',
          tools: Object.entries(tools).map(([name, tool]) => ({
            id: `${connectionId}-${name}`,
            name,
            description: (tool as any).description || '',
            parameters: (tool as any).parameters || {},
          })),
          client,
          connectedAt: new Date().toISOString(),
          metrics: {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            averageLatency: 0,
          },
        };

        setConnections(prev => [...prev, connection]);
        setConnectionStatus(prev => ({ ...prev, [connectionId]: 'connected' }));
      } catch (error) {
        logError('Failed to connect:', error);
        setConnectionStatus(prev => ({ ...prev, [connectionId]: 'error' }));
      }
    },
    [setConnections],
  );

  // Disconnect from a server
  const disconnectFromServer = useCallback(
    async (connectionId: string) => {
      const connection = connections.find(c => c.id === connectionId);
      if (connection?.client) {
        await connection.client.close();
      }

      setConnections(prev => prev.filter(c => c.id !== connectionId));
      setConnectionStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[connectionId];
        return newStatus;
      });
    },
    [connections, setConnections],
  );

  // Reconnect to a server
  const reconnectToServer = useCallback(
    async (connectionId: string) => {
      const connection = connections.find(c => c.id === connectionId);
      if (connection?.config) {
        await disconnectFromServer(connectionId);
        await connectToServer(connection.config);
      }
    },
    [connections, connectToServer, disconnectFromServer],
  );

  return (
    <div className={cx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">MCP Connections</h3>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {/* Connection List */}
      <div className="space-y-2">
        {connections.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Link2 className="mx-auto mb-3 h-12 w-12 opacity-20" />
            <p className="text-sm">No MCP connections yet</p>
            <p className="mt-1 text-xs">Add a connection to enable external tools</p>
          </div>
        ) : (
          connections.map(connection => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              status={connectionStatus[connection.id] || connection.status}
              isSelected={selectedConnection === connection.id}
              onSelect={() =>
                setSelectedConnection(selectedConnection === connection.id ? null : connection.id)
              }
              onDisconnect={() => disconnectFromServer(connection.id)}
              onReconnect={() => reconnectToServer(connection.id)}
            />
          ))
        )}
      </div>

      {/* Add Connection Modal */}
      <AnimatePresence>
        {isAdding && (
          <AddConnectionModal
            onAdd={config => {
              connectToServer(config);
              closeAdd();
            }}
            onClose={closeAdd}
          />
        )}
      </AnimatePresence>

      {/* Connection Details */}
      <AnimatePresence>
        {(() => {
          const selectedConn = selectedConnection
            ? connections.find(c => c.id === selectedConnection)
            : null;
          return (
            selectedConn && (
              <ConnectionDetails
                connection={selectedConn}
                onClose={() => setSelectedConnection(null)}
              />
            )
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// Connection Card Component
function ConnectionCard({
  connection,
  status,
  isSelected,
  onSelect,
  onDisconnect,
  onReconnect,
}: {
  connection: MCPConnection;
  status: 'connecting' | 'connected' | 'error';
  isSelected: boolean;
  onSelect: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
}) {
  const getIcon = () => {
    switch (connection.transport) {
      case 'stdio':
        return Terminal;
      case 'sse':
        return Cloud;
      case 'custom':
        return Code;
      default:
        return Terminal;
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cx(
        'cursor-pointer rounded-lg border p-4 transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
        status === 'error' && 'border-red-500/50 bg-red-500/5',
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="relative">
          <div
            className={cx(
              'rounded-lg p-2',
              status === 'connected'
                ? 'bg-green-500/10'
                : status === 'connecting'
                  ? 'bg-yellow-500/10'
                  : 'bg-red-500/10',
            )}
          >
            <Icon
              className={cx(
                'h-4 w-4',
                status === 'connected'
                  ? 'text-green-500'
                  : status === 'connecting'
                    ? 'text-yellow-500'
                    : 'text-red-500',
              )}
            />
          </div>

          {/* Status Indicator */}
          <div
            className={cx(
              'absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background',
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting'
                  ? 'animate-pulse bg-yellow-500'
                  : 'bg-red-500',
            )}
          />
        </div>

        {/* Connection Info */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{connection.name}</h4>
            <div
              className="flex items-center gap-1"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Connection actions"
            >
              {status === 'error' && (
                <Button variant="ghost" size="sm" onClick={onReconnect} className="h-7 w-7 p-0">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                className="h-7 w-7 p-0 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{connection.description}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{connection.tools.length} tools</span>
            {connection.metrics && (
              <>
                <span>{connection.metrics.totalCalls} calls</span>
                <span>{connection.metrics.averageLatency.toFixed(0)}ms avg</span>
              </>
            )}
          </div>
        </div>

        <ChevronRight
          className={cx(
            'h-4 w-4 text-muted-foreground transition-transform',
            isSelected && 'rotate-90',
          )}
        />
      </div>
    </motion.div>
  );
}

// Add Connection Modal
function AddConnectionModal({
  onAdd,
  onClose,
}: {
  onAdd: (config: MCPConnectionConfig) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<Partial<MCPConnectionConfig>>({
    transport: 'stdio',
    name: '',
    description: '',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onAdd(config as MCPConnectionConfig);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return config.transport;
      case 2:
        if (config.transport === 'stdio') return config.command;
        if (config.transport === 'sse') return config.url;
        return false;
      case 3:
        return config.name;
      default:
        return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] flex items-center justify-center p-4 ${BACKDROP_STYLES.HEAVY}`}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-lg border bg-background shadow-lg"
      >
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add MCP Connection</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={cx(
                  'h-1 flex-1 rounded-full transition-colors',
                  i <= step ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h4 className="font-medium">Choose Connection Type</h4>
                <div className="space-y-2">
                  <ConnectionTypeOption
                    icon={Terminal}
                    title="Local CLI Tool"
                    description="Connect to tools running on your machine"
                    selected={config.transport === 'stdio'}
                    onClick={() => setConfig({ ...config, transport: 'stdio' })}
                  />
                  <ConnectionTypeOption
                    icon={Cloud}
                    title="Remote Server"
                    description="Connect to MCP servers over the internet"
                    selected={config.transport === 'sse'}
                    onClick={() => setConfig({ ...config, transport: 'sse' })}
                  />
                  <ConnectionTypeOption
                    icon={Code}
                    title="Custom Transport"
                    description="Use a custom transport implementation"
                    selected={config.transport === 'custom'}
                    onClick={() => setConfig({ ...config, transport: 'custom' })}
                    disabled
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h4 className="font-medium">Configure Connection</h4>

                {config.transport === 'stdio' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Command</label>
                      <input
                        type="text"
                        value={config.command || ''}
                        onChange={e => setConfig({ ...config, command: e.target.value })}
                        placeholder="node server.js"
                        className="mt-1 w-full rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Arguments (optional)</label>
                      <input
                        type="text"
                        value={config.args?.join(' ') || ''}
                        onChange={e =>
                          setConfig({
                            ...config,
                            args: e.target.value.split(' ').filter(Boolean),
                          })
                        }
                        placeholder="--port 3000"
                        className="mt-1 w-full rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}

                {config.transport === 'sse' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Server URL</label>
                      <input
                        type="url"
                        value={config.url || ''}
                        onChange={e => setConfig({ ...config, url: e.target.value })}
                        placeholder="https://mcp-server.com/sse"
                        className="mt-1 w-full rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Authorization (optional)</label>
                      <input
                        type="text"
                        value={config.headers?.Authorization || ''}
                        onChange={e =>
                          setConfig({
                            ...config,
                            headers: { ...config.headers, Authorization: e.target.value },
                          })
                        }
                        placeholder="Bearer your-api-key"
                        className="mt-1 w-full rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h4 className="font-medium">Name Your Connection</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Connection Name</label>
                    <input
                      type="text"
                      value={config.name || ''}
                      onChange={e => setConfig({ ...config, name: e.target.value })}
                      placeholder="My MCP Server"
                      className="mt-1 w-full rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description (optional)</label>
                    <textarea
                      value={config.description || ''}
                      onChange={e => setConfig({ ...config, description: e.target.value })}
                      placeholder="What does this connection provide?"
                      className="mt-1 w-full resize-none rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={3}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStepValid()}>
                <Link2 className="mr-2 h-4 w-4" />
                Connect
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Connection Type Option
function ConnectionTypeOption({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  disabled = false,
}: {
  icon: any;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'w-full rounded-lg border p-4 text-left transition-all',
        selected ? 'border-primary bg-primary/10' : 'hover:bg-muted/50',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cx(
            'rounded-lg p-2',
            selected ? 'bg-primary text-primary-foreground' : 'bg-muted',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h5 className="font-medium">{title}</h5>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

// Connection Details Panel
function ConnectionDetails({
  connection,
  onClose,
}: {
  connection: MCPConnection;
  onClose: () => void;
}) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed right-0 top-0 h-full w-96 border-l bg-background shadow-lg z-[${Z_INDEX.SIDEBAR}] overflow-y-auto`}
    >
      {/* Header */}
      <div className="sticky top-0 border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{connection.name}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-4">
        {/* Connection Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              Connected{' '}
              {connection.connectedAt
                ? new Date(connection.connectedAt).toLocaleString()
                : 'Unknown'}
            </span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Total Calls"
              value={connection.metrics?.totalCalls || 0}
              icon={Activity}
            />
            <MetricCard
              label="Success Rate"
              value={`${
                connection.metrics && connection.metrics.totalCalls > 0
                  ? Math.round(
                      (connection.metrics.successfulCalls / connection.metrics.totalCalls) * 100,
                    )
                  : 0
              }%`}
              icon={CheckCircle}
            />
            <MetricCard
              label="Avg Latency"
              value={`${connection.metrics?.averageLatency?.toFixed(0) || 0}ms`}
              icon={Zap}
            />
            <MetricCard
              label="Failed Calls"
              value={connection.metrics?.failedCalls || 0}
              icon={AlertCircle}
              variant="error"
            />
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-medium">
            <Database className="h-4 w-4" />
            Available Tools ({connection.tools.length})
          </h4>

          <div className="space-y-2">
            {connection.tools.map(tool => (
              <ToolCard
                key={tool.name}
                tool={tool}
                isSelected={selectedTool === tool.name}
                onClick={() => setSelectedTool(selectedTool === tool.name ? null : tool.name)}
              />
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-medium">
            <Shield className="h-4 w-4" />
            Security & Permissions
          </h4>

          <div className="space-y-2">
            <PermissionToggle label="Allow file system access" enabled={true} icon={Lock} />
            <PermissionToggle label="Allow network requests" enabled={true} icon={Globe} />
            <PermissionToggle label="Allow system commands" enabled={false} icon={Terminal} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Metric Card
function MetricCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  icon: any;
  variant?: 'default' | 'error';
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-1 flex items-center gap-2">
        <Icon
          className={cx('h-3 w-3', variant === 'error' ? 'text-red-500' : 'text-muted-foreground')}
        />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={cx('text-lg font-semibold', variant === 'error' && 'text-red-500')}>{value}</p>
    </div>
  );
}

// Tool Card
function ToolCard({
  tool,
  isSelected,
  onClick,
}: {
  tool: MCPTool;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cx(
        'cursor-pointer rounded-lg border p-3 transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="text-sm font-medium">{tool.name}</h5>
          <p className="mt-0.5 text-xs text-muted-foreground">{tool.description}</p>
        </div>
        <ChevronRight
          className={cx(
            'mt-1 h-3 w-3 text-muted-foreground transition-transform',
            isSelected && 'rotate-90',
          )}
        />
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 border-t pt-3">
              <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(tool.parameters, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Permission Toggle
function PermissionToggle({
  label,
  enabled,
  icon: Icon,
}: {
  label: string;
  enabled: boolean;
  icon: any;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <button
        className={cx(
          'relative h-5 w-10 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-muted',
        )}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 0 }}
          className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background"
        />
      </button>
    </div>
  );
}
