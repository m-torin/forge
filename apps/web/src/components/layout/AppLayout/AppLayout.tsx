'use client';

import {
  AppShell,
  type AppShellProps,
  Drawer,
  Group,
  NavLink,
  ScrollArea,
  Text,
  Center,
  Stack,
  Alert,
  Skeleton,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
// useResizeObserver removed - using fixed responsive heights
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useMemo } from 'react';

import { CartContentWrapper } from '@/components/CartContentWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/layout';
import { SidebarNavigationWrapper } from '@/components/SidebarNavigationWrapper';
import { Logo } from '@/components/ui';
import { AppLayoutProvider, useAppLayout } from '@/react/AppLayoutContext';
import { useCart } from '@/react/GuestActionsContext';
import { logger } from '@/lib/logger';

import classes from './AppLayout.module.css';
// Removed direct action import - data should come from props

import type { TCollection, TNavigationItem } from '@/types';

interface AppLayoutProps
  extends Omit<AppShellProps, 'aside' | 'children' | 'footer' | 'header' | 'navbar'> {
  children: ReactNode;
  dict?: any; // Using any for now due to type merging issues
  featuredCollection?: TCollection;
  locale?: string;
  navigationMenu?: TNavigationItem[];
  cartData?: any; // Cart data passed from server component
  loading?: boolean;
  error?: string;
}

// Loading skeleton for AppLayout
function AppLayoutSkeleton() {
  return (
    <div style={{ height: '100vh' }}>
      {/* Header skeleton */}
      <div
        style={{
          height: 60,
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          padding: '0 1rem',
        }}
      >
        <Group h={60} justify="space-between">
          <Skeleton height={32} width={120} />
          <Group gap="lg" visibleFrom="md">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={16} width={60 + Math.random() * 40} />
            ))}
          </Group>
          <Group gap="sm">
            <Skeleton height={36} width={200} />
            <Skeleton height={32} width={32} radius="xl" />
            <Skeleton height={32} width={32} radius="xl" />
          </Group>
        </Group>
      </div>

      {/* Content skeleton */}
      <div style={{ padding: '2rem' }}>
        <Stack gap="lg">
          <Skeleton height={40} width="60%" />
          <Skeleton height={200} />
          <Group>
            <Skeleton height={120} style={{ flex: 1 }} />
            <Skeleton height={120} style={{ flex: 1 }} />
            <Skeleton height={120} style={{ flex: 1 }} />
          </Group>
        </Stack>
      </div>
    </div>
  );
}

// Error state for AppLayout
function AppLayoutError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Center style={{ height: '100vh' }}>
      <Alert
        icon={<IconAlertTriangle size={20} />}
        title="Layout Error"
        color="red"
        variant="light"
        maw={400}
      >
        <Text size="sm">{error}</Text>
        {onRetry && (
          <button onClick={onRetry} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        )}
      </Alert>
    </Center>
  );
}

