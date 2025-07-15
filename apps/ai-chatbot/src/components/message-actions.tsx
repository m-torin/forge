import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { APPLE_BREAKPOINTS, RESPONSIVE } from '#/lib/ui-constants';
import { useClipboard, useViewportSize } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import { useSWRConfig } from 'swr';

import type { Vote } from '#/lib/db/schema';

import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from '#/components/icons';
import { OutputProcessorTrigger } from '#/components/output-processor-display';
import { SpeechSynthesis } from '#/components/speech-synthesis';
import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/ui/tooltip';
import { mockDataStore } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import type { ChatMessage } from '#/lib/types';
import equal from 'fast-deep-equal';
import { BookmarkPlus, Download, Flag, MessageSquare, RefreshCw, Share2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Pure message actions component with voting, copying, and other features
 * @param chatId - Current chat identifier
 * @param message - Message data
 * @param vote - User vote on this message
 * @param isLoading - Whether message is loading
 */
export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  const { copy: copyToClipboard } = useClipboard();
  const { width: windowWidth } = useViewportSize();
  const { variants } = useAnimationSystem();
  const prototypeMode = isPrototypeMode();

  const isMobile = windowWidth < APPLE_BREAKPOINTS.IPAD_MINI;

  // Local state for prototype mode voting
  const [localVote, setLocalVote] = useState<Vote | undefined>(vote);

  // Use local vote in prototype mode, otherwise use prop
  const currentVote = prototypeMode ? localVote : vote;

  // Mock voting handlers
  const handleMockVote = async (type: 'up' | 'down') => {
    const newVote: Vote = {
      chatId,
      messageId: message.id,
      isUpvoted: type === 'up',
    };

    setLocalVote(newVote);
    mockDataStore.addVote(newVote);

    toast.success(`${type === 'up' ? 'Upvoted' : 'Downvoted'} Response!`);
  };

  // Additional action handlers for prototype mode
  const handleRetry = () => {
    if (prototypeMode) {
      toast.success('Regenerating response...');
      // In prototype mode, just show feedback
      return;
    }
    // Real implementation would trigger message regeneration
  };

  const handleShare = async () => {
    if (prototypeMode) {
      const textFromParts = message.parts
        ?.filter(part => part.type === 'text')
        .map(part => part.text)
        .join('\n')
        .trim();

      if (navigator.share) {
        await navigator.share({
          title: 'AI Response',
          text: textFromParts,
        });
      } else {
        await copyToClipboard(window.location.href);
        toast.success('Share link copied to clipboard!');
      }
      return;
    }
    // Real implementation would generate shareable link
  };

  const handleBookmark = () => {
    if (prototypeMode) {
      toast.success('Response bookmarked!');
      return;
    }
    // Real implementation would save to bookmarks
  };

  const handleReport = () => {
    if (prototypeMode) {
      toast.success('Response reported for review');
      return;
    }
    // Real implementation would show report modal
  };

  const handleContinue = () => {
    if (prototypeMode) {
      toast.success('Continue conversation...');
      return;
    }
    // Real implementation would prompt AI to continue
  };

  const _handleEdit = () => {
    if (prototypeMode) {
      toast.success('Edit mode activated');
      return;
    }
    // Real implementation would enable message editing
  };

  const handleExport = () => {
    if (prototypeMode) {
      const textFromParts = message.parts
        ?.filter(part => part.type === 'text')
        .map(part => part.text)
        .join('\n')
        .trim();

      const blob = new Blob([textFromParts || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-response-${message.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    // Real implementation would show export options
  };

  if (isLoading) return null;
  if (message.role === 'user') return null;

  return (
    <TooltipProvider delayDuration={isMobile ? 300 : 0}>
      <motion.div
        variants={variants.staggerContainerFast}
        initial="hidden"
        animate="visible"
        className={`flex flex-row ${
          isMobile
            ? 'gap-2 opacity-100' // Always visible on mobile
            : 'gap-1 opacity-0 group-hover/message:opacity-100' // Hidden until hover on desktop
        }`}
      >
        {/* Primary Actions */}
        <motion.div variants={variants.slideUpVariants}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                variants={variants.hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  className={`text-muted-foreground hover:text-foreground ${
                    isMobile ? 'h-11 min-h-[44px] px-3 py-2' : 'h-fit px-2 py-1'
                  } ${RESPONSIVE.TOUCH_TARGET.SMALL}`}
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const textFromParts = message.parts
                      ?.filter(part => part.type === 'text')
                      .map(part => part.text)
                      .join('\n')
                      .trim();

                    if (!textFromParts) {
                      toast.error("There's no text to copy!");
                      return;
                    }

                    await copyToClipboard(textFromParts);
                    toast.success('Copied to clipboard!');
                  }}
                >
                  <CopyIcon size={14} />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Copy response</TooltipContent>
          </Tooltip>
        </motion.div>

        {/* Speech Synthesis */}
        <motion.div variants={variants.slideUpVariants}>
          <SpeechSynthesis
            text={
              message.parts
                ?.filter(part => part.type === 'text')
                .map(part => part.text)
                .join('\n')
                .trim() || ''
            }
            variant="ghost"
            size={isMobile ? 'default' : 'sm'}
            className={`text-muted-foreground hover:text-foreground ${
              isMobile ? 'h-11 min-h-[44px] px-3 py-2' : 'h-fit px-2 py-1'
            } ${RESPONSIVE.TOUCH_TARGET.SMALL}`}
          />
        </motion.div>

        <motion.div variants={variants.slideUpVariants}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                variants={variants.hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  className={`text-muted-foreground hover:text-foreground ${
                    isMobile ? 'h-11 min-h-[44px] px-3 py-2' : 'h-fit px-2 py-1'
                  } ${RESPONSIVE.TOUCH_TARGET.SMALL}`}
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                >
                  <RefreshCw size={14} />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Regenerate response</TooltipContent>
          </Tooltip>
        </motion.div>

        <motion.div variants={variants.slideUpVariants}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                variants={variants.hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap={currentVote?.isUpvoted ? 'rest' : 'tap'}
                animate={currentVote?.isUpvoted ? 'hover' : 'rest'}
              >
                <Button
                  data-testid="message-upvote"
                  className={`h-fit px-2 py-1 transition-colors ${
                    currentVote?.isUpvoted
                      ? 'text-green-500 hover:text-green-600'
                      : 'text-muted-foreground hover:text-green-500'
                  }`}
                  disabled={currentVote?.isUpvoted}
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (prototypeMode) {
                      await handleMockVote('up');
                      return;
                    }

                    const upvote = fetch('/api/vote', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        chatId,
                        messageId: message.id,
                        type: 'up',
                      }),
                    });

                    toast.promise(upvote, {
                      loading: 'Upvoting Response...',
                      success: () => {
                        mutate<Array<Vote>>(
                          `/api/vote?chatId=${chatId}`,
                          currentVotes => {
                            if (!currentVotes) return [];

                            const votesWithoutCurrent = currentVotes.filter(
                              vote => vote.messageId !== message.id,
                            );

                            return [
                              ...votesWithoutCurrent,
                              {
                                chatId,
                                messageId: message.id,
                                isUpvoted: true,
                              },
                            ];
                          },
                          { revalidate: false },
                        );

                        return 'Upvoted Response!';
                      },
                      error: 'Failed to upvote response.',
                    });
                  }}
                >
                  <motion.div
                    animate={currentVote?.isUpvoted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ThumbUpIcon size={14} />
                  </motion.div>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Upvote response</TooltipContent>
          </Tooltip>
        </motion.div>

        <motion.div variants={variants.slideUpVariants}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                variants={variants.hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap={currentVote && !currentVote.isUpvoted ? 'rest' : 'tap'}
                animate={currentVote && !currentVote.isUpvoted ? 'hover' : 'rest'}
              >
                <Button
                  data-testid="message-downvote"
                  className={`h-fit px-2 py-1 transition-colors ${
                    currentVote && !currentVote.isUpvoted
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-muted-foreground hover:text-red-500'
                  }`}
                  variant="ghost"
                  size="sm"
                  disabled={currentVote && !currentVote.isUpvoted}
                  onClick={async () => {
                    if (prototypeMode) {
                      await handleMockVote('down');
                      return;
                    }

                    const downvote = fetch('/api/vote', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        chatId,
                        messageId: message.id,
                        type: 'down',
                      }),
                    });

                    toast.promise(downvote, {
                      loading: 'Downvoting Response...',
                      success: () => {
                        mutate<Array<Vote>>(
                          `/api/vote?chatId=${chatId}`,
                          currentVotes => {
                            if (!currentVotes) return [];

                            const votesWithoutCurrent = currentVotes.filter(
                              vote => vote.messageId !== message.id,
                            );

                            return [
                              ...votesWithoutCurrent,
                              {
                                chatId,
                                messageId: message.id,
                                isUpvoted: false,
                              },
                            ];
                          },
                          { revalidate: false },
                        );

                        return 'Downvoted Response!';
                      },
                      error: 'Failed to downvote response.',
                    });
                  }}
                >
                  <motion.div
                    animate={
                      currentVote && !currentVote.isUpvoted ? { scale: [1, 1.2, 1] } : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <ThumbDownIcon size={14} />
                  </motion.div>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Downvote response</TooltipContent>
          </Tooltip>
        </motion.div>

        {/* Secondary Actions */}
        <AnimatePresence>
          {prototypeMode && (
            <>
              <motion.div
                variants={variants.scaleVariants}
                initial="hidden"
                animate="visible"
                className="mx-1 w-px bg-border"
              />

              <motion.div variants={variants.slideUpVariants}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={variants.hoverVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        className="h-fit px-2 py-1 text-muted-foreground hover:text-foreground"
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                      >
                        <Share2 size={14} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Share response</TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div variants={variants.slideUpVariants}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={variants.hoverVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        className="h-fit px-2 py-1 text-muted-foreground hover:text-foreground"
                        variant="ghost"
                        size="sm"
                        onClick={handleBookmark}
                      >
                        <BookmarkPlus size={14} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Bookmark response</TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div variants={variants.slideUpVariants}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={variants.hoverVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        className="h-fit px-2 py-1 text-muted-foreground hover:text-foreground"
                        variant="ghost"
                        size="sm"
                        onClick={handleContinue}
                      >
                        <MessageSquare size={14} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Continue conversation</TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div variants={variants.slideUpVariants}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={variants.hoverVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        className="h-fit px-2 py-1 text-muted-foreground hover:text-foreground"
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                      >
                        <Download size={14} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Export response</TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div variants={variants.slideUpVariants}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={variants.hoverVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        className="h-fit px-2 py-1 text-muted-foreground hover:text-orange-500"
                        variant="ghost"
                        size="sm"
                        onClick={handleReport}
                      >
                        <Flag size={14} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Report response</TooltipContent>
                </Tooltip>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Output Processors - Only show for AI responses in prototype mode */}
      {prototypeMode && message.role === 'assistant' && (
        <div className="mt-3 border-t pt-3">
          <OutputProcessorTrigger
            text={
              message.parts
                ?.filter(part => part.type === 'text')
                .map(part => part.text)
                .join('\n')
                .trim() || ''
            }
            processors={['sentiment-analysis', 'entity-extraction', 'text-summarization']}
          />
        </div>
      )}
    </TooltipProvider>
  );
}

export const MessageActions = memo(PureMessageActions, (prevProps, nextProps) => {
  if (!equal(prevProps.vote, nextProps.vote)) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.chatId !== nextProps.chatId) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.message.role !== nextProps.message.role) return false;
  // Compare message content length as a quick check
  if (prevProps.message.parts?.length !== nextProps.message.parts?.length) return false;

  return true;
});
