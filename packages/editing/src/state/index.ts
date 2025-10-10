/**
 * Jotai state management for @repo/editing
 *
 * Provides reactive state for editor, collaboration, and document management
 */

// Re-export atoms
export {
  aiCompletionAtom,
  // AI
  aiHighlightAtom,
  // Persistence
  autoSaveEnabledAtom,
  autoSaveIntervalAtom,
  // Metadata
  characterCountAtom,
  // Collaboration
  collaboratorsAtom,
  // Command menu
  commandMenuAtom,
  currentDocumentIdAtom,
  currentUserAtom,
  // Documents
  documentsAtom,
  documentsErrorAtom,
  // Core
  editorAtom,
  editorThemeAtom,
  isDirtyAtom,
  isEditableAtom,
  isEditorFocusedAtom,
  isLoadingDocumentsAtom,
  isSavingAtom,
  lastSavedAtom,
  readingTimeAtom,
  saveErrorAtom,
  searchQueryAtom,
  selectionAtom,
  showSidebarAtom,
  // UI
  showToolbarAtom,
  syncStatusAtom,
  wordCountAtom,
  yjsDocAtom,
  yjsProviderAtom,
} from './atoms';

// Re-export selectors
export {
  activeMarksAtom,
  activeNodeTypeAtom,
  canRedoAtom,
  canUndoAtom,
  collaboratorCountAtom,
  contentStatusAtom,
  currentDocumentAtom,
  editorCapabilitiesAtom,
  filteredDocumentsAtom,
  hasSelectionAtom,
  isCollaboratingAtom,
  isEmptyAtom,
  isSyncedAtom,
  selectedTextAtom,
} from './selectors';
