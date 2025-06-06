"use client";

import { Burger, Flex } from "@mantine/core";

interface AppLayoutHeaderProps {
  _dict?: any;
  _locale?: string;
  dict?: any;
  mobileNavbarOpened: boolean;
  navbarOpened: boolean;
  toggleMobileNavbar: () => void;
  toggleNavbar: () => void;
}

export function AppLayoutHeader({
  _dict: __dict,
  _locale: __locale,
  dict: _dict,
  mobileNavbarOpened,
  navbarOpened,
  toggleMobileNavbar,
  toggleNavbar,
}: AppLayoutHeaderProps) {
  return (
    <Flex align="center" h="100%">
      {/* Navigation Controls - hamburger menus */}
      <Flex gap="xs" p="md">
        <Burger
          hiddenFrom="sm"
          onClick={toggleMobileNavbar}
          opened={mobileNavbarOpened}
          size="sm"
        />
        <Burger
          onClick={toggleNavbar}
          opened={navbarOpened}
          visibleFrom="sm"
          size="sm"
        />
      </Flex>

      {/* Portal target for Header2 - takes remaining space */}
      <div id="header-portal-target" className="flex-grow h-full" />
    </Flex>
  );
}
