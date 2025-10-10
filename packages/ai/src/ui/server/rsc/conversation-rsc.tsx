/**
 * Conversation RSC Components - AI Elements Integration (Server)
 * Server-optimized conversation containers for static rendering
 */

import React from 'react';
import { cn } from '../../utils';
import { MessageListServer, type MessageListServerProps } from './message-server';

// Conversation RSC interface
export interface ConversationRSCProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

// Conversation content RSC interface
export interface ConversationContentRSCProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// Conversation layout interface
export interface ConversationLayoutProps {
  messages?: MessageListServerProps['messages'];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  messageProps?: Omit<MessageListServerProps, 'messages'>;
  className?: {
    container?: string;
    header?: string;
    content?: string;
  };
  emptyState?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Server-rendered conversation container
 */
export function ConversationRSC({
  children,
  title,
  subtitle,
  showHeader = false,
  className,
  ...props
}: ConversationRSCProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col',
        'bg-background border-border overflow-hidden rounded-lg border',
        className,
      )}
      {...props}
    >
      {showHeader && (title || subtitle) && (
        <div className="border-border bg-muted/50 border-b p-4">
          {title && <h3 className="text-foreground font-semibold">{title}</h3>}
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Server-rendered conversation content
 */
export function ConversationContentRSC({
  className,
  children,
  ...props
}: ConversationContentRSCProps) {
  return (
    <div className={cn('flex-1 overflow-auto', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Complete server-rendered conversation layout
 */
export function ConversationLayout({
  messages,
  title,
  subtitle,
  showHeader = false,
  messageProps,
  className = {},
  emptyState,
  footer,
}: ConversationLayoutProps) {
  return (
    <ConversationRSC
      title={title}
      subtitle={subtitle}
      showHeader={showHeader}
      className={className.container}
    >
      <ConversationContentRSC className={className.content}>
        {messages ? (
          <MessageListServer messages={messages} {...messageProps} />
        ) : emptyState ? (
          emptyState
        ) : (
          <div className="text-muted-foreground p-8 text-center">No conversation yet</div>
        )}
      </ConversationContentRSC>

      {footer && <div className="border-border bg-muted/50 border-t p-4">{footer}</div>}
    </ConversationRSC>
  );
}

/**
 * Server-rendered conversation with static messages
 */
export interface StaticConversationProps extends ConversationLayoutProps {
  messages: MessageListServerProps['messages'];
}

export function StaticConversation({ messages, ...props }: StaticConversationProps) {
  return <ConversationLayout {...props} messages={messages} />;
}

/**
 * Empty conversation state
 */
export interface EmptyConversationProps extends Omit<ConversationLayoutProps, 'messages'> {
  message?: string;
  action?: React.ReactNode;
}

export function EmptyConversation({
  message = 'Start a conversation',
  action,
  ...props
}: EmptyConversationProps) {
  return (
    <ConversationLayout
      {...props}
      emptyState={
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-sm space-y-4 text-center">
            <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <svg
                className="text-muted-foreground h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-muted-foreground">{message}</p>
              {action && <div className="mt-4">{action}</div>}
            </div>
          </div>
        </div>
      }
    />
  );
}

/**
 * Pre-configured conversation RSC variants
 */
export const ConversationRSCVariants = {
  /**
   * Basic static conversation
   */
  Basic: (props: StaticConversationProps) => <StaticConversation {...props} />,

  /**
   * Conversation with header
   */
  WithHeader: (props: StaticConversationProps) => (
    <StaticConversation {...props} showHeader={true} title={props.title || 'Conversation'} />
  ),

  /**
   * Minimal conversation without borders
   */
  Minimal: (props: StaticConversationProps) => (
    <StaticConversation
      {...props}
      className={{
        container: cn(props.className?.container, 'border-0 bg-transparent'),
        ...props.className,
      }}
    />
  ),

  /**
   * Compact conversation for smaller spaces
   */
  Compact: (props: StaticConversationProps) => (
    <StaticConversation
      {...props}
      className={{
        container: cn(props.className?.container, 'h-96 max-h-96'),
        ...props.className,
      }}
    />
  ),

  /**
   * Chat transcript format
   */
  Transcript: (props: StaticConversationProps) => (
    <StaticConversation
      {...props}
      messageProps={{
        showAvatars: false,
        showRoles: true,
        showTimestamps: true,
        ...props.messageProps,
      }}
      className={{
        container: cn(props.className?.container, 'bg-muted/20'),
        ...props.className,
      }}
    />
  ),
};

// Default export
