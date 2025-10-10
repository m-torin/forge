/**
 * MessageList Component
 * Eliminates the repeated messages.map() pattern from documentation examples
 */

'use client';

import type { UIMessage } from 'ai';
import React from 'react';
import { cn } from '../../utils';
import { messageFormatter, type MessageRenderOptions } from '../messages/formatter';

export interface MessageListProps {
  messages: UIMessage[];
  options?: MessageRenderOptions;
  className?:
    | {
        container?: string;
        message?: string;
        emptyState?: string;
      }
    | string;
  emptyState?: React.ReactNode;
  customMessageRenderer?: (message: UIMessage, index: number) => React.ReactNode;
}

/**
 * Renders a list of messages using the standardized messageFormatter
 * This eliminates the need for the repetitive pattern:
 * ```
 * {messages.map(message => (
 *   <div key={message.id}>
 *     {message.role === 'user' ? 'User: ' : 'AI: '}
 *     {message.parts.map((part, index) => ...)}
 *   </div>
 * ))}
 * ```
 */
export function MessageList({
  messages,
  options,
  className,
  emptyState,
  customMessageRenderer,
}: MessageListProps) {
  // Handle both string and object className patterns
  const classNames = typeof className === 'string' ? { container: className } : className || {};

  // Handle empty state
  if (!messages || messages.length === 0) {
    return (
      <div
        className={cn('text-center text-gray-600', classNames.emptyState)}
        data-testid="message-list-empty"
      >
        {emptyState || <p>No messages yet</p>}
      </div>
    );
  }

  return (
    <div className={cn(classNames.container)} data-testid="message-list">
      {messages.map((message, index) => {
        // Use custom renderer if provided
        if (customMessageRenderer) {
          return customMessageRenderer(message, index);
        }

        // Use standardized messageFormatter with message className
        return messageFormatter.renderMessage(message, {
          ...options,
          className: {
            ...options?.className,
            container: cn(options?.className?.container, classNames.message),
          },
        });
      })}
    </div>
  );
}

/**
 * Pre-configured MessageList variants for common use cases
 */
export const MessageListVariants = {
  /**
   * Basic variant - matches the documentation examples exactly
   */
  Basic: (props: Omit<MessageListProps, 'options'>) => (
    <MessageList
      {...props}
      options={{
        showRole: true,
        rolePrefix: { user: 'User: ', assistant: 'AI: ' },
      }}
    />
  ),

  /**
   * With metadata - shows timestamps, token counts, etc.
   */
  WithMetadata: (props: Omit<MessageListProps, 'options'>) => (
    <MessageList
      {...props}
      options={{
        showRole: true,
        showMetadata: true,
        showTimestamp: true,
        showTokenCount: true,
      }}
    />
  ),

  /**
   * Minimal variant - no role prefixes, clean design
   */
  Minimal: (props: Omit<MessageListProps, 'options'>) => (
    <MessageList {...props} options={{ showRole: false }} />
  ),

  /**
   * Debug variant - shows all metadata for development
   */
  Debug: (props: Omit<MessageListProps, 'options'>) => (
    <MessageList
      {...props}
      options={{
        showRole: true,
        showMetadata: true,
        showTimestamp: true,
        showTokenCount: true,
        className: {
          container: 'debug-message',
          metadata: 'debug-metadata',
        },
      }}
      className={
        typeof props.className === 'string'
          ? { container: props.className, message: 'debug-message-item' }
          : { ...props.className, message: cn(props.className?.message, 'debug-message-item') }
      }
    />
  ),
};

// Default export for convenience
