'use client';

import {
  createMockMessage,
  createMockTypingMessage,
  generateMockId,
  generateMockRAGStreamResponse,
  generateMockStreamResponse,
  mockDataStore,
  shouldUseMockRAG,
} from '#/lib/mock-data';
import type { ChatMessage, CustomUIDataTypes, MessageMetadata } from '#/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useCounter, useInterval, useSetState, useToggle } from '@mantine/hooks';
import { logWarn } from '@repo/observability';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Mock chat helpers interface matching AI SDK v5 UseChatHelpers
 */
interface MockChatHelpers {
  messages: ChatMessage[];
  setMessages: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['setMessages'];
  append: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['append'];
  reload: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['reload'];
  stop: () => void;
  status: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['status'];
  error: Error | undefined;
  input: string;
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Configuration options for mock chat functionality
 */
interface MockChatOptions {
  id: string;
  initialMessages?: ChatMessage[];
  generateId?: () => string;
  onFinish?: () => void;
  onError?: (error: Error) => void;
  onData?: (data: any) => void;
}

/**
 * Mock implementation of useChat hook for testing and development
 * @param options - Mock chat configuration options
 * @returns Mock chat helpers matching AI SDK interface
 */
export function useMockChat({
  id: _id,
  initialMessages = [],
  generateId: _generateId = generateMockId,
  onFinish,
  onError,
  onData,
}: MockChatOptions): MockChatHelpers {
  const [state, setState] = useSetState({
    messages: initialMessages.length > 0 ? initialMessages : mockDataStore.getMessages(),
    status: 'ready' as UseChatHelpers<MessageMetadata, CustomUIDataTypes>['status'],
    error: undefined as Error | undefined,
    input: '',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

  // Mock streaming delay configuration
  const THINKING_DELAY = 1000; // Delay before starting response
  const CHUNK_DELAY = 100; // Delay between chunks

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingMessageIdRef.current) {
      // Complete the current streaming message
      setState(prev => ({
        messages: prev.messages.map(msg =>
          msg.id === streamingMessageIdRef.current
            ? {
                ...msg,
                parts: [
                  {
                    type: 'text',
                    text: (msg.parts[0]?.type === 'text' ? msg.parts[0].text : '') + ' [Stopped]',
                  },
                ],
              }
            : msg,
        ),
      }));
      streamingMessageIdRef.current = null;
    }
    setState({ status: 'ready' });
  }, [setState]);

  const append = useCallback(
    async (message: any) => {
      if (state.status === 'streaming') {
        logWarn('Cannot append message while streaming');
        return;
      }

      try {
        setState({ status: 'submitted', error: undefined });

        // Extract text from various message formats
        let messageText = '';
        if (message.parts && message.parts[0]) {
          messageText = message.parts[0].text || message.parts[0].content || '';
        } else if (typeof message.content === 'string') {
          messageText = message.content;
        } else if (message.content && message.content[0]) {
          messageText = message.content[0].text || '';
        } else {
          messageText = String(message);
        }

        // Create user message
        const userMessage = createMockMessage(message.role || 'user', messageText);

        // Add user message immediately
        setState(prev => ({ messages: [...prev.messages, userMessage] }));

        // Add to mock data store
        mockDataStore.addMessage(userMessage);

        // Simulate thinking delay
        await new Promise(resolve => setTimeout(resolve, THINKING_DELAY));

        if (abortControllerRef.current?.signal.aborted) return;

        // Start streaming assistant response
        setState({ status: 'streaming' });

        // Create initial assistant message
        const assistantMessage = createMockTypingMessage();
        streamingMessageIdRef.current = assistantMessage.id;

        setState(prev => ({ messages: [...prev.messages, assistantMessage] }));

        // Generate streaming response (use RAG-aware streaming if appropriate)
        const responseGenerator = shouldUseMockRAG()
          ? generateMockRAGStreamResponse(messageText)
          : generateMockStreamResponse(messageText);

        let fullResponse = '';

        for await (const chunk of responseGenerator) {
          if (abortControllerRef.current?.signal.aborted) break;

          fullResponse += chunk;

          // Update the streaming message
          setState(prev => ({
            messages: prev.messages.map(msg =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    parts: [{ type: 'text', text: fullResponse }],
                    createdAt: new Date(),
                  }
                : msg,
            ),
          }));

          // Simulate data stream events
          if (onData) {
            onData({ text: chunk, type: 'text' });
          }

          // Random delay between chunks for realistic typing
          await new Promise(resolve =>
            setTimeout(resolve, CHUNK_DELAY + Math.random() * CHUNK_DELAY),
          );
        }

        // Finalize the message
        const finalMessage: ChatMessage = {
          ...assistantMessage,
          parts: [{ type: 'text', text: fullResponse }],
          metadata: {
            ...assistantMessage.metadata,
            createdAt: new Date().toISOString(),
          },
        };

        setState(prev => ({
          messages: prev.messages.map(msg => (msg.id === assistantMessage.id ? finalMessage : msg)),
        }));

        // Add to mock data store
        mockDataStore.addMessage(finalMessage);

        streamingMessageIdRef.current = null;
        setState({ status: 'ready' });

        if (onFinish) {
          onFinish();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mock chat error');
        setState({ error, status: 'error' });

        if (onError) {
          onError(error);
        }
      }
    },
    [state.status, onFinish, onError, onData, setState],
  );

