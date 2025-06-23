"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Menu, Text, Group } from "@mantine/core";
import { IconChevronDown, IconLanguage } from "@tabler/icons-react";
import type { ExtendedDictionary } from "@/i18n";
// Import locales from shared constants to avoid server-only imports
const locales = ["en", "es", "fr", "de", "pt"] as const;

interface LanguageSwitcherProps {
  currentLocale: string;
  dictionary: ExtendedDictionary;
  "data-testid"?: string;
}

const localeNames = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
} as const;

export function LanguageSwitcher({
  currentLocale,
  dictionary,
  "data-testid": testId = "language-switcher",
}: LanguageSwitcherProps): React.JSX.Element {
  const [opened, setOpened] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split("/");

    // Remove current locale from path if it exists
    if (
      segments[1] &&
      locales.includes(segments[1] as (typeof locales)[number])
    ) {
      segments.splice(1, 1);
    }

    // Construct new path
    let newPath = segments.join("/") || "/";

    // Add new locale prefix (except for English which is default)
    if (newLocale !== "en") {
      newPath = `/${newLocale}${newPath}`;
    }

    // Ensure path starts with /
    if (!newPath.startsWith("/")) {
      newPath = "/" + newPath;
    }

    router.push(newPath);
    setOpened(false);
  };

  return (
    <Menu opened={opened} onChange={setOpened} position="bottom-end">
      <Menu.Target>
        <Button
          variant="subtle"
          rightSection={<IconChevronDown size={16} />}
          data-testid={testId}
        >
          <Group gap="xs">
            <IconLanguage size={16} />
            <Text size="sm">
              {localeNames[currentLocale as keyof typeof localeNames] ||
                currentLocale}
            </Text>
          </Group>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{dictionary.common.selectLanguage}</Menu.Label>
        {locales.map((locale) => (
          <Menu.Item
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            data-testid={`language-option-${locale}`}
            style={{
              backgroundColor:
                locale === currentLocale
                  ? "var(--mantine-color-blue-light)"
                  : undefined,
            }}
          >
            {localeNames[locale as keyof typeof localeNames]}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
