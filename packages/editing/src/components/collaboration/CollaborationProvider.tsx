'use client';

import { safeEnv } from '@repo/editing/env';
import { useAtom, useSetAtom } from 'jotai';
import type { FC, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { collaboratorsAtom, syncStatusAtom, yjsDocAtom, yjsProviderAtom } from '../../state';
import type { Collaborator } from '../../types';

export interface CollaborationProviderProps {
  /** Document ID for collaboration */
  documentId: string;
  /** Current user information */
  user: Omit<Collaborator, 'clientId'>;
  /**
   * WebSocket server URL (optional)
   * Priority: serverUrl prop > COLLABORATION_WS_URL env > ws://localhost:1234 (default)
   */
  serverUrl?: string;
  /** Room name prefix (optional) */
  roomPrefix?: string;
  /** Connection timeout in ms */
  timeout?: number;
  /** Enable awareness (cursor tracking) */
  enableAwareness?: boolean;
  /** Children components */
  children: ReactNode;
  /** On connection status change */
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
  /** On collaborators change */
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void;
}

/**
 * CollaborationProvider component
 *
 * Manages WebSocket connection and Yjs document synchronization
 *
 * @example
 * ```tsx
 * <CollaborationProvider
 *   documentId="doc-123"
 *   user={{ id: '1', name: 'John Doe', color: '#FF0000' }}
 *   enableAwareness
 * >
 *   <EditorRoot>
 *     <EditorContent extensions={createCollaborationPreset()} />
 *   </EditorRoot>
 * </CollaborationProvider>
 * ```
 */
export const CollaborationProvider: FC<CollaborationProviderProps> = ({
  documentId,
  user,
  serverUrl,
  roomPrefix = 'doc',
  timeout = 30000,
  enableAwareness = true,
  children,
  onStatusChange,
  onCollaboratorsChange,
}) => {
  const [_yjsDoc, setYjsDoc] = useAtom(yjsDocAtom);
  const [_provider, setProvider] = useAtom(yjsProviderAtom);
  const setSyncStatus = useSetAtom(syncStatusAtom);
  const [_collaborators, setCollaborators] = useAtom(collaboratorsAtom);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (initRef.current) return;
    initRef.current = true;

    const env = safeEnv();
    const wsUrl = serverUrl || env.COLLABORATION_WS_URL || 'ws://localhost:1234';
    const roomName = `${roomPrefix}:${documentId}`;
    let connectionTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearConnectionTimeout = () => {
      if (!connectionTimeoutId) return;
      clearTimeout(connectionTimeoutId);
      connectionTimeoutId = null;
    };

    // Create Yjs document
    const doc = new Y.Doc();
    setYjsDoc(doc);

    // Create WebSocket provider
    const wsProvider = new WebsocketProvider(wsUrl, roomName, doc, {
      connect: true,
      params: {
        userId: user.id,
        userName: user.name,
      },
    });

    setProvider(wsProvider);

    if (timeout > 0) {
      connectionTimeoutId = setTimeout(() => {
        setSyncStatus('error');
        onStatusChange?.('error');
      }, timeout);
    }

    // Set up awareness (for cursor tracking)
    if (enableAwareness && wsProvider.awareness) {
      wsProvider.awareness.setLocalState({
        user: {
          id: user.id,
          name: user.name,
          color: user.color,
        },
      });

      // Track awareness changes
      const awarenessChangeHandler = () => {
        if (!wsProvider.awareness) return;

        const states = wsProvider.awareness.getStates();
        const currentCollaborators: Collaborator[] = [];

        states.forEach((state, clientId) => {
          if (state.user) {
            currentCollaborators.push({
              clientId,
              id: state.user.id,
              name: state.user.name,
              color: state.user.color,
            });
          }
        });

        setCollaborators(currentCollaborators);
        onCollaboratorsChange?.(currentCollaborators);
      };

      wsProvider.awareness.on('change', awarenessChangeHandler);
    }

    // Connection status handlers
    const handleSync = (synced: boolean) => {
      if (synced) {
        clearConnectionTimeout();
      }
      if (synced) {
        setSyncStatus('synced');
        onStatusChange?.('connected');
      } else {
        setSyncStatus('syncing');
        onStatusChange?.('connecting');
      }
    };

    const handleConnectionStatus = (event: { status: string }) => {
      switch (event.status) {
        case 'connected':
          clearConnectionTimeout();
          setSyncStatus('syncing');
          onStatusChange?.('connected');
          break;
        case 'disconnected':
          setSyncStatus('offline');
          onStatusChange?.('disconnected');
          break;
        default:
          setSyncStatus('error');
          onStatusChange?.('error');
      }
    };

    wsProvider.on('sync', handleSync);
    wsProvider.on('status', handleConnectionStatus);

    // Cleanup
    return () => {
      clearConnectionTimeout();
      wsProvider.disconnect();
      wsProvider.destroy();
      doc.destroy();
      setYjsDoc(null);
      setProvider(null);
      setSyncStatus('offline');
      setCollaborators([]);
    };
  }, [
    documentId,
    serverUrl,
    roomPrefix,
    user.id,
    user.name,
    user.color,
    enableAwareness,
    onCollaboratorsChange,
    onStatusChange,
    setSyncStatus,
    setCollaborators,
    setProvider,
    setYjsDoc,
    timeout,
  ]);

  return children;
};
