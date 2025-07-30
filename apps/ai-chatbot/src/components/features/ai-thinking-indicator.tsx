'use client';

import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { useCounter, useInterval } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Cpu, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ThinkingStage = 'understanding' | 'processing' | 'generating' | 'idle';

interface AiThinkingIndicatorProps {
  stage: ThinkingStage;
  isActive: boolean;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const stageConfig = {
  understanding: {
    icon: Brain,
    label: 'Understanding',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    animation: {
      rotate: [0, -10, 10, 0],
      scale: [1, 1.1, 1],
    },
  },
  processing: {
    icon: Cpu,
    label: 'Processing',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    animation: {
      rotate: [0, 180, 360],
      scale: [1, 1.05, 1],
    },
  },
  generating: {
    icon: Sparkles,
    label: 'Generating',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    animation: {
      rotate: [0, 5, -5, 0],
      scale: [1, 1.2, 1.1, 1],
      opacity: [0.8, 1, 0.8],
    },
  },
  idle: {
    icon: Zap,
    label: 'Ready',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    animation: {
      scale: [1, 1, 1],
    },
  },
};

export function AiThinkingIndicator({
  stage,
  isActive,
  className,
  showLabel = true,
  size = 'md',
}: AiThinkingIndicatorProps) {
  const { performance } = useAnimationSystem();
  const [displayStage, setDisplayStage] = useState<ThinkingStage>(stage);
  const config = stageConfig[displayStage];
  const Icon = config.icon;

  // Smooth stage transitions
  useEffect(() => {
    if (stage !== displayStage) {
      const timer = setTimeout(() => {
        setDisplayStage(stage);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [stage, displayStage]);

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={displayStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cx(
            'flex items-center gap-2 rounded-full px-3',
            config.bgColor,
            sizeClasses[size],
            className,
          )}
          data-testid="ai-thinking-indicator"
        >
          <motion.div
            animate={config.animation}
            transition={{
              duration: performance.optimizedDuration(displayStage === 'processing' ? 2 : 1.5),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={config.color}
            style={{ willChange: 'transform, opacity' }}
          >
            <Icon size={iconSizes[size]} />
          </motion.div>

          {showLabel && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cx('font-medium', config.color)}
            >
              {config.label}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage AI thinking states
export function useAiThinking() {
  const [stage, setStage] = useState<ThinkingStage>('idle');
  const [isActive, setIsActive] = useState(false);
  const [progress, { increment: incrementProgress, reset: resetProgress }] = useCounter(0, {
    min: 0,
    max: 100,
  });

  // Auto-progress through stages
  useInterval(
    () => {
      if (stage === 'understanding' && progress > 30) {
        setStage('processing');
      } else if (stage === 'processing' && progress > 70) {
        setStage('generating');
      }

      if (progress < 100) {
        incrementProgress();
      }
    },
    isActive ? 50 : 0,
  );

  const startThinking = (initialStage: ThinkingStage = 'understanding') => {
    setIsActive(true);
    setStage(initialStage);
    resetProgress();
  };

  const stopThinking = () => {
    setIsActive(false);
    setStage('idle');
    resetProgress();
  };

  const updateStage = (newStage: ThinkingStage) => {
    if (isActive) {
      setStage(newStage);
    }
  };

  return {
    stage,
    isActive,
    progress,
    startThinking,
    stopThinking,
    updateStage,
  };
}

// Multi-stage progress indicator
interface AiProgressIndicatorProps {
  stages: Array<{
    id: string;
    label: string;
    duration?: number;
  }>;
  currentStageIndex: number;
  className?: string;
}

export function AiProgressIndicator({
  stages,
  currentStageIndex,
  className,
}: AiProgressIndicatorProps) {
  const { performance } = useAnimationSystem();
  return (
    <div className={cx('flex items-center gap-1', className)}>
      {stages.map((stage, index) => {
        const isComplete = index < currentStageIndex;
        const isCurrent = index === currentStageIndex;
        const isPending = index > currentStageIndex;

        return (
          <div key={stage.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isCurrent ? 1.2 : 1,
                opacity: isPending ? 0.3 : 1,
              }}
              className={cx('h-2 w-2 rounded-full transition-colors duration-300', {
                'bg-green-500': isComplete,
                'bg-blue-500': isCurrent,
                'bg-gray-300': isPending,
              })}
            >
              {isCurrent && (
                <motion.div
                  className="h-full w-full rounded-full bg-blue-500"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.div>

            <AnimatePresence>
              {index < stages.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: isComplete ? 1 : 0,
                  }}
                  transition={{ duration: performance.optimizedDuration(0.3) }}
                  className="h-0.5 w-8 origin-left bg-green-500"
                  style={{ willChange: 'transform' }}
                />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
