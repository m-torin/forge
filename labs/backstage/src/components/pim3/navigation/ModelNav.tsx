'use client';

import { Badge, Group, NavLink, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { pimModels, type PimModel } from '@/config/models';

interface ModelNavProps {
  collapsed?: boolean;
}

export function ModelNav({ collapsed = false }: ModelNavProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 200);
  const pathname = usePathname();
  const router = useRouter();

  // Filter models based on search - memoized for performance
  const filteredModels = useMemo(() => {
    if (!debouncedSearch) return pimModels;

    const searchLower = debouncedSearch.toLowerCase();
    return pimModels.filter(
      (model) =>
        model.name.toLowerCase().includes(searchLower) ||
        model.description.toLowerCase().includes(searchLower),
    );
  }, [debouncedSearch]);

  const handleModelClick = (model: PimModel) => {
    router.push(model.path as any);
  };

  const getFeatureBadges = (model: PimModel) => {
    const badges = [];
    if (model.features.hierarchical) badges.push('Tree');
    if (model.features.bulkActions) badges.push('Bulk');
    if (model.features.import) badges.push('Import');
    if (model.features.export) badges.push('Export');
    return badges;
  };

  if (collapsed) {
    return (
      <Stack gap="xs" p="xs">
        {filteredModels.map((model) => {
          const Icon = model.icon;
          const isActive = pathname.startsWith(model.path);

          return (
            <NavLink
              key={model.path}
              onClick={() => handleModelClick(model)}
              active={isActive}
              leftSection={<Icon size={20} />}
              style={{ borderRadius: 8 }}
            />
          );
        })}
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      {/* Header */}
      <div>
        <Title order={4}>PIM Models</Title>
        <Text c="dimmed" size="sm">
          Product Information Management
        </Text>
      </div>

      {/* Search */}
      <TextInput
        leftSection={<IconSearch size={16} />}
        placeholder="Search models..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        size="sm"
      />

      {/* Model List */}
      <Stack gap="xs">
        {filteredModels.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="md">
            No models found
          </Text>
        ) : (
          filteredModels.map((model) => {
            const Icon = model.icon;
            const isActive = pathname.startsWith(model.path);
            const badges = getFeatureBadges(model);

            return (
              <NavLink
                key={model.path}
                onClick={() => handleModelClick(model)}
                active={isActive}
                leftSection={<Icon size={20} />}
                label={
                  <Group justify="space-between" style={{ flex: 1 }}>
                    <div>
                      <Text fw={500} size="sm">
                        {model.name}
                      </Text>
                      <Text c="dimmed" size="xs" lineClamp={1}>
                        {model.description}
                      </Text>
                    </div>
                    {badges.length > 0 && (
                      <Group gap={4}>
                        {badges.slice(0, 2).map((badge) => (
                          <Badge
                            key={badge}
                            size="xs"
                            variant="light"
                            color={isActive ? 'blue' : 'gray'}
                          >
                            {badge}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Group>
                }
                style={{ borderRadius: 8 }}
              />
            );
          })
        )}
      </Stack>
    </Stack>
  );
}
