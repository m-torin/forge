'use client';

import { 
  AppShell, 
  Group, 
  TextInput, 
  Title, 
  Menu, 
  Button, 
  rem,
  UnstyledButton,
  Text,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Box,
  Divider,
  Breadcrumbs,
  Anchor,
  useMantineColorScheme
} from '@mantine/core';
import { 
  IconSearch, 
  IconChevronDown,
  IconRocket,
  IconPackage,
  IconFileText,
  IconUsers,
  IconSettings,
  IconFlag,
  IconHome,
  IconLogout,
  IconBell,
  IconSun,
  IconMoon,
  IconCommand
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { useHotkeys } from '@mantine/hooks';
import Link from 'next/link';
import { SearchModal } from './components/search-modal';

const navigationItems = [
  {
    label: 'Dashboard',
    icon: IconHome,
    href: '/',
    color: 'blue'
  },
  {
    label: 'Workflows',
    icon: IconRocket,
    href: '/workflows',
    color: 'violet',
    items: [
      { label: 'Product Classification', href: '/workflows/product-classification' },
      { label: 'Batch Processing', href: '/workflows/batch-processing' },
      { label: 'Schedules', href: '/workflows/schedules' },
      { label: 'Integrations', href: '/workflows/integrations' },
      { label: 'Configuration', href: '/workflows/configuration' },
    ]
  },
  {
    label: 'PIM',
    icon: IconPackage,
    href: '/pim',
    color: 'green',
    items: [
      { label: 'Product Catalog', href: '/pim' },
      { label: 'Taxonomy', href: '/pim/taxonomy' },
      { label: 'Classification', href: '/pim/classification' },
    ]
  },
  {
    label: 'CMS',
    icon: IconFileText,
    href: '/cms',
    color: 'orange',
    items: [
      { label: 'Content Editor', href: '/cms/editor' },
      { label: 'Media Library', href: '/cms/media' },
    ]
  },
  {
    label: 'Guests',
    icon: IconUsers,
    href: '/guests',
    color: 'cyan',
    items: [
      { label: 'Users', href: '/guests' },
      { label: 'Organizations', href: '/guests/organizations' },
    ]
  },
];

const adminItems = [
  {
    label: 'Feature Flags',
    icon: IconFlag,
    href: '/feature-flags',
    color: 'pink'
  },
  {
    label: 'Settings',
    icon: IconSettings,
    href: '/settings',
    color: 'gray',
    items: [
      { label: 'General', href: '/settings' },
      { label: 'Security', href: '/settings/security' },
    ]
  },
];

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [searchOpened, setSearchOpened] = useState(false);
  
  // Keyboard shortcuts
  useHotkeys([
    ['mod+K', () => setSearchOpened(true)],
    ['/', () => setSearchOpened(true)],
  ]);

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ title: 'Home', href: '/' }];
    
    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const navItem = [...navigationItems, ...adminItems].find(item => item.href === currentPath);
      breadcrumbs.push({
        title: navItem?.label || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
        href: currentPath,
      });
    });
    
    return breadcrumbs;
  };

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      styles={{
        main: {
          background: colorScheme === 'dark' 
            ? 'var(--mantine-color-dark-8)' 
            : 'var(--mantine-color-gray-0)',
        },
      }}
    >
      <AppShell.Header styles={{ header: { borderBottom: '1px solid var(--mantine-color-gray-2)' } }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Title order={3}>Backstage Admin</Title>
            
            <Group gap={0}>
              {navigationItems.map((item) => (
                <Menu key={item.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
                  <Menu.Target>
                    <UnstyledButton
                      px="md"
                      py="sm"
                      onClick={() => router.push(item.href)}
                      styles={{
                        root: {
                          borderRadius: rem(4),
                          color: pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) 
                            ? `var(--mantine-color-${item.color}-6)` 
                            : undefined,
                          backgroundColor: pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                            ? `var(--mantine-color-${item.color}-0)` 
                            : undefined,
                          '&:hover': {
                            backgroundColor: 'var(--mantine-color-gray-0)',
                          },
                        }
                      }}
                    >
                      <Group gap="xs">
                        <item.icon size={16} />
                        <Text size="sm" fw={500}>{item.label}</Text>
                        {item.items && <IconChevronDown size={14} />}
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  {item.items && (
                    <Menu.Dropdown>
                      {item.items.map((subItem) => (
                        <Menu.Item
                          key={subItem.href}
                          onClick={() => router.push(subItem.href)}
                          leftSection={<div style={{ width: rem(14) }} />}
                        >
                          {subItem.label}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  )}
                </Menu>
              ))}
            </Group>
          </Group>

          <Group>
            <Tooltip label="Search (⌘K)">
              <ActionIcon
                onClick={() => setSearchOpened(true)}
                variant="subtle"
                color="gray"
                size="lg"
              >
                <IconSearch size={20} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Notifications">
              <ActionIcon variant="subtle" color="gray" size="lg">
                <IconBell size={20} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}>
              <ActionIcon
                onClick={() => toggleColorScheme()}
                variant="subtle"
                color="gray"
                size="lg"
              >
                {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>
            
            <Divider orientation="vertical" />
            
            <Menu trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
              <Menu.Target>
                <Button variant="subtle" color="gray" rightSection={<IconChevronDown size={14} />}>
                  Admin
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Administration</Menu.Label>
                {adminItems.map((item) => (
                  item.items ? (
                    <Menu key={item.label} trigger="hover" position="right-start" withinPortal>
                      <Menu.Target>
                        <Menu.Item
                          rightSection={<IconChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />}
                          leftSection={
                            <ThemeIcon size="sm" variant="light" color={item.color}>
                              <item.icon size={14} />
                            </ThemeIcon>
                          }
                        >
                          {item.label}
                        </Menu.Item>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {item.items.map((subItem) => (
                          <Menu.Item
                            key={subItem.href}
                            onClick={() => router.push(subItem.href)}
                          >
                            {subItem.label}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  ) : (
                    <Menu.Item
                      key={item.label}
                      onClick={() => router.push(item.href)}
                      leftSection={
                        <ThemeIcon size="sm" variant="light" color={item.color}>
                          <item.icon size={14} />
                        </ThemeIcon>
                      }
                    >
                      {item.label}
                    </Menu.Item>
                  )
                ))}
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={() => router.push('/')}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Box className="page-transition">
          {pathname !== '/' && (
            <Breadcrumbs 
              mb="md" 
              separator="›"
              styles={{
                root: {
                  fontSize: rem(14),
                },
                separator: {
                  marginLeft: rem(6),
                  marginRight: rem(6),
                },
              }}
            >
              {getBreadcrumbs().map((item, index) => (
                <Anchor
                  key={item.href}
                  component={Link}
                  href={item.href}
                  size="sm"
                  c={index === getBreadcrumbs().length - 1 ? 'dimmed' : undefined}
                  style={{
                    textDecoration: 'none',
                    fontWeight: index === getBreadcrumbs().length - 1 ? 500 : undefined,
                  }}
                >
                  {item.title}
                </Anchor>
              ))}
            </Breadcrumbs>
          )}
          {children}
        </Box>
      </AppShell.Main>
      
      <SearchModal opened={searchOpened} onClose={() => setSearchOpened(false)} />
    </AppShell>
  );
}
