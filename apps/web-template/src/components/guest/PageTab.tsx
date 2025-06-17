'use client';

import { usePathname } from 'next/navigation';
import { Skeleton, Alert, Text, Stack, Center } from '@mantine/core';
import { IconAlertTriangle, IconTags } from '@tabler/icons-react';
import { useState } from 'react';

import { Link } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const pages: {
  name: string;
  link: string;
}[] = [
  {
    name: 'Settings',
    link: '/account',
  },
  {
    name: 'Wishlists',
    link: '/account-wishlists',
  },
  {
    name: 'Orders history',
    link: '/orders',
  },
  {
    name: 'Change password',
    link: '/account-password',
  },
  {
    name: 'Billing',
    link: '/account-billing',
  },
];

interface PageTabProps {
  loading?: boolean;
  error?: string;
}

// Loading skeleton for PageTab
function PageTabSkeleton() {
  return (
    <div>
      <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={32} width={80 + Math.random() * 40} radius="sm" />
        ))}
      </div>
    </div>
  );
}

// Error state for PageTab
function PageTabError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Center py="md">
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" maw={300}>
        <Stack gap="xs">
          <Text size="xs">Page tabs error</Text>
          {onRetry && (
            <button onClick={onRetry} className="text-xs underline">
              Try Again
            </button>
          )}
        </Stack>
      </Alert>
    </Center>
  );
}

// Zero state for PageTab
function PageTabEmpty() {
  return (
    <Center py="md">
      <Stack align="center" gap="sm">
        <IconTags size={32} color="gray" />
        <Text c="dimmed" size="sm">
          No page tabs available
        </Text>
      </Stack>
    </Center>
  );
}

const PageTab = ({ loading = false, error }: PageTabProps = {}) => {
  const pathname = usePathname();
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <PageTabSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <PageTabError error={currentError} onRetry={() => setInternalError(null)} />;
  }

  // Show zero state when no pages
  if (!pages || pages.length === 0) {
    return <PageTabEmpty />;
  }

  return (
    <ErrorBoundary fallback={<PageTabError error="Page tabs failed to render" />}>
      <div>
        <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
          {pages.map((item: any) => {
            try {
              let isActive = pathname === item.link;
              if (item.link === '/orders' && pathname.includes('/orders/')) {
                isActive = true;
              }

              return (
                <ErrorBoundary
                  key={item.link}
                  fallback={<Skeleton height={32} width={80} radius="sm" />}
                >
                  <Link
                    href={item.link as any}
                    className={`block shrink-0 border-b-2 py-5 text-sm sm:text-base md:py-8 ${
                      isActive
                        ? 'border-primary-500 font-medium text-neutral-950 dark:text-neutral-100'
                        : 'border-transparent text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                </ErrorBoundary>
              );
            } catch (error) {
              console.error('Page tab item error:', error);
              setInternalError('Failed to render page tab');
              return <Skeleton key={item.link} height={32} width={80} radius="sm" />;
            }
          })}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PageTab;
