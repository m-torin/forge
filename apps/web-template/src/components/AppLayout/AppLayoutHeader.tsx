"use client";

import { Anchor, Burger, Flex, Group } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import LocaleSwitcher from "@/components/locale-switcher";
import { ColorSchemesSwitcher } from "@/components/color-schemes-switcher";

import type { TCollection, TNavigationItem } from "@/types";

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

      {/* Header content - takes remaining space */}
      <Group className="flex-grow h-full px-md" justify="space-between">
        <Link href={`/${locale}`}>
          <Image
            className="dark:invert"
            src="https://nextjs.org/icons/next.svg"
            alt="logo"
            width={100}
            height={100}
          />
        </Link>
        
        <Group>
          {_dict?.navigation && (
            <>
              <Anchor component={Link} href={`/${locale}`} size="sm">
                {_dict.navigation.home}
              </Anchor>
              <Anchor component={Link} href={`/${locale}/search`} size="sm">
                {_dict.navigation.search}
              </Anchor>
            </>
          )}
          {_dict?.app && (
            <LocaleSwitcher
              currentLocale={locale}
              languages={_dict.app.l}
              selectLanguagePlaceholder={_dict.app.selectLanguage}
            />
          )}
          <ColorSchemesSwitcher />
        </Group>
      </Group>
    </Flex>
  );
}
