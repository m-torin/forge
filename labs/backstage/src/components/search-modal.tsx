'use client';

import {
  Badge,
  Box,
  Divider,
  Group,
  Modal,
  rem,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconPackage, IconRocket, IconSearch, IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const searchResults = [
  {
    category: 'Workflows',
    color: 'blue',
    icon: IconRocket,
    items: [
      { href: '/workflows/product-classification', title: 'Product Classification' },
      { href: '/workflows/batch-processing', title: 'Batch Processing' },
      { href: '/workflows/schedules', title: 'Schedules' },
    ],
  },
  {
    category: 'PIM',
    color: 'green',
    icon: IconPackage,
    items: [
      { href: '/pim', title: 'Product Catalog' },
      { href: '/pim/taxonomy', title: 'Taxonomy' },
    ],
  },
  {
    category: 'Settings',
    color: 'gray',
    icon: IconSettings,
    items: [
      { href: '/settings', title: 'General Settings' },
      { href: '/settings/security', title: 'Security' },
    ],
  },
];

interface SearchModalProps {
  onClose: () => void;
  opened: boolean;
}

export function SearchModal({ onClose, opened }: SearchModalProps) {
  const [search, setSearch] = useState('');
  const [_selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (opened) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [opened]);

  const filteredResults = searchResults
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0);

  const handleSelect = (href: string) => {
    router.push(href as any);
    onClose();
  };

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      withCloseButton={false}
      styles={{
        body: { padding: 0 },
        header: { padding: 0 },
      }}
      padding={0}
      radius="md"
      size="lg"
      title={null}
    >
      <Box>
        <TextInput
          autoFocus
          leftSection={<IconSearch size={20} />}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for anything..."
          styles={{
            input: {
              border: 'none',
              borderBottom: '1px solid var(--mantine-color-gray-2)',
              borderRadius: 0,
            },
          }}
          size="lg"
          value={search}
        />

        <Box style={{ maxHeight: rem(400), overflowY: 'auto' }} p="md">
          {search === '' ? (
            <Stack gap="lg">
              <Text c="dimmed" size="sm">
                Quick actions
              </Text>
              {searchResults.map((category) => (
                <div key={category.category}>
                  <Group gap="xs" mb="sm">
                    <ThemeIcon color={category.color} size="sm" variant="light">
                      <category.icon size={14} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">
                      {category.category}
                    </Text>
                  </Group>
                  <Stack gap={4}>
                    {category.items.slice(0, 2).map((item) => (
                      <UnstyledButton
                        key={item.href}
                        onClick={() => handleSelect(item.href)}
                        styles={{
                          root: {
                            '&:hover': {
                              backgroundColor: 'var(--mantine-color-gray-0)',
                            },
                            borderRadius: rem(6),
                          },
                        }}
                        p="xs"
                      >
                        <Text size="sm">{item.title}</Text>
                      </UnstyledButton>
                    ))}
                  </Stack>
                </div>
              ))}
            </Stack>
          ) : filteredResults.length > 0 ? (
            <Stack gap="lg">
              {filteredResults.map((category) => (
                <div key={category.category}>
                  <Group gap="xs" mb="sm">
                    <ThemeIcon color={category.color} size="sm" variant="light">
                      <category.icon size={14} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">
                      {category.category}
                    </Text>
                  </Group>
                  <Stack gap={4}>
                    {category.items.map((item) => (
                      <UnstyledButton
                        key={item.href}
                        onClick={() => handleSelect(item.href)}
                        styles={{
                          root: {
                            '&:hover': {
                              backgroundColor: 'var(--mantine-color-gray-0)',
                            },
                            borderRadius: rem(6),
                          },
                        }}
                        p="xs"
                      >
                        <Text size="sm">{item.title}</Text>
                      </UnstyledButton>
                    ))}
                  </Stack>
                </div>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" py="xl" ta="center">
              No results found for "{search}"
            </Text>
          )}
        </Box>

        <Divider />

        <Group gap="xs" justify="space-between" p="sm">
          <Group gap="xs">
            <Badge color="gray" size="xs" variant="light">
              ESC
            </Badge>
            <Text c="dimmed" size="xs">
              to close
            </Text>
          </Group>
          <Group gap="xs">
            <Badge color="gray" size="xs" variant="light">
              ↑↓
            </Badge>
            <Text c="dimmed" size="xs">
              to navigate
            </Text>
            <Badge color="gray" size="xs" variant="light">
              Enter
            </Badge>
            <Text c="dimmed" size="xs">
              to select
            </Text>
          </Group>
        </Group>
      </Box>
    </Modal>
  );
}
