'use client';

import { Box, Paper } from '@mantine/core';
import Markdown from 'react-markdown';

import { Message as MessageType } from 'ai';
import { ComponentProps } from 'react';

interface ChatMessageProps extends Record<string, any> {
  data: MessageType;
  markdown?: ComponentProps<typeof Markdown>;
}

export const ChatMessage = ({ data, markdown }: ChatMessageProps) => {
  const paperProps = {
    bg: data.role === 'user' ? 'blue.6' : 'gray.1',
    maw: '80%',
    p: 'sm',
    radius: 'sm',
    style: { alignSelf: data.role === 'user' ? 'flex-end' : 'flex-start' },
    withBorder: true,
    ...(data.role === 'user' && { c: 'white' }),
  } as const;

  return (
    <Paper {...paperProps}>
      <Box>
        <Markdown {...markdown}>{data.content}</Markdown>
      </Box>
    </Paper>
  );
};
