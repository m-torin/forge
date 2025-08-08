'use client';

import { AnalyticsEvents, trackEvent } from '#/lib/analytics';
import type { Locale } from '#/lib/i18n';
import { ActionIcon, Menu } from '@mantine/core';
import { useLocale, usePathname, useRouter } from '@repo/internationalization/client/next';
import { logInfo, logWarn } from '@repo/observability';
import { IconLanguage } from '@tabler/icons-react';

const languages = [
  { code: 'en', name: '🇺🇸 English' },
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'de', name: '🇩🇪 Deutsch' },
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'pt', name: '🇵🇹 Português' },
] as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleLanguageChange = async (locale: Locale) => {
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

      // Use the next-intl router to change locale with the current pathname
      router.replace(pathname, { locale });

      logInfo('[Language Switcher] Language changed', {
        from: currentLocale,
        to: locale,
      });
    } catch (error) {
      logWarn('Language change tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Still change locale even if tracking fails
      router.replace(pathname, { locale });
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
            onClick={() => handleLanguageChange(lang.code as Locale)}
            bg={currentLocale === lang.code ? 'var(--mantine-color-blue-light)' : undefined}
          >
            {lang.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
