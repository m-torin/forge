'use client';

import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Avatar,
  Button,
  Box,
  Skeleton,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconUsers,
  IconBuilding,
  IconKey,
} from '@tabler/icons-react';
import { useState } from 'react';

interface ResponsiveDataTableProps {
  data: any[];
  loading?: boolean;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  customActions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: (item: any) => void;
    color?: string;
  }>;
  type: 'users' | 'organizations' | 'apiKeys';
}

function UserCard({ user, onView, onEdit, onDelete, customActions }: any) {
  return (
    <Card withBorder p="md" style={{ cursor: 'pointer' }} onClick={() => onView?.(user)}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar radius="xl" size="md">
              {user.name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('') || user.email[0]}
            </Avatar>
            <div>
              <Text fw={500} size="sm" lineClamp={1}>
                {user.name || user.email}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {user.email}
              </Text>
            </div>
          </Group>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onView?.(user)}>
                View Details
              </Menu.Item>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit?.(user)}>
                Edit
              </Menu.Item>
              {customActions?.map((action, index) => (
                <Menu.Item
                  key={index}
                  leftSection={action.icon}
                  color={action.color}
                  onClick={() => action.onClick(user)}
                >
                  {action.label}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete?.(user)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group gap="xs">
          <Badge
            color={user.role === 'admin' || user.role === 'super-admin' ? 'red' : 'blue'}
            variant="light"
            size="sm"
          >
            {user.role}
          </Badge>
          <Badge color={user.banned ? 'red' : 'green'} variant="dot" size="sm">
            {user.banned ? 'Banned' : 'Active'}
          </Badge>
        </Group>

        {user.organizations && user.organizations.length > 0 && (
          <Text size="xs" c="dimmed">
            {user.organizations.length} organization(s)
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function OrganizationCard({ org, onView, onEdit, onDelete, customActions }: any) {
  return (
    <Card withBorder p="md" style={{ cursor: 'pointer' }} onClick={() => onView?.(org)}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar radius="xl" size="md" color="blue">
              <IconBuilding size={20} />
            </Avatar>
            <div>
              <Text fw={500} size="sm" lineClamp={1}>
                {org.name}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {org.slug}
              </Text>
            </div>
          </Group>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onView?.(org)}>
                View Details
              </Menu.Item>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit?.(org)}>
                Edit
              </Menu.Item>
              {customActions?.map((action, index) => (
                <Menu.Item
                  key={index}
                  leftSection={action.icon}
                  color={action.color}
                  onClick={() => action.onClick(org)}
                >
                  {action.label}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete?.(org)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group gap="xs" wrap="wrap">
          <Badge color="blue" variant="light" size="sm">
            {org._count?.members || 0} members
          </Badge>
          {org._count?.invitations > 0 && (
            <Badge color="orange" variant="light" size="sm">
              {org._count.invitations} pending
            </Badge>
          )}
        </Group>

        {org.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {org.description}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function ApiKeyCard({ apiKey, onView, onEdit, onDelete, customActions }: any) {
  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();

  return (
    <Card withBorder p="md" style={{ cursor: 'pointer' }} onClick={() => onView?.(apiKey)}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar radius="xl" size="md" color="orange">
              <IconKey size={20} />
            </Avatar>
            <div>
              <Text fw={500} size="sm" lineClamp={1}>
                {apiKey.name}
              </Text>
              <Text size="xs" c="dimmed" family="monospace">
                {apiKey.prefix || 'forge'}_****{apiKey.start || '****'}
              </Text>
            </div>
          </Group>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onView?.(apiKey)}>
                View Details
              </Menu.Item>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit?.(apiKey)}>
                Edit
              </Menu.Item>
              {customActions?.map((action, index) => (
                <Menu.Item
                  key={index}
                  leftSection={action.icon}
                  color={action.color}
                  onClick={() => action.onClick(apiKey)}
                >
                  {action.label}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete?.(apiKey)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group gap="xs" wrap="wrap">
          <Badge
            color={isExpired ? 'red' : apiKey.enabled ? 'green' : 'gray'}
            variant="dot"
            size="sm"
          >
            {isExpired ? 'Expired' : apiKey.enabled ? 'Active' : 'Disabled'}
          </Badge>
          {apiKey.metadata?.type && (
            <Badge
              color={apiKey.metadata.type === 'service' ? 'orange' : 'blue'}
              variant="light"
              size="sm"
            >
              {apiKey.metadata.type}
            </Badge>
          )}
        </Group>

        <Group gap="xs" wrap="wrap">
          {(apiKey.permissions || ['read']).slice(0, 2).map((permission: string) => (
            <Badge key={permission} size="xs" variant="outline">
              {permission}
            </Badge>
          ))}
          {(apiKey.permissions || []).length > 2 && (
            <Text size="xs" c="dimmed">
              +{(apiKey.permissions || []).length - 2} more
            </Text>
          )}
        </Group>
      </Stack>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card withBorder p="md">
      <Stack gap="sm">
        <Group>
          <Skeleton height={48} width={48} radius="xl" />
          <Stack gap={4} style={{ flex: 1 }}>
            <Skeleton height={16} width="70%" />
            <Skeleton height={12} width="50%" />
          </Stack>
          <Skeleton height={24} width={24} />
        </Group>
        <Group gap="xs">
          <Skeleton height={20} width={60} radius="sm" />
          <Skeleton height={20} width={50} radius="sm" />
        </Group>
      </Stack>
    </Card>
  );
}

export function ResponsiveDataTable({
  data,
  loading = false,
  onView,
  onEdit,
  onDelete,
  customActions,
  type,
}: ResponsiveDataTableProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (!isMobile) {
    // Return null on desktop - the original DataTable will be used
    return null;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const renderCard = (item: any) => {
    const cardProps = {
      onView,
      onEdit,
      onDelete,
      customActions,
    };

    switch (type) {
      case 'users':
        return <UserCard key={item.id} user={item} {...cardProps} />;
      case 'organizations':
        return <OrganizationCard key={item.id} org={item} {...cardProps} />;
      case 'apiKeys':
        return <ApiKeyCard key={item.id} apiKey={item} {...cardProps} />;
      default:
        return null;
    }
  };

  return (
    <Card withBorder>
      <Card.Section p="md" withBorder>
        <Group justify="space-between">
          <Text fw={600}>
            {type === 'users' ? 'Users' : type === 'organizations' ? 'Organizations' : 'API Keys'}(
            {data.length})
          </Text>
          {totalPages > 1 && (
            <Text size="sm" c="dimmed">
              Page {currentPage} of {totalPages}
            </Text>
          )}
        </Group>
      </Card.Section>

      <ScrollArea>
        <Box p="md">
          <Stack gap="sm">
            {loading ? (
              Array.from({ length: 6 }, (_, i) => <LoadingCard key={i} />)
            ) : paginatedData.length > 0 ? (
              paginatedData.map(renderCard)
            ) : (
              <Card withBorder p="xl">
                <Stack align="center" gap="md">
                  <Avatar size="xl" color="gray">
                    {type === 'users' ? (
                      <IconUsers size={24} />
                    ) : type === 'organizations' ? (
                      <IconBuilding size={24} />
                    ) : (
                      <IconKey size={24} />
                    )}
                  </Avatar>
                  <Stack align="center" gap="xs">
                    <Text fw={500}>No {type} found</Text>
                    <Text size="sm" c="dimmed" ta="center">
                      {type === 'users'
                        ? 'No users match your search criteria'
                        : type === 'organizations'
                          ? 'No organizations match your search criteria'
                          : 'No API keys match your search criteria'}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            )}
          </Stack>
        </Box>
      </ScrollArea>

      {totalPages > 1 && !loading && (
        <>
          <Divider />
          <Card.Section p="md">
            <Group justify="center" gap="xs">
              <Button
                variant="light"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Text size="sm" c="dimmed" mx="md">
                {currentPage} / {totalPages}
              </Text>
              <Button
                variant="light"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </Group>
          </Card.Section>
        </>
      )}
    </Card>
  );
}
