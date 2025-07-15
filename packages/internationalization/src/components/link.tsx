'use client';

import NextLink from 'next/link';
import { useParams } from 'next/navigation';

import type { ComponentProps } from 'react';

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  href: string;
  locale?: string;
};

export function Link({ href, locale, ...props }: LinkProps) {
  const params = useParams();
  const currentLocale = locale || (params?.locale as string) || 'en';

  // If it's an external link or anchor, return as is
  if (href.startsWith('http') || href.startsWith('#')) {
    return <NextLink href={href as any} {...props} />;
  }

  // For default locale (English), don't add locale prefix
  if (currentLocale === 'en') {
    return <NextLink href={href as any} {...props} />;
  }

  // For other locales, add the locale prefix
  const localizedHref = href.startsWith('/')
    ? `/${currentLocale}${href}`
    : `/${currentLocale}/${href}`;

  return <NextLink href={localizedHref as any} {...props} />;
}
