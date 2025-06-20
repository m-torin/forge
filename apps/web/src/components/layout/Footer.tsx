'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { Skeleton, Alert, Text, Center, Stack } from '@mantine/core';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
  IconAlertTriangle,
  IconLayout2,
} from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface WidgetFooterMenu {
  id: string;
  menus: Array<{ href: string; label: string }>;
  title: string;
}

interface FooterProps {
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Footer
function FooterSkeleton() {
  return (
    <div className="nc-Footer relative border-t border-neutral-200 py-20 lg:pt-28 lg:pb-24 dark:border-neutral-700">
      <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:md:col-span-1">
          <div className="col-span-2 md:col-span-1">
            <Skeleton height={32} width={150} />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <div className="flex items-center space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={20} width={20} />
              ))}
            </div>
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-sm">
            <Skeleton height={20} width={100} mb="md" />
            <Stack gap="sm">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} height={16} width={80 + Math.random() * 40} />
              ))}
            </Stack>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error state for Footer
function FooterError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="nc-Footer relative border-t border-neutral-200 py-20 dark:border-neutral-700">
      <Center>
        <Alert
          icon={<IconAlertTriangle size={20} />}
          title="Footer Error"
          color="red"
          variant="light"
          maw={400}
        >
          <Stack gap="sm">
            <Text size="sm">{error}</Text>
            {onRetry && (
              <button onClick={onRetry} className="text-sm underline">
                Try Again
              </button>
            )}
          </Stack>
        </Alert>
      </Center>
    </div>
  );
}

// Zero state for Footer when no menu items
function FooterEmpty() {
  return (
    <div className="nc-Footer relative border-t border-neutral-200 py-20 dark:border-neutral-700">
      <Center>
        <Stack align="center" gap="md">
          <IconLayout2 size={48} color="gray" />
          <Text c="dimmed">No footer content available</Text>
        </Stack>
      </Center>
    </div>
  );
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: '5',
    menus: [
      { href: '/', label: 'Release Notes' },
      { href: '/', label: 'Upgrade Guide' },
      { href: '/', label: 'Browser Support' },
      { href: '/', label: 'Dark Mode' },
    ],
    title: 'Getting started',
  },
  {
    id: '1',
    menus: [
      { href: '/', label: 'Prototyping' },
      { href: '/', label: 'Design systems' },
      { href: '/', label: 'Pricing' },
      { href: '/', label: 'Security' },
    ],
    title: 'Explore',
  },
  {
    id: '2',
    menus: [
      { href: '/', label: 'Best practices' },
      { href: '/', label: 'Support' },
      { href: '/', label: 'Developers' },
      { href: '/', label: 'Learn design' },
    ],
    title: 'Resources',
  },
  {
    id: '4',
    menus: [
      { href: '/', label: 'Discussion Forums' },
      { href: '/', label: 'Code of Conduct' },
      { href: '/', label: 'Contributing' },
      { href: '/', label: 'API Reference' },
    ],
    title: 'Community',
  },
];

function Footer({ loading = false, error }: FooterProps = {}) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <FooterSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <FooterError error={currentError} onRetry={() => setInternalError(null)} />;
  }

  // Show zero state if no menu items (though unlikely with hardcoded menus)
  if (!widgetMenus || widgetMenus.length === 0) {
    return <FooterEmpty />;
  }

  const renderWidgetMenuItem = (menu: WidgetFooterMenu) => {
    try {
      return (
        <ErrorBoundary
          key={menu.id}
          fallback={
            <div className="text-sm">
              <Skeleton height={20} width={100} />
            </div>
          }
        >
          <div className="text-sm">
            <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">{menu.title}</h2>
            <ul className="mt-5 space-y-4">
              {menu.menus.map((item: any) => (
                <ErrorBoundary
                  key={item.label}
                  fallback={
                    <li>
                      <Skeleton height={16} width={60} />
                    </li>
                  }
                >
                  <li>
                    <Link
                      className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                </ErrorBoundary>
              ))}
            </ul>
          </div>
        </ErrorBoundary>
      );
    } catch (_error) {
      console.error('Footer menu item error:', _error);
      setInternalError('Failed to render footer menu');
      return (
        <div key={menu.id} className="text-sm">
          <Skeleton height={20} width={100} />
        </div>
      );
    }
  };

  return (
    <ErrorBoundary fallback={<FooterError error="Footer failed to render" />}>
      <div className="nc-Footer relative border-t border-neutral-200 py-20 lg:pt-28 lg:pb-24 dark:border-neutral-700">
        <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
          <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:md:col-span-1">
            <div className="col-span-2 md:col-span-1">
              <ErrorBoundary fallback={<Skeleton height={32} width={150} />}>
                <h3 className="text-2xl font-semibold">Web Template</h3>
              </ErrorBoundary>
            </div>
            <div className="col-span-2 flex items-center md:col-span-3">
              <div className="flex items-center space-x-2 lg:flex-col lg:items-start lg:space-y-3 lg:space-x-0">
                <ErrorBoundary fallback={<Skeleton height={20} width={20} />}>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                  >
                    <IconBrandFacebook size={20} />
                  </a>
                </ErrorBoundary>
                <ErrorBoundary fallback={<Skeleton height={20} width={20} />}>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                  >
                    <IconBrandTwitter size={20} />
                  </a>
                </ErrorBoundary>
                <ErrorBoundary fallback={<Skeleton height={20} width={20} />}>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                  >
                    <IconBrandInstagram size={20} />
                  </a>
                </ErrorBoundary>
                <ErrorBoundary fallback={<Skeleton height={20} width={20} />}>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                  >
                    <IconBrandYoutube size={20} />
                  </a>
                </ErrorBoundary>
              </div>
            </div>
          </div>
          {widgetMenus.map(renderWidgetMenuItem)}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Footer;
export { Footer };
