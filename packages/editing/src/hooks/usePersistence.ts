import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  autoSaveEnabledAtom,
  autoSaveIntervalAtom,
  currentDocumentIdAtom,
  editorAtom,
  isDirtyAtom,
  isSavingAtom,
  lastSavedAtom,
  saveErrorAtom,
} from '../state/atoms';
import type { DocumentMetadata, DocumentStorageAdapter } from '../types';

export interface UsePersistenceOptions {
  /** Storage adapter for saving/loading documents */
  storageAdapter?: DocumentStorageAdapter;
  /** Auto-save interval in milliseconds (0 to disable) */
  autoSaveInterval?: number;
  /** Callback when save succeeds */
  onSaveSuccess?: (document: DocumentMetadata) => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
  /** Callback when load succeeds */
  onLoadSuccess?: (document: DocumentMetadata) => void;
  /** Callback when load fails */
  onLoadError?: (error: Error) => void;
}

/**
 * Hook for document persistence (save/load)
 *
 * @param options - Persistence options
 * @returns Persistence state and actions
 *
 * @example
 * ```tsx
 * import { createLocalStorageStore } from '@repo/editing/utils';
 *
 * function MyEditor() {
 *   const storageAdapter = createLocalStorageStore('my-docs');
 *
 *   const { save, load, isSaving, lastSaved, isDirty } = usePersistence({
 *     storageAdapter,
 *     autoSaveInterval: 30000, // 30 seconds
 *     onSaveSuccess: (doc) => console.log('Saved:', doc.title)
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={save} disabled={!isDirty || isSaving}>
 *         {isSaving ? 'Saving...' : 'Save'}
 *       </button>
 *       {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePersistence(options: UsePersistenceOptions = {}) {
  const {
    storageAdapter,
    autoSaveInterval: providedInterval,
    onSaveSuccess,
    onSaveError,
    onLoadSuccess,
    onLoadError,
  } = options;

  const editor = useAtomValue(editorAtom);
  const [currentDocumentId, setCurrentDocumentId] = useAtom(currentDocumentIdAtom);
  const [isDirty, setIsDirty] = useAtom(isDirtyAtom);
  const [isSaving, setIsSaving] = useAtom(isSavingAtom);
  const [lastSaved, setLastSaved] = useAtom(lastSavedAtom);
  const [saveError, setSaveError] = useAtom(saveErrorAtom);
  const [autoSaveEnabled, setAutoSaveEnabled] = useAtom(autoSaveEnabledAtom);
  const [autoSaveInterval, setAutoSaveInterval] = useAtom(autoSaveIntervalAtom);

  // Set auto-save interval from options
  useEffect(() => {
    if (providedInterval !== undefined) {
      setAutoSaveInterval(providedInterval);
      setAutoSaveEnabled(providedInterval > 0);
    }
  }, [providedInterval, setAutoSaveInterval, setAutoSaveEnabled]);

  /**
   * Save current document
   */
  const save = useCallback(async () => {
    // TODO: Fix persistence - currentDocumentIdAtom stores ID not full document
    if (!editor || !currentDocumentId || !storageAdapter || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedDoc: DocumentMetadata = {
        id: currentDocumentId,
        title: '',
        content: {
          html: editor.getHTML(),
          json: editor.getJSON(),
          text: editor.getText(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await storageAdapter.save(updatedDoc);

      setLastSaved(new Date());
      setIsDirty(false);
      onSaveSuccess?.(updatedDoc);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Save failed');
      setSaveError(err.message);
      onSaveError?.(err);
    } finally {
      setIsSaving(false);
    }
  }, [
    editor,
    currentDocumentId,
    storageAdapter,
    isSaving,
    setIsSaving,
    setSaveError,
    setLastSaved,
    setIsDirty,
    onSaveSuccess,
    onSaveError,
  ]);

  /**
   * Load document by ID
   */
  const load = useCallback(
    async (documentId: string) => {
      if (!storageAdapter) {
        return;
      }

      try {
        const doc = await storageAdapter.load(documentId);

        setCurrentDocumentId(doc.id);

        if (editor && doc.content) {
          editor.commands.setContent(doc.content.json || doc.content.html || '');
        }

        setIsDirty(false);
        setLastSaved(doc.updatedAt);
        onLoadSuccess?.(doc);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Load failed');
        setSaveError(err.message);
        onLoadError?.(err);
      }
    },
    [
      storageAdapter,
      editor,
      setCurrentDocumentId,
      setIsDirty,
      setLastSaved,
      setSaveError,
      onLoadSuccess,
      onLoadError,
    ],
  );

  /**
   * Create new document
   */
  const createNew = useCallback(
    (title: string = 'Untitled Document') => {
      const newDoc: DocumentMetadata = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCurrentDocumentId(newDoc.id);
      setIsDirty(false);

      if (editor) {
        editor.commands.setContent('');
      }

      return newDoc;
    },
    [editor, setCurrentDocumentId, setIsDirty],
  );

  /**
   * Delete document by ID
   */
  const deleteDocument = useCallback(
    async (documentId: string) => {
      if (!storageAdapter) {
        return;
      }

      try {
        await storageAdapter.delete(documentId);

        if (currentDocumentId === documentId) {
          setCurrentDocumentId(null);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Delete failed');
        setSaveError(err.message);
        throw err;
      }
    },
    [storageAdapter, currentDocumentId, setCurrentDocumentId, setSaveError],
  );

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || autoSaveInterval === 0 || !isDirty) {
      return;
    }

    const timer = setTimeout(() => {
      save();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [autoSaveEnabled, autoSaveInterval, isDirty, save]);

  return {
    /** Current document ID */
    currentDocumentId,
    /** Whether content has unsaved changes */
    isDirty,
    /** Whether currently saving */
    isSaving,
    /** Last saved timestamp */
    lastSaved,
    /** Save error message */
    saveError,
    /** Whether auto-save is enabled */
    autoSaveEnabled,
    /** Auto-save interval in ms */
    autoSaveInterval,
    /** Save current document */
    save,
    /** Load document by ID */
    load,
    /** Create new document */
    createNew,
    /** Delete document by ID */
    deleteDocument,
    /** Enable/disable auto-save */
    setAutoSaveEnabled,
    /** Set auto-save interval */
    setAutoSaveInterval,
  };
}
