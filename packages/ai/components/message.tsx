import { Box, Paper } from '@mantine/core';
import Markdown from 'react-markdown';

import type { Message as MessageType } from 'ai';
import type { ComponentProps } from 'react';

interface MessageProps {
  data: MessageType;
  markdown?: ComponentProps<typeof Markdown>;
}

export const Message = ({ data, markdown }: MessageProps) => (
  <Paper
    style={{ alignSelf: data.role === 'user' ? 'flex-end' : 'flex-start' }}
    bg={data.role === 'user' ? 'dark.6' : 'gray.1'}
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
