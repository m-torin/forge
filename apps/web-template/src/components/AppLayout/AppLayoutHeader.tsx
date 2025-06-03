"use client";

import { ColorSchemesSwitcher } from "@/components/color-schemes-switcher";
import LocaleSwitcher from "@/components/locale-switcher";
import { Burger, Group } from "@mantine/core";
import Image from "next/image";

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
    <Group h="100%" justify="space-between" px="md">
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
        <Image
          width={100}
          className="dark:invert"
          alt={dict?.app?.logoAlt || "logo"}
          height={100}
          src="https://nextjs.org/icons/next.svg"
        />
      </Group>
      <Group>
        {locale && dict && (
          <LocaleSwitcher
            currentLocale={locale}
            selectLanguagePlaceholder={
              dict.app?.selectLanguage || "Select language"
            }
            languages={{
              de: dict.app?.l?.de || "German",
              en: dict.app?.l?.en || "English",
              esMX: dict.app?.l?.esMX || "Spanish (Mexico)",
              frCA: dict.app?.l?.frCA || "Français (Canada)",
              ptBR: dict.app?.l?.ptBR || "Portuguese (Brazil)",
            }}
          />
        )}
        <ColorSchemesSwitcher />
      </Group>
    </Group>
  );
}
