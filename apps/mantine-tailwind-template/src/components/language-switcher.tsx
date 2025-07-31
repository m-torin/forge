'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import type { Locale } from '../lib/i18n';

const languages = [
  { code: 'en', name: '🇺🇸 English' },
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'de', name: '🇩🇪 Deutsch' },
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'pt', name: '🇵🇹 Português' },
] as const;

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (locale: string) => {
    const currentPath = pathname.split('/').slice(2).join('/');
    const newPath = `/${locale}${currentPath ? `/${currentPath}` : ''}`;
    router.push(newPath);
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg">
          <IconLanguage size={18} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Select Language</Menu.Label>
        {languages.map((lang) => (
          <Menu.Item
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            bg={currentLocale === lang.code ? 'var(--mantine-color-blue-light)' : undefined}
          >
            {lang.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}