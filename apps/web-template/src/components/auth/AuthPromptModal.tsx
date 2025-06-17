'use client';

import { Modal, Button, Text, Stack, Group, Divider, Skeleton, Alert } from '@mantine/core';
import { IconHeart, IconLogin, IconUser, IconAlertTriangle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface AuthPromptModalProps {
  opened: boolean;
  onClose: () => void;
  action?: 'favorite' | 'review' | 'purchase' | 'generic';
  productName?: string;
  locale?: string;
  returnUrl?: string;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

const actionConfig = {
  favorite: {
    icon: IconHeart,
    title: 'Sign in to save favorites',
    description:
      'Save products you love and access them from any device. Your favorites will be waiting for you!',
    benefits: [
      'Save unlimited favorites',
      'Access from any device',
      'Get notified of price drops',
      'Sync across all your devices',
    ],
  },
  review: {
    icon: IconUser,
    title: 'Sign in to write reviews',
    description: 'Share your experience with other customers and help them make better decisions.',
    benefits: [
      'Write detailed reviews',
      'Upload photos',
      'Help other customers',
      'Build your reviewer reputation',
    ],
  },
  purchase: {
    icon: IconUser,
    title: 'Sign in to complete purchase',
    description: 'Create an account to track your orders and enjoy faster checkout.',
    benefits: [
      'Fast, secure checkout',
      'Order tracking',
      'Purchase history',
      'Exclusive member discounts',
    ],
  },
  generic: {
    icon: IconLogin,
    title: 'Sign in to continue',
    description: 'Create an account to unlock all features and personalize your experience.',
    benefits: [
      'Personalized recommendations',
      'Save your preferences',
      'Faster checkout',
      'Order tracking',
    ],
  },
};

// Loading skeleton for AuthPromptModal
function AuthPromptModalSkeleton({ testId }: { testId?: string }) {
  return (
    <Stack gap="lg" data-testid={testId}>
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} width="100%" />
      <div>
        <Skeleton height={16} width="30%" mb="xs" />
        <Stack gap="xs">
          {[1, 2, 3, 4].map((i) => (
            <Group key={i} gap="xs">
              <Skeleton height={6} width={6} radius="xl" />
              <Skeleton height={14} width={`${60 + Math.random() * 30}%`} />
            </Group>
          ))}
        </Stack>
      </div>
      <Skeleton height={40} width="100%" />
      <Skeleton height={40} width="100%" />
    </Stack>
  );
}

// Error state for AuthPromptModal
function AuthPromptModalError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" data-testid={testId}>
      <Text size="sm">Authentication prompt failed to load</Text>
    </Alert>
  );
}

export function AuthPromptModal({
  opened,
  onClose,
  action = 'generic',
  productName,
  locale = 'en',
  returnUrl,
  loading = false,
  error,
  'data-testid': testId = 'auth-prompt-modal',
}: AuthPromptModalProps) {
  const router = useRouter();
  const [internalError, setInternalError] = useState<string | null>(null);
  const config = actionConfig[action];
  const Icon = config.icon;

  // Build return URL with current context
  const buildReturnUrl = () => {
    try {
      if (returnUrl) return returnUrl;
      if (typeof window !== 'undefined') {
        return window.location.pathname + window.location.search;
      }
      return '/';
    } catch (err) {
      console.error('Failed to build return URL:', err);
      return '/';
    }
  };

  const encodedReturnUrl = encodeURIComponent(buildReturnUrl());

  const handleSignIn = () => {
    try {
      router.push(`/${locale}/login?returnUrl=${encodedReturnUrl}`);
      onClose();
    } catch (err) {
      console.error('Sign in navigation error:', err);
      setInternalError('Failed to navigate to sign in');
    }
  };

  const handleSignUp = () => {
    try {
      router.push(`/${locale}/signup?returnUrl=${encodedReturnUrl}`);
      onClose();
    } catch (err) {
      console.error('Sign up navigation error:', err);
      setInternalError('Failed to navigate to sign up');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <ErrorBoundary fallback={<Text fw={600}>Sign in required</Text>}>
          <Group gap="sm">
            <Icon size={20} color="var(--mantine-color-blue-6)" />
            <Text fw={600}>{config.title}</Text>
          </Group>
        </ErrorBoundary>
      }
      size="md"
      centered
      data-testid={testId}
    >
      <ErrorBoundary
        fallback={<AuthPromptModalError error="Modal content failed to load" testId={testId} />}
      >
        {loading ? (
          <AuthPromptModalSkeleton testId={testId} />
        ) : error || internalError ? (
          <AuthPromptModalError error={error || internalError || ''} testId={testId} />
        ) : (
          <Stack gap="lg">
            {/* Product Context */}
            {productName && action === 'favorite' && (
              <ErrorBoundary fallback={null}>
                <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                  <Text size="sm" c="dimmed">
                    Save "{productName}" to your favorites
                  </Text>
                </div>
              </ErrorBoundary>
            )}

            {/* Description */}
            <Text size="sm" c="dimmed">
              {config.description}
            </Text>

            {/* Benefits List */}
            <div>
              <Text size="sm" fw={500} mb="xs">
                Why sign in?
              </Text>
              <Stack gap="xs">
                {config.benefits.map((benefit, index) => (
                  <ErrorBoundary key={index} fallback={null}>
                    <Group gap="xs">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      <Text size="sm" c="dimmed">
                        {benefit}
                      </Text>
                    </Group>
                  </ErrorBoundary>
                ))}
              </Stack>
            </div>

            <Divider />

            {/* Action Buttons */}
            <Stack gap="sm">
              <Button
                onClick={handleSignIn}
                leftSection={<IconLogin size={16} />}
                fullWidth
                size="md"
              >
                Sign In
              </Button>

              <Button
                onClick={handleSignUp}
                variant="outline"
                leftSection={<IconUser size={16} />}
                fullWidth
                size="md"
              >
                Create Account
              </Button>

              <Button onClick={onClose} variant="subtle" fullWidth size="sm" c="dimmed">
                Continue browsing
              </Button>
            </Stack>

            {/* Footer Note */}
            <Text size="xs" c="dimmed" ta="center">
              It's free and takes less than 30 seconds!
            </Text>
          </Stack>
        )}
      </ErrorBoundary>
    </Modal>
  );
}
