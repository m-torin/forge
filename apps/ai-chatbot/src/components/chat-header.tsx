'use client';

import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { useLocalStorage, useViewportSize } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { ContextWindowIndicator } from '#/components/context-awareness';
import { FeatureTooltip } from '#/components/features/feature-tooltip';
import { PlusIcon } from '#/components/icons';
import { McpFeatureBadge } from '#/components/mcp/feature-indicator';
import { ModelSelector } from '#/components/model-selector';
import { NetworkStatus } from '#/components/network-status';
import { RAGIndicator } from '#/components/rag/rag-indicator';
import { RAGStatusBadge } from '#/components/rag/rag-status-indicator';
import { SidebarToggle } from '#/components/sidebar-toggle';
import { Button } from '#/components/ui/button';
import { useSidebar } from '#/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { type VisibilityType, VisibilitySelector } from '#/components/visibility-selector';
import { isRAGEnabled, shouldUseMockRAG } from '#/lib/mock-data';
import type { ChatMessage } from '#/lib/types';
import { APPLE_BREAKPOINTS, RESPONSIVE } from '#/lib/ui-constants';
import { Sparkles, Trophy } from 'lucide-react';
import type { Session } from 'next-auth';
import { memo, useState } from 'react';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session: _session,
  messages,
  onModelSelect,
  ragEnabled = false,
  onRAGToggle,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  messages?: ChatMessage[];
  onModelSelect?: (model: string) => void;
  ragEnabled?: boolean;
  onRAGToggle?: (enabled: boolean) => void;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useViewportSize();

  // Progress tracker state
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [featureUsage] = useLocalStorage<any[]>({
    key: 'feature-usage-tracking',
    defaultValue: [],
  });

  const { variants, performance } = useAnimationSystem();

  return (
    <>
      <ProgressTrackerModal
        isOpen={showProgressTracker}
        onClose={() => setShowProgressTracker(false)}
        featureUsage={featureUsage}
      />
      <motion.header
        className="landscape-compact sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2"
        variants={variants.slideDownVariants}
        initial="hidden"
        animate="visible"
        style={{ willChange: 'transform, opacity' }}
      >
        <motion.div
          variants={variants.staggerContainerFast}
          initial="hidden"
          animate="visible"
          className="flex w-full items-center gap-2"
        >
          <motion.div
            variants={variants.slideRightVariants}
            style={{ willChange: 'transform, opacity' }}
          >
            <SidebarToggle />
          </motion.div>

          <AnimatePresence>
            {(!open || windowWidth < APPLE_BREAKPOINTS.IPAD_MINI) && (
              <motion.div
                variants={variants.scaleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ willChange: 'transform, opacity' }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={`order-2 ml-auto px-2 md:order-1 md:ml-0 md:h-fit md:px-2 ${RESPONSIVE.TOUCH_TARGET.SMALL}`}
                      onClick={() => {
                        performance.batchUpdates([() => router.push('/'), () => router.refresh()]);
                      }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 90, 0] }}
                        transition={{ duration: performance.optimizedDuration(0.3) }}
                        whileHover={{ scale: 1.1 }}
                        style={{ willChange: 'transform' }}
                      >
                        <PlusIcon />
                      </motion.div>
                      <span className="md:sr-only">New Chat</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Chat</TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isReadonly && (
              <motion.div
                variants={variants.slideUpVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: performance.optimizedDuration(0.1) }}
                style={{ willChange: 'transform, opacity' }}
              >
                <ModelSelector
                  selectedModel={selectedModelId}
                  onModelSelect={onModelSelect || (() => {})}
                  ragEnabled={ragEnabled}
                  onRAGToggle={onRAGToggle}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isReadonly && (
              <motion.div
                variants={variants.slideUpVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: performance.optimizedDuration(0.15) }}
                style={{ willChange: 'transform, opacity' }}
                className="order-1 md:order-3"
              >
                <VisibilitySelector
                  chatId={chatId}
                  selectedVisibilityType={selectedVisibilityType}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Context Window Indicator */}
          <AnimatePresence>
            {messages && messages.length > 0 && (
              <motion.div
                variants={variants.fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: performance.optimizedDuration(0.2) }}
                className="order-2 hidden sm:block md:order-4"
                style={{ willChange: 'transform, opacity' }}
              >
                <ContextWindowIndicator
                  messages={messages.map(m => ({
                    role: m.role,
                    content: m.parts
                      .filter(p => p.type === 'text')
                      .map(p => p.text)
                      .join(' '),
                  }))}
                  showDetails={windowWidth > APPLE_BREAKPOINTS.IPAD_MINI}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced RAG Status Indicator */}
          <motion.div
            variants={variants.bounceScaleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: performance.optimizedDuration(0.25) }}
            className="order-3 md:order-5"
            style={{ willChange: 'transform, opacity' }}
          >
            <RAGIndicator
              isActive={ragEnabled && (isRAGEnabled() || shouldUseMockRAG())}
              isDemo={shouldUseMockRAG()}
              variant="minimal"
            />
          </motion.div>

          {/* Enhanced RAG Status Badge */}
          <motion.div
            variants={variants.scaleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: performance.optimizedDuration(0.3) }}
            className="order-3 md:order-5"
            style={{ willChange: 'transform, opacity' }}
          >
            <RAGStatusBadge />
          </motion.div>

          {/* Enhanced MCP Feature Badge */}
          <motion.div
            variants={variants.slideLeftVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: performance.optimizedDuration(0.35) }}
            className="order-4 md:order-6"
            style={{ willChange: 'transform, opacity' }}
          >
            <McpFeatureBadge showLabel={windowWidth > APPLE_BREAKPOINTS.IPHONE_PRO_MAX} />
          </motion.div>

          {/* Enhanced Progress Tracker Button */}
          <motion.div
            variants={variants.bounceScaleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: performance.optimizedDuration(0.4) }}
            className="order-5 md:order-7"
            style={{ willChange: 'transform, opacity' }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    performance.batchUpdates([() => setShowProgressTracker(true)]);
                  }}
                  className="gap-2"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: performance.optimizedDuration(2),
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    style={{ willChange: 'transform' }}
                  >
                    <Trophy className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Progress</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                View Feature Progress ({featureUsage.length} features used)
              </TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Enhanced Network Status Indicator */}
          <motion.div
            variants={variants.slideRightVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: performance.optimizedDuration(0.45) }}
            className="order-6 md:order-8"
            style={{ willChange: 'transform, opacity' }}
          >
            <NetworkStatus />
          </motion.div>

          {/* Enhanced Feature Tour Button */}
          <motion.div
            variants={variants.scaleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: performance.optimizedDuration(0.5) }}
            className="order-7 md:order-9"
            style={{ willChange: 'transform, opacity' }}
          >
            <FeatureTooltip
              featureId="feature-tour"
              title="Take a Tour"
              description="Discover all the features we've built to enhance your experience"
              trigger="hover"
              position="bottom"
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  performance.batchUpdates([() => window.open('/?showcase=true', '_blank')]);
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: performance.optimizedDuration(3),
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  style={{ willChange: 'transform' }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                <span className="hidden sm:inline">Features</span>
              </Button>
            </FeatureTooltip>
          </motion.div>
        </motion.div>
      </motion.header>
    </>
  );
}