  const reload = useCallback(async () => {
    if (state.messages.length === 0) return null;

    // Find the last user message
    const lastUserMessageIndex = state.messages.findLastIndex(msg => msg.role === 'user');
    if (lastUserMessageIndex === -1) return null;

    // Remove all messages after the last user message
    const messagesToKeep = state.messages.slice(0, lastUserMessageIndex + 1);
    setState({ messages: messagesToKeep });

    // Re-generate response for the last user message
    const lastUserMessage = state.messages[lastUserMessageIndex];
    if (lastUserMessage) {
      await append(lastUserMessage);
    }

    return null;
  }, [state.messages, append, setState]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setState({ input: e.target.value });
    },
    [setState],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!state.input.trim() || state.status === 'streaming') return;

      const messageText = state.input.trim();
      setState({ input: '' });

      await append({
        role: 'user',
        parts: [{ type: 'text', text: messageText }],
        content: [{ type: 'text', text: messageText }],
      });
    },
    [state.input, state.status, append, setState],
  );

  // Create abort controller on mount
  useEffect(() => {
    abortControllerRef.current = new AbortController();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Clean up streaming message on unmount
  useEffect(() => {
    return () => {
      streamingMessageIdRef.current = null;
    };
  }, []);

  return {
    messages: state.messages,
    setMessages: (messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[])) => {
      if (typeof messages === 'function') {
        setState(prev => ({ messages: messages(prev.messages) }));
      } else {
        setState({ messages });
      }
    },
    append,
    reload,
    stop,
    status: state.status,
    error: state.error,
    input: state.input,
    setInput: (input: string) => setState({ input }),
    handleInputChange,
    handleSubmit,
  };
}

/**
 * Generic mock version of useChat for drop-in replacement - matches real AI SDK v5 API
 * @param options - Chat options matching AI SDK interface
 * @returns Mock chat helpers with full AI SDK compatibility
 */
export function useMockChatReplace(options: any) {
  const mockHelpers = useMockChat({
    id: options.id || 'mock-chat',
    initialMessages: options.initialMessages || [],
    generateId: options.generateId,
    onFinish: options.onFinish,
    onError: options.onError,
    onData: options.onData,
  });

  // Return object matching what real useChat returns from AI SDK v5
  return {
    messages: mockHelpers.messages,
    append: mockHelpers.append,
    reload: mockHelpers.reload,
    stop: mockHelpers.stop,
    status: mockHelpers.status,
    error: mockHelpers.error,
    input: mockHelpers.input,
    setInput: mockHelpers.setInput,
    handleInputChange: mockHelpers.handleInputChange,
    handleSubmit: mockHelpers.handleSubmit,
    setMessages: mockHelpers.setMessages,
    data: [],
    setData: () => {},
    id: options.id || 'mock-chat',
    sendMessage: async (message: any) => {
      await mockHelpers.append(message);
      return undefined;
    },
    addToolResult: () => {},
  };
}

