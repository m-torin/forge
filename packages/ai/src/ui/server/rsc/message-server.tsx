/**
 * Message Server Components - AI Elements Integration (RSC)
 * Server-optimized message components for static rendering
 */

import React from 'react';
import { cn, formatNumber } from '../../utils';

// Message role types
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Server message interface
export interface MessageServerProps extends React.HTMLAttributes<HTMLDivElement> {
  from: MessageRole;
  content: string;
  timestamp?: string | Date;
  showAvatar?: boolean;
  showRole?: boolean;
  showTimestamp?: boolean;
  metadata?: {
    tokens?: number;
    model?: string;
    duration?: number;
  };
}

// Message avatar server interface
export interface MessageAvatarServerProps {
  role: MessageRole;
  src?: string;
  className?: string;
}

/**
 * Server-rendered message avatar
 */
export function MessageAvatarServer({ role, src, className }: MessageAvatarServerProps) {
  const defaultFallback = {
    user: 'U',
    assistant: 'AI',
    system: 'S',
    tool: 'T',
  }[role];

  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-medium',
        role === 'user' && 'bg-muted text-muted-foreground',
        role === 'assistant' && 'bg-primary text-primary-foreground',
        role === 'system' && 'bg-secondary text-secondary-foreground',
        role === 'tool' && 'bg-accent text-accent-foreground',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={`${role} avatar`} className="h-full w-full rounded-full object-cover" />
      ) : (
        defaultFallback
      )}
    </div>
  );
}

/**
 * Server-optimized message component
 */
export function MessageServer({
  from,
  content,
  timestamp,
  showAvatar = true,
  showRole = true,
  showTimestamp = false,
  metadata,
  className,
  ...props
}: MessageServerProps) {
  const roleLabels = {
    user: 'You',
    assistant: 'Assistant',
    system: 'System',
    tool: 'Tool',
  };

  const displayTimestamp = timestamp
    ? typeof timestamp === 'string'
      ? timestamp
      : timestamp.toLocaleTimeString()
    : null;

  return (
    <div
      className={cn(
        'border-border flex gap-3 border-b p-4 last:border-b-0',
        from === 'user' && 'is-user flex-row-reverse',
        from === 'assistant' && 'is-assistant',
        from === 'system' && 'is-system opacity-75',
        from === 'tool' && 'is-tool bg-muted/50',
        className,
      )}
      data-role={from}
      {...props}
    >
      {showAvatar && <MessageAvatarServer role={from} />}

      <div className="min-w-0 flex-1">
        {(showRole || showTimestamp) && (
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
            {showRole && <span className="font-medium">{roleLabels[from]}</span>}
            {showTimestamp && displayTimestamp && <span>{displayTimestamp}</span>}
          </div>
        )}

        <div
          className={cn(
            'text-foreground whitespace-pre-wrap text-sm leading-relaxed',
            from === 'user' &&
              'bg-primary text-primary-foreground ml-auto max-w-[80%] rounded-lg px-4 py-3',
          )}
        >
          {content}
        </div>

        {metadata && (
          <div className="text-muted-foreground mt-2 space-x-4 text-xs">
            {metadata.tokens && <span>{formatNumber(metadata.tokens)} tokens</span>}
            {metadata.model && <span>{metadata.model}</span>}
            {metadata.duration && <span>{metadata.duration}ms</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Batch message renderer for server
 */
export interface MessageListServerProps {
  messages: Array<{
    id?: string;
    role: MessageRole;
    content: string;
    timestamp?: string | Date;
    metadata?: {
      tokens?: number;
      model?: string;
      duration?: number;
    };
  }>;
  showAvatars?: boolean;
  showRoles?: boolean;
  showTimestamps?: boolean;
  className?: string;
}

export function MessageListServer({
  messages,
  showAvatars = true,
  showRoles = true,
  showTimestamps = false,
  className,
}: MessageListServerProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className={cn('text-muted-foreground p-8 text-center', className)}>No messages yet</div>
    );
  }

  return (
    <div className={cn('divide-border divide-y', className)}>
      {messages.map((message, index) => (
        <MessageServer
          key={message.id || index}
          from={message.role}
          content={message.content}
          timestamp={message.timestamp}
          metadata={message.metadata}
          showAvatar={showAvatars}
          showRole={showRoles}
          showTimestamp={showTimestamps}
        />
      ))}
    </div>
  );
}

/**
 * Pre-configured server message variants
 */
export const MessageServerVariants = {
  /**
   * Basic message with avatar
   */
  WithAvatar: (props: MessageServerProps) => <MessageServer {...props} showAvatar={true} />,

  /**
   * Minimal message without avatar
   */
  Minimal: (props: MessageServerProps) => (
    <MessageServer
      {...props}
      showAvatar={false}
      showRole={false}
      className={cn(props.className, 'p-2')}
    />
  ),

  /**
   * Message with full metadata
   */
  WithMetadata: (props: MessageServerProps) => (
    <MessageServer {...props} showRole={true} showTimestamp={true} />
  ),

  /**
   * Bubble-style message
   */
  Bubble: (props: MessageServerProps) => (
    <MessageServer
      {...props}
      showAvatar={false}
      showRole={false}
      className={cn(
        props.className,
        'border-0 p-2',
        props.from === 'user' ? 'justify-end' : 'justify-start',
      )}
    />
  ),
};

// Default export
