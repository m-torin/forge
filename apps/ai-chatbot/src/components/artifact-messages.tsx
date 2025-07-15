import type { UIArtifact } from '#/components/artifact';
import { PreviewMessage, ThinkingMessage } from '#/components/message';
import { useMessages } from '#/hooks/chat/use-messages';
import type { Vote } from '#/lib/db/schema';
import type { ChatMessage } from '#/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';
import equal from 'fast-deep-equal';
import { motion } from 'framer-motion';
import { memo } from 'react';

/**
 * Props for ArtifactMessages component
 */
interface ArtifactMessagesProps {
  chatId: string;
  status: UseChatHelpers['status'];
  votes: Array<Vote> | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<any, any>['setMessages'];
  reload: () => Promise<string | null | undefined>;
  isReadonly: boolean;
  artifactStatus: UIArtifact['status'];
}

/**
 * Pure artifact messages component for rendering messages in artifact view
 * @param chatId - Current chat identifier
 * @param status - Chat status
 * @param votes - User votes on messages
 * @param messages - Array of chat messages
 * @param setMessages - Function to update messages
 * @param reload - Function to reload conversation
 * @param isReadonly - Whether messages are read-only
 */
function PureArtifactMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: ArtifactMessagesProps) {
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

  return (
    <div
      ref={messagesContainerRef}
      className="flex h-full flex-col items-center gap-4 overflow-y-scroll px-4 pt-20"
    >
      {messages.map((message, index) => (
        <PreviewMessage
          chatId={chatId}
          key={message.id}
          message={message}
          isLoading={status === 'streaming' && index === messages.length - 1}
          vote={votes ? votes.find(vote => vote.messageId === message.id) : undefined}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          requiresScrollPadding={hasSentMessage && index === messages.length - 1}
        />
      ))}

      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="min-h-[24px] min-w-[24px] shrink-0"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

/**
 * Comparison function for memoization optimization
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns Whether props are equal for memoization
 */
function areEqual(prevProps: ArtifactMessagesProps, nextProps: ArtifactMessagesProps) {
  if (prevProps.artifactStatus === 'streaming' && nextProps.artifactStatus === 'streaming')
    return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
}

/**
 * Memoized artifact messages component with streaming optimization
 */
export const ArtifactMessages = memo(PureArtifactMessages, areEqual);
