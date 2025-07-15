'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { useDisclosure, useHover } from '@mantine/hooks';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, HelpCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

// Confidence levels
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain';

interface ResponseConfidenceProps {
  confidence: number; // 0-1
  reasoning?: string;
  factors?: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  className?: string;
  showDetails?: boolean;
}

export function ResponseConfidence({
  confidence,
  reasoning,
  factors,
  className,
  showDetails = false,
}: ResponseConfidenceProps) {
  const { hovered, ref } = useHover();
  const [_isExpanded, { toggle: toggleExpanded }] = useDisclosure();

  const level = getConfidenceLevel(confidence);
  const config = getConfidenceConfig(level);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={toggleExpanded}
          className={cx(
            'inline-flex cursor-help items-center gap-1.5 rounded-full px-2 py-1',
            'transition-all duration-200',
            config.bgColor,
            config.textColor,
            className,
          )}
          data-testid="response-confidence"
        >
          <motion.div animate={hovered ? config.animation : {}} transition={{ duration: 0.5 }}>
            <config.icon size={14} />
          </motion.div>

          {showDetails && (
            <span className="text-xs font-medium">{Math.round(confidence * 100)}%</span>
          )}

          {/* Confidence meter */}
          <div className="relative h-1 w-12 overflow-hidden rounded-full bg-black/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cx('absolute left-0 top-0 h-full', config.barColor)}
            />
          </div>
        </motion.div>
      </TooltipTrigger>

      <TooltipContent>
        <div className="max-w-xs space-y-2">
          <div className="flex items-center gap-2">
            <config.icon size={16} className={config.textColor} />
            <span className="font-medium">{config.label}</span>
            <span className="text-muted-foreground">({Math.round(confidence * 100)}%)</span>
          </div>

          {reasoning && <p className="text-sm text-muted-foreground">{reasoning}</p>}

          {factors && factors.length > 0 && (
            <div className="space-y-1 border-t pt-1">
              <p className="text-xs font-medium">Contributing factors:</p>
              {factors.map(factor => (
                <div key={`factor-${factor.name}`} className="flex items-center gap-1.5 text-xs">
                  <FactorIcon impact={factor.impact} />
                  <span>{factor.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Helper to determine confidence level
function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  if (confidence >= 0.3) return 'low';
  return 'uncertain';
}

// Configuration for each confidence level
function getConfidenceConfig(level: ConfidenceLevel) {
  const configs = {
    high: {
      icon: CheckCircle,
      label: 'High Confidence',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400',
      barColor: 'bg-green-500',
      animation: { rotate: [0, 10, -10, 0] },
    },
    medium: {
      icon: Info,
      label: 'Medium Confidence',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      barColor: 'bg-blue-500',
      animation: { scale: [1, 1.1, 1] },
    },
    low: {
      icon: AlertTriangle,
      label: 'Low Confidence',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      barColor: 'bg-yellow-500',
      animation: { y: [0, -2, 0] },
    },
    uncertain: {
      icon: HelpCircle,
      label: 'Uncertain',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-600 dark:text-gray-400',
      barColor: 'bg-gray-500',
      animation: { opacity: [1, 0.7, 1] },
    },
  };

  return configs[level];
}

// Factor impact icon
function FactorIcon({ impact }: { impact: 'positive' | 'negative' | 'neutral' }) {
  const icons = {
    positive: { icon: '✓', color: 'text-green-500' },
    negative: { icon: '✗', color: 'text-red-500' },
    neutral: { icon: '•', color: 'text-gray-500' },
  };

  const config = icons[impact];

  return <span className={cx('text-xs', config.color)}>{config.icon}</span>;
}

// Hook to calculate response confidence
export function useResponseConfidence(message: string, _context?: any) {
  const [confidence, setConfidence] = useState(0);
  const [factors, setFactors] = useState<
    Array<{
      name: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
    }>
  >([]);

  useEffect(() => {
    // Simple confidence calculation based on various factors
    const newFactors = [];
    let score = 0.5; // Base confidence

    // Check message length (very short or very long reduces confidence)
    if (message.length < 50) {
      newFactors.push({
        name: 'Short response',
        impact: 'negative' as const,
        description: 'Response may lack detail',
      });
      score -= 0.1;
    } else if (message.length > 2000) {
      newFactors.push({
        name: 'Detailed response',
        impact: 'positive' as const,
        description: 'Comprehensive answer provided',
      });
      score += 0.1;
    }

    // Check for uncertainty markers
    const uncertaintyMarkers = ['might', 'maybe', 'possibly', 'could be', 'not sure'];
    const hasUncertainty = uncertaintyMarkers.some(marker =>
      message.toLowerCase().includes(marker),
    );

    if (hasUncertainty) {
      newFactors.push({
        name: 'Uncertainty detected',
        impact: 'negative' as const,
        description: 'Response contains uncertain language',
      });
      score -= 0.2;
    }

    // Check for citations or sources
    const hasCitations = message.includes('[') && message.includes(']');
    if (hasCitations) {
      newFactors.push({
        name: 'Sources cited',
        impact: 'positive' as const,
        description: 'Response includes references',
      });
      score += 0.15;
    }

    // Check for code blocks (usually high confidence)
    const hasCode = message.includes('```');
    if (hasCode) {
      newFactors.push({
        name: 'Code included',
        impact: 'positive' as const,
        description: 'Response contains executable code',
      });
      score += 0.1;
    }

    // Clamp confidence between 0 and 1
    const finalScore = Math.max(0, Math.min(1, score));

    setConfidence(finalScore);
    setFactors(newFactors);
  }, [message]);

  return { confidence, factors };
}

// Inline confidence indicator for messages
interface MessageConfidenceIndicatorProps {
  message: string;
  className?: string;
}

export function MessageConfidenceIndicator({
  message,
  className,
}: MessageConfidenceIndicatorProps) {
  const { confidence, factors } = useResponseConfidence(message);

  // Only show for medium to low confidence
  if (confidence > 0.7) return null;

  return (
    <ResponseConfidence
      confidence={confidence}
      factors={factors}
      className={className}
      showDetails
    />
  );
}

// Confidence trend visualization
interface ConfidenceTrendProps {
  history: number[];
  className?: string;
}

export function ConfidenceTrend({ history, className }: ConfidenceTrendProps) {
  const latest = history[history.length - 1] || 0;
  const trend = history.length > 1 ? history[history.length - 1] - history[history.length - 2] : 0;

  return (
    <div className={cx('flex items-center gap-2', className)}>
      <svg className="h-8 w-24">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={history
            .map((value, index) => `${(index / (history.length - 1)) * 90 + 5},${35 - value * 30}`)
            .join(' ')}
          className="text-primary"
        />
      </svg>

      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{Math.round(latest * 100)}%</span>
        {trend !== 0 && (
          <span className={cx('text-xs', trend > 0 ? 'text-green-500' : 'text-red-500')}>
            {trend > 0 ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
}
