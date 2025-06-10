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
  ActionIcon,
  Tooltip,
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

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  members?: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  _count?: {
    members: number;
    invitations: number;
  };
}

interface OrganizationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrganizationDetailPage({ params }: OrganizationDetailPageProps) {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(p => setParamsData(p));
  }, [params]);

  useEffect(() => {
    if (paramsData?.id) {
      loadOrganization();
    }
  }, [paramsData?.id]);

  const loadOrganization = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/organizations/${paramsData?.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization);
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

  if (loading || !organization) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
            Back to Organizations
          </Button>
        </Group>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="md">
                <Avatar size="lg" radius="md">
                  <IconBuilding size={32} />
                </Avatar>
                <div>
                  <Text fw={600} size="xl">
                    {organization.name}
                  </Text>
                  <Text c="dimmed" size="sm">
                    @{organization.slug}
                  </Text>
                  {organization.description && (
                    <Text c="dimmed" size="sm" mt={4}>
                      {organization.description}
                    </Text>
                  )}
                </div>
              </Group>
              <Group gap="xs">
                <Tooltip label="Edit Organization">
                  <ActionIcon variant="light" color="blue" size="lg">
                    <IconEdit size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Settings">
                  <ActionIcon variant="light" color="gray" size="lg">
                    <IconSettings size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            <Divider />

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Card padding="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconUsers size={16} />
                    <Text fw={500} size="sm">Members</Text>
                  </Group>
                  <Text fw={600} size="xl">
                    {organization._count?.members || organization.members?.length || 0}
                  </Text>
                </Stack>
              </Card>

              <Card padding="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text fw={500} size="sm">Created</Text>
                  </Group>
                  <Text size="sm">
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </Text>
                </Stack>
              </Card>

              <Card padding="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconSettings size={16} />
                    <Text fw={500} size="sm">Pending Invites</Text>
                  </Group>
                  <Text fw={600} size="xl">
                    {organization._count?.invitations || 0}
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

            {organization.members && organization.members.length > 0 && (
              <>
                <Divider />
                <div>
                  <Text fw={500} mb="md" size="lg">Members</Text>
                  <Stack gap="md">
                    {organization.members.map((member) => (
                      <Card key={member.id} padding="md" radius="md" withBorder>
                        <Group justify="space-between">
                          <Group gap="sm">
                            <Avatar size="md" radius="xl">
                              {member.user.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')}
                            </Avatar>
                            <div>
                              <Text fw={500}>{member.user.name}</Text>
                              <Text c="dimmed" size="sm">{member.user.email}</Text>
                            </div>
                          </Group>
                          <Badge 
                            variant="light" 
                            size="lg"
                            color={member.role === 'owner' ? 'yellow' : member.role === 'admin' ? 'red' : 'blue'}
                            leftSection={member.role === 'owner' ? <IconCrown size={14} /> : undefined}
                          >
                            {member.role}
                          </Badge>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </div>
              </>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}