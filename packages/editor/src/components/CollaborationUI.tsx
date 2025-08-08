'use client';

import { ActionIcon, Box, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { IconMessage, IconSettings, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import { Collaborator } from '../types/index';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { PresenceIndicator } from './PresenceIndicator';

interface CollaborationUIProps {
  collaborators: Collaborator[];
  isConnected: boolean;
  documentTitle?: string;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
  showChatButton?: boolean;
  showSettingsButton?: boolean;
}

export function CollaborationUI({
  collaborators,
  isConnected,
  documentTitle,
  onOpenChat,
  onOpenSettings,
  showChatButton = true,
  showSettingsButton = true,
}: CollaborationUIProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeCollaborators = collaborators.filter(c => c.isActive);
  const inactiveCollaborators = collaborators.filter(c => !c.isActive);

  return (
    <Paper p="md" shadow="sm" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group>
            <IconUsers size={16} />
            <Text size="sm" fw={500}>
              {documentTitle || 'Collaboration'}
            </Text>
          </Group>

          <Group gap="xs">
            {showChatButton && (
              <ActionIcon variant="subtle" size="sm" onClick={onOpenChat} title="Open chat">
                <IconMessage size={14} />
              </ActionIcon>
            )}

            {showSettingsButton && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={onOpenSettings}
                title="Collaboration settings"
              >
                <IconSettings size={14} />
              </ActionIcon>
            )}

            <PresenceIndicator isConnected={isConnected} />
          </Group>
        </Group>

        {activeCollaborators.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text size="xs" c="dimmed" mb="xs">
                Active ({activeCollaborators.length})
              </Text>
              <Group gap="xs">
                {activeCollaborators.slice(0, 5).map(collaborator => (
                  <CollaboratorAvatar key={collaborator.id} collaborator={collaborator} size="sm" />
                ))}
                {activeCollaborators.length > 5 && (
                  <Text size="xs" c="dimmed">
                    +{activeCollaborators.length - 5} more
                  </Text>
                )}
              </Group>
            </Box>
          </>
        )}

        {inactiveCollaborators.length > 0 && (
          <>
            <Divider />
            <Box>
              <Group
                justify="space-between"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Text size="xs" c="dimmed">
                  Recently active ({inactiveCollaborators.length})
                </Text>
                <Text size="xs" c="dimmed">
                  {isExpanded ? '−' : '+'}
                </Text>
              </Group>

              {isExpanded && (
                <Group gap="xs" mt="xs">
                  {inactiveCollaborators.map(collaborator => (
                    <CollaboratorAvatar
                      key={collaborator.id}
                      collaborator={collaborator}
                      size="sm"
                    />
                  ))}
                </Group>
              )}
            </Box>
          </>
        )}

        {collaborators.length === 0 && (
          <>
            <Divider />
            <Text size="xs" c="dimmed" ta="center">
              No other collaborators
            </Text>
          </>
        )}
      </Stack>
    </Paper>
  );
}
