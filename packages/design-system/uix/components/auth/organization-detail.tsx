'use client';

import {
  Alert,
  Avatar,
  Badge,
  Box,
  Card,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconBuilding, IconCalendar, IconCrown, IconUsers } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { getOrganization, useSession } from '@repo/auth/client';

interface OrganizationDetailProps {
  className?: string;
  organizationId?: string;
}

interface OrganizationData {
  createdAt: Date | string;
  id: string;
  logoUrl?: string;
  members?: {
    id: string;
    userId: string;
    organizationId: string;
    role: 'member' | 'admin' | 'owner';
    createdAt: Date | string;
    user: {
      id?: string;
      name: string;
      email: string;
      image?: string | undefined;
    };
  }[];
  name: string;
  slug?: string;
}

export const OrganizationDetail = ({ className = '', organizationId }: OrganizationDetailProps) => {
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the organizationId prop if provided, otherwise use the active organization from the session
  const orgId = organizationId || session?.session?.activeOrganizationId;

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!orgId) {
        setLoading(false);
        setError('No organization ID provided');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const orgData = await getOrganization({
          query: { organizationId: orgId },
        });

        if (orgData?.data) {
          setOrganization(orgData.data);
        } else {
          setError('Organization not found');
        }
      } catch (err) {
        console.error('Failed to fetch organization:', err);
        setError('Failed to load organization details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [orgId]);

  if (loading) {
    return (
      <Card shadow="sm" withBorder className={className} p="lg" radius="md">
        <Stack>
          <Skeleton width={200} height={24} />
          <Skeleton width={150} height={16} />
          <Skeleton height={60} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </Stack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card shadow="sm" withBorder className={className} p="lg" radius="md">
        <Alert color="red" title="Error" variant="light">
          {error}
        </Alert>
      </Card>
    );
  }

  if (!organization) {
    return (
      <Card shadow="sm" withBorder className={className} p="lg" radius="md">
        <Alert color="gray" title="No Organization" variant="light">
          No organization data available
        </Alert>
      </Card>
    );
  }

  const memberCount = organization.members?.length || 0;
  const isOwner = organization.members?.some(
    (member) => member.userId === session?.user?.id && member.role === 'owner',
  );

  return (
    <Card shadow="sm" withBorder className={className} p="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Box>
          <Group gap="xs" mb={4}>
            <IconBuilding size={20} />
            <Title order={3}>{organization.name}</Title>
          </Group>
          {organization.slug && (
            <Text c="dimmed" size="sm">
              @{organization.slug}
            </Text>
          )}
        </Box>
        {isOwner && (
          <Badge leftSection={<IconCrown size={14} />} variant="light">
            Owner
          </Badge>
        )}
      </Group>

      <Stack gap="sm">
        <Group gap="xs">
          <IconUsers size={16} />
          <Text c="dimmed" size="sm">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Text>
        </Group>

        <Group gap="xs">
          <IconCalendar size={16} />
          <Text c="dimmed" size="sm">
            Created on{' '}
            {format(
              typeof organization.createdAt === 'string'
                ? new Date(organization.createdAt)
                : organization.createdAt,
              'MMM d, yyyy',
            )}
          </Text>
        </Group>

        {/* Member list section */}
        {organization.members && organization.members.length > 0 && (
          <>
            <Divider my="sm" />
            <Box>
              <Text fw={500} mb="md" size="sm">
                Members
              </Text>
              <Stack gap="sm">
                {organization.members.map((member) => (
                  <Group key={member.id} justify="space-between">
                    <Group gap="sm">
                      <Avatar color="initials" size="sm">
                        {member.user.name?.[0]?.toUpperCase() ||
                          member.user.email?.[0]?.toUpperCase() ||
                          '?'}
                      </Avatar>
                      <Box>
                        <Text fw={500} size="sm">
                          {member.user.name || member.user.email || 'Unknown'}
                        </Text>
                        {member.user.email && member.user.name && (
                          <Text c="dimmed" size="xs">
                            {member.user.email}
                          </Text>
                        )}
                      </Box>
                    </Group>
                    <Badge
                      size="sm"
                      tt="capitalize"
                      variant={member.role === 'owner' ? 'filled' : 'light'}
                    >
                      {member.role}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
};
