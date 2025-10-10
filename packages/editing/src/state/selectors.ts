import { atom } from 'jotai';
import {
  characterCountAtom,
  collaboratorsAtom,
  currentDocumentIdAtom,
  documentsAtom,
  editorAtom,
  isDirtyAtom,
  isEditableAtom,
  selectionAtom,
  syncStatusAtom,
} from './atoms';

/**
 * Derived state selectors using Jotai
 */

// Selection helpers
export const hasSelectionAtom = atom(get => !get(selectionAtom).empty);

export const selectedTextAtom = atom(get => {
  const editor = get(editorAtom);
  const selection = get(selectionAtom);

  if (!editor || selection.empty) {
    return '';
  }

  const { from, to } = selection;
  return editor.state.doc.textBetween(from, to, ' ');
});

// Collaboration helpers
export const isCollaboratingAtom = atom(get => get(collaboratorsAtom).length > 0);

export const collaboratorCountAtom = atom(get => get(collaboratorsAtom).length);

export const isSyncedAtom = atom(get => get(syncStatusAtom) === 'synced');

// Document helpers
export const currentDocumentAtom = atom(get => {
  const documents = get(documentsAtom);
  const currentId = get(currentDocumentIdAtom);

  if (!currentId) return null;

  return documents.find(doc => doc.id === currentId) || null;
});

export const filteredDocumentsAtom = atom(get => {
  const documents = get(documentsAtom);
  // We'll add search filtering in a future iteration
  return documents;
});

// Editor state helpers
export const canUndoAtom = atom(get => {
  const editor = get(editorAtom);
  return editor?.can().undo() ?? false;
});

export const canRedoAtom = atom(get => {
  const editor = get(editorAtom);
  return editor?.can().redo() ?? false;
});

export const isEmptyAtom = atom(get => {
  const count = get(characterCountAtom);
  return count === 0;
});

// Content status
export const contentStatusAtom = atom(get => {
  const isDirty = get(isDirtyAtom);
  const isEditable = get(isEditableAtom);
  const isEmpty = get(isEmptyAtom);
  const isSynced = get(isSyncedAtom);

  return {
    isDirty,
    isEditable,
    isEmpty,
    isSynced,
    canSave: isDirty && !isEmpty,
  };
});

// Editor capabilities
export const editorCapabilitiesAtom = atom(get => {
  const editor = get(editorAtom);
  if (!editor) {
    return {
      canBold: false,
      canItalic: false,
      canUnderline: false,
      canStrike: false,
      canCode: false,
      canLink: false,
      canHeading: false,
      canBulletList: false,
      canOrderedList: false,
      canBlockquote: false,
      canCodeBlock: false,
    };
  }

  return {
    canBold: editor.can().toggleBold(),
    canItalic: editor.can().toggleItalic(),
    canUnderline: editor.can().toggleUnderline(),
    canStrike: editor.can().toggleStrike(),
    canCode: editor.can().toggleCode(),
    canLink: editor.can().toggleLink({ href: '' }),
    canHeading: editor.can().toggleHeading({ level: 1 }),
    canBulletList: editor.can().toggleBulletList(),
    canOrderedList: editor.can().toggleOrderedList(),
    canBlockquote: editor.can().toggleBlockquote(),
    canCodeBlock: editor.can().toggleCodeBlock(),
  };
});

// Active marks/nodes
export const activeMarksAtom = atom(get => {
  const editor = get(editorAtom);
  if (!editor) {
    return {
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      code: false,
      link: false,
    };
  }

  return {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    underline: editor.isActive('underline'),
    strike: editor.isActive('strike'),
    code: editor.isActive('code'),
    link: editor.isActive('link'),
  };
});

export const activeNodeTypeAtom = atom(get => {
  const editor = get(editorAtom);
  if (!editor) return null;

  if (editor.isActive('heading')) {
    return `heading${editor.getAttributes('heading').level}`;
  }
  if (editor.isActive('bulletList')) return 'bulletList';
  if (editor.isActive('orderedList')) return 'orderedList';
  if (editor.isActive('codeBlock')) return 'codeBlock';
  if (editor.isActive('blockquote')) return 'blockquote';

  return 'paragraph';
});
