import { Box } from '@mantine/core';

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box style={{ backgroundColor: 'var(--mantine-color-gray-0)', minHeight: '100vh' }}>
      {children}
    </Box>
  );
}
