'use client';

import { Button } from '#/components/ui/button';
import type { MCPConnection } from '#/lib/mcp/types';
import { useLocalStorage } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  Play,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface ActivityLogEntry {
  id: string;
  connectionId: string;
  connectionName: string;
  toolName: string;
  timestamp: string;
  duration: number;
  status: 'success' | 'error' | 'running';
  error?: string;
  parameters?: any;
  result?: any;
}

interface MCPActivityLogProps {
  connections: MCPConnection[];
  className?: string;
}

export function MCPActivityLog({ connections, className }: MCPActivityLogProps) {
  const [logs, setLogs] = useLocalStorage<ActivityLogEntry[]>({
    key: 'mcp-activity-logs',
    defaultValue: getMockLogs(), // In reality, this would be populated by actual tool calls
  });

  const [filter, setFilter] = useState<{
    connectionId?: string;
    status?: string;
    timeRange?: string;
  }>({});

  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (filter.connectionId && log.connectionId !== filter.connectionId) return false;
    if (filter.status && log.status !== filter.status) return false;
    // Time range filtering would be implemented here
    return true;
  });

  // Calculate stats
  const stats = {
    total: logs.length,
    successful: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'error').length,
    avgDuration: logs.length > 0 ? logs.reduce((acc, l) => acc + l.duration, 0) / logs.length : 0,
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcp-activity-log-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div className={cx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Log</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={exportLogs} disabled={logs.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={clearLogs} disabled={logs.length === 0}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            <StatCard label="Total Calls" value={stats.total} icon={Activity} />
            <StatCard
              label="Success Rate"
              value={`${stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%`}
              icon={CheckCircle}
              color="text-green-500"
            />
            <StatCard
              label="Failed Calls"
              value={stats.failed}
              icon={XCircle}
              color="text-red-500"
            />
            <StatCard
              label="Avg Duration"
              value={`${stats.avgDuration.toFixed(0)}ms`}
              icon={Zap}
              color="text-yellow-500"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={filter.connectionId || ''}
          onChange={e => setFilter({ ...filter, connectionId: e.target.value || undefined })}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Connections</option>
          {connections.map(conn => (
            <option key={conn.id} value={conn.id}>
              {conn.name}
            </option>
          ))}
        </select>

        <select
          value={filter.status || ''}
          onChange={e => setFilter({ ...filter, status: e.target.value || undefined })}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="running">Running</option>
        </select>
      </div>

      {/* Log Entries */}
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Activity className="mx-auto mb-3 h-12 w-12 opacity-20" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <LogEntry
              key={log.id}
              log={log}
              isSelected={selectedLog === log.id}
              onSelect={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Log Entry Component
function LogEntry({
  log,
  isSelected,
  onSelect,
}: {
  log: ActivityLogEntry;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getStatusIcon = () => {
    switch (log.status) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'running':
        return Play;
    }
  };

  const getStatusColor = () => {
    switch (log.status) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'running':
        return 'text-yellow-500 animate-pulse';
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={cx(
        'cursor-pointer rounded-lg border p-3 transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
      )}
    >
      <div className="flex items-start gap-3">
        <StatusIcon className={cx('mt-0.5 h-4 w-4', getStatusColor())} />

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{log.toolName}</h4>
            <span className="text-xs text-muted-foreground">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{log.connectionName}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {log.duration}ms
            </span>
          </div>

          {log.error && <p className="mt-1 text-xs text-red-500">{log.error}</p>}
        </div>

        <ChevronRight
          className={cx(
            'h-4 w-4 text-muted-foreground transition-transform',
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
            <div className="mt-3 space-y-3 border-t pt-3">
              {/* Parameters */}
              {log.parameters && (
                <div>
                  <h5 className="mb-1 text-xs font-medium text-muted-foreground">Parameters</h5>
                  <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                    {JSON.stringify(log.parameters, null, 2)}
                  </pre>
                </div>
              )}

              {/* Result */}
              {log.result && (
                <div>
                  <h5 className="mb-1 text-xs font-medium text-muted-foreground">Result</h5>
                  <pre className="max-h-32 overflow-x-auto rounded bg-muted p-2 text-xs">
                    {JSON.stringify(log.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-muted-foreground',
}: {
  label: string;
  value: string | number;
  icon: any;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-1 flex items-center gap-2">
        <Icon className={cx('h-3 w-3', color)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

// Mock data generator
function getMockLogs(): ActivityLogEntry[] {
  return [
    {
      id: 'log-1',
      connectionId: 'mcp-1',
      connectionName: 'GitHub Tools',
      toolName: 'search_repositories',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      duration: 245,
      status: 'success',
      parameters: { query: 'ai chatbot', limit: 10 },
      result: { repositories: 10, total: 1234 },
    },
    {
      id: 'log-2',
      connectionId: 'mcp-2',
      connectionName: 'File System',
      toolName: 'read_file',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      duration: 45,
      status: 'error',
      error: 'Permission denied: /etc/passwd',
      parameters: { path: '/etc/passwd' },
    },
    {
      id: 'log-3',
      connectionId: 'mcp-1',
      connectionName: 'GitHub Tools',
      toolName: 'create_issue',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      duration: 567,
      status: 'success',
      parameters: {
        repo: 'user/project',
        title: 'Bug: MCP connection fails',
        body: 'Description of the issue...',
      },
      result: { issue_number: 42, url: 'https://github.com/user/project/issues/42' },
    },
  ];
}