/**
 * Enhanced mock with additional features like typing indicators
 * @param options - Mock chat configuration options
 * @returns Enhanced mock chat helpers with extra features
 */
export function useEnhancedMockChat(options: MockChatOptions) {
  const chatHelpers = useMockChat(options);
  const [isTyping, toggleTyping] = useToggle([false, true]);
  const [typingIndicator, setTypingIndicator] = useSetState({ text: '' });

  // Enhanced typing simulation with useInterval
  const { start: startTypingInterval, stop: stopTypingInterval } = useInterval(() => {
    setTypingIndicator(prev => ({
      text: prev.text === '...' ? '.' : prev.text + '.',
    }));
  }, 500);

  // Enhanced typing simulation
  useEffect(() => {
    if (chatHelpers.status === 'streaming') {
      toggleTyping(true);
      startTypingInterval();
    } else {
      toggleTyping(false);
      stopTypingInterval();
      setTypingIndicator({ text: '' });
    }
  }, [
    chatHelpers.status,
    toggleTyping,
    startTypingInterval,
    stopTypingInterval,
    setTypingIndicator,
  ]);

  return {
    ...chatHelpers,
    isTyping,
    typingIndicator: typingIndicator.text,
  };
}

/**
 * Creates a mock conversation branch from a specific message
 * @param fromMessageId - ID of message to branch from
 * @param newUserMessage - New user message for the branch
 * @returns Array of messages representing the conversation branch
 */
export function createMockConversationBranch(
  fromMessageId: string,
  newUserMessage: string,
): ChatMessage[] {
  const messages = mockDataStore.getMessages();
  const messageIndex = messages.findIndex(m => m.id === fromMessageId);

  if (messageIndex === -1) return [];

  // Create branch from this point
  const branchMessages = messages.slice(0, messageIndex + 1);
  const newMessage = createMockMessage('user', newUserMessage);

  return [...branchMessages, newMessage];
}

/**
 * Mock multi-model comparison functionality
 * @param modelIds - Array of model identifiers to compare
 * @returns Multi-model chat comparison interface
 */
export function useMockMultiModelChat(modelIds: string[]) {
  const [state, setState] = useSetState({
    responses: {} as Record<string, ChatMessage[]>,
    isComparing: false,
  });
  const [modelIndex, { increment: incrementModel, reset: resetModelIndex }] = useCounter(0, {
    min: 0,
    max: modelIds.length - 1,
  });

  const compareModels = useCallback(
    async (prompt: string) => {
      setState({ isComparing: true });
      resetModelIndex();
      const newResponses: Record<string, ChatMessage[]> = {};

      // Simulate different model responses
      for (const modelId of modelIds) {
        const userMessage = createMockMessage('user', prompt);
        let assistantResponse = '';

        // Generate model-specific responses
        switch (modelId) {
          case 'gpt-4':
            assistantResponse = `GPT-4 Response: This is a comprehensive analysis of your question. I'll provide detailed insights with multiple perspectives...`;
            break;
          case 'claude-3-sonnet':
            assistantResponse = `Claude Response: I'd be happy to help you with this. Let me break down the approach step by step...`;
            break;
          case 'gemini-pro':
            assistantResponse = `Gemini Response: Here's my analysis with visual understanding capabilities integrated...`;
            break;
          default:
            assistantResponse = `${modelId} Response: Here's my response to your question...`;
        }

        const assistantMessage = createMockMessage('assistant', assistantResponse);
        newResponses[modelId] = [userMessage, assistantMessage];
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setState({ responses: newResponses, isComparing: false });
    },
    [modelIds, setState, resetModelIndex],
  );

  return {
    responses: state.responses,
    isComparing: state.isComparing,
    compareModels,
    currentModelIndex: modelIndex,
    nextModel: incrementModel,
  };
}
