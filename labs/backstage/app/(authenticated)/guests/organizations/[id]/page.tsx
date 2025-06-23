'use client';

import {
  Avatar,
  Badge,
  Group,
  Stack,
  Text,
  Card,
  SimpleGrid,
  Divider,
  Container,
  Button,
} from '@mantine/core';
import {
  IconBuilding,
  IconUsers,
  IconCalendar,
  IconEdit,
  IconSettings,
  IconCrown,
  IconArrowLeft,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

import { getOrganizationAction } from '@/actions/guests';
import { OrganizationForm } from '@/components/guests/forms/OrganizationForm';
import { PageHeader } from '@/components/page-header';
import type { Organization } from '@/types/guests';

interface OrganizationPageProps {
  params: Promise<{ id: string }>;
}

export default function OrganizationPage({ params }: OrganizationPageProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setParamsData(p));
  }, [params]);

  useEffect(() => {
    if (paramsData?.id) {
      if (paramsData.id === 'new') {
        setLoading(false);
      } else {
        loadOrganization();
      }
    }
  }, [paramsData?.id]);

  const loadOrganization = async () => {
    if (!paramsData?.id || paramsData.id === 'new') return;

    setLoading(true);
    try {
      const result = await getOrganizationAction(paramsData.id);
      if (result && (result as any).success && (result as any).data) {
        // The organization data from better-auth may have a different structure
        // Add member count information
        const org = (result as any).data;
        setOrganization({
          ...org,
          _count: {
            members: org.members?.length || 0,
            invitations: org.invitations?.length || 0,
          },
        });
      } else if (result && (result as any).id) {
        // Direct organization object returned
        setOrganization({
          ...(result as any),
          _count: {
            members: (result as any).members?.length || 0,
            invitations: (result as any).invitations?.length || 0,
          },
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to load organization details',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load organization:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load organization details',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle "new" case - show create form
  if (paramsData?.id === 'new') {
    return (
      <Container py="xl" size="xl">
        <Stack gap="xl">
          <PageHeader
            title="Create New Organization"
            description="Set up a new organization for your team"
            breadcrumbs={[
              { label: 'Guests', href: '/guests' },
              { label: 'Organizations', href: '/guests/organizations' },
              { label: 'New' },
            ]}
          />
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <OrganizationForm />
          </Card>
        </Stack>
      </Container>
    );
  }

  // Handle edit mode
  if (isEdit && organization) {
    return (
      <Container py="xl" size="xl">
        <Stack gap="xl">
          <PageHeader
            title="Edit Organization"
            description="Update organization details"
            breadcrumbs={[
              { label: 'Guests', href: '/guests' },
              { label: 'Organizations', href: '/guests/organizations' },
              { label: organization.name },
            ]}
          />
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <OrganizationForm
              organization={organization}
              onSuccess={() => {
                setIsEdit(false);
                loadOrganization();
              }}
              onCancel={() => setIsEdit(false)}
            />
          </Card>
        </Stack>
      </Container>
    );
  }

  if (loading || !organization) {
    return (
      <Container py="xl" size="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  // Handle view mode
  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <PageHeader
          title="Organization Details"
          description="View and manage organization information"
          actions={{
            primary: {
              icon: <IconEdit size={16} />,
              label: 'Edit',
              onClick: () => setIsEdit(true),
            },
            secondary: [
              {
                icon: <IconSettings size={16} />,
                label: 'Settings',
                onClick: () => console.log('Settings'),
              },
            ],
          }}
          breadcrumbs={[
            { label: 'Guests', href: '/guests' },
            { label: 'Organizations', href: '/guests/organizations' },
            { label: organization.name },
          ]}
        />

        <SimpleGrid cols={{ base: 1, lg: 3, sm: 2 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconBuilding size={16} />
                <Text fw={500} size="sm">
                  Organization Info
                </Text>
              </Group>
              <div>
                <Text size="sm" c="dimmed">
                  Name
                </Text>
                <Text fw={500}>{organization.name}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Slug
                </Text>
                <Text fw={500}>{organization.slug}</Text>
              </div>
              {organization.description && (
                <div>
                  <Text size="sm" c="dimmed">
                    Description
                  </Text>
                  <Text fw={500}>{organization.description}</Text>
                </div>
              )}
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconUsers size={16} />
                <Text fw={500} size="sm">
                  Team Information
                </Text>
              </Group>
              <div>
                <Text size="sm" c="dimmed">
                  Total Members
                </Text>
                <Text fw={500}>{(organization as any)._count?.members || 0}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Pending Invitations
                </Text>
                <Text fw={500}>{(organization as any)._count?.invitations || 0}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Created
                </Text>
                <Text fw={500}>{new Date(organization.createdAt).toLocaleDateString()}</Text>
              </div>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text fw={500} size="sm">
                  Activity
                </Text>
              </Group>
              <div>
                <Text size="sm" c="dimmed">
                  API Keys
                </Text>
                <Text fw={500}>{(organization as any)._count?.apiKeys || 0}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Teams
                </Text>
                <Text fw={500}>{(organization as any)._count?.teams || 0}</Text>
              </div>
            </Stack>
          </Card>
        </SimpleGrid>

        {organization.members && organization.members.length > 0 && (
          <>
            <Divider />
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={500}>Members</Text>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {organization.members.map((member) => (
                    <Card key={member.id} padding="sm" radius="md" withBorder>
                      <Group gap="sm">
                        <Avatar radius="xl" size="sm">
                          {member.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </Avatar>
                        <div style={{ flex: 1 }}>
                          <Text fw={500} size="sm">
                            {member.user.name}
                          </Text>
                          <Text c="dimmed" size="xs">
                            {member.user.email}
                          </Text>
                        </div>
                        <Badge
                          color={
                            member.role === 'owner'
                              ? 'red'
                              : member.role === 'admin'
                                ? 'orange'
                                : 'blue'
                          }
                          variant="light"
                          size="sm"
                          leftSection={member.role === 'owner' ? <IconCrown size={12} /> : null}
                        >
                          {member.role}
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </Stack>
            </Card>
          </>
        )}

        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push('/guests/organizations')}
          >
            Back to Organizations
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
