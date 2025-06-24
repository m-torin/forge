'use client';

import {
  Avatar,
  Badge,
  Button,
  Container,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Select,
  Alert,
} from '@mantine/core';
import {
  IconBuilding,
  IconBuildingStore,
  IconMail,
  IconPlus,
  IconUsers,
  IconUserPlus,
  IconSettings,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState, useMemo } from 'react';
import { notifications } from '@mantine/notifications';

import {
  listOrganizationsAction as getOrganizationsAction,
  createOrganizationAction,
  deleteOrganizationAction,
  bulkInviteUsersAction,
} from '@repo/auth/actions';

import { DataTable } from '@/components/auth/DataTable';
import { PageHeader } from '@/components/auth/PageHeader';
import { StatsCard } from '@/components/auth/StatsCard';

import type { Organization } from '@/types/auth';

// Constants
const ORG_ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

// Custom hook for organizations data
const useOrganizationsData = () => {
  const [state, setState] = useState({
    organizations: [] as Organization[],
    loading: true,
  });

  const loadData = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await getOrganizationsAction();
      if (result.success && result.data) {
        setState({ organizations: result.data || [], loading: false });
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error('Failed to load organizations:', result);

        notifications.show({
          title: 'Failed to load organizations',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Organizations loading exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'Organizations Loading Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { ...state, refetch: loadData };
};

export default function OrganizationsPage() {
  const { organizations, loading, refetch } = useOrganizationsData();
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [inviteModalOpened, { open: openInviteModal, close: closeInviteModal }] =
    useDisclosure(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '', description: '' });
  const [inviteData, setInviteData] = useState({
    emails: '',
    role: 'member' as 'owner' | 'admin' | 'member',
    message: '',
  });

  const statsData = useMemo(() => {
    const totalMembers = organizations.reduce(
      (acc, org) => acc + ((org as any)._count?.members || 0),
      0,
    );
    const totalInvitations = organizations.reduce(
      (acc, org) => acc + ((org as any)._count?.invitations || 0),
      0,
    );
    const avgMembers = organizations.length ? Math.round(totalMembers / organizations.length) : 0;

    return [
      {
        title: 'Total Organizations',
        value: organizations.length.toString(),
        color: 'blue',
        icon: IconBuilding,
        change: { value: 8 },
      },
      { title: 'Total Members', value: totalMembers.toString(), color: 'green', icon: IconUsers },
      {
        title: 'Pending Invitations',
        value: totalInvitations.toString(),
        color: 'orange',
        icon: IconMail,
      },
      {
        title: 'Average Members',
        value: avgMembers.toString(),
        color: 'violet',
        icon: IconBuildingStore,
      },
    ];
  }, [organizations]);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleNameChange = (name: string) => {
    setNewOrg((prev) => ({ ...prev, name, slug: prev.slug || generateSlug(name) }));
  };

  const handleCreateOrganization = async () => {
    try {
      const result = await createOrganizationAction({
        name: newOrg.name,
        slug: newOrg.slug,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Organization created successfully',
          color: 'green',
        });
        closeCreateModal();
        setNewOrg({ name: '', slug: '', description: '' });
        await refetch();
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error('Organization creation failed:', {
          input: { name: newOrg.name, slug: newOrg.slug },
          result,
          error: result.error,
        });

        notifications.show({
          title: 'Failed to create organization',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }
    } catch (error) {
      console.error('Organization creation exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'Organization Creation Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
    }
  };

  const handleInviteUsers = async () => {
    if (!selectedOrg) return;

    try {
      const emailList = inviteData.emails
        .split('\n')
        .map((email) => email.trim())
        .filter((email) => email && email.includes('@'));

      if (emailList.length === 0) {
        notifications.show({
          title: 'Invalid Email Input',
          message: 'Please enter at least one valid email address',
          color: 'red',
        });
        return;
      }

      const result = await bulkInviteUsersAction({
        emails: emailList,
        organizationId: selectedOrg.id,
        role: inviteData.role,
      });

      if (Array.isArray(result)) {
        const successCount = result.filter((r: any) => r.success).length;
        const totalCount = emailList.length;
        const failedResults = result.filter((r: any) => !r.success);

        if (successCount === totalCount) {
          notifications.show({
            title: 'Invitations Sent',
            message: `All ${successCount} invitations sent successfully`,
            color: 'green',
          });
        } else {
          const failureDetails = failedResults
            .map((r: any) => `${r.email}: ${r.error?.message || r.error || 'Unknown error'}`)
            .join('; ');

          console.error('Bulk invitation failures:', failedResults);

          notifications.show({
            title: 'Partial Success',
            message: `${successCount}/${totalCount} invitations sent. Failures: ${failureDetails}`,
            color: 'orange',
            autoClose: false,
          });
        }

        closeInviteModal();
        setInviteData({ emails: '', role: 'member', message: '' });
        await refetch();
      } else {
        const errorDetails = (result as any).error
          ? typeof (result as any).error === 'string'
            ? (result as any).error
            : JSON.stringify((result as any).error, null, 2)
          : 'Unknown error occurred';

        console.error('Bulk invitation failed:', {
          input: { emails: emailList, organizationId: selectedOrg.id, role: inviteData.role },
          result,
          error: (result as any).error,
        });

        notifications.show({
          title: 'Failed to send invitations',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }
    } catch (error) {
      console.error('Invitation exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'Invitation Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    try {
      const result = await deleteOrganizationAction(orgId);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Organization deleted successfully',
          color: 'green',
        });
        await refetch();
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error('Organization deletion failed:', {
          organizationId: orgId,
          result,
          error: result.error,
        });

        notifications.show({
          title: 'Failed to delete organization',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }
    } catch (error) {
      console.error('Organization deletion exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'Organization Deletion Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
    }
  };

  const openInviteModalForOrg = (org: Organization) => {
    setSelectedOrg(org);
    openInviteModal();
  };

  const columns = [
    {
      key: 'name',
      label: 'Organization',
      render: (value: string, row: Organization) => (
        <Group gap="sm">
          <Avatar radius="xl" size="sm" color="blue">
            <IconBuilding size={16} />
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {value}
            </Text>
            <Text c="dimmed" size="xs">
              {row.slug}
            </Text>
          </div>
        </Group>
      ),
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <Text size="sm" lineClamp={2}>
          {value || 'No description'}
        </Text>
      ),
    },
    {
      key: '_count.members',
      label: 'Members',
      render: (value: number) => (
        <Badge color="blue" variant="light">
          {value || 0} members
        </Badge>
      ),
      sortable: true,
    },
    {
      key: '_count.invitations',
      label: 'Pending Invitations',
      render: (value: number) => (
        <Badge color={value > 0 ? 'orange' : 'gray'} variant="light">
          {value || 0} pending
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => {
        const date = new Date(value);
        return <Text size="sm">{date.toLocaleDateString()}</Text>;
      },
      sortable: true,
    },
  ];

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <PageHeader
          actions={{
            primary: {
              icon: <IconPlus size={16} />,
              label: 'Create Organization',
              onClick: openCreateModal,
            },
            secondary: [
              {
                label: 'Export Organizations',
                onClick: () => console.log('Export organizations'),
              },
            ],
          }}
          description="Manage organizations, members, and invitations"
          onRefresh={refetch}
          title="Organization Management"
        />

        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {statsData.map((stat) => (
            <StatsCard key={stat.title} {...stat} loading={loading} />
          ))}
        </SimpleGrid>

        <DataTable
          actions={{
            custom: [
              {
                icon: <IconUserPlus size={14} />,
                label: 'Invite Members',
                onClick: (row) => openInviteModalForOrg(row),
              },
              {
                icon: <IconUsers size={14} />,
                label: 'View Members',
                onClick: (row) => console.log('View members', row),
              },
              {
                icon: <IconSettings size={14} />,
                label: 'Settings',
                onClick: (row) => console.log('Organization settings', row),
              },
            ],
            onDelete: (row) => handleDeleteOrganization(row.id),
            onEdit: (row) => console.log('Edit organization', row),
            onView: (row) => console.log('View organization', row),
          }}
          bulkActions={[
            {
              color: 'red',
              label: 'Delete Selected',
              onClick: (rows) => console.log('Delete organizations', rows),
            },
            {
              label: 'Export Selected',
              onClick: (rows) => console.log('Export organizations', rows),
            },
          ]}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 25,
            total: organizations.length,
          }}
          searchPlaceholder="Search organizations..."
          data={organizations}
          emptyState={{
            description: 'Create your first organization to get started',
            icon: IconBuilding,
            title: 'No organizations found',
          }}
          selectable
        />
      </Stack>

      {/* Create Organization Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create New Organization">
        <Stack gap="md">
          <TextInput
            label="Organization Name"
            placeholder="Enter organization name"
            value={newOrg.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
          <TextInput
            label="Slug"
            placeholder="organization-slug"
            value={newOrg.slug}
            onChange={(e) => setNewOrg((prev) => ({ ...prev, slug: e.target.value }))}
            description="URL-friendly identifier for the organization"
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter organization description (optional)"
            value={newOrg.description}
            onChange={(e) => setNewOrg((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrganization} disabled={!newOrg.name || !newOrg.slug}>
              Create Organization
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Invite Members Modal */}
      <Modal
        opened={inviteModalOpened}
        onClose={closeInviteModal}
        title={`Invite Members to ${selectedOrg?.name}`}
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertTriangle size={16} />} title="Bulk Invitation" color="blue">
            Enter one email address per line to invite multiple users at once.
          </Alert>

          <Textarea
            label="Email Addresses"
            placeholder={'user1@example.com\nuser2@example.com\nuser3@example.com'}
            value={inviteData.emails}
            onChange={(e) => setInviteData((prev) => ({ ...prev, emails: e.target.value }))}
            rows={6}
            required
          />

          <Select
            label="Role"
            placeholder="Select role for invited users"
            value={inviteData.role}
            onChange={(value) =>
              setInviteData((prev) => ({ ...prev, role: (value as any) || 'member' }))
            }
            data={ORG_ROLES}
          />

          <Textarea
            label="Invitation Message (Optional)"
            placeholder="Add a personal message to the invitation..."
            value={inviteData.message}
            onChange={(e) => setInviteData((prev) => ({ ...prev, message: e.target.value }))}
            rows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeInviteModal}>
              Cancel
            </Button>
            <Button onClick={handleInviteUsers} disabled={!inviteData.emails.trim()}>
              Send Invitations
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
