'use client';

import { Center, Loader, Stack, Text } from '@mantine/core';

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = 'Loading...' }: LoadingStateProps) {
  return (
    <Center h={200}>
      <Stack align="center" gap="md">
        <Loader size="md" />
        {text && (
          <Text c="dimmed" size="sm">
            {text}
          </Text>
        )}
      </Stack>
    </Center>
  );
}