// Enhanced progress tracker modal component with animations
function ProgressTrackerModal({
  isOpen,
  onClose,
  featureUsage,
}: {
  isOpen: boolean;
  onClose: () => void;
  featureUsage: any[];
}) {
  const { variants, performance } = useAnimationSystem();

  if (!isOpen) return null;

  const allFeatures = [
    { id: 'micromoments', name: 'Micromoments', category: 'UI/UX' },
    { id: 'network-status', name: 'Network Status', category: 'UI/UX' },
    { id: 'message-reactions', name: 'Message Reactions', category: 'UI/UX' },
    { id: 'virtual-scrolling', name: 'Virtual Scrolling', category: 'Performance' },
    { id: 'performance-monitor', name: 'Performance Monitor', category: 'Performance' },
    { id: 'mcp-connections', name: 'MCP Connections', category: 'MCP Tools' },
    { id: 'mcp-marketplace', name: 'MCP Marketplace', category: 'MCP Tools' },
    { id: 'mcp-permissions', name: 'Permission Manager', category: 'MCP Tools' },
    { id: 'tool-chains', name: 'Tool Chain Builder', category: 'MCP Tools' },
    { id: 'multi-model', name: 'Multi-Model Compare', category: 'AI Features' },
    { id: 'conversation-branching', name: 'Conversation Branching', category: 'AI Features' },
    { id: 'ai-memory', name: 'AI Memory System', category: 'AI Features' },
    { id: 'prompt-templates', name: 'Prompt Templates', category: 'AI Features' },
  ];

  const usedFeatures = featureUsage.length;
  const totalFeatures = allFeatures.length;
  const progressPercentage = (usedFeatures / totalFeatures) * 100;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        variants={variants.overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        style={{ willChange: 'opacity' }}
      >
        <motion.div
          className="w-80 rounded-lg border bg-background shadow-2xl"
          variants={variants.modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div
            className="border-b p-4"
            variants={variants.staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-2"
                variants={variants.slideRightVariants}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: performance.optimizedDuration(2),
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  style={{ willChange: 'transform' }}
                >
                  <Trophy className="h-5 w-5 text-primary" />
                </motion.div>
                <h3 className="font-semibold">Feature Progress</h3>
              </motion.div>
              <motion.div
                variants={variants.scaleVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ willChange: 'transform' }}
              >
                <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                  ×
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-4 p-4"
            variants={variants.staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={variants.slideUpVariants}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Features Explored</span>
                <motion.span
                  className="text-sm text-muted-foreground"
                  key={usedFeatures}
                  variants={variants.bounceScaleVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {usedFeatures}/{totalFeatures}
                </motion.span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-2 rounded-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{
                    duration: performance.optimizedDuration(1),
                    ease: [0.4, 0.0, 0.2, 1],
                    delay: performance.optimizedDuration(0.3),
                  }}
                  style={{ willChange: 'width' }}
                />
              </div>
            </motion.div>

            <motion.div className="grid grid-cols-2 gap-4" variants={variants.staggerContainerFast}>
              <motion.div
                className="rounded-lg bg-muted/50 p-3 text-center"
                variants={variants.scaleVariants}
                whileHover={{ scale: 1.05 }}
                style={{ willChange: 'transform' }}
              >
                <motion.div
                  className="text-2xl font-bold text-primary"
                  key={usedFeatures}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: performance.optimizedDuration(0.3) }}
                >
                  {usedFeatures}
                </motion.div>
                <div className="text-xs text-muted-foreground">Features Used</div>
              </motion.div>
              <motion.div
                className="rounded-lg bg-muted/50 p-3 text-center"
                variants={variants.scaleVariants}
                whileHover={{ scale: 1.05 }}
                style={{ willChange: 'transform' }}
              >
                <motion.div
                  className="text-2xl font-bold text-primary"
                  key={totalFeatures - usedFeatures}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: performance.optimizedDuration(0.3) }}
                >
                  {totalFeatures - usedFeatures}
                </motion.div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {usedFeatures < totalFeatures && (
                <motion.div
                  className="space-y-2 text-center"
                  variants={variants.bounceScaleVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.p
                    className="text-sm text-muted-foreground"
                    variants={variants.fadeVariants}
                  >
                    {totalFeatures - usedFeatures} more features to discover!
                  </motion.p>
                  <motion.div
                    variants={variants.scaleVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ willChange: 'transform' }}
                  >
                    <Button
                      size="sm"
                      onClick={() => {
                        performance.batchUpdates([
                          () => window.open('/?showcase=true', '_blank'),
                          () => onClose(),
                        ]);
                      }}
                      className="gap-2"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: performance.optimizedDuration(2),
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                        style={{ willChange: 'transform' }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Explore Features
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;
  if (prevProps.chatId !== nextProps.chatId) return false;
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) return false;
  if (prevProps.isReadonly !== nextProps.isReadonly) return false;
  if (prevProps.ragEnabled !== nextProps.ragEnabled) return false;
  if (prevProps.messages?.length !== nextProps.messages?.length) return false;
  return true;
});
