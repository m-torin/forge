import type { Editor } from '@tiptap/core';
import { useAtomValue } from 'jotai';
import {
  characterCountAtom,
  editorAtom,
  isDirtyAtom,
  isEditableAtom,
  isEditorFocusedAtom,
  readingTimeAtom,
  selectionAtom,
  wordCountAtom,
} from '../state/atoms';
import {
  activeMarksAtom,
  activeNodeTypeAtom,
  canRedoAtom,
  canUndoAtom,
  contentStatusAtom,
  editorCapabilitiesAtom,
  hasSelectionAtom,
  isEmptyAtom,
  selectedTextAtom,
} from '../state/selectors';

/**
 * Hook for accessing editor instance and state
 *
 * @returns Editor instance and state
 *
 * @example
 * ```tsx
 * function EditorToolbar() {
 *   const { editor, isEmpty, canUndo, canRedo } = useEditor();
 *
 *   if (!editor) return null;
 *
 *   return (
 *     <div>
 *       <button onClick={() => editor.chain().focus().undo().run()} disabled={!canUndo}>
 *         Undo
 *       </button>
 *       <button onClick={() => editor.chain().focus().redo().run()} disabled={!canRedo}>
 *         Redo
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEditor() {
  const editor = useAtomValue(editorAtom);
  const isEditable = useAtomValue(isEditableAtom);
  const isDirty = useAtomValue(isDirtyAtom);
  const selection = useAtomValue(selectionAtom);
  const characterCount = useAtomValue(characterCountAtom);
  const wordCount = useAtomValue(wordCountAtom);
  const readingTime = useAtomValue(readingTimeAtom);
  const isFocused = useAtomValue(isEditorFocusedAtom);

  // Selectors
  const hasSelection = useAtomValue(hasSelectionAtom);
  const selectedText = useAtomValue(selectedTextAtom);
  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);
  const isEmpty = useAtomValue(isEmptyAtom);
  const contentStatus = useAtomValue(contentStatusAtom);
  const capabilities = useAtomValue(editorCapabilitiesAtom);
  const activeMarks = useAtomValue(activeMarksAtom);
  const activeNodeType = useAtomValue(activeNodeTypeAtom);

  return {
    /** Editor instance */
    editor,
    /** Whether editor is editable */
    isEditable,
    /** Whether content has been modified */
    isDirty,
    /** Current selection state */
    selection,
    /** Character count */
    characterCount,
    /** Word count */
    wordCount,
    /** Estimated reading time in minutes */
    readingTime,
    /** Whether editor is focused */
    isFocused,
    /** Whether text is selected */
    hasSelection,
    /** Selected text */
    selectedText,
    /** Whether undo is available */
    canUndo,
    /** Whether redo is available */
    canRedo,
    /** Whether editor is empty */
    isEmpty,
    /** Content status (empty, has-content, error) */
    contentStatus,
    /** Available editor capabilities */
    capabilities,
    /** Active marks (bold, italic, etc.) */
    activeMarks,
    /** Active node type */
    activeNodeType,
  };
}

/**
 * Hook for accessing just the editor instance
 *
 * @returns Editor instance or null
 *
 * @example
 * ```tsx
 * function FormatButton() {
 *   const editor = useEditorInstance();
 *
 *   return (
 *     <button onClick={() => editor?.chain().focus().toggleBold().run()}>
 *       Bold
 *     </button>
 *   );
 * }
 * ```
 */
export function useEditorInstance(): Editor | null {
  return useAtomValue(editorAtom);
}

/**
 * Hook for editor statistics
 *
 * @returns Character count, word count, and reading time
 *
 * @example
 * ```tsx
 * function EditorStats() {
 *   const { characterCount, wordCount, readingTime } = useEditorStats();
 *
 *   return (
 *     <div>
 *       {wordCount} words · {characterCount} characters · {readingTime} min read
 *     </div>
 *   );
 * }
 * ```
 */
export function useEditorStats() {
  const characterCount = useAtomValue(characterCountAtom);
  const wordCount = useAtomValue(wordCountAtom);
  const readingTime = useAtomValue(readingTimeAtom);

  return {
    characterCount,
    wordCount,
    readingTime,
  };
}

/**
 * Hook for editor selection state
 *
 * @returns Selection information
 *
 * @example
 * ```tsx
 * function SelectionInfo() {
 *   const { hasSelection, selectedText, selection } = useEditorSelection();
 *
 *   if (!hasSelection) return null;
 *
 *   return <div>Selected: {selectedText}</div>;
 * }
 * ```
 */
export function useEditorSelection() {
  const selection = useAtomValue(selectionAtom);
  const hasSelection = useAtomValue(hasSelectionAtom);
  const selectedText = useAtomValue(selectedTextAtom);

  return {
    selection,
    hasSelection,
    selectedText,
  };
}
