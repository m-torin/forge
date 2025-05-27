'use client';

import {
  Card,
  Code,
  Divider,
  Grid,
  Group,
  NavLink,
  Portal,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBuilding,
  IconClock,
  IconFingerprint,
  IconKey,
  IconShieldLock,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import * as betterAuthActions from '@repo/auth/actions';

import * as prismaActions from './actions';

interface TestResult {
  betterAuthResponse?: {
    success: boolean;
    data: any;
    error?: string;
  };
  endpoint: string;
  method: string;
  prismaResponse?: {
    success: boolean;
    data: any;
    error?: string;
  };
  timestamp: string;
}

export default function DebugAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>('session');
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Initialize active section from URL on mount
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Update URL when section changes
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('section', sectionId);
    router.push(`?${newSearchParams.toString()}`);
  };

  const testAction = async (
    description: string,
    betterAuthAction: () => Promise<any>,
    prismaAction?: () => Promise<any>,
  ) => {
    setLoading(description);

    try {
      // Test Better Auth action
      const betterAuthResponse = await betterAuthAction();

      const result: TestResult = {
        betterAuthResponse,
        endpoint: description,
        method: 'ACTION',
        timestamp: new Date().toISOString(),
      };

      // Test Prisma action if provided
      if (prismaAction) {
        const prismaResponse = await prismaAction();
        result.prismaResponse = prismaResponse;
      }

      setCurrentResult(result);

      if (result.betterAuthResponse?.success) {
        notifications.show({
          color: 'green',
          message: `${description} completed successfully`,
          title: 'Success',
        });
      } else {
        notifications.show({
          color: 'red',
          message: `${description} failed`,
          title: 'Error',
        });
      }
    } catch (error) {
      const result: TestResult = {
        betterAuthResponse: {
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        },
        endpoint: description,
        method: 'ACTION',
        timestamp: new Date().toISOString(),
      };

      setCurrentResult(result);

      notifications.show({
        color: 'red',
        message: `Failed to test ${description}`,
        title: 'Error',
      });
    } finally {
      setLoading(null);
    }
  };

  const isLoading = (description: string) => {
    return loading === description;
  };

  const sections = [
    {
      id: 'session',
      buttons: [
        {
          description: 'Get Current Session',
          label: 'Get Session',
          onClick: () =>
            testAction(
              'Get Current Session',
              betterAuthActions.getSession,
              prismaActions.getCurrentSessionFromDatabase,
            ),
        },
        {
          color: 'red',
          description: 'Delete Session',
          label: 'Delete Session',
          onClick: () => testAction('Delete Session', betterAuthActions.deleteSession),
        },
      ],
      icon: IconClock,
      title: 'Session Management',
    },
    {
      id: 'user',
      buttons: [
        {
          description: 'Get Current User',
          label: 'Get User',
          onClick: () =>
            testAction(
              'Get Current User',
              betterAuthActions.getCurrentUser,
              prismaActions.getCurrentUserFromDatabase,
            ),
        },
        {
          description: 'Update User',
          label: 'Update User',
          onClick: () =>
            testAction('Update User', () => betterAuthActions.updateUser({ name: 'Updated Name' })),
        },
        {
          color: 'red',
          description: 'Delete User',
          label: 'Delete User',
          onClick: () => testAction('Delete User', betterAuthActions.deleteUser),
        },
        {
          description: 'Get User Accounts',
          label: 'Get Accounts',
          onClick: () =>
            testAction(
              'Get User Accounts',
              async () => ({ data: null, error: 'No Better Auth endpoint', success: false }),
              prismaActions.getAccountsFromDatabase,
            ),
        },
      ],
      icon: IconUser,
      title: 'User Management',
    },
    {
      id: 'admin-users',
      buttons: [
        {
          description: 'List All Users',
          label: 'List Users',
          onClick: () =>
            testAction(
              'List All Users',
              betterAuthActions.listUsers,
              prismaActions.getUsersFromDatabase,
            ),
        },
        {
          description: 'List All Sessions',
          label: 'List Sessions',
          onClick: () =>
            testAction(
              'List All Sessions',
              betterAuthActions.listSessions,
              prismaActions.getSessionsFromDatabase,
            ),
        },
        {
          description: 'Impersonate User',
          label: 'Test Impersonate',
          onClick: () =>
            testAction('Impersonate User', () => betterAuthActions.impersonateUser('test-user-id')),
        },
        {
          color: 'orange',
          description: 'Ban User',
          label: 'Test Ban',
          onClick: () => testAction('Ban User', () => betterAuthActions.banUser('test-user-id')),
        },
        {
          color: 'green',
          description: 'Unban User',
          label: 'Test Unban',
          onClick: () =>
            testAction('Unban User', () => betterAuthActions.unbanUser('test-user-id')),
        },
      ],
      icon: IconUsers,
      title: 'Admin - User Operations',
    },
    {
      id: 'organizations',
      buttons: [
        {
          description: 'Get Active Organization',
          label: 'Get Active Org',
          onClick: () =>
            testAction(
              'Get Active Organization',
              betterAuthActions.getActiveOrganization,
              prismaActions.getCurrentOrganizationFromDatabase,
            ),
        },
        {
          description: 'Create Organization',
          label: 'Create Org',
          onClick: () =>
            testAction('Create Organization', () =>
              betterAuthActions.createOrganization({ name: 'Test Org' }),
            ),
        },
        {
          description: 'Update Organization',
          label: 'Update Org',
          onClick: () =>
            testAction('Update Organization', () =>
              betterAuthActions.updateOrganization({ name: 'Updated Org' }),
            ),
        },
        {
          color: 'red',
          description: 'Delete Organization',
          label: 'Delete Org',
          onClick: () => testAction('Delete Organization', betterAuthActions.deleteOrganization),
        },
        {
          description: 'List User Organizations',
          label: 'List My Orgs',
          onClick: () =>
            testAction(
              'List User Organizations',
              betterAuthActions.listUserOrganizations,
              prismaActions.getUserOrganizationsFromDatabase,
            ),
        },
        {
          description: 'List All Organizations',
          label: 'List All Orgs',
          onClick: () =>
            testAction(
              'List All Organizations',
              betterAuthActions.listAllOrganizations,
              prismaActions.getOrganizationsFromDatabase,
            ),
        },
      ],
      icon: IconBuilding,
      title: 'Organization Management',
    },
    {
      id: 'api-keys',
      buttons: [
        {
          description: 'List API Keys',
          label: 'List Keys',
          onClick: () =>
            testAction(
              'List API Keys',
              betterAuthActions.listApiKeys,
              prismaActions.getApiKeysFromDatabase,
            ),
        },
        {
          description: 'Create API Key',
          label: 'Create Key',
          onClick: () =>
            testAction('Create API Key', () => betterAuthActions.createApiKey('Test Key')),
        },
        {
          description: 'Update API Key',
          label: 'Update Key',
          onClick: () =>
            testAction('Update API Key', () =>
              betterAuthActions.updateApiKey('test-id', 'Updated Key'),
            ),
        },
        {
          color: 'red',
          description: 'Delete API Key',
          label: 'Delete Key',
          onClick: () =>
            testAction('Delete API Key', () => betterAuthActions.deleteApiKey('test-id')),
        },
      ],
      icon: IconKey,
      title: 'API Key Management',
    },
    {
      id: '2fa',
      buttons: [
        {
          description: 'Get 2FA Status',
          label: 'Get Status',
          onClick: () =>
            testAction(
              'Get 2FA Status',
              betterAuthActions.getTwoFactorStatus,
              prismaActions.getTwoFactorFromDatabase,
            ),
        },
        {
          description: 'Enable 2FA',
          label: 'Enable 2FA',
          onClick: () => testAction('Enable 2FA', betterAuthActions.enableTwoFactor),
        },
        {
          description: 'Disable 2FA',
          label: 'Disable 2FA',
          onClick: () =>
            testAction('Disable 2FA', () => betterAuthActions.disableTwoFactor('test123')),
        },
        {
          description: 'Get Backup Codes',
          label: 'Get Backup Codes',
          onClick: () => testAction('Get Backup Codes', betterAuthActions.getTwoFactorBackupCodes),
        },
      ],
      icon: IconShieldLock,
      title: 'Two-Factor Authentication',
    },
    {
      id: 'passkeys',
      buttons: [
        {
          description: 'List Passkeys',
          label: 'List Passkeys',
          onClick: () =>
            testAction(
              'List Passkeys',
              betterAuthActions.listPasskeys,
              prismaActions.getPasskeysFromDatabase,
            ),
        },
        {
          description: 'Get Registration Options',
          label: 'Register Options',
          onClick: () =>
            testAction(
              'Get Registration Options',
              betterAuthActions.generatePasskeyRegistrationOptions,
            ),
        },
        {
          color: 'red',
          description: 'Delete Passkey',
          label: 'Delete Passkey',
          onClick: () =>
            testAction('Delete Passkey', () => betterAuthActions.deletePasskey('test-id')),
        },
      ],
      icon: IconFingerprint,
      title: 'Passkeys',
    },
    {
      id: 'stats',
      buttons: [
        {
          description: 'Get Database Statistics',
          label: 'Get Stats',
          onClick: () =>
            testAction(
              'Get Database Statistics',
              async () => ({ data: null, error: 'No Better Auth endpoint', success: false }),
              prismaActions.getDatabaseStats,
            ),
        },
      ],
      icon: IconUsers,
      title: 'Database Stats',
    },
  ];

  return (
    <>
      {/* Portal sidebar content into AppShell.Navbar */}
      <Portal target="#debug-auth-navbar">
        <Stack gap="sm">
          <Title order={4}>API Actions</Title>
          <Divider />
          <ScrollArea style={{ height: 'calc(100vh - 160px)' }}>
            <Stack gap={4}>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <NavLink
                    key={section.id}
                    leftSection={<Icon size={18} />}
                    onClick={() => handleSectionChange(section.id)}
                    childrenOffset={28}
                    defaultOpened={activeSection === section.id}
                    label={section.title}
                  >
                    {section.buttons.map((button, index) => (
                      <NavLink
                        key={`${section.id}-${index}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          button.onClick();
                        }}
                        styles={{
                          label: { width: '100%' },
                        }}
                        active={activeSection === section.id && isLoading(button.description)}
                        label={
                          <Group gap="xs" justify="space-between" wrap="nowrap">
                            <Text
                              style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                              size="sm"
                            >
                              {button.label}
                            </Text>
                            {button.color && (
                              <Text c={button.color} fw={600} size="xs">
                                {button.color.toUpperCase()}
                              </Text>
                            )}
                          </Group>
                        }
                      />
                    ))}
                  </NavLink>
                );
              })}
            </Stack>
          </ScrollArea>
        </Stack>
      </Portal>

      <Stack style={{ height: 'calc(100vh - 120px)' }} gap="md">
        <Grid gutter="md" h="100%">
          {currentResult ? (
            <>
              {/* Better Auth Response */}
              <Grid.Col span={currentResult.prismaResponse ? 6 : 12}>
                <Card shadow="sm" h="100%" p="lg" radius="md">
                  <Stack gap="sm" h="100%">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Title order={4}>Better Auth Response</Title>
                        <Text c="dimmed" size="xs">
                          {currentResult.endpoint}
                        </Text>
                      </Group>
                      <Text
                        c={currentResult.betterAuthResponse?.success ? 'green' : 'red'}
                        fw={600}
                        size="sm"
                      >
                        {currentResult.betterAuthResponse?.success ? 'SUCCESS' : 'FAILED'}
                      </Text>
                    </Group>
                    {currentResult.betterAuthResponse?.error && (
                      <Text c="red" size="sm">
                        Error: {currentResult.betterAuthResponse.error}
                      </Text>
                    )}
                    <ScrollArea style={{ flex: 1 }}>
                      <Code block>
                        {JSON.stringify(currentResult.betterAuthResponse?.data, null, 2)}
                      </Code>
                    </ScrollArea>
                  </Stack>
                </Card>
              </Grid.Col>

              {/* Prisma Response (if available) */}
              {currentResult.prismaResponse && (
                <Grid.Col span={6}>
                  <Card shadow="sm" h="100%" p="lg" radius="md">
                    <Stack gap="sm" h="100%">
                      <Group justify="space-between">
                        <Title order={4}>Prisma Direct Query</Title>
                        <Text
                          c={currentResult.prismaResponse.success ? 'green' : 'red'}
                          fw={600}
                          size="sm"
                        >
                          {currentResult.prismaResponse.success ? 'SUCCESS' : 'FAILED'}
                        </Text>
                      </Group>
                      {currentResult.prismaResponse.error && (
                        <Text c="red" size="sm">
                          Error: {currentResult.prismaResponse.error}
                        </Text>
                      )}
                      <ScrollArea style={{ flex: 1 }}>
                        <Code block>
                          {JSON.stringify(currentResult.prismaResponse.data, null, 2)}
                        </Code>
                      </ScrollArea>
                    </Stack>
                  </Card>
                </Grid.Col>
              )}
            </>
          ) : (
            <Grid.Col span={12}>
              <Card shadow="sm" p="xl" radius="md">
                <Stack align="center" gap="md" py="xl">
                  <Text c="dimmed" size="lg">
                    Select an API action to test
                  </Text>
                  <Text c="dimmed" size="sm">
                    Results will appear here
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </>
  );
}
