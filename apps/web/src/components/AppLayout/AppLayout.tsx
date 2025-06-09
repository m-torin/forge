"use client";

import {
  AppShell,
  type AppShellProps,
  Group,
  NavLink,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import classes from "./AppLayout.module.css";
import { useAppLayout } from "./AppLayoutContext";
import { AppLayoutHeader } from "./AppLayoutHeader";

import type { TCollection, TNavigationItem } from "@/data/data-service";

interface AppLayoutProps
  extends Omit<
    AppShellProps,
    "children" | "header" | "navbar" | "aside" | "footer"
  > {
  children: ReactNode;
  dict?: any; // Using any for now due to type merging issues
  featuredCollection?: TCollection;
  locale?: string;
  navigationMenu?: TNavigationItem[];
}

export function AppLayout({
  children,
  dict,
  disabled = false,
  featuredCollection,
  layout = "default",
  locale,
  navigationMenu,
  offsetScrollbars,
  padding = 0,
  transitionDuration = 200,
  transitionTimingFunction = "ease",
  withBorder = true,
  zIndex = 100,
  ...otherProps
}: AppLayoutProps) {
  const pathname = usePathname();
  const {
    asideEnabled,
    asideOpened,
    asideWidth,
    navbarWidth,
    toggleAside: _toggleAside,
    footerEnabled,
    footerHeight,
    headerEnabled,
    headerHeight,
    mobileNavbarOpened,
    navbarEnabled,
    navbarOpened,
    toggleMobileNavbar,
    toggleNavbar,
  } = useAppLayout();

  return (
    <AppShell
      aside={
        asideEnabled
          ? {
              width: asideWidth,
              breakpoint: "md",
              collapsed: { desktop: !asideOpened, mobile: true },
            }
          : undefined
      }
      footer={footerEnabled ? { height: footerHeight } : undefined}
      layout={layout}
      offsetScrollbars={offsetScrollbars}
      transitionDuration={transitionDuration}
      transitionTimingFunction={transitionTimingFunction}
      withBorder={withBorder}
      className={classes.layout}
      disabled={disabled}
      header={headerEnabled ? { height: headerHeight } : undefined}
      navbar={
        navbarEnabled
          ? {
              width: navbarWidth,
              breakpoint: "sm",
              collapsed: {
                desktop: !navbarOpened,
                mobile: !mobileNavbarOpened,
              },
            }
          : undefined
      }
      padding={padding}
      zIndex={zIndex}
      {...otherProps}
    >
      {headerEnabled && (
        <AppShell.Header className={classes.header}>
          <AppLayoutHeader
            _locale={locale}
            featuredCollection={featuredCollection}
            locale={locale}
            mobileNavbarOpened={mobileNavbarOpened}
            navigationMenu={navigationMenu}
            toggleMobileNavbar={toggleMobileNavbar}
            toggleNavbar={toggleNavbar}
            dict={dict}
            navbarOpened={navbarOpened}
          />
        </AppShell.Header>
      )}

      {navbarEnabled && (
        <AppShell.Navbar className={classes.navbar} p="md">
          <Text fw={500} mb="md" size="sm">
            {dict?.app?.navigation || "Navigation"}
          </Text>

          <NavLink
            href={`/${locale}` as any}
            component={Link}
            active={pathname === `/${locale}`}
            label={dict?.app?.home || "Home"}
            mb="xs"
          />

          <NavLink
            href={`/${locale}/about` as any}
            component={Link}
            active={pathname === `/${locale}/about`}
            label={dict?.app?.about || "About"}
            mb="xs"
          />
        </AppShell.Navbar>
      )}

      <AppShell.Main className={classes.main}>{children}</AppShell.Main>

      {asideEnabled && (
        <AppShell.Aside className={classes.aside} p="md">
          <div id="aside-portal-target" className={classes.asidePortalTarget} />
        </AppShell.Aside>
      )}

      {footerEnabled && (
        <AppShell.Footer className={classes.footer} p="md">
          <Group justify="space-between">
            <Text c="dimmed" size="sm">
              © 2024 {dict?.app?.brand || "Web New App"}.{" "}
              {dict?.app?.allRightsReserved || "All rights reserved."}
            </Text>
            <Group gap="xs">
              <Text c="dimmed" size="sm">
                {dict?.app?.madeWith || "Made with"} ❤️ {dict?.app?.by || "by"}{" "}
                {dict?.app?.team || "the team"}
              </Text>
            </Group>
          </Group>
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
