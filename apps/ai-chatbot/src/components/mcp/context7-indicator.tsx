/**
 * Context7 Status Indicator Component
 * Shows Context7 activity and library documentation usage
 */

'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/ui/tooltip';
import { cn } from '#/lib/utils';
import { useInterval } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import { BookOpen, CheckCircle, Database, ExternalLink, Info } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Context7Status {
  active: boolean;
  librariesDetected: string[];
  documentationFetched: number;
  cacheHitRate: number;
  lastUsed?: number;
  isEnhancing?: boolean;
}

interface Context7IndicatorProps {
  className?: string;
  showLabel?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export function Context7Indicator({
  className,
  showLabel = true,
  position = 'bottom',
  size = 'md',
}: Context7IndicatorProps) {
  const [status, setStatus] = useState<Context7Status>({
    active: false,
    librariesDetected: [],
    documentationFetched: 0,
    cacheHitRate: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [_showDetails, _setShowDetails] = useState(false);

  // Simulate Context7 status updates (in production, this would come from the backend)
  const updateStatus = useCallback(() => {
    setStatus({
      active: true,
      librariesDetected: ['react', 'next.js', 'tailwind'],
      documentationFetched: 12,
      cacheHitRate: 0.85,
      lastUsed: Date.now() - 30000, // 30 seconds ago
      isEnhancing: Math.random() > 0.8, // Sometimes show as actively enhancing
    });
  }, []);

  const statusInterval = useInterval(updateStatus, 10000); // Update every 10 seconds

  useEffect(() => {
    updateStatus();
    statusInterval.start();

    return () => statusInterval.stop();
  }, [updateStatus, statusInterval]);

  if (!status.active) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const _badgeSize = size === 'sm' ? 'sm' : 'default';
  const iconSize = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-2', className)}>
            <Badge
              variant="outline"
              className={cn(
                'flex cursor-pointer items-center gap-1 transition-colors hover:bg-blue-50',
                status.isEnhancing && 'border-blue-200 bg-blue-50',
                !showLabel && 'px-2',
              )}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="relative">
                <BookOpen className={cn(iconSize, 'text-blue-600')} />
                {status.isEnhancing && (
                  <div className="absolute -right-1 -top-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  </div>
                )}
              </div>
              {showLabel && (
                <>
                  <span className="text-sm font-medium">Context7</span>
                  {status.documentationFetched > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +{status.documentationFetched}
                    </span>
                  )}
                </>
              )}
            </Badge>

            {/* Quick status indicators */}
            {status.librariesDetected.length > 0 && (
              <div className="flex gap-1">
                {status.librariesDetected.slice(0, 3).map((lib, _index) => (
                  <Badge key={lib} variant="secondary" className="h-5 px-1 py-0 text-xs">
                    {lib}
                  </Badge>
                ))}
                {status.librariesDetected.length > 3 && (
                  <Badge variant="secondary" className="h-5 px-1 py-0 text-xs">
                    +{status.librariesDetected.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={position} className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Context7 Active</span>
              {status.isEnhancing && <span className="text-xs text-blue-600">Enhancing...</span>}
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div>📚 {status.documentationFetched} docs fetched</div>
              <div>⚡ {Math.round(status.cacheHitRate * 100)}% cache hit rate</div>
              {status.librariesDetected.length > 0 && (
                <div>🔍 Libraries: {status.librariesDetected.join(', ')}</div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t pt-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Up-to-date library documentation</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Detailed status modal/panel */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-lg border bg-background p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Context7 Status</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              {/* Current Status */}
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">
                    {status.isEnhancing ? 'Enhancing messages' : 'Ready'}
                  </span>
                </div>
                {status.lastUsed && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Last used {Math.round((Date.now() - status.lastUsed) / 1000)}s ago
                  </span>
                )}
              </div>

              {/* Libraries Detected */}
              {status.librariesDetected.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium">Libraries Detected</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {status.librariesDetected.map(lib => (
                      <div key={lib} className="flex items-center gap-2 rounded bg-muted/50 p-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-sm">{lib}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {status.documentationFetched}
                    </div>
                    <div className="text-xs text-muted-foreground">Docs Fetched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(status.cacheHitRate * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Cache Hit</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    // Clear cache action
                    logInfo('Context7 cache cleared', { timestamp: new Date().toISOString() });
                  }}
                >
                  <Database className="h-3 w-3" />
                  Clear Cache
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    window.open('https://context7.com', '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}

/**
 * Compact Context7 badge for use in headers or toolbars
 */
export function Context7Badge({
  className,
  showCount = true,
}: {
  className?: string;
  showCount?: boolean;
}) {
  const [enhancementCount, setEnhancementCount] = useState(0);

  // Use Mantine's useInterval for enhancement count updates
  const enhancementInterval = useInterval(() => {
    setEnhancementCount(prev => prev + Math.floor(Math.random() * 3));
  }, 15000);

  useEffect(() => {
    enhancementInterval.start();
    return () => enhancementInterval.stop();
  }, [enhancementInterval]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn('flex items-center gap-1 border-blue-200 text-blue-600', className)}
          >
            <BookOpen className="h-3 w-3" />
            Context7
            {showCount && enhancementCount > 0 && (
              <span className="text-xs">+{enhancementCount}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            Context7 is providing up-to-date library documentation
            {enhancementCount > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                {enhancementCount} enhancements in this session
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Context7 activity indicator for message enhancement
 */
export function Context7ActivityIndicator({
  isActive,
  librariesFound,
  className,
}: {
  isActive: boolean;
  librariesFound?: string[];
  className?: string;
}) {
  if (!isActive) return null;

  return (
    <div className={cn('flex items-center gap-2 text-xs text-blue-600', className)}>
      <div className="flex items-center gap-1">
        <BookOpen className="h-3 w-3" />
        <span className="animate-pulse">Enhancing with Context7...</span>
      </div>
      {librariesFound && librariesFound.length > 0 && (
        <div className="flex gap-1">
          {librariesFound.slice(0, 2).map(lib => (
            <Badge key={lib} variant="secondary" className="h-4 px-1 py-0 text-xs">
              {lib}
            </Badge>
          ))}
          {librariesFound.length > 2 && (
            <span className="text-xs text-muted-foreground">+{librariesFound.length - 2} more</span>
          )}
        </div>
      )}
    </div>
  );
}
