'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import type { Route } from 'next';

const languages = [
  { label: '🇬🇧 English', value: 'en' },
  { label: '🇪🇸 Español', value: 'es' },
  { label: '🇩🇪 Deutsch', value: 'de' },
  { label: '🇨🇳 中文', value: 'zh' },
  { label: '🇫🇷 Français', value: 'fr' },
  { label: '🇵🇹 Português', value: 'pt' },
];

export const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const switchLanguage = (locale: string) => {
    // Replace the current locale in the pathname with the new one
    const newPathname = pathname.replace(`/${params.locale}`, `/${locale}`);
    router.push(newPathname as Route);
  };

  return (
    <Menu width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon color="gray" aria-label="Switch language" size="lg" variant="subtle">
          <IconLanguage size={20} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {languages.map(({ label, value }) => (
          <Menu.Item key={value} onClick={() => switchLanguage(value)}>
            {label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
