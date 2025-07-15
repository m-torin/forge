'use client';

import { AnalyticsEvents, trackEvent } from '#/lib/analytics';
import type { Locale } from '#/lib/i18n';
import { ActionIcon, Menu } from '@mantine/core';
import type { Route } from 'next';
import { logInfo, logWarn } from '@repo/observability';
import { IconLanguage } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

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

  const handleLanguageChange = async (locale: string) => {
    try {
      // Track the language change event
      await trackEvent(AnalyticsEvents.LANGUAGE_CHANGED, {
        new_language: locale,
        previous_language: currentLocale,
        path: pathname,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        triggered_by: 'language_switcher',
        available_languages: languages.map(lang => lang.code),
      });

      // Perform the navigation
      const currentPath = pathname.split('/').slice(2).join('/');
      const newPath = `/${locale}${currentPath ? `/${currentPath}` : ''}`;
      router.push(newPath as Route);

      logInfo('[Language Switcher] Language changed', {
        from: currentLocale,
        to: locale,
        newPath,
      });
    } catch (error) {
      logWarn('Language change tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Still navigate even if tracking fails
      const currentPath = pathname.split('/').slice(2).join('/');
      const newPath = `/${locale}${currentPath ? `/${currentPath}` : ''}`;
      router.push(newPath as Route);
    }
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
        {languages.map(lang => (
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
