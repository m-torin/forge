import { ChatSkeleton, MessageSkeleton } from '#/components/contextual-loading';
import { useDataStream } from '#/components/data-stream-provider';
import { Greeting } from '#/components/greeting';
import { PreviewMessage, ThinkingMessage } from '#/components/message';
import { useMessages } from '#/hooks/chat/use-messages';
import type { Vote } from '#/lib/db/schema';
import type { ChatMessage } from '#/lib/types';
import equal from 'fast-deep-equal';
import { motion } from 'framer-motion';
import { memo } from 'react';

/**
 * Props for the Messages component
 */
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

/**
 * Pure messages component for rendering chat message list
 * @param chatId - Current chat identifier
 * @param status - Chat status
 * @param votes - User votes on messages
 * @param messages - Array of chat messages
 * @param setMessages - Function to update messages
 * @param reload - Function to reload conversation
 * @param isReadonly - Whether messages are read-only
 * @param isLoadingHistory - Whether chat history is loading
 */
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

  useDataStream();

  return (
    <div
      ref={messagesContainerRef}
      className="relative flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll pt-4"
    >
      {/* Empty State or Loading History */}
      {messages.length === 0 &&
        (isLoadingHistory ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <ChatSkeleton className="px-4" animated={true} />
          </motion.div>
        ) : (
          <Greeting />
        ))}

      {/* Messages */}
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === 'streaming' && messages.length - 1 === index}
          vote={votes ? votes.find(vote => vote.messageId === message.id) : undefined}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          requiresScrollPadding={hasSentMessage && index === messages.length - 1}
        />
      ))}

      {/* Thinking State */}
      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      {/* Loading More Messages */}
      {status === 'streaming' && messages.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4">
          <MessageSkeleton animated={true} />
        </motion.div>
      )}

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
 * Memoized messages component with artifact visibility optimization
 */
export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return false;
});
