import type { Editor } from '@tiptap/core';
import type * as Y from 'yjs';

/**
 * Collaborator information
 */
export interface Collaborator {
  /** Unique collaborator ID */
  id: string;
  /** Optional client ID from provider */
  clientId?: number | string;
  /** Collaborator name */
  name: string;
  /** Collaborator color (for cursor) */
  color: string;
  /** Collaborator avatar URL */
  avatar?: string;
  /** Current cursor position */
  cursor?: {
    from: number;
    to: number;
  } | null;
  /** Last active timestamp */
  lastActive?: Date;
}

/**
 * Collaboration provider configuration
 */
export interface CollaborationConfig {
  /** Document ID */
  documentId: string;
  /** WebSocket URL */
  websocketUrl: string;
  /** Current user ID */
  userId: string;
  /** Current user name */
  userName: string;
  /** Current user color */
  userColor?: string;
  /** Current user avatar */
  userAvatar?: string;
  /** Authentication token */
  token?: string;
  /** Whether to enable awareness (presence) */
  awareness?: boolean;
}

/**
 * Collaboration sync status
 */
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'disconnected' | 'offline';

/**
 * Collaboration event types
 */
export interface CollaborationEvents {
  /** User joined */
  'user:joined': (collaborator: Collaborator) => void;
  /** User left */
  'user:left': (userId: string) => void;
  /** Sync status changed */
  'sync:status': (status: SyncStatus) => void;
  /** Content synced */
  'sync:content': () => void;
  /** Error occurred */
  error: (error: Error) => void;
}

/**
 * Y.js document state
 */
export interface YjsDocumentState {
  /** Y.Doc instance */
  doc: Y.Doc;
  /** Shared type (usually Y.XmlFragment) */
  type: Y.XmlFragment;
  /** Provider instance */
  provider: any; // WebsocketProvider or HocuspocusProvider
  /** Awareness instance */
  awareness?: any;
}

/**
 * Collaboration provider props
 */
export interface CollaborationProviderProps extends CollaborationConfig {
  /** Editor instance */
  editor?: Editor;
  /** Children elements */
  children?: React.ReactNode;
  /** On sync status change */
  onSyncStatus?: (status: SyncStatus) => void;
  /** On collaborators change */
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void;
}

/**
 * Presence data structure
 */
export interface PresenceData {
  user: {
    id: string;
    name: string;
    color: string;
    avatar?: string;
  };
  cursor?: {
    anchor: number;
    head: number;
  } | null;
  lastUpdate: number;
}
