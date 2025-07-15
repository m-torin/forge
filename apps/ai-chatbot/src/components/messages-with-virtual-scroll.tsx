import { ChatSkeleton, MessageSkeleton } from '#/components/contextual-loading';
import { useDataStream } from '#/components/data-stream-provider';
import { Greeting } from '#/components/greeting';
import { PreviewMessage, ThinkingMessage } from '#/components/message';
import { VirtualMessages } from '#/components/virtual-messages';
import { useMessages } from '#/hooks/chat/use-messages';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import type { Vote } from '#/lib/db/schema';
import { isPrototypeMode } from '#/lib/prototype-mode';
import type { ChatMessage } from '#/lib/types';
import { RESPONSIVE, Z_INDEX } from '#/lib/ui-constants';
import { useLocalStorage } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo } from 'react';

interface MessagesProps {
  chatId: string;
  status: 'ready' | 'streaming' | 'submitted' | 'error';
  votes: Array<Vote> | undefined;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[])) => void;
  reload: () => Promise<string | null | undefined>;
  isReadonly: boolean;
  isArtifactVisible: boolean;
  isLoadingHistory?: boolean;
}

// Threshold for when to enable virtual scrolling
const VIRTUAL_SCROLL_THRESHOLD = 50;

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  isLoadingHistory = false,
}: MessagesProps) {
  const [enableVirtualScroll, setEnableVirtualScroll] = useLocalStorage({
    key: 'chat-virtual-scroll',
    defaultValue: true,
  });

  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  // Initialize animation system for messages performance optimization
  const { variants, performance, cleanup } = useAnimationSystem({
    enableHardwareAccel: true,
    respectReducedMotion: true,
  });

  useDataStream();

  // Check if we're in prototype mode
  const prototypeMode = useMemo(() => isPrototypeMode(), []);

  // Determine if we should use virtual scrolling with memoization
  const shouldUseVirtualScroll = useMemo(
    () => enableVirtualScroll && messages.length > VIRTUAL_SCROLL_THRESHOLD,
    [enableVirtualScroll, messages.length],
  );

  // Optimized virtual scroll toggle
  const _handleVirtualScrollToggle = useCallback(() => {
    performance.batchUpdates([() => setEnableVirtualScroll(!enableVirtualScroll)]);
  }, [enableVirtualScroll, performance, setEnableVirtualScroll]);

  // Performance monitoring and cleanup
  useEffect(() => {
    performance.startMonitoring();

    if (process.env.NODE_ENV === 'development') {
      logInfo(
        `Messages: ${messages.length}, Virtual Scroll: ${shouldUseVirtualScroll}, Prototype: ${prototypeMode}`,
      );
    }

    return () => {
      performance.stopMonitoring();
      cleanup();
    };
  }, [messages.length, shouldUseVirtualScroll, prototypeMode, performance, cleanup]);

  return (
    <>
      {/* Virtual scrolling for large conversations */}
      {shouldUseVirtualScroll ? (
        <motion.div
          className="relative flex-1 overflow-hidden"
          variants={variants.fadeVariants}
          initial="hidden"
          animate="visible"
          style={{
            willChange: 'opacity',
          }}
        >
          {messages.length === 0 ? (
            <motion.div
              className="flex h-full flex-col items-center justify-center"
              variants={variants.scaleVariants}
              initial="hidden"
              animate="visible"
            >
              {isLoadingHistory ? (
                <motion.div
                  variants={variants.slideUpVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={RESPONSIVE.SPACING.GAP.LG}
                >
                  <ChatSkeleton className="px-4" animated={true} />
                </motion.div>
              ) : (
                <motion.div
                  variants={variants.slideUpVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: performance.optimizedDuration(0.1) }}
                >
                  <Greeting />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={variants.slideUpVariants}
              initial="hidden"
              animate="visible"
              style={{
                willChange: 'transform, opacity',
              }}
            >
              <VirtualMessages
                chatId={chatId}
                messages={messages}
                votes={votes}
                status={status}
                setMessages={setMessages as any}
                reload={reload}
                isReadonly={isReadonly}
                scrollOnNewMessage={hasSentMessage}
              />
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Regular scrolling for small conversations */
        <motion.div
          ref={messagesContainerRef}
          className={`relative flex min-w-0 flex-1 flex-col ${RESPONSIVE.SPACING.GAP.LG} overflow-scroll-ios overflow-y-scroll pt-4`}
          variants={variants.fadeVariants}
          initial="hidden"
          animate="visible"
          style={{
            willChange: 'scroll-position',
          }}
        >
          {/* Empty State or Loading History */}
          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div
                key="empty-state"
                variants={variants.slideUpVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={isLoadingHistory ? RESPONSIVE.SPACING.GAP.LG : ''}
              >
                {isLoadingHistory ? (
                  <ChatSkeleton className="px-4" animated={true} />
                ) : (
                  <Greeting />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages with stagger animation */}
          <motion.div variants={variants.staggerContainer} initial="hidden" animate="visible">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                variants={variants.slideUpVariants}
                layout
                style={{
                  willChange: 'transform, opacity',
                }}
              >
                <PreviewMessage
                  chatId={chatId}
                  message={message}
                  isLoading={status === 'streaming' && messages.length - 1 === index}
                  vote={votes ? votes.find(vote => vote.messageId === message.id) : undefined}
                  setMessages={setMessages}
                  reload={reload}
                  isReadonly={isReadonly}
                  requiresScrollPadding={hasSentMessage && index === messages.length - 1}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Thinking State */}
          <AnimatePresence>
            {status === 'submitted' &&
              messages.length > 0 &&
              messages[messages.length - 1].role === 'user' && (
                <motion.div
                  variants={variants.slideUpVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <ThinkingMessage />
                </motion.div>
              )}
          </AnimatePresence>

          {/* Loading More Messages */}
          <AnimatePresence>
            {status === 'streaming' && messages.length === 0 && (
              <motion.div
                variants={variants.slideUpVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="px-4"
              >
                <MessageSkeleton animated={true} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={messagesEndRef}
            className="min-h-[24px] min-w-[24px] shrink-0"
            onViewportLeave={onViewportLeave}
            onViewportEnter={onViewportEnter}
            variants={variants.fadeVariants}
            initial="hidden"
            animate="visible"
          />
        </motion.div>
      )}

      {/* Performance toggle for development */}
      {process.env.NODE_ENV === 'development' && messages.length > 30 && (
        <div className={`absolute bottom-2 left-2 z-[${Z_INDEX.POPOVER}] space-y-1`}>
          <button
            onClick={() => setEnableVirtualScroll(!enableVirtualScroll)}
            className="block rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          >
            Virtual Scroll: {enableVirtualScroll ? 'ON' : 'OFF'}
          </button>
          {prototypeMode && (
            <div className="rounded bg-orange-500/80 px-2 py-1 text-xs text-white">PROTOTYPE</div>
          )}
        </div>
      )}
    </>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return false;
});
