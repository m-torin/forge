'use client';

import { Button } from '#/components/ui/button';
import { mockRAGKnowledgeBase, shouldUseMockRAG } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { motion } from 'framer-motion';
import { Brain, Database, Plus, Search, TrendingUp, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';

interface RAGQuickActionsProps {
  onActionSelect?: (action: string, data?: any) => void;
  className?: string;
}

export function RAGQuickActions({ onActionSelect, className }: RAGQuickActionsProps) {
  const prototypeMode = isPrototypeMode();
  const useMockRAG = shouldUseMockRAG();
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const handleAction = useCallback(
    async (actionId: string, data?: any) => {
      if (!useMockRAG) return;

      setIsExecuting(actionId);

      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsExecuting(null);
      onActionSelect?.(actionId, data);
    },
    [useMockRAG, onActionSelect],
  );

  const quickActions = [
    {
      id: 'quick-search',
      icon: Search,
      label: 'Quick Search',
      description: 'Search knowledge base instantly',
      color:
        'bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-950/40',
      action: () => handleAction('quick-search'),
    },
    {
      id: 'add-current',
      icon: Plus,
      label: 'Add Current',
      description: 'Save current conversation',
      color:
        'bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950/20 dark:hover:bg-green-950/40',
      action: () => handleAction('add-current', { type: 'conversation' }),
    },
    {
      id: 'smart-suggest',
      icon: Brain,
      label: 'Smart Suggest',
      description: 'Get knowledge-based suggestions',
      color:
        'bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950/20 dark:hover:bg-purple-950/40',
      action: () => handleAction('smart-suggest'),
    },
    {
      id: 'trending-topics',
      icon: TrendingUp,
      label: 'Trending',
      description: 'Most accessed knowledge',
      color:
        'bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/20 dark:hover:bg-orange-950/40',
      action: () => handleAction('trending-topics'),
    },
  ];

  if (!useMockRAG) {
    return null;
  }

  return (
    <div className={`grid grid-cols-2 gap-3 ${className || ''}`}>
      {quickActions.map((action, index) => {
        const Icon = action.icon;
        const executing = isExecuting === action.id;

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={action.action}
              disabled={executing}
              variant="outline"
              className={`h-auto w-full flex-col gap-2 p-4 ${action.color}`}
            >
              <div className="flex items-center gap-2">
                {executing ? (
                  <Zap className="h-4 w-4 animate-pulse" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <p className="text-center text-xs text-muted-foreground">{action.description}</p>
            </Button>
          </motion.div>
        );
      })}

      {/* Stats Summary */}
      {prototypeMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 rounded-lg border bg-muted/30 p-3 text-center"
        >
          <div className="mb-1 flex items-center justify-center gap-2">
            <Database className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Knowledge Base</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {mockRAGKnowledgeBase.getDocuments().length} documents •
            {mockRAGKnowledgeBase.getDocuments().reduce((sum, doc) => sum + doc.chunks.length, 0)}{' '}
            chunks
          </div>
        </motion.div>
      )}
    </div>
  );
}
