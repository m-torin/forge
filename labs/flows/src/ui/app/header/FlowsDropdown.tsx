'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  HoverCard,
  Button,
  Text,
  SimpleGrid,
  Anchor,
  Divider,
  Center,
  Box,
  rem,
  useMantineTheme,
  ThemeIcon,
  Flex,
} from '@mantine/core';
import {
  IconChevronDown,
  IconCode,
  IconCoin,
  IconFingerprint,
  IconNotification,
} from '@tabler/icons-react';
import classes from './AppHeader.module.scss';
import React from 'react';
import Link from 'next/link';

export const linkData = [
  {
    icon: IconCode,
    title: 'All Flows',
    href: '/flows',
  },
  {
    icon: IconCoin,
    title: 'Integrations',
    description: '3rd party services',
    href: '/integrations/databases',
  },
  {
    icon: IconNotification,
    title: 'Logs & Notifications',
    description: 'App-wide events',
    href: '/logs',
  },
  {
    icon: IconFingerprint,
    title: 'Secrets & Credentials',
    description: 'Cross-flow variables',
    href: '/integrations/secrets',
  },
];

// Link Component
const NavLink: React.FC<{
  href: string;
  title: string;
  description?: string;
  Icon: React.ElementType;
}> = ({ href, title, description, Icon }) => {
  const router = useRouter();

  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router.push(href);
  };

  return (
    <a className={classes.subLink} href={href} onClick={handleNavigation}>
      <Flex wrap="nowrap" align="center" mb="xs">
        <ThemeIcon size={34} variant="default" radius="md">
          <Icon style={{ width: rem(22), height: rem(22) }} />
        </ThemeIcon>
        <Box ml={rem(15)}>
          <Text size="sm" fw={500}>
            {title}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </Box>
      </Flex>
    </a>
  );
};

export const AppHeaderMenuBar: React.FC = () => {
  const theme = useMantineTheme();
  const _pathname = usePathname();

  const cyanColor = theme.colors.cyan[6];

  // const isFlowPage = (str: string) => /\/flow/.test(str);
  // if (isFlowPage(pathname)) return null;

  return (
    <Flex gap="0">
      <HoverCard
        width={500}
        position="bottom"
        radius="md"
        shadow="md"
        withinPortal
      >
        <HoverCard.Target>
          <Anchor component={Link} href="/flows" className={classes.link}>
            <Center inline>
              <Box component="span" mr={5}>
                Flows
              </Box>
              <IconChevronDown
                style={{ width: rem(16), height: rem(16) }}
                color={cyanColor}
              />
            </Center>
          </Anchor>
        </HoverCard.Target>

        <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
          <Flex justify="space-between" px="md">
            <Text fw={500}>Flows on Demo</Text>
          </Flex>

          <Divider my="sm" />

          <SimpleGrid cols={2} spacing="sm">
            {linkData.map((item) => (
              <NavLink
                key={item.title}
                href={item.href}
                title={item.title}
                {...(item.description && { description: item.description })}
                Icon={item.icon}
              />
            ))}
          </SimpleGrid>

          <div className={classes.dropdownFooter}>
            <Flex justify="space-between">
              <Box>
                <Text fw={500} fz="sm">
                  Get started
                </Text>
                <Text size="xs" c="dimmed">
                  Create a new flow or fork an existing one.
                </Text>
              </Box>
              <Button variant="default" component={Link} href="/flows/new">
                Create a Flow
              </Button>
            </Flex>
          </div>
        </HoverCard.Dropdown>
      </HoverCard>

      <Anchor component={Link} href="/tags" className={classes.link}>
        Tags
      </Anchor>
      <Anchor component={Link} href="/monitoring" className={classes.link}>
        Monitoring
      </Anchor>
      <Anchor component={Link} href="/auditing" className={classes.link}>
        Auditing
      </Anchor>
    </Flex>
  );
};
