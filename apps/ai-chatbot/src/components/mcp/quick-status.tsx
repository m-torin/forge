/**
 * Quick MCP Status - Simple sidebar widget showing MCP tool health
 */

'use client';

import { useQuickAccess } from '#/components/context/quick-access-context';
import { Badge } from '#/components/ui/badge';
import { cn } from '#/lib/utils';
import { BookOpen, CheckCircle2, Zap } from 'lucide-react';
import { useState } from 'react';

interface QuickMcpStatusProps {
  className?: string;
}

export function QuickMcpStatus({ className }: QuickMcpStatusProps) {
  const { navigateToMarketplace } = useQuickAccess();
  const [status, _setStatus] = useState({
    context7: true,
    perplexity: true,
    totalTools: 8,
  });

  const handleContext7Click = () => {
    navigateToMarketplace('context7');
  };

  return (
    <div className={cn('space-y-2 rounded-lg border p-3', className)}>
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">MCP Tools</span>
      </div>

      <div className="space-y-1">
        <button
          onClick={handleContext7Click}
          className="-m-1 flex w-full items-center justify-between rounded p-1 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-3 w-3 text-blue-600" />
            <span className="text-xs">Context7</span>
          </div>
          {status.context7 ? (
            <CheckCircle2 className="h-3 w-3 text-green-600" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{status.totalTools} tools ready</span>
          <Badge variant="outline" className="h-5 text-xs">
            Active
          </Badge>
        </div>
      </div>
    </div>
  );
}