function AppLayoutInner({
  children,
  dict,
  disabled = false,
  featuredCollection,
  layout = 'default',
  locale,
  navigationMenu,
  cartData,
  loading = false,
  error,
  offsetScrollbars,
  padding = 'md', // Changed default to "md" for proper content spacing
  transitionDuration = 200,
  transitionTimingFunction = 'ease',
  withBorder = true,
  zIndex = 100,
  ...otherProps
}: AppLayoutProps) {
  const pathname = usePathname();
  const cart = useCart();
  const { cartItemCount } = cart;
  const {
    cartOpened,
    closeCart,
    closeNav,
    navOpened,
    asideEnabled,
    asideOpened,
    asideWidth,
    footerEnabled,
    footerHeight,
    headerEnabled,
    headerHeight,
    mobileNavbarOpened,
    navbarEnabled,
    navbarOpened,
    navbarWidth,
    toggleAside: _toggleAside,
    toggleMobileNavbar,
    toggleNavbar,
  } = useAppLayout();

  // Show loading state
  if (loading) {
    return <AppLayoutSkeleton />;
  }

  // Show error state
  if (error) {
    return <AppLayoutError error={error} />;
  }

  // Use navigationMenu prop directly instead of client-side fetching
  const navigationData = navigationMenu || [];

  // Fixed responsive header heights - no dynamic measurement needed
  // CSS custom properties are set via Mantine's responsive system

  // Memoize AppShell configuration to prevent unnecessary re-renders
  const appShellConfig = useMemo(
    () => ({
      aside: asideEnabled
        ? {
            breakpoint: 'md' as const,
            collapsed: { desktop: !asideOpened, mobile: true },
            width: asideWidth,
          }
        : undefined,
      footer: footerEnabled ? { height: footerHeight } : undefined,
      header: headerEnabled ? { height: headerHeight } : undefined,
      navbar: navbarEnabled
        ? {
            breakpoint: 'sm' as const,
            collapsed: {
              desktop: !navbarOpened,
              mobile: !mobileNavbarOpened,
            },
            width: navbarWidth,
          }
        : undefined,
    }),
    [
      asideEnabled,
      asideOpened,
      asideWidth,
      navbarEnabled,
      navbarOpened,
      mobileNavbarOpened,
      navbarWidth,
      footerEnabled,
      footerHeight,
      headerEnabled,
      headerHeight,
    ],
  );

  // Memoize navigation items to prevent recreation on each render
  const memoizedNavigationItems = useMemo(() => {
    // Ensure navigationMenu is an array and handle edge cases
    if (!navigationMenu || !Array.isArray(navigationMenu)) {
      logger.warn('navigationMenu is not a valid array', navigationMenu);
      return [];
    }

    return navigationMenu
      .map((item: any) => {
        if (!item || typeof item !== 'object') {
          logger.warn('Invalid navigation item', item);
          return null;
        }

        const href = item.href?.startsWith('/') ? `/${locale}${item.href}` : item.href || '#';
        const isActive = pathname === href;

        return {
          ...item,
          children: item.children
            ?.map((child: any) => {
              if (!child || typeof child !== 'object') {
                logger.warn('Invalid navigation child item', child);
                return null;
              }
              const childHref = child.href?.startsWith('/')
                ? `/${locale}${child.href}`
                : child.href || '#';
              const isChildActive = pathname === childHref;
              return {
                ...child,
                href: childHref,
                isActive: isChildActive,
              };
            })
            .filter(Boolean), // Remove any null entries
          href,
          isActive,
        };
      })
      .filter(Boolean); // Remove any null entries
  }, [navigationMenu, locale, pathname]);

  // If all components are disabled, render children directly without AppShell
  if (!headerEnabled && !navbarEnabled && !asideEnabled && !footerEnabled) {
    return children as ReactNode;
  }

  return (
    <>
      <AppShell
        {...appShellConfig}
        className={classes.layout}
        disabled={disabled}
        layout={layout}
        offsetScrollbars={offsetScrollbars}
        padding={headerEnabled || navbarEnabled || asideEnabled ? padding : 0}
        transitionDuration={transitionDuration}
        transitionTimingFunction={transitionTimingFunction}
        withBorder={withBorder}
        zIndex={zIndex}
        {...otherProps}
      >
        {headerEnabled && (
          <AppShell.Header className={classes.header}>
            <ErrorBoundary
              fallback={<div style={{ height: 60, padding: '1rem' }}>Header Error</div>}
            >
              <Header
                cartItemsCount={cartItemCount}
                dict={dict}
                featuredCollection={featuredCollection}
                locale={locale}
                mobileMenuOpen={mobileNavbarOpened}
                navbarOpen={navbarOpened}
                navigationMenu={navigationMenu}
                onMobileMenuToggle={toggleMobileNavbar}
                onNavbarToggle={toggleNavbar}
              />
            </ErrorBoundary>
          </AppShell.Header>
        )}

        {navbarEnabled && (
          <AppShell.Navbar className={classes.navbar} p="md">
            <ErrorBoundary fallback={<div style={{ padding: '1rem' }}>Navigation Error</div>}>
              <Text fw={500} mb="md" size="md">
                {dict?.navigation?.home || 'Navigation'}
              </Text>

              {memoizedNavigationItems?.map((item: any) => (
                <div key={item.id}>
                  <NavLink
                    active={item.isActive}
                    component={Link}
                    href={item.href as any}
                    label={item.name}
                    mb="xs"
                  />
                  {/* Handle children items */}
                  {item.children?.map((child: any) => (
                    <NavLink
                      key={child.id}
                      active={child.isActive}
                      component={Link}
                      href={child.href as any}
                      label={child.name}
                      mb="xs"
                      pl="md"
                    />
                  ))}
                </div>
              ))}
            </ErrorBoundary>
          </AppShell.Navbar>
        )}

        <AppShell.Main className={classes.main}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AppShell.Main>

        {asideEnabled && (
          <AppShell.Aside className={classes.aside} p="md">
            <ErrorBoundary fallback={<div style={{ padding: '1rem' }}>Aside Error</div>}>
              <div className={classes.asidePortalTarget} id="aside-portal-target" />
            </ErrorBoundary>
          </AppShell.Aside>
        )}

        {footerEnabled && (
          <AppShell.Footer className={classes.footer} p="md">
            <ErrorBoundary fallback={<div style={{ padding: '1rem' }}>Footer Error</div>}>
              <Group justify="space-between">
                <Text c="dimmed" size="md">
                  © 2024 {dict?.app?.brand || 'Web New App'}.{' '}
                  {dict?.app?.allRightsReserved || 'All rights reserved.'}
                </Text>
                <Group gap="xs">
                  <Text c="dimmed" size="md">
                    {dict?.app?.madeWith || 'Made with'} ❤️ {dict?.app?.by || 'by'}{' '}
                    {dict?.app?.team || 'the team'}
                  </Text>
                </Group>
              </Group>
            </ErrorBoundary>
          </AppShell.Footer>
        )}
      </AppShell>

      {/* Cart Drawer */}
      <Drawer
        onClose={closeCart}
        opened={cartOpened}
        position="right"
        scrollAreaComponent={ScrollArea.Autosize}
        styles={{
          body: { height: '100%', padding: 0 },
          content: { display: 'flex', flexDirection: 'column' },
        }}
        size="md"
        title="Shopping Cart"
        zIndex={200}
      >
        <ErrorBoundary fallback={<div style={{ padding: '1rem' }}>Cart Error</div>}>
          <CartContentWrapper onClose={closeCart} />
        </ErrorBoundary>
      </Drawer>

      {/* Navigation Drawer */}
      <Drawer
        onClose={closeNav}
        opened={navOpened}
        position="right"
        scrollAreaComponent={ScrollArea.Autosize}
        classNames={{
          content: 'max-w-md',
        }}
        styles={{
          body: { height: '100%', padding: 0 },
          content: { display: 'flex', flexDirection: 'column' },
          header: { borderBottom: '1px solid var(--mantine-color-gray-3)' },
        }}
        size="md"
        title={<Logo />}
        zIndex={200}
      >
        <ErrorBoundary fallback={<div style={{ padding: '1rem' }}>Navigation Error</div>}>
          <div style={{ padding: 'var(--mantine-spacing-md)' }}>
            <SidebarNavigationWrapper onClose={closeNav} data={navigationData} />
          </div>
        </ErrorBoundary>
      </Drawer>
    </>
  );
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <AppLayoutProvider>
      <AppLayoutInner {...props} />
    </AppLayoutProvider>
  );
}
