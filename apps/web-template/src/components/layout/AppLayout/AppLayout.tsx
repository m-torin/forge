'use client';

import {
  AppShell,
  type AppShellProps,
  Drawer,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from '@mantine/core';
// useResizeObserver removed - using fixed responsive heights
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useMemo, useEffect, useState } from 'react';

import { CartContent } from '@/components/CartContent';
import { SidebarNavigationWrapper } from '@/components/SidebarNavigationWrapper';
import { Header } from '@/components/layout';
import { getNavigationAction } from '@/actions';

import classes from './AppLayout.module.css';
import { AppLayoutProvider, useAppLayout } from '@/react/AppLayoutContext';

import { Footer, Logo } from '@/components/ui';

import { TCollection, TNavigationItem } from '@/types';

interface AppLayoutProps
  extends Omit<AppShellProps, 'aside' | 'children' | 'footer' | 'header' | 'navbar'> {
  children: ReactNode;
  dict?: any; // Using any for now due to type merging issues
  featuredCollection?: TCollection;
  locale?: string;
  navigationMenu?: TNavigationItem[];
}

function AppLayoutInner({
  children,
  dict,
  disabled = false,
  featuredCollection,
  layout = 'default',
  locale,
  navigationMenu,
  offsetScrollbars,
  padding = 'md', // Changed default to "md" for proper content spacing
  transitionDuration = 200,
  transitionTimingFunction = 'ease',
  withBorder = true,
  zIndex = 100,
  ...otherProps
}: AppLayoutProps) {
  const pathname = usePathname();
  const { cartOpened, closeCart, closeNav, navOpened } = useAppLayout();
  const [navigationData, setNavigationData] = useState<any[]>([]);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const data = await getNavigationAction();
        setNavigationData(data);
      } catch (error) {
        console.error('Failed to fetch navigation: ', error);
      }
    };
    fetchNavigation();
  }, []);
  const {
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
    return navigationMenu?.map((item: any) => {
      const href = item.href.startsWith('/') ? `/${locale}${item.href}` : item.href;
      const isActive = pathname === href;

      return {
        ...item,
        children: item.children?.map((child: any) => {
          const childHref = child.href.startsWith('/') ? `/${locale}${child.href}` : child.href;
          const isChildActive = pathname === childHref;
          return {
            ...child,
            href: childHref,
            isActive: isChildActive,
          };
        }),
        href,
        isActive,
      };
    });
  }, [navigationMenu, locale, pathname]);

  // If all components are disabled, render children directly without AppShell
  if (!headerEnabled && !navbarEnabled && !asideEnabled && !footerEnabled) {
    return <>{children}</>;
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
            <Header
              dict={dict}
              featuredCollection={featuredCollection}
              locale={locale}
              mobileMenuOpen={mobileNavbarOpened}
              navbarOpen={navbarOpened}
              navigationMenu={navigationMenu}
              onMobileMenuToggle={toggleMobileNavbar}
              onNavbarToggle={toggleNavbar}
            />
          </AppShell.Header>
        )}

        {navbarEnabled && (
          <AppShell.Navbar className={classes.navbar} p="md">
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
          </AppShell.Navbar>
        )}

        <AppShell.Main className={classes.main}>{children}</AppShell.Main>

        {asideEnabled && (
          <AppShell.Aside className={classes.aside} p="md">
            <div className={classes.asidePortalTarget} id="aside-portal-target" />
          </AppShell.Aside>
        )}

        {footerEnabled && (
          <AppShell.Footer className={classes.footer} p="md">
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
        <CartContent onClose={closeCart} />
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
        <div style={{ padding: 'var(--mantine-spacing-md)' }}>
          <SidebarNavigationWrapper onClose={closeNav} data={navigationData} />
        </div>
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
