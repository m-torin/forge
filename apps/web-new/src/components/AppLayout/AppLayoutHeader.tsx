"use client";

import { Burger, Group } from "@mantine/core";

interface AppLayoutHeaderProps {
  dict?: any;
  locale?: string;
  mobileNavbarOpened: boolean;
  navbarOpened: boolean;
  toggleMobileNavbar: () => void;
  toggleNavbar: () => void;
}

export function AppLayoutHeader({
  dict,
  locale,
  mobileNavbarOpened,
  navbarOpened,
  toggleMobileNavbar,
  toggleNavbar,
}: AppLayoutHeaderProps) {
  return (
    <div className="h-full relative">
      {/* Navigation Controls - positioned absolutely over the header */}
      <div className="absolute top-0 left-0 z-50 p-4">
        <Group>
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
        </Group>
      </div>
      
      {/* Portal target for Header2 */}
      <div id="header-portal-target" className="h-full" />
    </div>
  );
}
