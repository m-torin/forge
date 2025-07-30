'use client';

import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ReactNode, FC, useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { usePath } from '#/lib';
import { AppLayoutHeader } from './header';
import classes from './AppLayout.module.scss';

const heights = { header: 60, footer: 50 };

const useScrollAreaHeight = (): string => {
  return useMemo(
    () => `calc(100vh - ${heights.header}px - ${heights.footer}px)`,
    [],
  );
};

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const [opened, { toggle: _toggle }] = useDisclosure();
  const { display } = usePath();
  const _scrollAreaHeight = useScrollAreaHeight();
  const pathname = usePathname();

  const isIntegrationsRoute = pathname.startsWith('/integrations');
  const isNavbarCollapsed = !isIntegrationsRoute;

  return (
    <AppShell
      header={{ height: heights.header }}
      footer={{ height: heights.footer, collapsed: display.aside }}
      navbar={{
        width: 221,
        breakpoint: 'sm',
        collapsed: {
          desktop: isNavbarCollapsed,
          mobile: isNavbarCollapsed || !opened,
        },
      }}
      aside={{
        width: 232,
        breakpoint: 'md',
        collapsed: { desktop: display.aside, mobile: true },
      }}
      padding="0"
    >
      <AppLayoutHeader />

      <AppShell.Navbar py={0} px={0}>
        <Box id="applayout-sidebar" h="100%" />
      </AppShell.Navbar>

      <AppShell.Main className={classes.appMain}>{children}</AppShell.Main>

      <AppShell.Aside>
        <Box h="100%" style={{ overflow: 'auto' }} id="applayout-aside" />
      </AppShell.Aside>

      <AppShell.Footer>
        <Box id="applayout-footer" visibleFrom="sm" />
      </AppShell.Footer>
    </AppShell>
  );
};

export default AppLayout;
