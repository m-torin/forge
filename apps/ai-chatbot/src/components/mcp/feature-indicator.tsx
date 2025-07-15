/**
 * MCP Feature Indicator Component
 * Shows users when enhanced MCP features are available and active
 */

'use client';

import { useQuickAccess } from '#/components/context/quick-access-context';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/ui/tooltip';
import { cn } from '#/lib/utils';
import { Activity, ChevronDown, ChevronUp, Info, Shield, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMcpConnectionStatus } from './connection-status';

interface McpFeatureIndicatorProps {
  className?: string;
  position?: 'top' | 'bottom' | 'inline';
  showDetails?: boolean;
  autoCollapse?: boolean;
}

const featureDescriptions = {
  enhanced: {
    icon: Zap,
    label: 'Enhanced Mode',
    description: 'Advanced MCP functionality with full AI SDK v5 integration',
    color: 'text-blue-600',
  },
  errorHandling: {
    icon: Shield,
    label: 'Error Recovery',
    description: 'Intelligent error handling and automatic recovery',
    color: 'text-green-600',
  },
  streamLifecycle: {
    icon: Activity,
    label: 'Stream Monitoring',
    description: 'Real-time stream lifecycle management and analytics',
    color: 'text-purple-600',
  },
  healthMonitoring: {
    icon: Activity,
    label: 'Health Monitoring',
    description: 'Continuous connection health monitoring and diagnostics',
    color: 'text-orange-600',
  },
  gracefulDegradation: {
    icon: Shield,
    label: 'Graceful Degradation',
    description: 'Automatic fallback when enhanced features are unavailable',
    color: 'text-gray-600',
  },
  demo: {
    icon: Sparkles,
    label: 'Demo Mode',
    description: 'Demonstration mode with enhanced mock functionality',
    color: 'text-indigo-600',
  },
};

export function McpFeatureIndicator({
  className,
  position = 'inline',
  showDetails = false,
  autoCollapse = true,
}: McpFeatureIndicatorProps) {
  const { status, isLoading, isEnhanced, isDemoMode } = useMcpConnectionStatus();
  const [isExpanded, setIsExpanded] = useState(!autoCollapse);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Show indicator when enhanced features are available or demo mode is active
    const hasEnhancedFeatures =
      Boolean(isEnhanced) ||
      Boolean(isDemoMode) ||
      Boolean(status?.features.enhanced && status.status !== 'disconnected');
    setShouldShow(hasEnhancedFeatures);
  }, [status, isEnhanced, isDemoMode]);

  if (isLoading || !status || !shouldShow) {
    return null;
  }

  const activeFeatures = Object.entries(status.features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as keyof typeof featureDescriptions);

  if (activeFeatures.length === 0) {
    return null;
  }

  const primaryFeature = activeFeatures.includes('enhanced')
    ? 'enhanced'
    : activeFeatures.includes('demo')
      ? 'demo'
      : activeFeatures[0];

  const PrimaryIcon = featureDescriptions[primaryFeature]?.icon || Zap;

  const positionClasses = {
    top: 'fixed top-4 right-4 z-50',
    bottom: 'fixed bottom-4 right-4 z-50',
    inline: '',
  };

  const containerClasses = cn(
    'bg-background border rounded-lg shadow-lg',
    positionClasses[position],
    className,
  );

  if (!showDetails && !isExpanded) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(containerClasses, 'p-2')}>
              <Badge
                variant="outline"
                className="flex cursor-pointer items-center gap-1 transition-colors hover:bg-muted/50"
                onClick={() => setIsExpanded(true)}
              >
                <PrimaryIcon
                  className={cn('h-3 w-3', featureDescriptions[primaryFeature]?.color)}
                />
                {featureDescriptions[primaryFeature]?.label}
                {activeFeatures.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    +{activeFeatures.length - 1}
                  </span>
                )}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="mb-1 font-medium">Enhanced MCP Features Active</p>
            <p className="text-sm text-muted-foreground">
              {featureDescriptions[primaryFeature]?.description}
            </p>
            {activeFeatures.length > 1 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Click to see all {activeFeatures.length} active features
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <PrimaryIcon className={cn('h-4 w-4', featureDescriptions[primaryFeature]?.color)} />
          <span className="text-sm font-medium">Enhanced Features</span>
          <Badge variant="outline" className="text-xs">
            {activeFeatures.length} active
          </Badge>
        </div>
        {autoCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-3 p-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                status.status === 'connected'
                  ? 'bg-green-500'
                  : status.status === 'demo'
                    ? 'bg-blue-500'
                    : status.status === 'degraded'
                      ? 'bg-yellow-500'
                      : 'bg-red-500',
              )}
            />
            <span className="text-muted-foreground">
              {status.clientType === 'enhanced'
                ? 'Enhanced Connection'
                : status.clientType === 'demo'
                  ? 'Demo Mode Active'
                  : 'Standard Connection'}
            </span>
          </div>

          {/* Active Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Active Features
            </h4>
            <div className="space-y-1">
              {activeFeatures.map(featureKey => {
                const feature = featureDescriptions[featureKey];
                if (!feature) return null;

                const Icon = feature.icon;
                return (
                  <TooltipProvider key={featureKey}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex cursor-help items-center gap-2 rounded p-1 hover:bg-muted/50">
                          <Icon className={cn('h-3 w-3', feature.color)} />
                          <span className="text-xs font-medium">{feature.label}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-sm">{feature.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>

          {/* Capabilities */}
          {status.metadata.capabilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-1">
                {status.metadata.capabilities.map(capability => (
                  <Badge key={capability} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div className="border-t border-border/50 pt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Enhanced by AI SDK v5 integration</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline feature indicator for use in other components
 */
export function McpFeatureBadge({
  className,
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { status, isEnhanced, isDemoMode } = useMcpConnectionStatus();
  const { isQuickAccessOpen } = useQuickAccess();

  // Only show when quick access is open
  if (!isQuickAccessOpen || !status || (!isEnhanced && !isDemoMode)) {
    return null;
  }

  const config = isDemoMode
    ? { icon: Sparkles, label: 'Demo', color: 'text-indigo-600' }
    : { icon: Zap, label: 'MCP', color: 'text-blue-600' };

  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn('flex items-center gap-1', className)}>
            <Icon className={cn('h-3 w-3', config.color)} />
            {showLabel && config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {isDemoMode
              ? 'Demo mode with enhanced mock functionality'
              : 'Enhanced MCP features with AI SDK v5 integration'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
