import { Anchor, Group, Text, Skeleton } from '@mantine/core';
import { IconBrandFramerMotion, IconAlertTriangle } from '@tabler/icons-react';
import Link from 'next/link';
import { type FC, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface LogoProps {
  className?: string;
  'data-testid'?: string;
  locale?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Logo
function LogoSkeleton({ testId }: { testId: string }) {
  return (
    <Group gap="xs" data-testid={`${testId}-skeleton`}>
      <Skeleton height={32} width={32} />
      <Skeleton height={24} width={80} />
    </Group>
  );
}

// Error state for Logo
function LogoError({ error, testId }: { error: string; testId: string }) {
  return (
    <Group gap="xs" data-testid={`${testId}-error`}>
      <IconAlertTriangle size={32} color="red" />
      <Text size="sm" c="red">
        Logo Error
      </Text>
    </Group>
  );
}

const Logo: FC<LogoProps> = ({
  className = '',
  'data-testid': testId = 'logo',
  locale = 'en',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <LogoSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <LogoError error={currentError} testId={testId} />;
  }

  const handleClick = () => {
    try {
      // Navigation handled by Link component
    } catch (error) {
      console.error('Logo navigation error:', error);
      setInternalError('Failed to navigate home');
    }
  };

  return (
    <ErrorBoundary fallback={<LogoError error="Logo failed to render" testId={testId} />}>
      <Anchor
        className={className}
        component={Link}
        data-testid={testId}
        href={`/${locale}`}
        underline="never"
        onClick={handleClick}
      >
        <Group ta="center" gap="xs">
          <ErrorBoundary fallback={<Skeleton height={32} width={32} />}>
            <IconBrandFramerMotion className="text-blue-500 dark:text-blue-400" size={32} />
          </ErrorBoundary>
          <ErrorBoundary fallback={<Skeleton height={24} width={80} />}>
            <Text className="text-neutral-900 dark:text-white" fw={700} size="lg">
              WebApp
            </Text>
          </ErrorBoundary>
        </Group>
      </Anchor>
    </ErrorBoundary>
  );
};

export default Logo;
