'use client';

import { Box, Paper } from '@mantine/core';
import Markdown from 'react-markdown';

import type { Message as MessageType } from 'ai';
import type { ComponentProps } from 'react';

interface ChatMessageProps {
  data: MessageType;
  markdown?: ComponentProps<typeof Markdown>;
}

export const ChatMessage = ({ data, markdown }: ChatMessageProps) => (
  <Paper
    withBorder
    style={{ alignSelf: data.role === 'user' ? 'flex-end' : 'flex-start' }}
    bg={data.role === 'user' ? 'blue.6' : 'gray.1'}
    c={data.role === 'user' ? 'white' : undefined}
    maw="80%"
    p="sm"
    radius="md"
  >
    <Box>
      <Markdown {...markdown}>{data.content}</Markdown>
    </Box>
  </Paper>
);
