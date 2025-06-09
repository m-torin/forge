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
  MultiSelect,
  Alert,
} from '@mantine/core';
import {
  IconBuilding,
  IconBuildingStore,
  IconCrown,
  IconMail,
  IconPlus,
  IconTrash,
  IconUsers,
  IconUserPlus,
  IconSettings,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';

import { DataTable } from '../../components/data-table';
import { PageHeader } from '../../components/page-header';
import { StatsCard } from '../../components/stats-card';

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

interface User {
  id: string;
  name: string;
  email: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [inviteModalOpened, { open: openInviteModal, close: closeInviteModal }] = useDisclosure(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [inviteData, setInviteData] = useState({
    emails: '',
    role: 'member' as 'owner' | 'admin' | 'member',
    message: '',
  });

  const statsData = [
    {
      title: 'Total Organizations',
      value: organizations.length.toString(),
      color: 'blue',
      icon: IconBuilding,
      change: { value: 8 },
    },
    {
      title: 'Total Members',
      value: organizations.reduce((acc, org) => acc + (org._count?.members || 0), 0).toString(),
      color: 'green',
      icon: IconUsers,
    },
    {
      title: 'Pending Invitations',
      value: organizations.reduce((acc, org) => acc + (org._count?.invitations || 0), 0).toString(),
      color: 'orange',
      icon: IconMail,
    },
    {
      title: 'Average Members',
      value: organizations.length > 0 
        ? Math.round(organizations.reduce((acc, org) => acc + (org._count?.members || 0), 0) / organizations.length).toString()
        : '0',
      color: 'violet',
      icon: IconBuildingStore,
    },
  ];

  useEffect(() => {
    loadOrganizations();
    loadUsers();
    
    // Listen for refresh events from modals
    const handleRefresh = () => loadOrganizations();
    window.addEventListener('refreshOrganizations', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshOrganizations', handleRefresh);
    };
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to load organizations',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load organizations',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setNewOrg(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleCreateOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrg),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Organization created successfully',
          color: 'green',
        });
        closeCreateModal();
        setNewOrg({ name: '', slug: '', description: '' });
        await loadOrganizations();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create organization',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create organization',
        color: 'red',
      });
    }
  };

  const handleInviteUsers = async () => {
    if (!selectedOrg) return;

    try {
      const emailList = inviteData.emails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      if (emailList.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'Please enter at least one valid email address',
          color: 'red',
        });
        return;
      }

      const response = await fetch(`/api/admin/organizations/${selectedOrg.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emailList,
          role: inviteData.role,
          message: inviteData.message,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const successCount = result.results?.filter((r: any) => r.success).length || 0;
        const totalCount = emailList.length;

        notifications.show({
          title: 'Invitations Sent',
          message: `${successCount}/${totalCount} invitations sent successfully`,
          color: successCount === totalCount ? 'green' : 'orange',
        });
        closeInviteModal();
        setInviteData({ emails: '', role: 'member', message: '' });
        await loadOrganizations();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to send invitations',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to invite users:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to send invitations',
        color: 'red',
      });
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Organization deleted successfully',
          color: 'green',
        });
        await loadOrganizations();
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete organization',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to delete organization:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete organization',
        color: 'red',
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
              href: '/guests/organizations/new',
            },
            secondary: [
              {
                label: 'Export Organizations',
                onClick: () => console.log('Export organizations'),
              },
            ],
          }}
          description="Manage organizations, members, and invitations"
          onRefresh={loadOrganizations}
          title="Organization Management"
        />

        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.title}
              {...stat}
              loading={loading}
            />
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
            onChange={(e) => setNewOrg(prev => ({ ...prev, slug: e.target.value }))}
            description="URL-friendly identifier for the organization"
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter organization description (optional)"
            value={newOrg.description}
            onChange={(e) => setNewOrg(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrganization}
              disabled={!newOrg.name || !newOrg.slug}
            >
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
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Bulk Invitation"
            color="blue"
          >
            Enter one email address per line to invite multiple users at once.
          </Alert>
          
          <Textarea
            label="Email Addresses"
            placeholder={'user1@example.com\nuser2@example.com\nuser3@example.com'}
            value={inviteData.emails}
            onChange={(e) => setInviteData(prev => ({ ...prev, emails: e.target.value }))}
            rows={6}
            required
          />
          
          <Select
            label="Role"
            placeholder="Select role for invited users"
            value={inviteData.role}
            onChange={(value) => setInviteData(prev => ({ ...prev, role: value as any || 'member' }))}
            data={[
              { value: 'member', label: 'Member' },
              { value: 'admin', label: 'Admin' },
              { value: 'owner', label: 'Owner' },
            ]}
          />
          
          <Textarea
            label="Invitation Message (Optional)"
            placeholder="Add a personal message to the invitation..."
            value={inviteData.message}
            onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
            rows={3}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeInviteModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleInviteUsers}
              disabled={!inviteData.emails.trim()}
            >
              Send Invitations
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}