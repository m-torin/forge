'use client';

import { Box, Burger, Container, Group, Skeleton, Stack, Center, Alert, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { type FC, memo, useCallback, useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';

import { ColorSchemesSwitcher } from '@/components/ColorSchemesSwitcher';
import CartButton from '@/components/layout/CartButton';
import GuestNavMenu from '@/components/layout/GuestNavMenu';
import Logo from '@/components/layout/Logo';
import Navigation from '@/components/layout/Navigation';
import TabNavigation from '@/components/layout/TabNavigation';
import ProductionFederatedAutocomplete from '@/components/search/ProductionFederatedAutocomplete';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { TCollection, TNavigationItem } from '@/types';

export interface HeaderProps {
  cartItemsCount?: number;
  dict?: {
    navigation?: {
      account?: string;
      help?: string;
      home?: string;
      login?: string;
      logout?: string;
      orders?: string;
      search?: string;
      wishlist?: string;
    };
    search?: {
      button?: string;
      placeholder?: string;
    };
  };
  featuredCollection?: TCollection;
  hasBorder?: boolean;
  locale?: string;
  mobileMenuOpen?: boolean;
  navbarOpen?: boolean;
  navigationMenu?: TNavigationItem[];
  onMobileMenuToggle?: () => void;
  onNavbarToggle?: () => void;
  user?: null | {
    avatar?: string;
    email?: string;
    name?: string;
  };
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Header
function HeaderSkeleton() {
  return (
    <Box className="relative z-50 w-full h-auto bg-transparent flex flex-col">
      <Box className="relative border-neutral-200 dark:border-neutral-700 flex-shrink-0 bg-transparent">
        <Container className="min-h-20 py-4" fluid>
          <Group h="100%" justify="space-between" px="md">
            {/* Left Section Skeleton */}
            <Group gap="md">
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={120} />
            </Group>

            {/* Center Navigation Skeleton */}
            <Group className="hidden lg:flex" gap="xl">
              <Group gap="lg">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={16} width={60 + Math.random() * 40} />
                ))}
              </Group>
              <Skeleton height={40} width={250} />
            </Group>

            {/* Right Actions Skeleton */}
            <Group gap="md">
              <Skeleton height={32} width={32} radius="xl" />
              <Skeleton height={32} width={80} />
              <Skeleton height={32} width={32} radius="xl" />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Tab Navigation Skeleton */}
      <Box className="w-full py-2 border-t border-gray-200 dark:border-neutral-700">
        <Container fluid>
          <Group gap="md" px="md">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={20} width={40 + Math.random() * 30} />
            ))}
          </Group>
        </Container>
      </Box>
    </Box>
  );
}

// Error state for Header
function HeaderError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Box className="relative z-50 w-full h-auto bg-transparent">
      <Center py="lg">
        <Alert
          icon={<IconAlertTriangle size={20} />}
          title="Header Error"
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
    </Box>
  );
}

