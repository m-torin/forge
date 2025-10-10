/**
 * Hooks
 *
 * React hooks for editor functionality
 */

// Editor hooks
export { useEditor, useEditorInstance, useEditorSelection, useEditorStats } from './useEditor';

// Persistence hooks
export { usePersistence } from './usePersistence';
export type { UsePersistenceOptions } from './usePersistence';

// Command menu hooks
export { useCommandMenu } from './useCommandMenu';

// AI hooks
export { useAICompletion } from './useAICompletion';
export type { UseAICompletionOptions } from './useAICompletion';

// Collaboration hooks
export { useCollaboration, useCollaborator, useSyncStatus } from './useCollaboration';
