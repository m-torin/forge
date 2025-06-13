'use client';

import { Select } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

// Define available locales based on languine.json configuration
const locales = ['en', 'es', 'de', 'zh', 'fr', 'pt'] as const;
type Locale = (typeof locales)[number];

interface LocaleSwitcherProps {
  currentLocale: string;
  languages: Record<string, string>;
  selectLanguagePlaceholder: string;
}

export default function LocaleSwitcher({
  currentLocale,
  languages,
  selectLanguagePlaceholder,
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Dynamically create language options from available locales
  const languageOptions = locales.map((locale) => ({
    label: languages[locale] || locale,
    value: locale,
  }));

  const handleLocaleChange = (value: null | string) => {
    if (!value || !locales.includes(value as Locale)) return;

    startTransition(() => {
      // Get the current path segments
      const segments = pathname.split('/').filter(Boolean);

      // Check if the first segment is a locale
      const hasLocalePrefix = segments.length > 0 && locales.includes(segments[0] as Locale);

      let newPath: string;

      if (hasLocalePrefix) {
        // Replace the existing locale
        segments[0] = value;
        newPath = `/${segments.join('/')}`;
      } else {
        // Add the new locale prefix
        newPath = `/${value}${pathname}`;
      }

      // Handle the root path case
      if (newPath === `/${value}/`) {
        newPath = `/${value}`;
      }

      router.push(newPath);
    });
  };

  return (
    <Select
      data={languageOptions}
      disabled={isPending}
      placeholder={selectLanguagePlaceholder}
      size="md"
      value={currentLocale}
      w={180}
      onChange={handleLocaleChange}
    />
  );
}
