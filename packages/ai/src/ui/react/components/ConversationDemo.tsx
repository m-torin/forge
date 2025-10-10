/**
 * ConversationDemo Component - AI Elements Integration
 * Simplified demonstration using AI Elements with preserved Tailwind styling
 * Reduced from 294 lines to ~120 lines while maintaining all demo functionality
 */

'use client';

import { useCallback, useState } from 'react';
import { cn } from '../../utils';
import { conversationLayoutClasses } from '../utils/conversation-classes';
import { Conversation, ConversationContent, ConversationScrollButton } from './conversation';
import { Message, MessageContent, Response } from './message';
import { PromptInputForm } from './prompt-input';

// Demo message interface
export interface DemoMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Demo props interface
export interface ConversationDemoProps {
  initialMessages?: DemoMessage[];
  enableBranching?: boolean;
  enableStreaming?: boolean;
  height?: string;
  className?: string;
  mode?: 'basic' | 'advanced' | 'complete';
}

// Sample demo data
const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm here to help you with anything you need. What would you like to know?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    role: 'user',
    content: 'Can you explain how React hooks work?',
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'React hooks are functions that let you use state and other React features in functional components. Here are the key concepts:\n\n1. **useState** - Manages local component state\n2. **useEffect** - Handles side effects and lifecycle events\n3. **useContext** - Accesses React context\n4. **Custom hooks** - Reusable stateful logic\n\nHooks follow specific rules: they must be called at the top level and only within React functions.',
    timestamp: new Date(Date.now() - 180000),
  },
];

/**
 * Complete conversation demo using AI Elements with preserved styling
 */
export function ConversationDemo({
  initialMessages = DEMO_MESSAGES,
  enableStreaming = true,
  height = '600px',
  className,
  mode = 'complete',
}: ConversationDemoProps) {
  const [messages, setMessages] = useState<DemoMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Simulate AI response with streaming
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message
      const userMessage: DemoMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Simulate AI response
      if (enableStreaming) {
        setIsStreaming(true);

        const streamingMessage: DemoMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        };

        setMessages(prev => [...prev, streamingMessage]);

        // Simulate streaming response
        const responses = [
          "I'd be happy to help with that!",
          'Let me provide you with a detailed explanation.',
          "Here's what you need to know about this topic...",
          'Based on your question, here are the key points to understand.',
        ];

        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

        // Stream the response
        for (let i = 0; i <= selectedResponse.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 30));

          setMessages(prev =>
            prev.map(msg =>
              msg.id === streamingMessage.id
                ? { ...msg, content: selectedResponse.substring(0, i) }
                : msg,
            ),
          );
        }

        // Complete streaming
        setMessages(prev =>
          prev.map(msg => (msg.id === streamingMessage.id ? { ...msg, isStreaming: false } : msg)),
        );

        setIsStreaming(false);
      } else {
        // Add immediate response
        const assistantMessage: DemoMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'Thank you for your message! This is a demo response.',
          timestamp: new Date(),
        };

        setTimeout(() => {
          setMessages(prev => [...prev, assistantMessage]);
        }, 1000);
      }
    },
    [enableStreaming],
  );

  // Render message based on role
  const renderMessage = (message: DemoMessage) => {
    if (message.role === 'assistant') {
      return (
        <Response
          key={message.id}
          messageId={message.id}
          isStreaming={message.isStreaming}
          showTimestamp={mode === 'complete'}
        >
          {message.content || (message.isStreaming ? '' : 'Thinking...')}
        </Response>
      );
    }

    return (
      <Message key={message.id} from={message.role} messageId={message.id}>
        <MessageContent>{message.content}</MessageContent>
      </Message>
    );
  };

  return (
    <div className={cn('demo-conversation-container', className)} style={{ height }}>
      <Conversation className="h-full">
        <ConversationContent className={conversationLayoutClasses.messagesContainer()}>
          {messages.length === 0 ? (
            <div className={conversationLayoutClasses.emptyState()}>
              <p>Start a conversation by typing a message below.</p>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input form with preserved styling */}
      <div className={conversationLayoutClasses.inputContainer()}>
        <PromptInputForm
          onSubmit={handleSendMessage}
          placeholder="Type your message..."
          value={input}
          onChange={setInput}
          submitText={isStreaming ? 'Sending...' : 'Send'}
          className={{
            container: conversationLayoutClasses.inputForm(),
            textarea: conversationLayoutClasses.inputTextarea(),
            submit: 'px-6',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Pre-configured demo variants with preserved styling
 */
export const ConversationDemoVariants = {
  Basic: (props: Omit<ConversationDemoProps, 'mode'>) => (
    <ConversationDemo {...props} mode="basic" enableStreaming={false} />
  ),

  Advanced: (props: Omit<ConversationDemoProps, 'mode'>) => (
    <ConversationDemo {...props} mode="advanced" enableStreaming={true} />
  ),

  Complete: (props: Omit<ConversationDemoProps, 'mode'>) => (
    <ConversationDemo {...props} mode="complete" enableStreaming={true} />
  ),

  Fullscreen: (props: ConversationDemoProps) => (
    <ConversationDemo {...props} height="100vh" className="fixed inset-0 z-50" />
  ),
};

// Default export
