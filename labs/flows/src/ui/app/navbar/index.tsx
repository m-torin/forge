'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  IconDatabaseImport,
  IconFingerprint,
  IconLogout,
  IconBrandAws,
  IconSettings,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Group, Stack, Title } from '@mantine/core';
import classes from './NavbarSimpleColored.module.scss';

const data = [
  {
    link: '/integrations/eventbridge/bus',
    label: 'EventBridge',
    icon: IconBrandAws,
  },
  {
    link: '/integrations/databases',
    label: 'Databases',
    icon: IconDatabaseImport,
  },
  { link: '/integrations/secrets', label: 'Secrets', icon: IconFingerprint },
  { link: '/integrations/other', label: 'Other Settings', icon: IconSettings },
];

export function NavbarSimpleColored() {
  const pathname = usePathname(); // Get the current route
  const router = useRouter();

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={pathname === item.link || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        router.push(item.link); // Navigate to the new route
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Title className={classes.title} order={3}>
            Integrations
          </Title>
        </Group>

        <Stack gap="sm">{links}</Stack>
      </div>

      <div className={classes.footer}>
        <button
          type="button"
          className={classes.link}
          onClick={(event) => event.preventDefault()}
        >
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change instance</span>
        </button>

        <button
          type="button"
          className={classes.link}
          onClick={(event) => event.preventDefault()}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
