import { Box } from '@mantine/core';

import type { BoxProps } from '@mantine/core';
import type { ReactNode } from 'react';

type ThreadProps = BoxProps & {
  children: ReactNode;
};

export const Thread = ({ children, ...props }: ThreadProps) => (
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
