import type { Editor } from '@tiptap/core';
import type { Collaborator, SyncStatus } from './collaboration';
import type { DocumentMetadata } from './document';

/**
 * AI highlight state
 */
export interface AIHighlightState {
  from: number;
  to: number;
  isActive: boolean;
  color: string;
  defaultColor?: string;
}

/**
 * AI completion state
 */
export interface AICompletionState {
  text: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Command menu state
 */
export interface CommandMenuState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  position?: { top: number; left: number };
}

/**
 * Selection state (extended)
 */
export interface EditorSelectionState {
  from: number;
  to: number;
  empty: boolean;
  text?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isCode?: boolean;
}

/**
 * Editor global state
 */
export interface EditorGlobalState {
  /** Editor instance */
  editor: Editor | null;
  /** Is editable */
  isEditable: boolean;
  /** Has unsaved changes */
  isDirty: boolean;
  /** Current selection */
  selection: EditorSelectionState;
  /** AI features */
  ai: {
    highlight: AIHighlightState;
    completion: AICompletionState;
  };
  /** Command menu */
  commandMenu: CommandMenuState;
}

/**
 * Collaboration state
 */
export interface CollaborationState {
  /** Connected collaborators */
  collaborators: Collaborator[];
  /** Sync status */
  syncStatus: SyncStatus;
  /** Current user */
  currentUser: {
    id: string;
    name: string;
    color: string;
  } | null;
}

/**
 * Document state
 */
export interface DocumentState {
  /** Document ID */
  id: string | null;
  /** Document title */
  title: string;
  /** Document content */
  content: string;
  /** Created at */
  createdAt: Date | null;
  /** Updated at */
  updatedAt: Date | null;
  /** Is loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Document list item
 */
export type DocumentListItem = DocumentMetadata;

/**
 * Document management state
 */
export interface DocumentManagementState {
  /** All documents */
  documents: DocumentListItem[];
  /** Current document ID */
  currentDocumentId: string | null;
  /** Search query */
  searchQuery: string;
  /** Is loading list */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Persistence state
 */
export interface PersistenceState {
  /** Auto-save enabled */
  autoSaveEnabled: boolean;
  /** Auto-save interval (ms) */
  autoSaveInterval: number;
  /** Last saved timestamp */
  lastSaved: Date | null;
  /** Is saving */
  isSaving: boolean;
  /** Save error */
  error: string | null;
}
