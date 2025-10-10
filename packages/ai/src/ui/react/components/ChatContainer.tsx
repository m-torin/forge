/**
 * ChatContainer Component
 * A complete chat interface that eliminates ALL the repetitive patterns from docs
 */

'use client';

import type { UIMessage, UseChatHelpers } from '@ai-sdk/react';
import React from 'react';
import { cn } from '../../utils';
import { ChatForm, type ChatFormProps } from './ChatForm';
import { MessageList, type MessageListProps } from './MessageList';
import { StatusIndicator, type StatusIndicatorProps } from './StatusIndicator';

export interface ChatContainerProps {
  /** The useChat hook result */
  chat: UseChatHelpers<UIMessage>;
  /** Message list configuration */
  messageList?: Partial<MessageListProps>;
  /** Chat form configuration */
  chatForm?: Partial<Omit<ChatFormProps, 'chat'>>;
  /** Status indicator configuration */
  statusIndicator?: Partial<Omit<StatusIndicatorProps, 'chat'>>;
  /** Container CSS classes */
  className?: {
    container?: string;
    header?: string;
    messages?: string;
    messagesArea?: string;
    status?: string;
    statusArea?: string;
    form?: string;
    formArea?: string;
    footer?: string;
  };
  /** Layout configuration */
  layout?: {
    showHeader?: boolean;
    showFooter?: boolean;
    headerContent?: React.ReactNode;
    footerContent?: React.ReactNode;
  };
  /** Custom empty state for messages */
  emptyState?: React.ReactNode;
}

/**
 * Complete chat interface that replaces the entire pattern from docs:
 * ```
 * // BEFORE: 50+ lines of repetitive code
 * const { messages, sendMessage, status, stop, error, regenerate } = useChat();
 * const [input, setInput] = useState('');
 *
 * return (
 *   <>
 *     {messages.map(message => (...))}
 *     {status === 'streaming' && <button onClick={stop}>Stop</button>}
 *     {error && <button onClick={regenerate}>Retry</button>}
 *     <form onSubmit={...}>...</form>
 *   </>
 * );
 *
 * // AFTER: 3 lines
 * const chat = useChat();
 * return <ChatContainer chat={chat} />;
 * ```
 */
export function ChatContainer({
  chat,
  messageList = {},
  chatForm = {},
  statusIndicator = {},
  className = {},
  layout = {},
  emptyState,
}: ChatContainerProps) {
  const { showHeader = false, showFooter = false, headerContent, footerContent } = layout;

  return (
    <div className={cn('flex h-full flex-col', className.container)} data-testid="chat-container">
      {/* Optional Header */}
      {showHeader && (
        <div className={cn('mb-4', className.header)} data-testid="chat-header">
          {headerContent || <h3 className="m-0 mb-4">Chat</h3>}
        </div>
      )}

      {/* Messages Area */}
      <div
        className={cn('mb-4 flex-1 overflow-y-auto', className.messagesArea)}
        data-testid="messages-area"
      >
        <MessageList
          messages={chat.messages}
          emptyState={emptyState}
          className={className.messages}
          {...messageList}
        />
      </div>

      {/* Status Indicator */}
      <div className={cn(className.statusArea)} data-testid="status-area">
        <StatusIndicator
          chat={chat}
          className={className.status ? { container: className.status } : {}}
          {...statusIndicator}
        />
      </div>

      {/* Chat Form */}
      <div className={cn(className.formArea)} data-testid="form-area">
        <ChatForm
          chat={chat}
          className={className.form ? { form: className.form } : {}}
          {...chatForm}
        />
      </div>

      {/* Optional Footer */}
      {showFooter && (
        <div className={cn('mt-4', className.footer)} data-testid="chat-footer">
          {footerContent}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured ChatContainer variants for common use cases
 */
export const ChatContainerVariants = {
  /**
   * Basic variant - exactly like the documentation examples
   */
  Basic: (props: Omit<ChatContainerProps, 'messageList' | 'statusIndicator' | 'chatForm'>) => (
    <ChatContainer
      {...props}
      messageList={{
        options: {
          showRole: true,
          rolePrefix: { user: 'User: ', assistant: 'AI: ' },
        },
      }}
      statusIndicator={{
        showSpinner: true,
        showStopButton: true,
      }}
      chatForm={{
        placeholder: 'Say something...',
        submitText: 'Submit',
      }}
    />
  ),

  /**
   * With metadata - shows timestamps and token counts
   */
  WithMetadata: (props: ChatContainerProps) => (
    <ChatContainer
      {...props}
      messageList={{
        options: {
          showRole: true,
          showMetadata: true,
          showTimestamp: true,
          showTokenCount: true,
        },
      }}
    />
  ),

  /**
   * With file support - enables file attachments
   */
  WithFiles: (props: ChatContainerProps) => (
    <ChatContainer
      {...props}
      chatForm={{
        enableFiles: true,
        placeholder: 'Type a message or attach files...',
        ...props.chatForm,
      }}
    />
  ),

  /**
   * Minimal variant - clean, minimal design
   */
  Minimal: (props: ChatContainerProps) => (
    <ChatContainer
      {...props}
      messageList={{
        options: { showRole: false },
      }}
      statusIndicator={{
        showSpinner: false,
        statusMessages: {
          submitted: 'Thinking...',
          streaming: 'Typing...',
          error: 'Error',
        },
      }}
      chatForm={{
        submitText: 'Send',
        placeholder: 'Message...',
      }}
    />
  ),

  /**
   * Debug variant - shows all metadata and detailed status
   */
  Debug: (props: ChatContainerProps) => (
    <ChatContainer
      {...props}
      layout={{
        showHeader: true,
        headerContent: <div>Debug Chat (Status: {props.chat.status})</div>,
      }}
      messageList={{
        options: {
          showRole: true,
          showMetadata: true,
          showTimestamp: true,
          showTokenCount: true,
        },
      }}
      statusIndicator={{
        statusMessages: {
          submitted: 'Processing your message...',
          streaming: 'AI is responding...',
          error: 'An error occurred. Please try again.',
        },
      }}
    />
  ),
};

/**
 * Hook for building custom chat layouts with the standardized components
 */
export function useChatComponents(chat: UseChatHelpers<UIMessage>) {
  return {
    MessageList: (props?: Partial<MessageListProps>) => (
      <MessageList messages={chat.messages} {...props} />
    ),
    ChatForm: (props?: Partial<Omit<ChatFormProps, 'chat'>>) => <ChatForm chat={chat} {...props} />,
    StatusIndicator: (props?: Partial<Omit<StatusIndicatorProps, 'chat'>>) => (
      <StatusIndicator chat={chat} {...props} />
    ),
    // Access to the individual message patterns
    messages: chat.messages,
    status: chat.status,
    error: chat.error,
  };
}

// Default export for convenience
