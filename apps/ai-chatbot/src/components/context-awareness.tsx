'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { useDisclosure, useHover, useInterval, useListState } from '@mantine/hooks';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { AlertCircle, Brain, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Token estimation (rough approximation)
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Props for context window indicator component
 */
interface ContextWindowIndicatorProps {
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  className?: string;
  showDetails?: boolean;
}

/**
 * Context window indicator component showing token usage
 * @param messages - Array of chat messages
 * @param maxTokens - Maximum allowed tokens
 * @param className - Additional CSS classes
 * @param showDetails - Whether to show detailed information
 */
export function ContextWindowIndicator({
  messages,
  maxTokens = 100000, // Default for Claude 3
  className,
  showDetails = false,
}: ContextWindowIndicatorProps) {
  const [currentTokens, setCurrentTokens] = useState(0);
  const [isApproachingLimit, { open: setApproachingLimit, close: clearApproachingLimit }] =
    useDisclosure();
  const { hovered: _hovered, ref } = useHover();

  // Calculate total tokens
  useEffect(() => {
    const totalTokens = messages.reduce((sum, msg) => {
      return sum + estimateTokens(msg.content);
    }, 0);

    setCurrentTokens(totalTokens);
    if (totalTokens > maxTokens * 0.8) {
      setApproachingLimit();
    } else {
      clearApproachingLimit();
    }
  }, [messages, maxTokens, clearApproachingLimit, setApproachingLimit]);

  const percentage = (currentTokens / maxTokens) * 100;
  const remaining = maxTokens - currentTokens;

  const getStatusColor = () => {
    if (percentage >= 90) return 'text-red-500 bg-red-500/10';
    if (percentage >= 80) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={ref}
          className={cx(
            'flex items-center gap-2 rounded-full px-3 py-1.5',
            'transition-all duration-200 ease-out',
            'cursor-help hover:scale-105',
            getStatusColor(),
            className,
          )}
          data-testid="context-window-indicator"
        >
          <Brain size={14} />

          {showDetails && (
            <span className="text-xs font-medium">
              {currentTokens.toLocaleString()} / {maxTokens.toLocaleString()}
            </span>
          )}

          {/* Progress bar */}
          <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-black/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className={cx(
                'absolute left-0 top-0 h-full',
                percentage >= 90
                  ? 'bg-red-500'
                  : percentage >= 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500',
              )}
            />
          </div>

          {isApproachingLimit && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <AlertCircle size={14} />
            </motion.div>
          )}
        </div>
      </TooltipTrigger>

      <TooltipContent>
        <div className="space-y-2 text-sm">
          <div className="font-semibold">Context Window Usage</div>
          <div className="space-y-1">
            <div>Current: {currentTokens.toLocaleString()} tokens</div>
            <div>Remaining: {remaining.toLocaleString()} tokens</div>
            <div>Usage: {percentage.toFixed(1)}%</div>
          </div>
          {isApproachingLimit && (
            <div className="text-xs text-yellow-500">
              Approaching context limit. Consider starting a new conversation.
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Token usage meter with animation
interface TokenUsageMeterProps {
  current: number;
  max: number;
  className?: string;
}

export function TokenUsageMeter({ current, max, className }: TokenUsageMeterProps) {
  const percentage = (current / max) * 100;

  return (
    <div className={cx('relative', className)}>
      <svg className="h-16 w-16 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-muted"
        />
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 28}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - percentage / 100) }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cx(
            percentage >= 90
              ? 'text-red-500'
              : percentage >= 70
                ? 'text-yellow-500'
                : 'text-green-500',
          )}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// Session info component
interface SessionInfoProps {
  sessionStart: Date;
  messageCount: number;
  modelName: string;
  className?: string;
}

export function SessionInfo({
  sessionStart,
  messageCount,
  modelName,
  className,
}: SessionInfoProps) {
  const [duration, setDuration] = useState('0m');

  // Use useInterval for session duration updates
  useInterval(() => {
    const now = new Date();
    const diff = now.getTime() - sessionStart.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      setDuration(`${hours}h ${minutes % 60}m`);
    } else {
      setDuration(`${minutes}m`);
    }
  }, 60000); // Update every minute

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cx('flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-xs', className)}
    >
      <div className="flex items-center gap-1.5">
        <Info size={12} />
        <span className="font-medium">{modelName}</span>
      </div>

      <div className="h-3 w-px bg-border" />

      <div>{messageCount} messages</div>

      <div className="h-3 w-px bg-border" />

      <div>{duration}</div>
    </motion.div>
  );
}

// Hook for tracking context usage
export function useContextAwareness(messages: Array<{ role: string; content: string }>) {
  const [metrics, setMetrics] = useState({
    totalTokens: 0,
    userTokens: 0,
    assistantTokens: 0,
    systemTokens: 0,
    avgMessageLength: 0,
  });

  const [warnings, warningsHandlers] = useListState<string>([]);

  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const systemMessages = messages.filter(m => m.role === 'system');

    const userTokens = userMessages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    const assistantTokens = assistantMessages.reduce(
      (sum, m) => sum + estimateTokens(m.content),
      0,
    );
    const systemTokens = systemMessages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    const totalTokens = userTokens + assistantTokens + systemTokens;

    const avgLength =
      messages.length > 0
        ? Math.round(messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length)
        : 0;

    setMetrics({
      totalTokens,
      userTokens,
      assistantTokens,
      systemTokens,
      avgMessageLength: avgLength,
    });

    // Generate warnings using useListState
    warningsHandlers.setState([]);
    if (totalTokens > 80000) {
      warningsHandlers.append('Approaching context window limit');
    }
    if (messages.length > 100) {
      warningsHandlers.append('Long conversation may affect performance');
    }
    if (avgLength > 2000) {
      warningsHandlers.append('Consider breaking down long messages');
    }
  }, [messages, warningsHandlers]);

  return { metrics, warnings };
}
