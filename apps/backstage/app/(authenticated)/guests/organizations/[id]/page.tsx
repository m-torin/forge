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

// Note: Auth functions removed - this page now shows static demo data

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
      // Mock organization data
      const mockOrg: Organization = {
        id: organizationId,
        name: organizationId === '1' ? 'Demo Organization' : 'Test Company',
        createdAt: new Date().toISOString(),
        members: [
          {
            id: '1',
            createdAt: new Date().toISOString(),
            role: 'owner',
            user: {
              id: 'user1',
              name: 'John Doe',
              email: 'john@example.com',
            },
            userId: 'user1',
          },
          {
            id: '2',
            createdAt: new Date().toISOString(),
            role: 'member',
            user: {
              id: 'user2',
              name: 'Jane Smith',
              email: 'jane@example.com',
            },
            userId: 'user2',
          },
        ],
        metadata: { plan: 'pro', region: 'us-east-1' },
        slug: organizationId === '1' ? 'demo-org' : 'test-company',
      };

      setOrganization(mockOrg);
      setEditedOrg({
        name: mockOrg.name,
        logo: mockOrg.logo || '',
        metadata: JSON.stringify(mockOrg.metadata || {}, null, 2),
        slug: mockOrg.slug,
      });
    } catch (error) {
      console.error('Failed to load organization:', error);
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
      // Mock invitations data
      const mockInvitations: Invitation[] = [
        {
          id: '1',
          email: 'newuser@example.com',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          inviter: {
            user: {
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
          role: 'member',
          status: 'pending',
        },
      ];
      setInvitations(mockInvitations);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  }, [organizationId]);

  const loadTeams = useCallback(async () => {
    // TODO: Implement team listing functionality
    console.log('Team listing not implemented yet');
  }, [organizationId]);

  // Only one useEffect after all useCallbacks are defined
  useEffect(() => {
    loadOrganization();
    loadInvitations();
    loadTeams();
  }, [loadOrganization, loadInvitations, loadTeams]);

  const handleUpdate = async () => {
    // TODO: Implement organization update functionality
    notifications.show({
      color: 'orange',
      message: 'Organization update functionality not yet implemented',
      title: 'Not Implemented',
    });
  };

  const handleInvite = async () => {
    // TODO: Implement invitation functionality
    notifications.show({
      color: 'orange',
      message: 'Invitation functionality not yet implemented',
      title: 'Not Implemented',
    });
  };

  const handleCancelInvitation = async (invitationId: string) => {
    // TODO: Implement invitation cancellation
    console.log('Cancel invitation:', invitationId);
    notifications.show({
      color: 'orange',
      message: 'Invitation cancellation not yet implemented',
      title: 'Not Implemented',
    });
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    // TODO: Implement role update
    console.log('Update role:', memberId, newRole);
    notifications.show({
      color: 'orange',
      message: 'Role update functionality not yet implemented',
      title: 'Not Implemented',
    });
  };

  const handleRemoveMember = async (memberId: string) => {
    // TODO: Implement member removal
    console.log('Remove member:', memberId);
    notifications.show({
      color: 'orange',
      message: 'Member removal functionality not yet implemented',
      title: 'Not Implemented',
    });
    setRemoveModalOpen(false);
    setSelectedMember(null);
  };

  const handleCreateTeam = async () => {
    // TODO: Implement team creation
    notifications.show({
      color: 'orange',
      message: 'Team creation functionality not yet implemented',
      title: 'Not Implemented',
    });
  };

  const _handleUpdateTeam = async (teamId: string, name: string) => {
    // TODO: Implement team update
    console.log('Update team:', teamId, name);
    notifications.show({
      color: 'orange',
      message: 'Team update functionality not yet implemented',
      title: 'Not Implemented',
    });
  };

  const handleRemoveTeam = async (teamId: string) => {
    // TODO: Implement team removal
    console.log('Remove team:', teamId);
    notifications.show({
      color: 'orange',
      message: 'Team removal functionality not yet implemented',
      title: 'Not Implemented',
    });
    setRemoveTeamModalOpen(false);
    setSelectedTeam(null);
  };

  if (loading || !organization) {
    return (
      <Stack gap="lg">
        <Skeleton width={300} height={48} />
        <Stack gap="md">
          {[1, 2, 3].map((i) => (
            <Skeleton key={`skeleton-${i}`} height={128} />
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
