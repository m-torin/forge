'use client';

import { Avatar, Badge, Group, Text, Tooltip } from '@mantine/core';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { collaboratorsAtom, syncStatusAtom } from '../../state';

export interface PresenceIndicatorProps {
  /** Maximum avatars to show before grouping */
  maxAvatars?: number;
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show sync status badge */
  showSyncStatus?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * PresenceIndicator component
 *
 * Shows active collaborators with avatars and sync status
 *
 * @example
 * ```tsx
 * <CollaborationProvider documentId="doc-123" user={currentUser}>
 *   <EditorRoot>
 *     <PresenceIndicator maxAvatars={5} showSyncStatus />
 *     <EditorContent extensions={createCollaborationPreset()} />
 *   </EditorRoot>
 * </CollaborationProvider>
 * ```
 */
export const PresenceIndicator: FC<PresenceIndicatorProps> = ({
  maxAvatars = 5,
  size = 'sm',
  showSyncStatus = true,
  className,
}) => {
  const collaborators = useAtomValue(collaboratorsAtom);
  const syncStatus = useAtomValue(syncStatusAtom);

  const visibleCollaborators = collaborators.slice(0, maxAvatars);
  const hiddenCount = Math.max(0, collaborators.length - maxAvatars);

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'green';
      case 'syncing':
        return 'blue';
      case 'offline':
        return 'gray';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  if (collaborators.length === 0 && !showSyncStatus) {
    return null;
  }

  return (
    <Group gap="xs" className={className}>
      {showSyncStatus && (
        <Badge color={getSyncStatusColor()} variant="light" size="sm">
          {getSyncStatusText()}
        </Badge>
      )}

      {collaborators.length > 0 && (
        <Group gap={4}>
          <Avatar.Group>
            {visibleCollaborators.map(collaborator => (
              <Tooltip key={collaborator.clientId} label={collaborator.name} withArrow>
                <Avatar
                  size={size}
                  radius="xl"
                  color={collaborator.color}
                  style={{
                    backgroundColor: collaborator.color,
                    cursor: 'pointer',
                  }}
                >
                  {collaborator.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </Avatar>
              </Tooltip>
            ))}

            {hiddenCount > 0 && (
              <Tooltip label={`${hiddenCount} more`} withArrow>
                <Avatar size={size} radius="xl">
                  +{hiddenCount}
                </Avatar>
              </Tooltip>
            )}
          </Avatar.Group>

          <Text size="sm" c="dimmed">
            {collaborators.length === 1
              ? '1 person editing'
              : `${collaborators.length} people editing`}
          </Text>
        </Group>
      )}
    </Group>
  );
};
