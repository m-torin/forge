'use client';

import { ActionIcon, Box, Textarea } from '@mantine/core';
import { IconSend, IconX } from '@tabler/icons-react';
import { type KeyboardEvent, useCallback, useState } from 'react';

interface ChatInputProps {
  disabled?: boolean;
  isStreaming?: boolean;
  maxLength?: number;
  onSend: (message: string) => void;
  onStop?: () => void;
  placeholder?: string;
}

export const ChatInput = ({
  disabled = false,
  isStreaming = false,
  maxLength = 2000,
  onSend,
  onStop,
  placeholder = 'Type your message...',
}: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = useCallback(() => {
    if (input.trim() && !disabled && !isStreaming) {
      onSend(input.trim());
      setInput('');
    }
  }, [input, onSend, disabled, isStreaming]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleStop = useCallback(() => {
    if (onStop) {
      onStop();
    }
  }, [onStop]);

  return (
    <Box
      style={{
        alignItems: 'flex-end',
        borderTop: '1px solid var(--mantine-color-gray-3)',
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem',
      }}
    >
      <Textarea
        autosize
        maxRows={4}
        minRows={1}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
          setInput(event.currentTarget.value)
        }
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ flex: 1 }}
        styles={{
          input: {
            resize: 'none',
          },
        }}
        disabled={disabled}
        maxLength={maxLength}
        value={input}
      />

      {isStreaming ? (
        <ActionIcon color="red" onClick={handleStop} disabled={!onStop} size="lg">
          <IconX size={18} />
        </ActionIcon>
      ) : (
        <ActionIcon
          color="blue"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          size="lg"
        >
          <IconSend size={18} />
        </ActionIcon>
      )}
    </Box>
  );
};
