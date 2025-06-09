"use client";

import LocalizedHeader2 from "@/components/LocalizedHeader2";
import { Burger, Flex } from "@mantine/core";

import type { TCollection, TNavigationItem } from "@/lib/data-service";

interface AppLayoutHeaderProps {
  _dict?: any;
  _locale?: string;
  dict?: any;
  featuredCollection?: TCollection;
  locale?: string;
  mobileNavbarOpened: boolean;
  navbarOpened: boolean;
  navigationMenu?: TNavigationItem[];
  toggleMobileNavbar: () => void;
  toggleNavbar: () => void;
}

export function AppLayoutHeader({
  _dict: __dict,
  _locale: __locale,
  dict: _dict,
  featuredCollection,
  locale = "en",
  mobileNavbarOpened,
  navbarOpened,
  navigationMenu,
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

      {/* Header2 - takes remaining space */}
      <div className="flex-grow h-full">
        <LocalizedHeader2
          featuredCollection={featuredCollection}
          locale={locale}
          navigationMenu={navigationMenu}
        />
      </div>
    </Flex>
  );
}
