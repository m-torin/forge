'use client';

import { Box, LoadingOverlay, Paper, ScrollArea, Text } from '@mantine/core';
import { useCallback } from 'react';

import { useAIChat } from '../../hooks/use-ai-chat';

import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';
import { ChatThread } from './chat-thread';

interface AIChatProps extends Record<string, any> {
  api?: string;
  height?: number | string;
  placeholder?: string;
  systemPrompt?: string;
  welcomeMessage?: string;
}

export const AIChat = ({
  api = '/api/ai/chat',
  height = 600,
  placeholder = 'Ask me anything...',
  systemPrompt,
  welcomeMessage = 'Hello! How can I help you today?',
}: AIChatProps) => {
  const { append, isLoading, messages, stop } = useAIChat({
    api,
    initialMessages: welcomeMessage
      ? [{ content: welcomeMessage, id: 'welcome', role: 'assistant' as const }]
      : [],
    ...(systemPrompt && {
      body: { systemPrompt },
    }),
  });

  const handleSend = useCallback(
    (message: string) => {
      void append({ content: message, role: 'user' });
    },
    [append],
  );

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  return (
    <Paper
      style={{
        display: 'flex',
        flexDirection: 'column',
        height,
        position: 'relative',
      }}
      withBorder={true}
    >
      <LoadingOverlay visible={isLoading && messages.length === 0} />

      {/* Chat Header */}
      <Box
        style={{
          backgroundColor: 'var(--mantine-color-gray-0)',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          padding: '1rem',
        }}
      >
        <Text fw={600} size="sm">
          AI Assistant
        </Text>
      </Box>

      {/* Messages Area */}
      <ScrollArea offsetScrollbars scrollbarSize={6} style={{ flex: 1 }}>
        <ChatThread>
          {messages.length === 0 && !isLoading && (
            <Box style={{ padding: '2rem', textAlign: 'center' }}>
              <Text c="dimmed">Start a conversation by typing a message below.</Text>
            </Box>
          )}

          {messages.map((message: any) => (
            <ChatMessage key={message.id} data={message} />
          ))}

          {isLoading && messages.length > 0 && (
            <Box style={{ padding: '0.5rem' }}>
              <Text c="dimmed" size="sm">
                Thinking...
              </Text>
            </Box>
          )}
        </ChatThread>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        disabled={isLoading}
        isStreaming={isLoading}
        placeholder={placeholder}
        onSend={handleSend}
        onStop={handleStop}
      />
    </Paper>
  );
};
