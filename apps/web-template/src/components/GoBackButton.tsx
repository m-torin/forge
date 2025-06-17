'use client';

import { Button, Skeleton } from '@mantine/core';
import { IconArrowLeft, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface GoBackButtonProps {
  children: React.ReactNode;
  size?: string;
  variant?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for GoBackButton
function GoBackButtonSkeleton({ size }: { size?: string }) {
  const height = size === 'lg' ? 42 : size === 'md' ? 36 : 32;
  return <Skeleton height={height} width={120} radius="sm" />;
}

// Error state for GoBackButton
function GoBackButtonError({
  error,
  size,
  variant,
}: {
  error: string;
  size?: string;
  variant?: string;
}) {
  return (
    <Button
      leftSection={<IconAlertTriangle size={16} />}
      size={size}
      variant="light"
      color="red"
      disabled
    >
      Error
    </Button>
  );
}

export function GoBackButton({
  children,
  size = 'lg',
  variant = 'light',
  loading = false,
  error,
}: GoBackButtonProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <GoBackButtonSkeleton size={size} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <GoBackButtonError error={currentError} size={size} variant={variant} />;
  }

  const handleGoBack = () => {
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      }
    } catch (error) {
      console.error('Go back navigation error:', error);
      setInternalError('Failed to navigate back');
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <GoBackButtonError error="Go back button failed to render" size={size} variant={variant} />
      }
    >
      <Button
        leftSection={<IconArrowLeft size={16} />}
        size={size}
        variant={variant}
        onClick={handleGoBack}
      >
        {children}
      </Button>
    </ErrorBoundary>
  );
}