const Header: FC<HeaderProps> = memo(
  ({
    cartItemsCount = 0,
    dict,
    featuredCollection,
    hasBorder = true,
    locale = 'en',
    mobileMenuOpen = false,
    navbarOpen = true,
    navigationMenu = [],
    onMobileMenuToggle,
    onNavbarToggle,
    user: _user,
    loading = false,
    error,
  }) => {
    // Note: User will be handled by GuestNavMenu via AuthProvider

    const router = useRouter();
    const { width: viewportWidth } = useViewportSize();
    const isMobile = viewportWidth <= 768;
    const [internalError, setInternalError] = useState<string | null>(null);

    // Show loading state
    if (loading) {
      return <HeaderSkeleton />;
    }

    // Show error state
    const currentError = error || internalError;
    if (currentError) {
      return <HeaderError error={currentError} onRetry={() => setInternalError(null)} />;
    }

    // Use mobile state on mobile, desktop state on desktop
    // For Burger: opened=true shows X, opened=false shows hamburger ☰
    const isMenuOpen = isMobile ? mobileMenuOpen : navbarOpen;

    // Memoize burger click handler to prevent recreation
    const handleBurgerClick = useCallback(() => {
      if (isMobile && onMobileMenuToggle) {
        onMobileMenuToggle();
      } else if (!isMobile && onNavbarToggle) {
        onNavbarToggle();
      }
    }, [isMobile, onMobileMenuToggle, onNavbarToggle]);

    // Handle federated search selection
    const handleSearchSelect = useCallback(
      (item: any, source: string) => {
        try {
          // Navigate based on source type
          if (source === 'products' && item.objectID) {
            router.push(`/${locale}/products/${item.objectID}`);
          } else if (source === 'articles' && item.objectID) {
            router.push(`/${locale}/blog/${item.objectID}`);
          } else if (source === 'faq' && item.objectID) {
            router.push(`/${locale}/help?faq=${item.objectID}`);
          } else if (source === 'querysuggestions' && item.query) {
            router.push(`/${locale}/search?q=${encodeURIComponent(item.query)}`);
          } else {
            router.push(
              `/${locale}/search?q=${encodeURIComponent(item.query || item.name || item.title)}`,
            );
          }
        } catch (error) {
          console.error('Search navigation error:', error);
          setInternalError('Failed to navigate to search result');
        }
      },
      [router, locale],
    );

    return (
      <ErrorBoundary fallback={<HeaderError error="Header failed to render" />}>
        <Box className="relative z-50 w-full h-auto bg-transparent flex flex-col">
          {/* Main Header Bar */}
          <Box
            className={clsx(
              'relative border-neutral-200 dark:border-neutral-700 flex-shrink-0 bg-transparent',
              !hasBorder && 'has-[.header-popover-full-panel]:border-b',
            )}
          >
            <Container className="min-h-20 py-4" fluid>
              <Group h="100%" justify="space-between" px="md">
                {/* Left Section - Hamburger and Logo */}
                <Group gap="md">
                  <ErrorBoundary fallback={<Skeleton height={32} width={32} />}>
                    <Burger
                      className="text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      opened={isMenuOpen}
                      size="md"
                      onClick={handleBurgerClick}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary fallback={<Skeleton height={32} width={120} />}>
                    <Logo locale={locale} />
                  </ErrorBoundary>
                </Group>

                {/* Center - Desktop Navigation and Search */}
                <Group className="hidden lg:flex" gap="xl">
                  <ErrorBoundary fallback={<Skeleton height={40} width={200} />}>
                    <Navigation
                      featuredCollection={featuredCollection}
                      locale={locale}
                      menu={navigationMenu}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary fallback={<Skeleton height={40} width={250} />}>
                    <ProductionFederatedAutocomplete
                      className="w-64"
                      placeholder={
                        dict?.search?.placeholder || 'Search products, articles, help...'
                      }
                      size="lg"
                      locale={locale}
                      onSelect={handleSearchSelect}
                    />
                  </ErrorBoundary>
                </Group>

                {/* Right Actions */}
                <Group gap="md">
                  <ErrorBoundary fallback={<Skeleton height={32} width={32} radius="xl" />}>
                    <ColorSchemesSwitcher />
                  </ErrorBoundary>
                  <ErrorBoundary fallback={<Skeleton height={32} width={80} />}>
                    <GuestNavMenu dict={dict?.navigation} locale={locale} />
                  </ErrorBoundary>
                  <ErrorBoundary fallback={<Skeleton height={32} width={32} radius="xl" />}>
                    <CartButton locale={locale} numberItems={cartItemsCount} />
                  </ErrorBoundary>
                </Group>
              </Group>
            </Container>
          </Box>

          {/* Tab Navigation */}
          <Box
            className={clsx(
              'w-full py-2',
              hasBorder && 'border-t border-gray-200 dark:border-neutral-700',
            )}
          >
            <ErrorBoundary fallback={<Skeleton height={40} />}>
              <TabNavigation locale={locale} />
            </ErrorBoundary>
          </Box>
        </Box>
      </ErrorBoundary>
    );
  },
);

Header.displayName = 'Header';

export default Header;
