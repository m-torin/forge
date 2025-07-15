'use client';

import type { MCPConnection } from '#/lib/mcp/types';
import { Z_INDEX } from '#/lib/ui-constants';
import { useDisclosure } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Cloud,
  Code,
  Loader2,
  Shield,
  Terminal,
  Unlink,
  Zap,
} from 'lucide-react';

interface MCPStatusBarProps {
  connections: MCPConnection[];
  className?: string;
}

export function MCPStatusBar({ connections, className }: MCPStatusBarProps) {
  const [isExpanded, { toggle: toggleExpanded }] = useDisclosure();
  const [showAll, { toggle: toggleShowAll }] = useDisclosure();

  const activeConnections = connections.filter(c => c.status === 'connected');
  const errorConnections = connections.filter(c => c.status === 'error');
  const totalTools = connections.reduce((acc, c) => acc + c.tools.length, 0);

  // Calculate aggregate metrics
  const totalCalls = connections.reduce((acc, c) => acc + (c.metrics?.totalCalls || 0), 0);
  const avgLatency =
    connections.length > 0
      ? connections.reduce((acc, c) => acc + (c.metrics?.averageLatency || 0), 0) /
        connections.length
      : 0;

  const getStatusColor = () => {
    if (errorConnections.length > 0) return 'text-red-500';
    if (activeConnections.length > 0) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const getStatusIcon = () => {
    if (errorConnections.length > 0) return AlertCircle;
    if (activeConnections.length > 0) return CheckCircle;
    return Unlink;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={cx('relative', className)}>
      {/* Compact Status Bar */}
      <button
        onClick={toggleExpanded}
        className={cx(
          'flex items-center gap-2 rounded-lg px-3 py-1.5',
          'bg-muted/50 text-sm transition-colors hover:bg-muted',
        )}
      >
        <StatusIcon className={cx('h-3.5 w-3.5', getStatusColor())} />

        {activeConnections.length === 0 ? (
          <span className="text-muted-foreground">No MCP connections</span>
        ) : (
          <>
            <span>{activeConnections.length} connected</span>
            <span className="text-muted-foreground">•</span>
            <span>{totalTools} tools</span>
            {totalCalls > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <Activity className="h-3 w-3" />
                <span>{totalCalls}</span>
              </>
            )}
          </>
        )}

        <ChevronDown
          className={cx('ml-1 h-3 w-3 transition-transform', isExpanded && 'rotate-180')}
        />
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute right-0 top-full mt-2 w-80 rounded-lg border bg-background p-4 shadow-lg z-[${Z_INDEX.POPOVER}]`}
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium">MCP Connections</h4>
              <button onClick={toggleShowAll} className="text-xs text-primary hover:underline">
                {showAll ? 'Show active only' : 'Show all'}
              </button>
            </div>

            {/* Connection List */}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {(showAll ? connections : activeConnections).map(connection => (
                <ConnectionStatusItem key={connection.id} connection={connection} />
              ))}

              {!showAll && connections.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  <Unlink className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p>No active connections</p>
                </div>
              )}
            </div>

            {/* Aggregate Metrics */}
            {activeConnections.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3">
                <MetricBadge icon={Activity} label="Calls" value={totalCalls} />
                <MetricBadge icon={Zap} label="Avg" value={`${avgLatency.toFixed(0)}ms`} />
                <MetricBadge icon={Shield} label="Tools" value={totalTools} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Connection Status Item
function ConnectionStatusItem({ connection }: { connection: MCPConnection }) {
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
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
      <div className="relative">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div
          className={cx(
            'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full',
            connection.status === 'connected'
              ? 'bg-green-500'
              : connection.status === 'connecting'
                ? 'animate-pulse bg-yellow-500'
                : 'bg-red-500',
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{connection.name}</p>
        <p className="text-xs text-muted-foreground">
          {connection.tools.length} tools • {connection.metrics?.totalCalls || 0} calls
        </p>
      </div>

      {connection.status === 'connecting' && (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

// Metric Badge
function MetricBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <div className="text-xs">
        <span className="text-muted-foreground">{label}:</span>
        <span className="ml-1 font-medium">{value}</span>
      </div>
    </div>
  );
}
