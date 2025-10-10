import type { Editor, Range } from '@tiptap/core';
import { atom } from 'jotai';
import type {
  AICompletionState,
  AIHighlightState,
  Collaborator,
  CommandMenuState,
  DocumentListItem,
  EditorSelectionState,
  SyncStatus,
} from '../types';

/**
 * Core editor state atoms
 */

// Editor instance
export const editorAtom = atom<Editor | null>(null);

// Editor editability
export const isEditableAtom = atom<boolean>(true);

// Dirty state (unsaved changes)
export const isDirtyAtom = atom<boolean>(false);

/**
 * Selection state atoms
 */
export const selectionAtom = atom<EditorSelectionState>({
  from: 0,
  to: 0,
  empty: true,
});

/**
 * Command menu state atoms (for EditorCommand components)
 */
export const queryAtom = atom('');
export const rangeAtom = atom<Range | null>(null);

/**
 * AI feature atoms
 */
export const aiHighlightAtom = atom<AIHighlightState>({
  from: 0,
  to: 0,
  isActive: false,
  color: '#c1ecf970',
  defaultColor: '#c1ecf970',
});

export const aiCompletionAtom = atom<AICompletionState>({
  text: '',
  isLoading: false,
  error: null,
});

/**
 * Command menu atoms
 */
export const commandMenuAtom = atom<CommandMenuState>({
  isOpen: false,
  query: '',
  selectedIndex: 0,
});

/**
 * Collaboration atoms
 */
export const collaboratorsAtom = atom<Collaborator[]>([]);

export const syncStatusAtom = atom<SyncStatus>('synced');

export const currentUserAtom = atom<{
  id: string;
  name: string;
  color: string;
} | null>(null);

// Yjs collaboration atoms
export const yjsDocAtom = atom<any | null>(null);

export const yjsProviderAtom = atom<any | null>(null);

/**
 * Document management atoms
 */
export const documentsAtom = atom<DocumentListItem[]>([]);

export const currentDocumentIdAtom = atom<string | null>(null);

export const searchQueryAtom = atom<string>('');

export const isLoadingDocumentsAtom = atom<boolean>(false);

export const documentsErrorAtom = atom<string | null>(null);

/**
 * Persistence atoms
 */
export const autoSaveEnabledAtom = atom<boolean>(true);

export const autoSaveIntervalAtom = atom<number>(5000); // 5 seconds

export const lastSavedAtom = atom<Date | null>(null);

export const isSavingAtom = atom<boolean>(false);

export const saveErrorAtom = atom<string | null>(null);

/**
 * UI state atoms
 */
export const showToolbarAtom = atom<boolean>(true);

export const showSidebarAtom = atom<boolean>(false);

export const editorThemeAtom = atom<'light' | 'dark'>('light');

/**
 * Focus state
 */
export const isEditorFocusedAtom = atom<boolean>(false);

/**
 * Content metadata
 */
export const characterCountAtom = atom<number>(0);

export const wordCountAtom = atom<number>(0);

export const readingTimeAtom = atom<number>(0); // in minutes
