'use client';

import {
  Modal,
  TextInput,
  Stack,
  Text,
  Group,
  UnstyledButton,
  Badge,
  rem,
  ThemeIcon,
  Box,
  Divider,
} from '@mantine/core';
import {
  IconSearch,
  IconFileText,
  IconPackage,
  IconRocket,
  IconUsers,
  IconSettings,
  IconFlag,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const searchResults = [
  {
    category: 'Workflows',
    icon: IconRocket,
    color: 'blue',
    items: [
      { title: 'Product Classification', href: '/workflows/product-classification' },
      { title: 'Batch Processing', href: '/workflows/batch-processing' },
      { title: 'Schedules', href: '/workflows/schedules' },
    ],
  },
  {
    category: 'PIM',
    icon: IconPackage,
    color: 'green',
    items: [
      { title: 'Product Catalog', href: '/pim' },
      { title: 'Taxonomy', href: '/pim/taxonomy' },
    ],
  },
  {
    category: 'Settings',
    icon: IconSettings,
    color: 'gray',
    items: [
      { title: 'General Settings', href: '/settings' },
      { title: 'Security', href: '/settings/security' },
    ],
  },
];

interface SearchModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SearchModal({ opened, onClose }: SearchModalProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
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
        item.title.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      size="lg"
      padding={0}
      radius="md"
      withCloseButton={false}
      styles={{
        body: { padding: 0 },
        header: { padding: 0 },
      }}
    >
      <Box>
        <TextInput
          placeholder="Search for anything..."
          leftSection={<IconSearch size={20} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="lg"
          styles={{
            input: {
              border: 'none',
              borderRadius: 0,
              borderBottom: '1px solid var(--mantine-color-gray-2)',
            },
          }}
          autoFocus
        />
        
        <Box p="md" style={{ maxHeight: rem(400), overflowY: 'auto' }}>
          {search === '' ? (
            <Stack gap="lg">
              <Text size="sm" c="dimmed">
                Quick actions
              </Text>
              {searchResults.map((category) => (
                <div key={category.category}>
                  <Group gap="xs" mb="sm">
                    <ThemeIcon size="sm" variant="light" color={category.color}>
                      <category.icon size={14} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>
                      {category.category}
                    </Text>
                  </Group>
                  <Stack gap={4}>
                    {category.items.slice(0, 2).map((item) => (
                      <UnstyledButton
                        key={item.href}
                        onClick={() => handleSelect(item.href)}
                        p="xs"
                        styles={{
                          root: {
                            borderRadius: rem(6),
                            '&:hover': {
                              backgroundColor: 'var(--mantine-color-gray-0)',
                            },
                          },
                        }}
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
                    <ThemeIcon size="sm" variant="light" color={category.color}>
                      <category.icon size={14} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>
                      {category.category}
                    </Text>
                  </Group>
                  <Stack gap={4}>
                    {category.items.map((item) => (
                      <UnstyledButton
                        key={item.href}
                        onClick={() => handleSelect(item.href)}
                        p="xs"
                        styles={{
                          root: {
                            borderRadius: rem(6),
                            '&:hover': {
                              backgroundColor: 'var(--mantine-color-gray-0)',
                            },
                          },
                        }}
                      >
                        <Text size="sm">{item.title}</Text>
                      </UnstyledButton>
                    ))}
                  </Stack>
                </div>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              No results found for "{search}"
            </Text>
          )}
        </Box>
        
        <Divider />
        
        <Group justify="space-between" p="sm" gap="xs">
          <Group gap="xs">
            <Badge size="xs" variant="light" color="gray">
              ESC
            </Badge>
            <Text size="xs" c="dimmed">to close</Text>
          </Group>
          <Group gap="xs">
            <Badge size="xs" variant="light" color="gray">
              ↑↓
            </Badge>
            <Text size="xs" c="dimmed">to navigate</Text>
            <Badge size="xs" variant="light" color="gray">
              Enter
            </Badge>
            <Text size="xs" c="dimmed">to select</Text>
          </Group>
        </Group>
      </Box>
    </Modal>
  );
}