/**
 * AI SDK Integration Example
 * Complete working example showing how to integrate AI Elements components with AI SDK
 */

'use client';

import { useChat } from '@ai-sdk/react';
import { useCallback, useState } from 'react';
import { cn } from '../../utils';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  Message,
  MessageAvatar,
  MessageContent,
  PromptInputTextarea,
  Response,
} from '../components';
import { conversationLayoutClasses } from '../utils/conversation-classes';

// Example props interface
export interface AiSdkIntegrationExampleProps {
  /** API endpoint for chat completion */
  apiEndpoint?: string;
  /** Custom headers for the request */
  headers?: Record<string, string>;
  /** Initial messages */
  initialMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  /** Enable file uploads */
  enableFiles?: boolean;
  /** Custom styling */
  className?: string;
  /** Height of the chat container */
  height?: string;
}

/**
 * Complete AI SDK integration example with all features
 */
function AiSdkIntegrationExample({
  apiEndpoint = '/api/chat',
  headers,
  initialMessages,
  enableFiles = false,
  className,
  height = '600px',
}: AiSdkIntegrationExampleProps) {
  // AI SDK v5 doesn't manage input state internally, so we need local state
  const [input, setInput] = useState('');

  // Use the AI SDK useChat hook
  const chat = useChat({
    onError: error => {
      console.error('[AiSdkIntegration] Chat error:', error);
    },
  });

  // Handle form submission with proper types
  const handleChatSubmit = useCallback(
    (value: string) => {
      const isLoading = chat.status === 'submitted' || chat.status === 'streaming';
      if (!value.trim() || isLoading) return;

      // AI SDK v5: Use sendMessage method only
      (chat as any).sendMessage({
        text: value.trim(),
      });

      // Clear the local input state
      setInput('');
    },
    [chat],
  );

  // Render message based on role
  const renderMessage = useCallback(
    (message: any, index: number) => {
      const messageId = `msg-${message.id || index}`;
      const isStreaming =
        (chat.status === 'submitted' || chat.status === 'streaming') &&
        index === chat.messages.length - 1;

      // AI SDK v5: Extract text content from parts format
      const textContent =
        message.parts?.map((part: any) => (part.type === 'text' ? part.text : '')).join('') || '';

      if (message.role === 'assistant') {
        return (
          <Response
            key={messageId}
            messageId={messageId}
            isStreaming={isStreaming}
            showTimestamp={true}
          >
            {textContent}
          </Response>
        );
      }

      return (
        <Message key={messageId} from={message.role} messageId={messageId}>
          <MessageAvatar role={message.role} />
          <MessageContent>{textContent}</MessageContent>
        </Message>
      );
    },
    [chat.status, chat.messages.length],
  );

  return (
    <div className={cn('ai-sdk-integration-example', className)} style={{ height }}>
      <Conversation className="h-full">
        <ConversationContent className={conversationLayoutClasses.messagesContainer()}>
          {chat.messages.length === 0 ? (
            <div className={conversationLayoutClasses.emptyState()}>
              <p>Start a conversation by typing a message below.</p>
            </div>
          ) : (
            chat.messages.map(renderMessage)
          )}

          {/* Error state */}
          {chat.error && (
            <div className="bg-destructive/10 border-destructive/20 m-4 rounded-lg border p-4">
              <div className="text-destructive mb-2 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Error</span>
              </div>
              <p className="text-muted-foreground mb-3 text-sm">
                {chat.error.message || 'Failed to send message'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // AI SDK v5: Use regenerate to retry last assistant response
                    chat.regenerate?.();
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1 text-xs"
                >
                  Retry
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded px-3 py-1 text-xs"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input form with preserved styling */}
      <div className={conversationLayoutClasses.inputContainer()}>
        <div className={conversationLayoutClasses.inputForm()}>
          <PromptInputTextarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={chat.status === 'submitted' || chat.status === 'streaming'}
            className={conversationLayoutClasses.inputTextarea()}
            rows={1}
          />
          {chat.status === 'submitted' || chat.status === 'streaming' ? (
            <button
              onClick={chat.stop}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => handleChatSubmit(input)}
              disabled={!input.trim()}
              className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Send
            </button>
          )}
        </div>

        {/* File upload (if enabled) */}
        {enableFiles && (
          <div className="mt-2">
            <input
              type="file"
              multiple
              className="text-muted-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1"
            />
          </div>
        )}

        {/* Status indicators */}
        <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {(chat.status === 'submitted' || chat.status === 'streaming') && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                <span className="ml-1">AI is thinking...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>
              {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pre-configured variants of the AI SDK integration
 */
export const AiSdkIntegrationVariants = {
  /**
   * Basic chat interface
   */
  Basic: (props: Omit<AiSdkIntegrationExampleProps, 'enableFiles'>) => (
    <AiSdkIntegrationExample {...props} enableFiles={false} />
  ),

  /**
   * With file upload support
   */
  WithFiles: (props: AiSdkIntegrationExampleProps) => (
    <AiSdkIntegrationExample {...props} enableFiles={true} />
  ),

  /**
   * Fullscreen chat interface
   */
  Fullscreen: (props: AiSdkIntegrationExampleProps) => (
    <AiSdkIntegrationExample
      {...props}
      height="100vh"
      className={cn(props.className, 'fixed inset-0 z-50')}
    />
  ),

  /**
   * Compact chat for smaller spaces
   */
  Compact: (props: AiSdkIntegrationExampleProps) => (
    <AiSdkIntegrationExample {...props} height="400px" />
  ),
};

// Default export
export default AiSdkIntegrationExample;
