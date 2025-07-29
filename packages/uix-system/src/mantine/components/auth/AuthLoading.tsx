import { Center, Loader, Stack, Text } from '@mantine/core';

export interface AuthLoadingProps {
  message?: string;
  height?: number | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AuthLoading({
  message = 'Loading...',
  height = 400,
  size = 'lg',
}: AuthLoadingProps) {
  return (
    <Center h={height}>
      <Stack align="center" gap="md">
        <Loader size={size} />
        <Text c="dimmed">{message}</Text>
      </Stack>
    </Center>
  );
}
