'use client';

import { Button } from '#/components/ui/button';
import type { VisibilityType } from '#/components/visibility-selector';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { mockSuggestedActions } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { RESPONSIVE } from '#/lib/ui-constants';
import type { UseChatHelpers } from '@ai-sdk/react';
import { logInfo } from '@repo/observability';
import { motion } from 'framer-motion';
import { ChevronRight, Code, HelpCircle, RefreshCw, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

/**
 * Props for suggested actions component
 */
interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'] | ((message: any) => Promise<void>);
  selectedVisibilityType: VisibilityType;
}

/**
 * Pure suggested actions component for chat interface
 * @param chatId - Current chat identifier
 * @param append - Function to append messages to chat
 * @param selectedVisibilityType - Chat visibility setting (unused)
 */
function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType: _selectedVisibilityType,
}: SuggestedActionsProps) {
  // Use mock data in prototype mode, otherwise use default suggestions
  const prototypeMode = useMemo(() => isPrototypeMode(), []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get animation system
  const { variants, performance } = useAnimationSystem();

  // Memoize default suggestions to prevent recreation on every render
  const defaultSuggestions = useMemo(
    () => [
      {
        title: 'What are the advantages',
        label: 'of using Next.js?',
        action: 'What are the advantages of using Next.js?',
        category: 'development',
        icon: Code,
      },
      {
        title: 'Write code to',
        label: `demonstrate djikstra's algorithm`,
        action: `Write code to demonstrate djikstra's algorithm`,
        category: 'coding',
        icon: Code,
      },
      {
        title: 'Help me write an essay',
        label: `about silicon valley`,
        action: `Help me write an essay about silicon valley`,
        category: 'writing',
        icon: Sparkles,
      },
      {
        title: 'What is the weather',
        label: 'in San Francisco?',
        action: 'What is the weather in San Francisco?',
        category: 'general',
        icon: HelpCircle,
      },
    ],
    [],
  );

  // Memoize enhanced mock suggestions to prevent recreation on every render
  const enhancedMockSuggestions = useMemo(
    () =>
      mockSuggestedActions.map((action, index) => ({
        ...action,
        category: ['development', 'coding', 'debugging', 'performance'][index % 4],
        icon: [Code, Sparkles, HelpCircle, Zap][index % 4],
      })),
    [],
  );

  const suggestedActions = prototypeMode ? enhancedMockSuggestions : defaultSuggestions;

  // Memoize categories to prevent recreation on every render
  const categories = useMemo(
    () => [
      { id: 'development', label: 'Development', icon: Code },
      { id: 'coding', label: 'Coding', icon: Sparkles },
      { id: 'debugging', label: 'Debug', icon: HelpCircle },
      { id: 'performance', label: 'Performance', icon: Zap },
    ],
    [],
  );

  // Memoize filtered suggestions to prevent unnecessary filtering
  const filteredSuggestions = useMemo(
    () =>
      selectedCategory
        ? suggestedActions.filter(action => action.category === selectedCategory)
        : suggestedActions,
    [selectedCategory, suggestedActions],
  );

  // Memoize action handler to prevent recreation on every render
  const handleActionClick = useCallback(
    async (action: string) => {
      window.history.replaceState({}, '', `/chat/${chatId}`);

      // Use appropriate message format based on mode
      if (prototypeMode) {
        append({
          role: 'user',
          parts: [{ type: 'text', text: action }],
        });
      } else {
        append({
          role: 'user',
          parts: [{ type: 'text', text: action }],
        });
      }
    },
    [chatId, prototypeMode, append],
  );

  return (
    <div data-testid="suggested-actions" className={`w-full ${RESPONSIVE.SPACING.GAP.MD}`}>
      {/* Category Pills */}
      {prototypeMode && (
        <div className={`flex items-center ${RESPONSIVE.SPACING.GAP.SM} overflow-x-auto pb-2`}>
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="shrink-0"
          >
            <TrendingUp className="mr-1 h-3 w-3" />
            All
          </Button>
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setSelectedCategory(selectedCategory === category.id ? null : category.id)
                }
                className="shrink-0"
              >
                <Icon className="mr-1 h-3 w-3" />
                {category.label}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Shuffle suggestions for demo
              const shuffled = [...suggestedActions].sort(() => Math.random() - 0.5);
              // In real app, this would fetch new suggestions
              logInfo('Refreshing suggestions', { count: shuffled.length });
            }}
            className="ml-auto shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Suggestions Grid */}
      <motion.div
        className={`grid w-full ${RESPONSIVE.SPACING.GAP.SM} grid-cols-1 sm:grid-cols-2`}
        variants={variants.staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {filteredSuggestions.slice(0, 4).map((suggestedAction, index) => {
          const Icon = suggestedAction.icon || Sparkles;
          return (
            <motion.div
              variants={variants.slideUpVariants}
              key={`suggested-action-${suggestedAction.title}`}
              className={index > 1 ? 'hidden sm:block' : 'block'}
            >
              <motion.div
                variants={variants.hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="ghost"
                  onClick={() => {
                    performance.batchUpdates([() => handleActionClick(suggestedAction.action)]);
                  }}
                  className={`h-auto w-full flex-1 items-start justify-start gap-2 rounded-xl border ${RESPONSIVE.SPACING.MOBILE.SM} text-left ${RESPONSIVE.TYPOGRAPHY.BODY.MD} group focus:ring-2 focus:ring-ring/20`}
                  disableAnimation={true} // Disable default button animation to control manually
                >
                  <div className="flex w-full items-start gap-3">
                    {/* Enhanced icon with micromoments */}
                    <motion.div
                      className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary"
                      animate={{
                        backgroundColor: 'var(--primary-bg)',
                        scale: 1,
                      }}
                      whileHover={{
                        backgroundColor: 'var(--primary-hover-bg)',
                        scale: 1.05,
                        transition: { duration: performance.optimizedDuration(0.15) },
                      }}
                      style={
                        {
                          willChange: 'transform, background-color',
                          '--primary-bg': 'rgb(var(--primary) / 0.1)',
                          '--primary-hover-bg': 'rgb(var(--primary) / 0.2)',
                        } as any
                      }
                    >
                      <motion.div
                        animate={{ rotate: 0 }}
                        whileHover={{
                          rotate: [0, -5, 5, 0],
                          transition: { duration: performance.optimizedDuration(0.3) },
                        }}
                        style={{ willChange: 'transform' }}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                    </motion.div>

                    <div className={`flex-1 ${RESPONSIVE.SPACING.GAP.XS}`}>
                      <div className="flex items-center justify-between">
                        {/* Enhanced title with color animation */}
                        <motion.span
                          className="font-medium"
                          animate={{ color: 'var(--foreground)' }}
                          whileHover={{
                            color: 'var(--primary)',
                            transition: { duration: performance.optimizedDuration(0.15) },
                          }}
                          style={
                            {
                              willChange: 'color',
                              '--foreground': 'hsl(var(--foreground))',
                              '--primary': 'hsl(var(--primary))',
                            } as any
                          }
                        >
                          {suggestedAction.title}
                        </motion.span>

                        {/* Enhanced chevron with sophisticated animation */}
                        <motion.div
                          animate={{
                            opacity: 0,
                            x: -5,
                          }}
                          whileHover={{
                            opacity: 1,
                            x: 0,
                            transition: {
                              duration: performance.optimizedDuration(0.2),
                              ease: [0.4, 0.0, 0.2, 1],
                            },
                          }}
                          style={{ willChange: 'transform, opacity' }}
                        >
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        </motion.div>
                      </div>

                      {/* Enhanced label with fade animation */}
                      <motion.span
                        className="text-xs text-muted-foreground"
                        animate={{ opacity: 0.7 }}
                        whileHover={{
                          opacity: 1,
                          transition: { duration: performance.optimizedDuration(0.15) },
                        }}
                        style={{ willChange: 'opacity' }}
                      >
                        {suggestedAction.label}
                      </motion.span>
                    </div>
                  </div>
                </Button>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Enhanced show more suggestions indicator */}
      {prototypeMode && filteredSuggestions.length > 4 && (
        <motion.div
          className="text-center"
          variants={variants.fadeVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: performance.optimizedDuration(0.3) }}
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ willChange: 'transform' }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                performance.batchUpdates([
                  () => {
                    // In real app, this would load more suggestions
                    logInfo('Loading more suggestions');
                  },
                ]);
              }}
              className="text-xs"
            >
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{
                  duration: performance.optimizedDuration(2),
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ willChange: 'opacity' }}
              >
                Show {filteredSuggestions.length - 4} more suggestions
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, (prevProps, nextProps) => {
  if (prevProps.chatId !== nextProps.chatId) return false;
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) return false;

  return true;
});
