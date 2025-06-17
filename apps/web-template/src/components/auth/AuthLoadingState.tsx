'use client';

import { Skeleton, Stack, Group } from '@mantine/core';

interface AuthLoadingStateProps {
  type?: 'form' | 'page' | 'inline';
}

export function AuthLoadingState({ type = 'form' }: AuthLoadingStateProps) {
  if (type === 'inline') {
    return <Skeleton height={36} width={120} radius="sm" />;
  }
  
  if (type === 'page') {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Skeleton height={40} width={300} mb="xl" />
        <Stack gap="md">
          <Skeleton height={20} width="100%" />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="60%" />
        </Stack>
      </div>
    );
  }
  
  // Form loading state
  return (
    <div className="w-full max-w-md mx-auto">
      <Stack gap="md">
        {/* Title */}
        <Skeleton height={36} width={200} mx="auto" mb="lg" />
        
        {/* Form fields */}
        <Stack gap="sm">
          <Skeleton height={40} width="100%" radius="md" />
          <Skeleton height={40} width="100%" radius="md" />
        </Stack>
        
        {/* Submit button */}
        <Skeleton height={42} width="100%" radius="md" mt="md" />
        
        {/* Social buttons */}
        <Group grow mt="md">
          <Skeleton height={40} radius="md" />
          <Skeleton height={40} radius="md" />
          <Skeleton height={40} radius="md" />
        </Group>
        
        {/* Links */}
        <Group justify="space-between" mt="sm">
          <Skeleton height={16} width={100} />
          <Skeleton height={16} width={80} />
        </Group>
      </Stack>
    </div>
  );
}