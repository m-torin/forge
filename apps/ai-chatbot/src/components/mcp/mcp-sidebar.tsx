'use client';

import { Button } from '#/components/ui/button';
import type { MCPConnection, MCPTool } from '#/lib/mcp/types';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { Z_INDEX } from '#/lib/ui-constants';
import { useDisclosure } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, History, Link2, Menu, Package, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { MCPActivityLog } from './mcp-activity-log';
import { MCPConnectionManager } from './mcp-connection-manager-prototype';
import { MCPMarketplace } from './mcp-marketplace';
import { MCPPermissionManager } from './mcp-permission-manager';
import { MCPToolDiscovery } from './mcp-tool-discovery';

interface MCPSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onConnectionsChange: (connections: MCPConnection[]) => void;
  onToolSelect: (tool: MCPTool, connectionId: string) => void;
  className?: string;
}

export function MCPSidebar({
  isOpen,
  onToggle,
  onConnectionsChange,
  onToolSelect,
  className,
}: MCPSidebarProps) {
  const prototypeMode = isPrototypeMode();
  const [activeTab, setActiveTab] = useState<'connections' | 'tools' | 'marketplace' | 'activity'>(
    'connections',
  );
  const [connections, setConnections] = useState<MCPConnection[]>([]);
  const [selectedConnection, _setSelectedConnection] = useState<string | null>(null);
  const [_showMarketplace, { open: _openMarketplace, close: closeMarketplace }] =
    useDisclosure(false);

  const handleConnectionsChange = (newConnections: MCPConnection[]) => {
    setConnections(newConnections);
    onConnectionsChange(newConnections);
  };

  const handleToolTest = async (tool: MCPTool, connectionId: string) => {
    // Mock tool testing - in reality this would call the tool
    logInfo('Testing tool:', { toolName: tool.name, connectionId });
  };

  const handlePermissionChange = (connectionId: string, permissions: any[]) => {
    logInfo('Permission change for', { connectionId, permissions });
  };

  const handleMarketplaceInstall = (server: any) => {
    logInfo('Installing server:', { serverName: server.name });
    // This would trigger the connection flow
    closeMarketplace();
  };

  const tabs = [
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'tools', label: 'Tools', icon: Package },
    { id: 'marketplace', label: 'Marketplace', icon: Search },
    { id: 'activity', label: 'Activity', icon: History },
  ];

  const activeConnections = connections.filter(c => c.status === 'connected');
  const totalTools = connections.reduce((acc, c) => acc + c.tools.length, 0);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cx(
          `fixed right-4 top-20 z-[${Z_INDEX.PANEL}] rounded-lg border bg-background p-2 shadow-lg`,
          'transition-colors hover:bg-muted',
          isOpen && 'pointer-events-none opacity-0',
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 20 }}
            className={cx(
              `fixed right-0 top-0 h-full w-80 border-l bg-background shadow-lg z-[${Z_INDEX.SIDEBAR}]`,
              className,
            )}
          >
            {/* Header */}
            <div className="border-b p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">MCP Tools</h3>
                  {prototypeMode && (
                    <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs text-orange-600">
                      DEMO
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="mb-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Link2 className="h-3 w-3" />
                    Connections
                  </div>
                  <p className="text-sm font-medium">
                    {activeConnections.length}/{connections.length}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="mb-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="h-3 w-3" />
                    Total Tools
                  </div>
                  <p className="text-sm font-medium">{totalTools}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cx(
                      'relative flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors',
                      activeTab === tab.id
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {activeTab === 'connections' && (
                  <motion.div
                    key="connections"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <MCPConnectionManager onConnectionsChange={handleConnectionsChange} />

                    {selectedConnection && (
                      <div className="mt-4">
                        {(() => {
                          const selectedConn = connections.find(c => c.id === selectedConnection);
                          return (
                            selectedConn && (
                              <MCPPermissionManager
                                connection={selectedConn}
                                onPermissionChange={handlePermissionChange}
                              />
                            )
                          );
                        })()}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'tools' && (
                  <motion.div
                    key="tools"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <MCPToolDiscovery
                      connections={connections}
                      onToolSelect={onToolSelect}
                      onToolTest={handleToolTest}
                    />
                  </motion.div>
                )}

                {activeTab === 'marketplace' && (
                  <motion.div
                    key="marketplace"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <MCPMarketplace onInstall={handleMarketplaceInstall} />
                  </motion.div>
                )}

                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <MCPActivityLog connections={connections} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            {activeTab === 'connections' && connections.length === 0 && (
              <div className="border-t p-4">
                <Button onClick={() => setActiveTab('marketplace')} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Browse Marketplace
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
