'use client';

import { Box } from '@mantine/core';

import type { BoxProps } from '@mantine/core';
import type { ReactNode } from 'react';

type ChatThreadProps = BoxProps & {
  children: ReactNode;
};

export const ChatThread = ({ children, ...props }: ChatThreadProps) => (
  <Box
    style={{
      alignItems: 'flex-start',
      flex: 1,
      flexDirection: 'column',
      gap: '1rem',
      overflowY: 'auto',
    }}
    display="flex"
    p="xl"
    pb={0}
    {...props}
  >
    {children}
  </Box>
);
