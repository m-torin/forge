'use client';

import { Select, Skeleton } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Define available locales based on languine.json configuration
const locales = ['en', 'es', 'de', 'zh', 'fr', 'pt'] as const;
type Locale = (typeof locales)[number];

interface LocaleSwitcherProps {
  currentLocale: string;
  languages: Record<string, string>;
  selectLanguagePlaceholder: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for LocaleSwitcher
function LocaleSwitcherSkeleton() {
  return <Skeleton height={36} width={180} radius="sm" />;
}

// Error state for LocaleSwitcher
function LocaleSwitcherError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Select
      data={[]}
      disabled
      placeholder="Language error"
      size="md"
      w={180}
      error="Language switcher unavailable"
      rightSection={<IconAlertTriangle size={16} color="red" />}
    />
  );
}

export default function LocaleSwitcher({
  currentLocale,
  languages,
  selectLanguagePlaceholder,
  loading = false,
  error,
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <LocaleSwitcherSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <LocaleSwitcherError error={currentError} onRetry={() => setInternalError(null)} />;
  }

  // Dynamically create language options from available locales
  const languageOptions = locales.map((locale) => ({
    label: languages[locale] || locale,
    value: locale,
  }));

  const handleLocaleChange = (value: null | string) => {
    try {
      if (!value || !locales.includes(value as Locale)) return;

      startTransition(() => {
        try {
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
        } catch (error) {
          console.error('Locale navigation error:', error);
          setInternalError('Failed to change language');
        }
      });
    } catch (error) {
      console.error('Locale change error:', error);
      setInternalError('Failed to change language');
    }
  };

  return (
    <ErrorBoundary fallback={<LocaleSwitcherError error="Language switcher failed to render" />}>
      <Select
        data={languageOptions}
        disabled={isPending}
        placeholder={selectLanguagePlaceholder}
        size="md"
        value={currentLocale}
        w={180}
        onChange={handleLocaleChange}
      />
    </ErrorBoundary>
  );
}
