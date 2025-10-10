/**
 * Message Components - AI Elements Integration
 * Simplified implementation using AI Elements with preserved Tailwind styling
 * Reduced from 300+ lines to ~80 lines while maintaining all functionality
 */

'use client';

import React, { memo } from 'react';
import { cn, formatTimestamp } from '../../utils';
import { messageClasses, responseClasses, type MessageRole } from '../utils/message-classes';

// Import AI Elements base components
import {
  Message as AIMessage,
  MessageAvatar as AIMessageAvatar,
  MessageContent as AIMessageContent,
  type MessageAvatarProps as AIMessageAvatarProps,
  type MessageContentProps as AIMessageContentProps,
  type MessageProps as AIMessageProps,
} from '../ai-elements/message';

import { Response as AIResponse } from '../ai-elements/response';
import { useMessageActions } from '../lib';

// Simplified props interfaces
export interface MessageProps extends Omit<AIMessageProps, 'className'> {
  className?: string;
  messageId?: string;
}

export interface MessageContentProps extends AIMessageContentProps {}

export interface MessageAvatarProps extends Omit<AIMessageAvatarProps, 'src'> {
  role?: MessageRole;
  src?: string;
  alt?: string;
  fallback?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
}

export interface ResponseProps {
  children: React.ReactNode;
  messageId?: string;
  isStreaming?: boolean;
  showTimestamp?: boolean;
  avatarSrc?: string;
  assistantName?: string;
  className?: string;
}

/**
 * Main message container with preserved role-based Tailwind styling
 */
export function Message({ from, messageId, className, ...props }: MessageProps) {
  return (
    <AIMessage
      from={from}
      className={messageClasses.container(from, className)}
      data-role={from}
      data-message-id={messageId}
      {...props}
    />
  );
}

/**
 * Message content container with preserved user/assistant styling
 */
export const MessageContent = memo<MessageContentProps>(function MessageContent({
  className,
  ...props
}) {
  return <AIMessageContent className={messageClasses.content(className)} {...props} />;
});

/**
 * Message avatar with preserved role-based styling and fallbacks
 */
export const MessageAvatar = memo<MessageAvatarProps>(function MessageAvatar({
  role,
  src,
  alt,
  fallback,
  loading = 'lazy',
  decoding = 'async',
  className,
  ...props
}) {
  // Default fallbacks based on role
  const defaultFallback = {
    user: 'U',
    assistant: 'AI',
    system: 'S',
    tool: 'T',
  }[role || 'assistant'];

  const displayFallback = fallback || defaultFallback;
  const displayAlt = alt || `${role} avatar`;

  // Filter out ref to avoid type conflicts
  const { ref, ...divProps } = props as any;

  if (src) {
    return (
      <AIMessageAvatar
        src={src}
        name={displayAlt}
        className={messageClasses.avatar(role, className)}
        {...props}
      />
    );
  }

  // Fallback avatar
  return (
    <div className={messageClasses.avatar(role, className)} {...divProps}>
      {displayFallback}
    </div>
  );
});

/**
 * Response component for AI assistant messages with streaming support
 */
export function Response({
  children,
  messageId,
  isStreaming = false,
  showTimestamp = false,
  avatarSrc,
  assistantName = 'Assistant',
  className,
  ...props
}: ResponseProps) {
  const { getMessageMetadata } = useMessageActions();
  const metadata = messageId ? getMessageMetadata(messageId) : null;

  return (
    <div className={responseClasses.container(className)} {...props}>
      <MessageAvatar role="assistant" src={avatarSrc} className={responseClasses.avatar()} />

      <div className={responseClasses.content()}>
        {showTimestamp && (
          <div className={responseClasses.header()}>
            <span className={responseClasses.assistantName()}>{assistantName}</span>
            {metadata?.timestamp && (
              <span className="text-muted-foreground text-xs">
                {formatTimestamp(metadata.timestamp)}
              </span>
            )}
          </div>
        )}

        <div className={responseClasses.body()}>
          <AIResponse>{typeof children === 'string' ? children : String(children)}</AIResponse>

          {isStreaming && (
            <div className={responseClasses.streamingContainer()}>
              <div className={responseClasses.streamingCursor()} aria-hidden="true" />
              <div className={responseClasses.liveRegion()} aria-live="polite" aria-atomic="true">
                AI is responding...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Pre-configured message variants with preserved Tailwind styling
 */
export const MessageVariants = {
  Basic: (props: MessageProps) => <Message {...props} />,
  Compact: (props: MessageProps) => (
    <Message {...props} className={cn(props.className, 'gap-2 p-2')} />
  ),
  Minimal: (props: MessageProps) => (
    <Message {...props} className={cn(props.className, 'border-b-0 p-2')} />
  ),
};

// Re-export message role type
export type { MessageRole };

// Default exports
