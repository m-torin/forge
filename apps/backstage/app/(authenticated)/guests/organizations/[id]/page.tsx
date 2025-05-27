'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconEdit,
  IconMail,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

// Import server actions from auth package
import {
  cancelOrganizationInvitation,
  createOrganizationTeam,
  getOrganizationById,
  inviteOrganizationMember,
  listOrganizationInvitations,
  listOrganizationTeams,
  removeOrganizationMember,
  removeOrganizationTeam,
  updateOrganizationById,
  updateOrganizationMemberRole,
  updateOrganizationTeam,
} from '@repo/auth/actions';

// Declare unused variables with underscore prefix
const _IconUsers = IconUsers;
const _IconCheck = IconCheck;
const _IconRefresh = IconRefresh;

interface Organization {
  createdAt: string;
  id: string;
  logo?: string;
  members?: Member[];
  metadata?: Record<string, unknown>;
  name: string;
  slug: string;
}

interface Member {
  createdAt: string;
  id: string;
  role: string;
  teamId?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  userId: string;
}

interface Invitation {
  email: string;
  expiresAt: string;
  id: string;
  inviter: {
    user: {
      name: string;
      email: string;
    };
  };
  role: string;
  status: string;
  teamId?: string;
}

interface Team {
  createdAt: string;
  id: string;
  members?: Member[];
  name: string;
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  console.log('OrganizationDetailPage mounted with ID:', organizationId);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedOrg, setEditedOrg] = useState({
    name: '',
    logo: '',
    metadata: '',
    slug: '',
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteTeamId, setInviteTeamId] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [removeTeamModalOpen, setRemoveTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const loadOrganization = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading organization with ID:', organizationId);
      const response = await getOrganizationById(organizationId);
      console.log('Organization data received:', response);
      if (response.success && response.data) {
        interface OrganizationData {
          createdAt: string;
          id: string;
          logo?: string;
          members: Member[];
          metadata?: Record<string, unknown>;
          name: string;
          slug: string;
        }

        const org = response.data as OrganizationData;
        setOrganization({
          id: org.id,
          name: org.name,
          createdAt: org.createdAt,
          logo: org.logo,
          members: org.members,
          metadata: org.metadata,
          slug: org.slug,
        });
        setEditedOrg({
          name: org.name,
          logo: org.logo || '',
          metadata: JSON.stringify(org.metadata || {}, null, 2),
          slug: org.slug,
        });
      }
    } catch (error) {
      console.error('Failed to load organization:', error);
      console.error('Error details:', error);
      notifications.show({
        color: 'red',
        message: `Failed to load organization: ${error instanceof Error ? error.message : 'Unknown error'}`,
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const loadInvitations = useCallback(async () => {
    try {
      const response = await listOrganizationInvitations(organizationId);
      if (response.success && response.data) {
        setInvitations(response.data as Invitation[]);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  }, [organizationId]);

  const loadTeams = useCallback(async () => {
    try {
      const response = await listOrganizationTeams(organizationId);
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setTeams(response.data as Team[]);
        } else if ('data' in response.data && Array.isArray(response.data.data)) {
          setTeams(response.data.data as Team[]);
        }
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  }, [organizationId]);

  // Only one useEffect after all useCallbacks are defined
  useEffect(() => {
    loadOrganization();
    loadInvitations();
    loadTeams();
  }, [loadOrganization, loadInvitations, loadTeams]);

  const handleUpdate = async () => {
    try {
      const metadata = editedOrg.metadata ? JSON.parse(editedOrg.metadata) : undefined;

      await updateOrganizationById(organizationId, {
        name: editedOrg.name,
        logo: editedOrg.logo || undefined,
        metadata,
        slug: editedOrg.slug,
      });

      notifications.show({
        color: 'green',
        message: 'Organization updated successfully',
        title: 'Success',
      });
      setEditMode(false);
      loadOrganization();
    } catch (error) {
      console.error('Failed to update organization:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to update organization',
        title: 'Error',
      });
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      notifications.show({
        color: 'red',
        message: 'Email is required',
        title: 'Error',
      });
      return;
    }

    try {
      await inviteOrganizationMember(
        organizationId,
        inviteEmail,
        inviteRole as 'member' | 'admin' | 'owner',
        inviteTeamId || undefined,
      );

      notifications.show({
        color: 'green',
        message: 'Invitation sent successfully',
        title: 'Success',
      });
      setInviteEmail('');
      setInviteRole('member');
      setInviteTeamId('');
      loadInvitations();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to send invitation',
        title: 'Error',
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelOrganizationInvitation(invitationId);
      notifications.show({
        color: 'green',
        message: 'Invitation cancelled',
        title: 'Success',
      });
      loadInvitations();
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to cancel invitation',
        title: 'Error',
      });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await updateOrganizationMemberRole(
        organizationId,
        memberId,
        newRole as 'member' | 'admin' | 'owner',
      );
      notifications.show({
        color: 'green',
        message: 'Member role updated',
        title: 'Success',
      });
      loadOrganization();
    } catch (error) {
      console.error('Failed to update role:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to update role',
        title: 'Error',
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await removeOrganizationMember(organizationId, memberId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove member');
      }
      notifications.show({
        color: 'green',
        message: 'Member removed',
        title: 'Success',
      });
      loadOrganization();
      setRemoveModalOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to remove member',
        title: 'Error',
      });
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) {
      notifications.show({
        color: 'red',
        message: 'Team name is required',
        title: 'Error',
      });
      return;
    }

    try {
      const response = await createOrganizationTeam(organizationId, newTeamName);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create team');
      }
      notifications.show({
        color: 'green',
        message: 'Team created successfully',
        title: 'Success',
      });
      setNewTeamName('');
      loadTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to create team',
        title: 'Error',
      });
    }
  };

  const _handleUpdateTeam = async (teamId: string, name: string) => {
    try {
      const response = await updateOrganizationTeam(teamId, name);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update team');
      }
      notifications.show({
        color: 'green',
        message: 'Team updated',
        title: 'Success',
      });
      loadTeams();
    } catch (error) {
      console.error('Failed to update team:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to update team',
        title: 'Error',
      });
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    try {
      const response = await removeOrganizationTeam(teamId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove team');
      }
      notifications.show({
        color: 'green',
        message: 'Team removed',
        title: 'Success',
      });
      loadTeams();
      setRemoveTeamModalOpen(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error('Failed to remove team:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to remove team',
        title: 'Error',
      });
    }
  };

  if (loading || !organization) {
    return (
      <Stack gap="lg">
        <Skeleton width={300} height={48} />
        <Stack gap="md">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={128} />
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group align="flex-start" justify="space-between">
        <div>
          <Title order={1}>{organization.name}</Title>
          <Text c="dimmed" size="sm">
            Manage organization settings and members
          </Text>
        </div>
        <Button onClick={() => router.push('/guests/organizations')} variant="subtle">
          Back to Organizations
        </Button>
      </Group>

      <Tabs defaultValue="details">
        <Tabs.List>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="members">Members</Tabs.Tab>
          <Tabs.Tab value="invitations">Invitations</Tabs.Tab>
          <Tabs.Tab value="teams">Teams</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel pt="lg" value="details">
          <Card shadow="sm" withBorder padding="lg" radius="md">
            <Group justify="space-between" mb="lg">
              <div>
                <Title order={3}>Organization Details</Title>
              </div>
              {!editMode ? (
                <Button
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setEditMode(true)}
                  size="sm"
                  variant="subtle"
                >
                  Edit
                </Button>
              ) : (
                <Group gap="sm">
                  <Button onClick={() => setEditMode(false)} size="sm" variant="subtle">
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} size="sm">
                    Save Changes
                  </Button>
                </Group>
              )}
            </Group>
            <Stack gap="md">
              <Stack gap="md">
                <div>
                  <Text fw={500} mb={4} size="sm">
                    Organization ID
                  </Text>
                  <Text c="dimmed" size="sm">
                    {organization.id}
                  </Text>
                </div>
                <div>
                  <Text fw={500} mb={4} size="sm">
                    Name
                  </Text>
                  {editMode ? (
                    <TextInput
                      onChange={(e) => setEditedOrg({ ...editedOrg, name: e.target.value })}
                      value={editedOrg.name}
                    />
                  ) : (
                    <Text size="sm">{organization.name}</Text>
                  )}
                </div>
                <div>
                  <Text fw={500} mb={4} size="sm">
                    Slug
                  </Text>
                  {editMode ? (
                    <TextInput
                      onChange={(e) => setEditedOrg({ ...editedOrg, slug: e.target.value })}
                      value={editedOrg.slug}
                    />
                  ) : (
                    <Badge color="gray">{organization.slug}</Badge>
                  )}
                </div>
                <div>
                  <Text fw={500} mb={4} size="sm">
                    Logo URL
                  </Text>
                  {editMode ? (
                    <TextInput
                      onChange={(e) => setEditedOrg({ ...editedOrg, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      value={editedOrg.logo}
                    />
                  ) : (
                    <Group gap="xs">
                      {organization.logo && (
                        <Image
                          width={32}
                          style={{ borderRadius: '50%', objectFit: 'cover' }}
                          alt={organization.name}
                          height={32}
                          src={organization.logo}
                        />
                      )}
                      <Text size="sm">{organization.logo || 'No logo set'}</Text>
                    </Group>
                  )}
                </div>
                <div>
                  <Text fw={500} mb={4} size="sm">
                    Metadata
                  </Text>
                  {editMode ? (
                    <Textarea
                      minRows={5}
                      onChange={(e) => setEditedOrg({ ...editedOrg, metadata: e.target.value })}
                      value={editedOrg.metadata}
                    />
                  ) : (
                    <Card withBorder p="xs">
                      <Text style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }} size="xs">
                        {JSON.stringify(organization.metadata || {}, null, 2)}
                      </Text>
                    </Card>
                  )}
                </div>
                <div>
                  <Text fw={500} mb={4} size="sm">
                    Created
                  </Text>
                  <Text c="dimmed" size="sm">
                    {new Date(organization.createdAt).toLocaleString()}
                  </Text>
                </div>
              </Stack>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel pt="lg" value="members">
          <Card shadow="sm" withBorder padding="lg" radius="md">
            <Stack gap="md">
              <div>
                <Title order={3}>Members</Title>
                <Text c="dimmed" size="sm">
                  Manage organization members and their roles
                </Text>
              </div>
              {organization.members && organization.members.length > 0 ? (
                <Table highlightOnHover striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Team</Table.Th>
                      <Table.Th>Joined</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {organization.members.map((member) => (
                      <Table.Tr key={member.id}>
                        <Table.Td>
                          <div>
                            <Text fw={500}>{member.user.name}</Text>
                            <Text c="dimmed" size="sm">
                              {member.user.email}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Select
                            onChange={(value) => value && handleUpdateRole(member.id, value)}
                            style={{ width: 120 }}
                            data={[
                              { label: 'Owner', value: 'owner' },
                              { label: 'Admin', value: 'admin' },
                              { label: 'Member', value: 'member' },
                            ]}
                            value={member.role}
                          />
                        </Table.Td>
                        <Table.Td>
                          {teams.find((t) => t.id === member.teamId)?.name || '-'}
                        </Table.Td>
                        <Table.Td>{new Date(member.createdAt).toLocaleDateString()}</Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <ActionIcon
                            color="red"
                            onClick={() => {
                              setSelectedMember(member);
                              setRemoveModalOpen(true);
                            }}
                            variant="subtle"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" py="xl" ta="center">
                  No members found
                </Text>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Remove Member Modal */}
        <Modal
          onClose={() => {
            setRemoveModalOpen(false);
            setSelectedMember(null);
          }}
          opened={removeModalOpen}
          centered
          title="Remove Member"
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to remove {selectedMember?.user.name} from the organization?
            </Text>
            <Group gap="sm" justify="flex-end">
              <Button
                onClick={() => {
                  setRemoveModalOpen(false);
                  setSelectedMember(null);
                }}
                variant="subtle"
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={() => selectedMember && handleRemoveMember(selectedMember.id)}
              >
                Remove
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Tabs.Panel pt="lg" value="invitations">
          <Card shadow="sm" withBorder padding="lg" radius="md">
            <Stack gap="md">
              <div>
                <Title order={3}>Invitations</Title>
                <Text c="dimmed" size="sm">
                  Invite new members to the organization
                </Text>
              </div>
              <Group gap="sm">
                <TextInput
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  style={{ flex: 1 }}
                  value={inviteEmail}
                />
                <Select
                  onChange={(value) => value && setInviteRole(value)}
                  style={{ width: 120 }}
                  data={[
                    { label: 'Admin', value: 'admin' },
                    { label: 'Member', value: 'member' },
                  ]}
                  value={inviteRole}
                />
                {teams.length > 0 && (
                  <Select
                    onChange={(value) => setInviteTeamId(value || '')}
                    placeholder="Select team"
                    style={{ width: 150 }}
                    data={[
                      { label: 'No team', value: '' },
                      ...teams.map((team) => ({
                        label: team.name,
                        value: team.id,
                      })),
                    ]}
                    value={inviteTeamId}
                  />
                )}
                <Button leftSection={<IconMail size={16} />} onClick={handleInvite}>
                  Send Invite
                </Button>
              </Group>

              {invitations.length > 0 ? (
                <Table highlightOnHover striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Team</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Invited By</Table.Th>
                      <Table.Th>Expires</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {invitations.map((invitation) => (
                      <Table.Tr key={invitation.id}>
                        <Table.Td>{invitation.email}</Table.Td>
                        <Table.Td>
                          <Badge color="gray">{invitation.role}</Badge>
                        </Table.Td>
                        <Table.Td>
                          {teams.find((t) => t.id === invitation.teamId)?.name || '-'}
                        </Table.Td>
                        <Table.Td>
                          <Badge color={invitation.status === 'pending' ? 'blue' : 'gray'}>
                            {invitation.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm">{invitation.inviter.user.name}</Text>
                            <Text c="dimmed" size="xs">
                              {invitation.inviter.user.email}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>{new Date(invitation.expiresAt).toLocaleDateString()}</Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {invitation.status === 'pending' && (
                            <ActionIcon
                              onClick={() => handleCancelInvitation(invitation.id)}
                              variant="subtle"
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" py="md" ta="center">
                  No pending invitations
                </Text>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel pt="lg" value="teams">
          <Card shadow="sm" withBorder padding="lg" radius="md">
            <Stack gap="md">
              <div>
                <Title order={3}>Teams</Title>
                <Text c="dimmed" size="sm">
                  Organize members into teams
                </Text>
              </div>
              <Group gap="sm">
                <TextInput
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  style={{ flex: 1 }}
                  value={newTeamName}
                />
                <Button leftSection={<IconPlus size={16} />} onClick={handleCreateTeam}>
                  Create Team
                </Button>
              </Group>

              {teams.length > 0 ? (
                <Table highlightOnHover striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Members</Table.Th>
                      <Table.Th>Created</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {teams.map((team) => (
                      <Table.Tr key={team.id}>
                        <Table.Td>{team.name}</Table.Td>
                        <Table.Td>{team.members?.length || 0}</Table.Td>
                        <Table.Td>{new Date(team.createdAt).toLocaleDateString()}</Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <ActionIcon
                            color="red"
                            onClick={() => {
                              setSelectedTeam(team);
                              setRemoveTeamModalOpen(true);
                            }}
                            variant="subtle"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" py="md" ta="center">
                  No teams created yet
                </Text>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Remove Team Modal */}
        <Modal
          onClose={() => {
            setRemoveTeamModalOpen(false);
            setSelectedTeam(null);
          }}
          opened={removeTeamModalOpen}
          centered
          title="Remove Team"
        >
          <Stack gap="md">
            <Text>Are you sure you want to remove the team "{selectedTeam?.name}"?</Text>
            <Group gap="sm" justify="flex-end">
              <Button
                onClick={() => {
                  setRemoveTeamModalOpen(false);
                  setSelectedTeam(null);
                }}
                variant="subtle"
              >
                Cancel
              </Button>
              <Button color="red" onClick={() => selectedTeam && handleRemoveTeam(selectedTeam.id)}>
                Remove
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Tabs>
    </Stack>
  );
}
