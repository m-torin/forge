/**
 * MCP Notifications Component
 * Provides toast notifications for MCP status changes and feature availability
 */

'use client';

import { AlertTriangle, CheckCircle, Sparkles, Wifi, WifiOff, XCircle, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useMcpConnectionStatus, type McpConnectionStatus } from './connection-status';

interface McpNotificationsProps {
  showConnectionChanges?: boolean;
  showFeatureUpdates?: boolean;
  showErrorNotifications?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function McpNotifications({
  showConnectionChanges = true,
  showFeatureUpdates = true,
  showErrorNotifications = true,
  position: _position = 'bottom-right',
}: McpNotificationsProps) {
  const { status, isLoading } = useMcpConnectionStatus();
  const previousStatus = useRef<McpConnectionStatus | null>(null);
  const hasShownInitialState = useRef(false);

  useEffect(() => {
    if (isLoading || !status) return;

    const prev = previousStatus.current;

    // Don't show notifications on initial load
    if (!hasShownInitialState.current) {
      hasShownInitialState.current = true;
      previousStatus.current = status;
      return;
    }

    // Connection status changes
    if (showConnectionChanges && prev && prev.status !== status.status) {
      handleConnectionStatusChange(prev.status, status.status, status.clientType);
    }

    // Client type changes (mock -> enhanced -> demo)
    if (showFeatureUpdates && prev && prev.clientType !== status.clientType) {
      handleClientTypeChange(prev.clientType, status.clientType);
    }

    // Feature changes
    if (showFeatureUpdates && prev) {
      handleFeatureChanges(prev.features, status.features);
    }

    // Health changes
    if (showErrorNotifications && prev && prev.health.healthy !== status.health.healthy) {
      handleHealthChange(prev.health.healthy, status.health, status.clientType);
    }

    previousStatus.current = status;
  }, [status, isLoading, showConnectionChanges, showFeatureUpdates, showErrorNotifications]);

  return null; // This component only manages notifications
}

function handleConnectionStatusChange(
  oldStatus: McpConnectionStatus['status'],
  newStatus: McpConnectionStatus['status'],
  clientType: McpConnectionStatus['clientType'],
) {
  const getStatusConfig = (status: McpConnectionStatus['status']) => {
    switch (status) {
      case 'connected':
        return { icon: CheckCircle, color: 'text-green-600', label: 'Connected' };
      case 'demo':
        return { icon: Sparkles, color: 'text-blue-600', label: 'Demo Mode' };
      case 'degraded':
        return { icon: AlertTriangle, color: 'text-yellow-600', label: 'Degraded' };
      case 'disconnected':
      default:
        return { icon: XCircle, color: 'text-red-600', label: 'Disconnected' };
    }
  };

  const newConfig = getStatusConfig(newStatus);
  const Icon = newConfig.icon;

  // Connection restored
  if (oldStatus === 'disconnected' && newStatus !== 'disconnected') {
    toast.success(
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${newConfig.color}`} />
        <div>
          <p className="font-medium">MCP Connection Restored</p>
          <p className="text-sm text-muted-foreground">
            {clientType === 'enhanced'
              ? 'Enhanced features available'
              : clientType === 'demo'
                ? 'Demo mode active'
                : 'Basic functionality restored'}
          </p>
        </div>
      </div>,
      {
        duration: 4000,
        id: 'mcp-connection-restored',
      },
    );
  }

  // Connection lost
  if (oldStatus !== 'disconnected' && newStatus === 'disconnected') {
    toast.error(
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${newConfig.color}`} />
        <div>
          <p className="font-medium">MCP Connection Lost</p>
          <p className="text-sm text-muted-foreground">Advanced features may be unavailable</p>
        </div>
      </div>,
      {
        duration: 6000,
        id: 'mcp-connection-lost',
      },
    );
  }

