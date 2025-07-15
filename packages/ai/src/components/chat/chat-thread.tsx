'use client';

import { Box, BoxProps } from '@mantine/core';

import { ReactNode } from 'react';

type ChatThreadProps = BoxProps & {
  children: ReactNode;
};

export const ChatThread = ({ children, ...props }: ChatThreadProps) => (
  <Box
    display="flex"
    p="xl"
    pb={0}
    style={{
      alignItems: 'flex-start',
      flex: 1,
      flexDirection: 'column',
      gap: '1rem',
      overflowY: 'auto',
    }}
    {...props}
  >
    {children}
  </Box>
);
