'use client';

import { Button } from '#/components/ui/button';
import { Progress } from '#/components/ui/progress';
import { useFixedPosition } from '#/hooks/ui/use-layout-manager';
import { Z_INDEX } from '#/lib/ui-constants';
import { cn as cx } from '#/lib/utils';
import { useLocalStorage } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface FeatureUsage {
  id: string;
  name: string;
  category: string;
  timesUsed: number;
  firstUsed?: string;
  lastUsed?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  condition: (usage: FeatureUsage[]) => boolean;
  unlocked: boolean;
}

const defaultAchievements: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Used your first feature',
    icon: Star,
    condition: usage => usage.length > 0,
    unlocked: false,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Tried 5 different features',
    icon: Target,
    condition: usage => usage.length >= 5,
    unlocked: false,
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Used 10+ features',
    icon: Zap,
    condition: usage => usage.length >= 10,
    unlocked: false,
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Tried all available features',
    icon: Trophy,
    condition: usage => usage.length >= 13, // allFeatures.length
    unlocked: false,
  },
  {
    id: 'daily-user',
    title: 'Daily User',
    description: 'Used features for 7 days',
    icon: Clock,
    condition: usage => {
      const uniqueDays = new Set(usage.map(u => u.lastUsed?.split('T')[0]).filter(Boolean));
      return uniqueDays.size >= 7;
    },
    unlocked: false,
  },
];

export function FeatureProgressTracker() {
  const [isVisible, setIsVisible] = useState(false);
  const [featureUsage] = useLocalStorage<FeatureUsage[]>({
    key: 'feature-usage-tracking',
    defaultValue: [],
  });
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>({
    key: 'feature-achievements',
    defaultValue: [],
  });

  const { className: panelClassName } = useFixedPosition(
    'feature-progress',
    'bottom-left',
    isVisible,
    1,
  );
  const { className: _buttonClassName } = useFixedPosition(
    'feature-progress-button',
    'bottom-left',
    !isVisible,
    1,
  );

  const allFeatures = [
    { id: 'micromoments', name: 'Micromoments', category: 'UI/UX' },
    { id: 'network-status', name: 'Network Status', category: 'UI/UX' },
    { id: 'message-reactions', name: 'Message Reactions', category: 'UI/UX' },
    { id: 'virtual-scrolling', name: 'Virtual Scrolling', category: 'Performance' },
    { id: 'mcp-connections', name: 'MCP Connections', category: 'MCP Tools' },
    { id: 'mcp-marketplace', name: 'MCP Marketplace', category: 'MCP Tools' },
    { id: 'mcp-permissions', name: 'Permission Manager', category: 'MCP Tools' },
    { id: 'tool-chains', name: 'Tool Chain Builder', category: 'MCP Tools' },
    { id: 'multi-model', name: 'Multi-Model Compare', category: 'AI Features' },
    { id: 'conversation-branching', name: 'Conversation Branching', category: 'AI Features' },
    { id: 'ai-memory', name: 'AI Memory System', category: 'AI Features' },
    { id: 'prompt-templates', name: 'Prompt Templates', category: 'AI Features' },
  ];

  // Initialize achievements if empty
  useEffect(() => {
    if (achievements.length === 0) {
      setAchievements(defaultAchievements);
    }
  }, [achievements.length, setAchievements]);

  // Check for new achievements
  useEffect(() => {
    if (featureUsage.length > 0 && achievements.length > 0) {
      const updatedAchievements = achievements.map(achievement => ({
        ...achievement,
        unlocked: achievement.unlocked || achievement.condition(featureUsage),
      }));

      const newUnlocks = updatedAchievements.filter(
        (a, i) => a.unlocked && !achievements[i]?.unlocked,
      );

      if (newUnlocks.length > 0) {
        setAchievements(updatedAchievements);
        // New achievements unlocked - could trigger a toast notification here
      }
    }
  }, [featureUsage, achievements, setAchievements]);

  // Auto-show progress tracker occasionally
  useEffect(() => {
    const shouldShow = Math.random() < 0.1 && featureUsage.length > 0; // 10% chance
    if (shouldShow) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [featureUsage.length]);

  const usedFeatures = featureUsage.length;
  const totalFeatures = allFeatures.length;
  const progressPercentage = (usedFeatures / totalFeatures) * 100;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  if (!isVisible) {
    return null; // No floating button - now integrated into chat header
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className={cx(
          panelClassName,
          'w-80 rounded-lg border bg-background shadow-2xl',
          `z-[${Z_INDEX.PANEL}]`,
        )}
      >
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Feature Progress</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="space-y-4 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Features Explored</span>
              <span className="text-sm text-muted-foreground">
                {usedFeatures}/{totalFeatures}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-2xl font-bold text-primary">{usedFeatures}</div>
              <div className="text-xs text-muted-foreground">Features Used</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-2xl font-bold text-primary">{unlockedAchievements}</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>

          {/* Recent Achievements */}
          {achievements.filter(a => a.unlocked).length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Latest Achievements</h4>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {achievements
                  .filter(a => a.unlocked)
                  .slice(-3)
                  .map(achievement => {
                    const Icon = achievement.icon;
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 rounded bg-primary/10 p-2"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{achievement.title}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {achievement.description}
                          </div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Call to Action */}
          {usedFeatures < totalFeatures && (
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                {totalFeatures - usedFeatures} more features to discover!
              </p>
              <Button
                size="sm"
                onClick={() => {
                  window.open('/?showcase=true', '_blank');
                  setIsVisible(false);
                }}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Explore Features
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Perfect Score Celebration */}
          {usedFeatures === totalFeatures && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/20 to-primary/10 p-4 text-center"
            >
              <Trophy className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="font-semibold text-primary">Congratulations!</div>
              <div className="text-sm text-muted-foreground">
                You&apos;ve explored every feature!
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for tracking feature usage
export function useFeatureTracking() {
  const [featureUsage, setFeatureUsage] = useLocalStorage<FeatureUsage[]>({
    key: 'feature-usage-tracking',
    defaultValue: [],
  });

  const trackFeatureUsage = (featureId: string, featureName: string, category: string) => {
    setFeatureUsage(prev => {
      const existing = prev.find(f => f.id === featureId);
      const now = new Date().toISOString();

      if (existing) {
        return prev.map(f =>
          f.id === featureId ? { ...f, timesUsed: f.timesUsed + 1, lastUsed: now } : f,
        );
      } else {
        return [
          ...prev,
          {
            id: featureId,
            name: featureName,
            category,
            timesUsed: 1,
            firstUsed: now,
            lastUsed: now,
          },
        ];
      }
    });
  };

  return { featureUsage, trackFeatureUsage };
}