  // Connection degraded
  if (oldStatus === 'connected' && newStatus === 'degraded') {
    toast.warning(
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${newConfig.color}`} />
        <div>
          <p className="font-medium">MCP Connection Degraded</p>
          <p className="text-sm text-muted-foreground">Some features may be limited</p>
        </div>
      </div>,
      {
        duration: 5000,
        id: 'mcp-connection-degraded',
      },
    );
  }
}

function handleClientTypeChange(
  oldType: McpConnectionStatus['clientType'],
  newType: McpConnectionStatus['clientType'],
) {
  // Enhanced mode activated
  if (oldType !== 'enhanced' && newType === 'enhanced') {
    toast.success(
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-blue-600" />
        <div>
          <p className="font-medium">Enhanced MCP Features Activated</p>
          <p className="text-sm text-muted-foreground">
            AI SDK v5 integration with advanced capabilities
          </p>
        </div>
      </div>,
      {
        duration: 5000,
        id: 'mcp-enhanced-activated',
      },
    );
  }

  // Demo mode activated
  if (oldType !== 'demo' && newType === 'demo') {
    toast.info(
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-600" />
        <div>
          <p className="font-medium">MCP Demo Mode Active</p>
          <p className="text-sm text-muted-foreground">Exploring enhanced functionality</p>
        </div>
      </div>,
      {
        duration: 4000,
        id: 'mcp-demo-activated',
      },
    );
  }

  // Fallback to mock mode
  if ((oldType === 'enhanced' || oldType === 'demo') && newType === 'mock') {
    toast.warning(
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-yellow-600" />
        <div>
          <p className="font-medium">MCP Features Unavailable</p>
          <p className="text-sm text-muted-foreground">Using basic functionality</p>
        </div>
      </div>,
      {
        duration: 4000,
        id: 'mcp-fallback-mock',
      },
    );
  }
}

function handleFeatureChanges(
  oldFeatures: McpConnectionStatus['features'],
  newFeatures: McpConnectionStatus['features'],
) {
  const featureNames = {
    enhanced: 'Enhanced Mode',
    errorHandling: 'Error Recovery',
    streamLifecycle: 'Stream Monitoring',
    healthMonitoring: 'Health Monitoring',
    gracefulDegradation: 'Graceful Degradation',
    demo: 'Demo Mode',
  };

  // Check for newly enabled features
  const newlyEnabled = Object.entries(newFeatures)
    .filter(([key, enabled]) => enabled && !oldFeatures[key as keyof typeof oldFeatures])
    .map(([key]) => featureNames[key as keyof typeof featureNames])
    .filter(Boolean);

  // Check for newly disabled features
  const newlyDisabled = Object.entries(oldFeatures)
    .filter(([key, enabled]) => enabled && !newFeatures[key as keyof typeof newFeatures])
    .map(([key]) => featureNames[key as keyof typeof featureNames])
    .filter(Boolean);

  if (newlyEnabled.length > 0) {
    toast.success(
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-green-600" />
        <div>
          <p className="font-medium">New MCP Features Available</p>
          <p className="text-sm text-muted-foreground">{newlyEnabled.join(', ')}</p>
        </div>
      </div>,
      {
        duration: 4000,
        id: 'mcp-features-enabled',
      },
    );
  }

  if (newlyDisabled.length > 0 && newlyDisabled.length <= 2) {
    toast.warning(
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-yellow-600" />
        <div>
          <p className="font-medium">MCP Features Disabled</p>
          <p className="text-sm text-muted-foreground">{newlyDisabled.join(', ')}</p>
        </div>
      </div>,
      {
        duration: 3000,
        id: 'mcp-features-disabled',
      },
    );
  }
}

function handleHealthChange(
  wasHealthy: boolean,
  currentHealth: McpConnectionStatus['health'],
  _clientType: McpConnectionStatus['clientType'],
) {
  // Health recovered
  if (!wasHealthy && currentHealth.healthy) {
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <div>
          <p className="font-medium">MCP Health Restored</p>
          <p className="text-sm text-muted-foreground">All connections are healthy</p>
        </div>
      </div>,
      {
        duration: 3000,
        id: 'mcp-health-restored',
      },
    );
  }

  // Health issues detected
  if (wasHealthy && !currentHealth.healthy && currentHealth.issues.length > 0) {
    toast.error(
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <div>
          <p className="font-medium">MCP Health Issues Detected</p>
          <p className="text-sm text-muted-foreground">
            {currentHealth.issues[0]}
            {currentHealth.issues.length > 1 && ` (+${currentHealth.issues.length - 1} more)`}
          </p>
        </div>
      </div>,
      {
        duration: 6000,
        id: 'mcp-health-issues',
      },
    );
  }
}

/**
 * Hook for manually triggering MCP notifications
 */
export function useMcpNotifications() {
  return {
    notifyEnhancedAvailable: () => {
      toast.success(
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600" />
          <div>
            <p className="font-medium">Enhanced MCP Available</p>
            <p className="text-sm text-muted-foreground">
              You now have access to advanced AI features
            </p>
          </div>
        </div>,
        { duration: 5000 },
      );
    },

    notifyFeatureUsed: (featureName: string) => {
      toast.info(
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <div>
            <p className="font-medium">MCP Feature Used</p>
            <p className="text-sm text-muted-foreground">{featureName} is now active</p>
          </div>
        </div>,
        { duration: 2000 },
      );
    },

    notifyConnectionError: (error: string) => {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-600" />
          <div>
            <p className="font-medium">MCP Connection Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>,
        { duration: 6000 },
      );
    },
  };
}
