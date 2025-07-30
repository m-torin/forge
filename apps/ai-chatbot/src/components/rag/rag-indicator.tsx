'use client';

import { Badge } from '#/components/ui/badge';
import { cn } from '#/lib/utils';
import { Brain, Database, Sparkles } from 'lucide-react';

interface RAGIndicatorProps {
  isActive?: boolean;
  isDemo?: boolean;
  className?: string;
  variant?: 'minimal' | 'detailed' | 'pulse';
}

export function RAGIndicator({
  isActive = false,
  isDemo = false,
  className,
  variant = 'minimal',
}: RAGIndicatorProps) {
  if (!isActive) return null;

  if (variant === 'minimal') {
    return (
      <Badge variant={isDemo ? 'secondary' : 'default'} className={cn('gap-1 text-xs', className)}>
        <Brain className="h-3 w-3" />
        RAG
      </Badge>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
        <div className="flex items-center gap-1">
          <div className="relative">
            <Brain className="h-4 w-4 text-blue-600" />
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-600 opacity-25" />
          </div>
          <span>Searching knowledge base...</span>
        </div>
        {isDemo && (
          <Badge variant="outline" className="text-xs">
            Demo
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-600" />
          <span className="text-blue-800">
            {isDemo ? 'Demo knowledge base active' : 'Knowledge base active'}
          </span>
        </div>
        <Badge variant={isDemo ? 'secondary' : 'default'} className="text-xs">
          {isDemo ? 'Demo Mode' : 'Live'}
        </Badge>
      </div>
    );
  }

  return null;
}

interface RAGProcessingIndicatorProps {
  stage?: 'searching' | 'retrieving' | 'processing' | 'generating';
  className?: string;
}

export function RAGProcessingIndicator({
  stage = 'searching',
  className,
}: RAGProcessingIndicatorProps) {
  const getStageInfo = () => {
    switch (stage) {
      case 'searching':
        return { icon: Brain, text: 'Searching knowledge base...', color: 'text-blue-600' };
      case 'retrieving':
        return {
          icon: Database,
          text: 'Retrieving relevant documents...',
          color: 'text-green-600',
        };
      case 'processing':
        return { icon: Sparkles, text: 'Processing information...', color: 'text-purple-600' };
      case 'generating':
        return { icon: Brain, text: 'Generating response...', color: 'text-orange-600' };
    }
  };

  const { icon: Icon, text, color } = getStageInfo();

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <div className="relative">
        <Icon className={cn('h-4 w-4', color)} />
        <div
          className={cn(
            'absolute inset-0 animate-ping rounded-full opacity-25',
            color.replace('text-', 'bg-'),
          )}
        />
      </div>
      <span>{text}</span>
    </div>
  );
}

interface RAGStatusBarProps {
  isEnabled?: boolean;
  isDemo?: boolean;
  documentsCount?: number;
  lastUpdated?: string;
  className?: string;
}

export function RAGStatusBar({
  isEnabled = false,
  isDemo = false,
  documentsCount = 0,
  lastUpdated,
  className,
}: RAGStatusBarProps) {
  if (!isEnabled) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-blue-200 bg-blue-50 px-3 py-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Brain className="h-3 w-3 text-blue-600" />
          <span>Knowledge Base</span>
          {isDemo && (
            <Badge variant="outline" className="ml-1 text-xs">
              Demo
            </Badge>
          )}
        </div>

        {documentsCount > 0 && <span>{documentsCount} documents</span>}

        {lastUpdated && <span>Updated {lastUpdated}</span>}
      </div>

      <div className="text-green-600">● Active</div>
    </div>
  );
}
