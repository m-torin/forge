'use client';

import { Group, Paper, Stack } from '@mantine/core';
import { Provider as JotaiProvider } from 'jotai';
import type { FC } from 'react';
import { createCollaborationPreset } from '../../presets/collaboration';
import type { Collaborator } from '../../types';
import type { NotionEditorProps } from '../mantine/NotionEditor';
import { NotionEditor } from '../mantine/NotionEditor';
import { CollaborationProvider } from './CollaborationProvider';
import { CursorOverlay } from './CursorOverlay';
import { PresenceIndicator } from './PresenceIndicator';

export interface CollaborativeEditorProps extends Omit<NotionEditorProps, 'extensions'> {
  /** Document ID for collaboration */
  documentId: string;
  /** Current user information */
  user: Omit<Collaborator, 'clientId'>;
  /**
   * WebSocket server URL (optional)
   * Defaults to ws://localhost:1234 for easy local development
   */
  serverUrl?: string;
  /** Room name prefix (optional) */
  roomPrefix?: string;
  /** Show presence indicator */
  showPresence?: boolean;
  /** Show cursor labels */
  showCursorLabels?: boolean;
  /** Collaboration preset options */
  collaborationOptions?: Parameters<typeof createCollaborationPreset>[0];
  /** On connection status change */
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
  /** On collaborators change */
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void;
}

/**
 * CollaborativeEditor component
 *
 * Complete editor with real-time collaboration built-in
 * Combines CollaborationProvider, NotionEditor, PresenceIndicator, and CursorOverlay
 *
 * @example
 * ```tsx
 * <CollaborativeEditor
 *   documentId="doc-123"
 *   user={{ id: '1', name: 'John Doe', color: '#FF0000' }}
 *   content="<p>Start collaborating...</p>"
 *   onUpdate={({ html }) => console.log(html)}
 *   showPresence
 * />
 * ```
 */
export const CollaborativeEditor: FC<CollaborativeEditorProps> = ({
  documentId,
  user,
  serverUrl,
  roomPrefix = 'doc',
  showPresence = true,
  showCursorLabels = true,
  collaborationOptions = {},
  onStatusChange,
  onCollaboratorsChange,
  ...editorProps
}) => {
  // Create collaboration preset with provided options
  const extensions = createCollaborationPreset(collaborationOptions);

  return (
    <JotaiProvider>
      <CollaborationProvider
        documentId={documentId}
        user={user}
        serverUrl={serverUrl}
        roomPrefix={roomPrefix}
        enableAwareness
        onStatusChange={onStatusChange}
        onCollaboratorsChange={onCollaboratorsChange}
      >
        <Stack gap="md">
          {showPresence && (
            <Paper p="sm" withBorder>
              <Group justify="space-between">
                <PresenceIndicator showSyncStatus maxAvatars={5} />
              </Group>
            </Paper>
          )}

          <NotionEditor {...editorProps} extensions={extensions} />

          <CursorOverlay showLabels={showCursorLabels} />
        </Stack>
      </CollaborationProvider>
    </JotaiProvider>
  );
};
