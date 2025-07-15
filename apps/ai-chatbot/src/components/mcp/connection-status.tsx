/**
 * MCP Connection Status Component
 * Displays real-time MCP connection status with feature flag awareness
 */

'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Progress } from '#/components/ui/progress';
import { cn } from '#/lib/utils';
import { useInterval } from '@mantine/hooks';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Settings,
  Shield,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export interface McpConnectionStatus {
  status: 'connected' | 'disconnected' | 'degraded' | 'demo';
  clientType: 'mock' | 'enhanced' | 'demo';
  health: {
    healthy: boolean;
    connections: number;
    issues: string[];
  };
  features: {
    enhanced: boolean;
    errorHandling: boolean;
    streamLifecycle: boolean;
    healthMonitoring: boolean;
    gracefulDegradation: boolean;
    demo: boolean;
  };
  metadata: {
    timestamp: string;
    capabilities: string[];
    environment: string;
  };
}

interface McpConnectionStatusProps {
  className?: string;
  compact?: boolean;
  showFeatures?: boolean;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export function McpConnectionStatusComponent({
  className,
  compact = false,
  showFeatures = true,
  showRefresh = true,
  onRefresh,
}: McpConnectionStatusProps) {
  const [status, setStatus] = useState<McpConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/mcp/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        // Failed to fetch MCP status
      }
    } catch (_error) {
      // Error fetching MCP status
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Use useInterval for periodic status updates
  useInterval(fetchStatus, 30000); // Update every 30 seconds

  useEffect(() => {
    fetchStatus(); // Initial fetch on mount
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatus();
    onRefresh?.();
  };

  const getStatusConfig = (status: McpConnectionStatus) => {
    switch (status.status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          badgeVariant: 'default' as const,
          label: 'Connected',
        };
      case 'demo':
        return {
          icon: Zap,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          badgeVariant: 'secondary' as const,
          label: 'Demo Mode',
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          badgeVariant: 'outline' as const,
          label: 'Degraded',
        };
      case 'disconnected':
      default:
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          badgeVariant: 'destructive' as const,
          label: 'Disconnected',
        };
    }
  };

  const getFeatureIcon = (featureName: string) => {
    switch (featureName) {
      case 'enhanced':
        return Zap;
      case 'errorHandling':
        return Shield;
      case 'streamLifecycle':
        return Activity;
      case 'healthMonitoring':
        return Activity;
      default:
        return Settings;
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg border bg-muted/50 p-3', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading MCP status...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3',
          className,
        )}
      >
        <XCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-700">Failed to load MCP status</span>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-auto h-6 px-2"
          >
            <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          </Button>
        )}
      </div>
    );
  }

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const activeFeatures = Object.entries(status.features).filter(([, enabled]) => enabled);
  const healthPercentage = status.health.healthy
    ? 100
    : Math.max(0, 100 - status.health.issues.length * 25);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Icon className={cn('h-4 w-4', config.color)} />
        <Badge variant={config.badgeVariant} className="text-xs">
          {config.label}
        </Badge>
        {status.clientType === 'enhanced' && (
          <Badge variant="outline" className="text-xs">
            Enhanced
          </Badge>
        )}
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border p-4', config.bgColor, className)}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', config.color)} />
          <div>
            <h3 className="text-sm font-medium">{config.label}</h3>
            <p className="text-xs text-muted-foreground">
              Client: {status.clientType} • {status.health.connections} connection
              {status.health.connections !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-2"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            <span className="ml-1 text-xs">Refresh</span>
          </Button>
        )}
      </div>

      {/* Health Progress */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium">Health</span>
          <span className="text-xs text-muted-foreground">{healthPercentage}%</span>
        </div>
        <Progress value={healthPercentage} className="h-2" />
        {status.health.issues.length > 0 && (
          <div className="mt-1">
            {status.health.issues.map(issue => (
              <p key={`issue-${issue}`} className="flex items-center gap-1 text-xs text-yellow-700">
                <AlertTriangle className="h-3 w-3" />
                {issue}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      {showFeatures && activeFeatures.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium">Active Features</h4>
          <div className="flex flex-wrap gap-1">
            {activeFeatures.map(([featureName, enabled]) => {
              if (!enabled) return null;
              const FeatureIcon = getFeatureIcon(featureName);
              return (
                <Badge
                  key={featureName}
                  variant="outline"
                  className="flex items-center gap-1 text-xs"
                >
                  <FeatureIcon className="h-3 w-3" />
                  {featureName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Capabilities */}
      {status.metadata.capabilities.length > 0 && (
        <div className="border-current/10 mt-3 border-t pt-3">
          <h4 className="mb-1 text-xs font-medium">Capabilities</h4>
          <p className="text-xs text-muted-foreground">{status.metadata.capabilities.join(', ')}</p>
        </div>
      )}

      {/* Timestamp */}
      <div className="border-current/10 mt-2 border-t pt-2">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(status.metadata.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

/**
 * Hook for accessing MCP connection status
 */
export function useMcpConnectionStatus() {
  const [status, setStatus] = useState<McpConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/mcp/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        // Failed to fetch MCP status
        setStatus(null);
      }
    } catch (_error) {
      // Error fetching MCP status
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Use useInterval for periodic status updates
  useInterval(fetchStatus, 30000); // Update every 30 seconds

  useEffect(() => {
    fetchStatus(); // Initial fetch on mount
  }, []);

  return {
    status,
    isLoading,
    refetch: fetchStatus,
    isConnected: status?.status === 'connected' || status?.status === 'demo',
    isEnhanced: status?.clientType === 'enhanced',
    isDemoMode: status?.status === 'demo',
  };
}
