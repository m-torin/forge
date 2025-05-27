'use client';

import { env } from '@/env';
import {
  AppShell,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconArrowRight, IconMenu2, IconX } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ModeToggle } from '@repo/design-system/components/mode-toggle';

import { LanguageSwitcher } from './language-switcher';
import Logo from './logo.svg';

import type { Dictionary } from '@repo/internationalization';
import type { Route } from 'next';

interface HeaderProps {
  dictionary: Dictionary;
}

export const Header = ({ dictionary }: HeaderProps) => {
  const navigationItems = [
    {
      description: '',
      href: '/',
      title: dictionary.web.header.home,
    },
    {
      description: dictionary.web.header.product.description,
      items: [
        {
          href: '/pricing',
          title: dictionary.web.header.product.pricing,
        },
      ],
      title: dictionary.web.header.product.title,
    },
    {
      description: '',
      href: '/blog',
      title: dictionary.web.header.blog,
    },
  ];

  if (env.NEXT_PUBLIC_DOCS_URL) {
    navigationItems.push({
      description: '',
      href: env.NEXT_PUBLIC_DOCS_URL,
      title: dictionary.web.header.docs,
    });
  }

  const [drawerOpened, setDrawerOpened] = useState(false);

  return (
    <AppShell.Header
      withBorder
      styles={{
        header: {
          position: 'sticky',
          top: 0,
          zIndex: 40,
        },
      }}
    >
      <Container h={80} size="lg">
        <Group h="100%" justify="space-between">
          {/* Desktop Navigation */}
          <Group visibleFrom="lg">
            {navigationItems.map((item) => (
              <Box key={item.title}>
                {item.href ? (
                  <Button href={item.href as Route} color="gray" component={Link} variant="subtle">
                    {item.title}
                  </Button>
                ) : (
                  <Menu width={450} position="bottom-start" trigger="hover">
                    <Menu.Target>
                      <Button color="gray" fw={500} size="sm" variant="subtle">
                        {item.title}
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown p="md">
                      <Group gap="xl">
                        <Stack style={{ flex: 1 }} justify="space-between">
                          <Stack gap={4}>
                            <Text size="md">{item.title}</Text>
                            <Text c="dimmed" size="sm">
                              {item.description}
                            </Text>
                          </Stack>
                          <Button href="/contact" component={Link} mt="xl" size="sm">
                            {dictionary.web.global.primaryCta}
                          </Button>
                        </Stack>
                        <Stack style={{ flex: 1 }} gap={4} justify="flex-end">
                          {item.items?.map((subItem, idx) => (
                            <UnstyledButton
                              key={idx}
                              href={subItem.href as Route}
                              component={Link}
                              style={{
                                '&:hover': {
                                  backgroundColor: 'var(--mantine-color-gray-light)',
                                },
                                borderRadius: 'var(--mantine-radius-default)',
                              }}
                              p="xs"
                              px="md"
                            >
                              <Group justify="space-between">
                                <Text size="sm">{subItem.title}</Text>
                                <IconArrowRight color="var(--mantine-color-dimmed)" size={16} />
                              </Group>
                            </UnstyledButton>
                          ))}
                        </Stack>
                      </Group>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Box>
            ))}
          </Group>

          {/* Logo */}
          <Group gap="xs">
            <Image
              width={24}
              style={{ filter: 'var(--dark-mode-logo-filter, none)' }}
              alt="Logo"
              height={24}
              src={Logo}
            />
            <Text style={{ whiteSpace: 'nowrap' }} fw={600}>
              forge
            </Text>
          </Group>

          {/* Right side actions */}
          <Group>
            <Button href="/contact" color="gray" component={Link} visibleFrom="md" variant="subtle">
              {dictionary.web.header.contact}
            </Button>

            <Divider orientation="vertical" visibleFrom="md" />

            <Box visibleFrom="md">
              <LanguageSwitcher />
            </Box>

            <Box visibleFrom="md">
              <ModeToggle />
            </Box>

            <Button
              href={`${env.NEXT_PUBLIC_APP_URL}/sign-in` as Route}
              component={Link}
              visibleFrom="md"
              variant="default"
            >
              {dictionary.web.header.signIn}
            </Button>

            <Button href={`${env.NEXT_PUBLIC_APP_URL}/sign-up` as Route} component={Link}>
              {dictionary.web.header.signUp}
            </Button>

            {/* Mobile menu button */}
            <Button
              hiddenFrom="lg"
              color="gray"
              onClick={() => setDrawerOpened(!drawerOpened)}
              px="xs"
              variant="subtle"
            >
              {drawerOpened ? <IconX size={20} /> : <IconMenu2 size={20} />}
            </Button>
          </Group>
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        onClose={() => setDrawerOpened(false)}
        opened={drawerOpened}
        position="top"
        withCloseButton={false}
        styles={{
          body: { paddingTop: 0 },
        }}
        size="auto"
      >
        <Container py="md">
          <Stack gap="xl">
            {navigationItems.map((item) => (
              <Stack key={item.title} gap="xs">
                {item.href ? (
                  <UnstyledButton
                    href={item.href as Route}
                    component={Link}
                    onClick={() => setDrawerOpened(false)}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                  >
                    <Group justify="space-between">
                      <Text size="lg">{item.title}</Text>
                      <IconArrowRight color="var(--mantine-color-dimmed)" stroke={1} size={16} />
                    </Group>
                  </UnstyledButton>
                ) : (
                  <Text size="lg">{item.title}</Text>
                )}
                {item.items?.map((subItem) => (
                  <UnstyledButton
                    key={subItem.title}
                    href={subItem.href as Route}
                    component={Link}
                    onClick={() => setDrawerOpened(false)}
                  >
                    <Group justify="space-between">
                      <Text c="dimmed">{subItem.title}</Text>
                      <IconArrowRight stroke={1} size={16} />
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>
            ))}
          </Stack>
        </Container>
      </Drawer>
    </AppShell.Header>
  );
};
