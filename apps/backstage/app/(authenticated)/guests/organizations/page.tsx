'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconPlus, IconSettings, IconTrash, IconUsers } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import {
  checkOrganizationSlug,
  createOrganization,
  deleteOrganizationById,
  listAllOrganizations,
} from '@repo/auth-new/actions';

// Declare unused variable with underscore prefix
const _BuildingIcon = IconBuilding;

interface Organization {
  createdAt: string;
  id: string;
  logo?: string;
  members?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
  name: string;
  slug: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { close, open }] = useDisclosure(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    logo: '',
    metadata: '',
    slug: '',
  });
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await listAllOrganizations();
      console.log('Organizations response:', response);

      if (response.success && response.data) {
        setOrganizations(response.data as Organization[]);
      } else if (!response.success) {
        console.error('Error from API:', response.error);
        throw new Error(response.error || 'Failed to load organizations');
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to load organizations',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }

    try {
      setSlugChecking(true);
      const result = await checkOrganizationSlug(slug);
      if (result.success && result.data && 'status' in result.data) {
        setSlugAvailable(result.data.status as boolean);
      }
    } catch (error) {
      console.error('Failed to check slug:', error);
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  };

  const handleCreate = async () => {
    if (!newOrg.name || !newOrg.slug) {
      notifications.show({
        color: 'red',
        message: 'Name and slug are required',
        title: 'Error',
      });
      return;
    }

    try {
      const metadata = newOrg.metadata ? JSON.parse(newOrg.metadata) : undefined;

      const response = await createOrganization({
        name: newOrg.name,
        logo: newOrg.logo || undefined,
        metadata,
        slug: newOrg.slug,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to create organization');
      }

      notifications.show({
        color: 'green',
        message: 'Organization created successfully',
        title: 'Success',
      });
      close();
      resetNewOrg();
      loadOrganizations();
    } catch (error) {
      console.error('Failed to create organization:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to create organization',
        title: 'Error',
      });
    }
  };

  const handleDelete = async (orgId: string) => {
    modals.openConfirmModal({
      children: (
        <Text size="sm">
          Are you sure you want to delete this organization? This action cannot be undone.
        </Text>
      ),
      confirmProps: { color: 'red' },
      labels: { cancel: 'Cancel', confirm: 'Delete' },
      onCancel: () => {},
      onConfirm: async () => {
        try {
          const response = await deleteOrganizationById(orgId);
          if (!response.success) {
            throw new Error(response.error || 'Failed to delete organization');
          }
          notifications.show({
            color: 'green',
            message: 'Organization deleted successfully',
            title: 'Success',
          });
          loadOrganizations();
        } catch (error) {
          console.error('Failed to delete organization:', error);
          notifications.show({
            color: 'red',
            message: 'Failed to delete organization',
            title: 'Error',
          });
        }
      },
      title: 'Delete Organization',
    });
  };

  const resetNewOrg = () => {
    setNewOrg({
      name: '',
      logo: '',
      metadata: '',
      slug: '',
    });
    setSlugAvailable(null);
  };

  if (loading) {
    return (
      <Stack gap="lg">
        <Skeleton width={200} height={40} />
        <Stack gap="md">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={80} />
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>Organizations</Title>
          <Text color="dimmed">Manage organizations and their members</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Create Organization
        </Button>
      </Group>

      <Modal onClose={close} opened={opened} size="lg" title="Create Organization">
        <Stack gap="md">
          <Text color="dimmed" size="sm">
            Create a new organization to manage teams and projects
          </Text>

          <TextInput
            onChange={(e) => {
              setNewOrg({ ...newOrg, name: e.currentTarget.value });
              // Auto-generate slug from name
              if (
                !newOrg.slug ||
                newOrg.slug === newOrg.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              ) {
                const slug = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                setNewOrg((prev) => ({ ...prev, slug }));
                checkSlugAvailability(slug);
              }
            }}
            placeholder="My Organization"
            label="Name"
            required
            value={newOrg.name}
          />

          <TextInput
            error={slugAvailable === false ? 'Slug is already taken' : ''}
            onChange={(e) => {
              setNewOrg({ ...newOrg, slug: e.currentTarget.value });
              checkSlugAvailability(e.currentTarget.value);
            }}
            placeholder="my-org"
            rightSection={
              slugChecking ? (
                <Text color="dimmed" size="xs">
                  Checking...
                </Text>
              ) : slugAvailable !== null ? (
                <Text color={slugAvailable ? 'green' : 'red'} size="xs">
                  {slugAvailable ? 'Available' : 'Taken'}
                </Text>
              ) : null
            }
            label="Slug"
            required
            value={newOrg.slug}
          />

          <TextInput
            description="Optional"
            onChange={(e) => setNewOrg({ ...newOrg, logo: e.currentTarget.value })}
            placeholder="https://example.com/logo.png"
            label="Logo URL"
            value={newOrg.logo}
          />

          <Textarea
            description="Optional"
            onChange={(e) => setNewOrg({ ...newOrg, metadata: e.currentTarget.value })}
            placeholder='{"plan": "pro"}'
            rows={3}
            label="Metadata (JSON)"
            value={newOrg.metadata}
          />

          <Group justify="flex-end" mt="md">
            <Button
              onClick={() => {
                close();
                resetNewOrg();
              }}
              variant="subtle"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newOrg.name || !newOrg.slug || slugAvailable === false}
            >
              Create Organization
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg">
            <Text color="dimmed" fw={500} size="sm">
              Total Organizations
            </Text>
            <Text fw={700} mt="xs" size="xl">
              {organizations.length}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg">
            <Text color="dimmed" fw={500} size="sm">
              Active This Week
            </Text>
            <Text color="green" fw={700} mt="xs" size="xl">
              {
                organizations.filter((org) => {
                  const createdDate = new Date(org.createdAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return createdDate > weekAgo;
                }).length
              }
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg">
            <Text color="dimmed" fw={500} size="sm">
              Total Members
            </Text>
            <Text fw={700} mt="xs" size="xl">
              {organizations.reduce((sum, org) => sum + (org.members?.length || 0), 0)}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg">
        <Stack gap="md">
          <div>
            <Title order={3}>All Organizations</Title>
            <Text color="dimmed" size="sm">
              View and manage all organizations in the system
            </Text>
          </div>

          {organizations.length === 0 ? (
            <Paper withBorder p="xl">
              <Text color="dimmed" ta="center">
                No organizations found
              </Text>
            </Paper>
          ) : (
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Members</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <Group gap="sm">
                        {org.logo && (
                          <Image
                            width={32}
                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                            alt={org.name}
                            height={32}
                            src={org.logo}
                          />
                        )}
                        <div>
                          <Text fw={500}>{org.name}</Text>
                          <Text color="dimmed" size="xs">
                            {org.id}
                          </Text>
                        </div>
                      </Group>
                    </td>
                    <td>
                      <Badge variant="outline">{org.slug}</Badge>
                    </td>
                    <td>
                      <Group gap={4}>
                        <IconUsers size={16} />
                        <Text>{org.members?.length || 0}</Text>
                      </Group>
                    </td>
                    <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          onClick={() => {
                            console.log('Navigating to organization:', org.id);
                            console.log('Full path:', `/guests/organizations/${org.id}`);
                            router.push(`/guests/organizations/${org.id}`);
                          }}
                          variant="subtle"
                        >
                          <IconSettings size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          onClick={() => handleDelete(org.id)}
                          variant="subtle"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
