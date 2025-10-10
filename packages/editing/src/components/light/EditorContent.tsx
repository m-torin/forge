'use client';

import type { JSONContent } from '@tiptap/core';
import { EditorContent as TipTapEditorContent, useEditor } from '@tiptap/react';
import { useAtom, useSetAtom } from 'jotai';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import {
  characterCountAtom,
  editorAtom,
  isDirtyAtom,
  isEditorFocusedAtom,
  selectionAtom,
  wordCountAtom,
} from '../../state/atoms';
import type { BaseEditorProps } from '../../types';

export interface EditorContentProps extends Omit<BaseEditorProps, 'children'> {
  /** Whether to auto-focus */
  autoFocus?: boolean;
  /** Optional children rendered inside the editor container (e.g., menus) */
  children?: ReactNode;
  /** Optional slot rendered after the editor content (e.g., ImageResizer) */
  slotAfter?: ReactNode;
  /** Optional initial content (JSON or HTML) */
  initialContent?: string | JSONContent;
}

/**
 * EditorContent component
 *
 * Wraps TipTap's editor with Jotai state management
 *
 * @example
 * ```tsx
 * <EditorContent
 *   extensions={extensions}
 *   content="<p>Hello world</p>"
 *   onUpdate={({ html }) => console.log(html)}
 * />
 * ```
 */
export const EditorContent: FC<EditorContentProps> = ({
  extensions,
  content,
  editable = true,
  autofocus = false,
  className,
  onCreate,
  onUpdate,
  onSelectionUpdate,
  onFocus,
  onBlur,
  onDestroy,
  autoFocus,
  children,
  slotAfter,
  initialContent,
  editorProps,
}) => {
  const setEditor = useSetAtom(editorAtom);
  const [, setSelection] = useAtom(selectionAtom);
  const setCharacterCount = useSetAtom(characterCountAtom);
  const setWordCount = useSetAtom(wordCountAtom);
  const setIsDirty = useSetAtom(isDirtyAtom);
  const setIsEditorFocused = useSetAtom(isEditorFocusedAtom);

  const resolvedContent = (initialContent ?? content ?? '') as string | JSONContent;

  const editor = useEditor({
    extensions,
    content: resolvedContent,
    editable,
    autofocus: autoFocus ?? autofocus,
    editorProps: {
      attributes: {
        class: className || 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
        spellcheck: 'true',
        ...(editorProps?.attributes ?? {}),
      },
      ...(editorProps ?? {}),
    },

    onCreate: ({ editor }) => {
      setEditor(editor);
      // Update character/word counts
      const text = editor.getText();
      setCharacterCount(text.length);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      onCreate?.({ editor });
    },

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      const text = editor.getText();

      // Update state
      setCharacterCount(text.length);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      setIsDirty(true);

      onUpdate?.({ editor, html, json });
    },

    onSelectionUpdate: ({ editor }) => {
      const { from, to, empty } = editor.state.selection;
      const text = empty ? '' : editor.state.doc.textBetween(from, to, ' ');

      setSelection({
        from,
        to,
        empty,
        text,
      });

      onSelectionUpdate?.({ editor });
    },

    onFocus: ({ editor, event }) => {
      setIsEditorFocused(true);
      onFocus?.({ editor, event });
    },

    onBlur: ({ editor, event }) => {
      setIsEditorFocused(false);
      onBlur?.({ editor, event });
    },

    onDestroy: () => {
      setEditor(null);
      setIsEditorFocused(false);
      onDestroy?.();
    },
  });

  // Sync editable state
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <>
      <TipTapEditorContent editor={editor} className={className} />
      {children}
      {slotAfter}
    </>
  );
};
