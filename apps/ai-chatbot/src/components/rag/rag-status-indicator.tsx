'use client';

import { mockRAGKnowledgeBase, shouldUseMockRAG } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { motion } from 'framer-motion';
import { AlertCircle, Brain, CheckCircle, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RAGStatusIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RAGStatusIndicator({
  size = 'sm',
  showLabel = false,
  className,
}: RAGStatusIndicatorProps) {
  const prototypeMode = isPrototypeMode();
  const useMockRAG = shouldUseMockRAG();
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Simulate RAG operations
  useEffect(() => {
    if (!useMockRAG) return;

    const operations = [
      'Indexing documents...',
      'Processing queries...',
      'Updating embeddings...',
      null, // idle state
    ];

    const interval = setInterval(
      () => {
        const randomOp = operations[Math.floor(Math.random() * operations.length)];
        setCurrentOperation(randomOp);
      },
      3000 + Math.random() * 2000,
    );

    return () => clearInterval(interval);
  }, [useMockRAG]);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (!useMockRAG) {
    return (
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <AlertCircle className={`text-muted-foreground ${sizeClasses[size]}`} />
        {showLabel && (
          <span className={`text-muted-foreground ${textSizes[size]}`}>RAG Offline</span>
        )}
      </div>
    );
  }

  const documents = mockRAGKnowledgeBase.getDocuments();
  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks.length, 0);

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {/* Status Icon */}
      <div className="relative">
        {currentOperation ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className={`text-blue-500 ${sizeClasses[size]}`} />
          </motion.div>
        ) : (
          <CheckCircle className={`text-green-500 ${sizeClasses[size]}`} />
        )}

        {/* Pulse effect when active */}
        {currentOperation && (
          <motion.div
            className={`absolute inset-0 rounded-full bg-blue-500/20 ${sizeClasses[size]}`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Status Text */}
      {showLabel && (
        <div className="flex flex-col">
          <span className={`font-medium ${textSizes[size]}`}>
            {currentOperation ? 'Processing' : 'RAG Active'}
          </span>
          {size !== 'sm' && (
            <span className={`text-muted-foreground ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
              {currentOperation || `${documents.length} docs, ${totalChunks} chunks`}
            </span>
          )}
        </div>
      )}

      {/* Prototype Mode Badge */}
      {prototypeMode && showLabel && (
        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
          Mock
        </span>
      )}
    </div>
  );
}

// Compact version for toolbars
export function RAGStatusBadge({ className }: { className?: string }) {
  const useMockRAG = shouldUseMockRAG();
  const prototypeMode = isPrototypeMode();

  if (!useMockRAG) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-1 dark:border-green-800 dark:bg-green-950/20 ${className || ''}`}
    >
      <Brain className="h-3 w-3 text-green-600" />
      <span className="text-xs font-medium text-green-800 dark:text-green-300">
        RAG {prototypeMode ? '(Mock)' : 'Active'}
      </span>
    </motion.div>
  );
}
