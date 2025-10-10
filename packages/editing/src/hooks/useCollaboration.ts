import { useAtomValue } from 'jotai';
import {
  collaboratorsAtom,
  isCollaboratingAtom,
  syncStatusAtom,
  yjsDocAtom,
  yjsProviderAtom,
} from '../state';
import type { Collaborator, SyncStatus } from '../types';

/**
 * Hook for accessing collaboration state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { collaborators, syncStatus, isConnected } = useCollaboration();
 *
 *   return (
 *     <div>
 *       {isConnected && <Badge>Connected</Badge>}
 *       <Text>{collaborators.length} people editing</Text>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCollaboration() {
  const collaborators = useAtomValue(collaboratorsAtom);
  const syncStatus = useAtomValue(syncStatusAtom);
  const yjsDoc = useAtomValue(yjsDocAtom);
  const provider = useAtomValue(yjsProviderAtom);
  const isCollaborating = useAtomValue(isCollaboratingAtom);

  const isConnected = syncStatus === 'synced' || syncStatus === 'syncing';
  const isOffline = syncStatus === 'offline';
  const hasError = syncStatus === 'error';

  return {
    /** List of active collaborators */
    collaborators,
    /** Current sync status */
    syncStatus,
    /** Yjs document instance */
    yjsDoc,
    /** WebSocket provider instance */
    provider,
    /** Whether collaboration is active */
    isCollaborating,
    /** Whether connected to collaboration server */
    isConnected,
    /** Whether currently offline */
    isOffline,
    /** Whether there's a connection error */
    hasError,
    /** Number of active collaborators */
    collaboratorCount: collaborators.length,
  };
}

/**
 * Hook for accessing specific collaborator information
 *
 * @param userId - User ID to find
 * @returns Collaborator object or undefined
 *
 * @example
 * ```tsx
 * function UserCursor({ userId }: { userId: string }) {
 *   const collaborator = useCollaborator(userId);
 *
 *   if (!collaborator) return null;
 *
 *   return <div style={{ color: collaborator.color }}>{collaborator.name}</div>;
 * }
 * ```
 */
export function useCollaborator(userId: string): Collaborator | undefined {
  const collaborators = useAtomValue(collaboratorsAtom);
  return collaborators.find(c => c.id === userId);
}

/**
 * Hook for accessing sync status information
 *
 * @returns Sync status details
 *
 * @example
 * ```tsx
 * function SyncIndicator() {
 *   const { status, label, color } = useSyncStatus();
 *
 *   return <Badge color={color}>{label}</Badge>;
 * }
 * ```
 */
export function useSyncStatus() {
  const syncStatus = useAtomValue(syncStatusAtom);

  const getStatusLabel = (status: SyncStatus): string => {
    switch (status) {
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

  const getStatusColor = (status: SyncStatus): string => {
    switch (status) {
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

  return {
    /** Current sync status */
    status: syncStatus,
    /** Human-readable status label */
    label: getStatusLabel(syncStatus),
    /** Color for status badge */
    color: getStatusColor(syncStatus),
    /** Whether currently syncing */
    isSyncing: syncStatus === 'syncing',
    /** Whether fully synced */
    isSynced: syncStatus === 'synced',
    /** Whether offline */
    isOffline: syncStatus === 'offline',
    /** Whether there's an error */
    hasError: syncStatus === 'error',
  };
}
