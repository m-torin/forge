'use client';

import { Box, Text } from '@mantine/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { useAtom, useSetAtom } from 'jotai';
import type { FC } from 'react';
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

export interface MinimalEditorProps extends Omit<BaseEditorProps, 'children'> {
  /** Show character count */
  showCharacterCount?: boolean;
  /** Maximum characters */
  maxCharacters?: number;
  /** Border style */
  withBorder?: boolean;
  /** Padding */
  p?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Background color */
  bg?: string;
  /** Placeholder text */
  _placeholder?: string;
}

/**
 * MinimalEditor component
 *
 * Lightweight editor with minimal UI, perfect for comments and simple inputs
 *
 * @example
 * ```tsx
 * <MinimalEditor
 *   extensions={createBasicPreset()}
 *   placeholder="Write a comment..."
 *   maxCharacters={500}
 *   showCharacterCount
 * />
 * ```
 */
export const MinimalEditor: FC<MinimalEditorProps> = ({
  extensions,
  content = '',
  editable = true,
  _placeholder,
  autofocus = false,
  className,
  onCreate,
  onUpdate,
  onSelectionUpdate,
  onFocus,
  onBlur,
  onDestroy,
  showCharacterCount = false,
  maxCharacters,
  withBorder = true,
  p = 'sm',
  bg,
}) => {
  const setEditor = useSetAtom(editorAtom);
  const [, setSelection] = useAtom(selectionAtom);
  const [characterCount, setCharacterCount] = useAtom(characterCountAtom);
  const setWordCount = useSetAtom(wordCountAtom);
  const setIsDirty = useSetAtom(isDirtyAtom);
  const setIsEditorFocused = useSetAtom(isEditorFocusedAtom);

  const editor = useEditor({
    extensions,
    content,
    editable,
    autofocus,
    editorProps: {
      attributes: {
        class: className || 'prose prose-sm focus:outline-none',
        spellcheck: 'true',
      },
    },

    onCreate: ({ editor }) => {
      setEditor(editor);
      const text = editor.getText();
      setCharacterCount(text.length);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      onCreate?.({ editor });
    },

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      const text = editor.getText();

      setCharacterCount(text.length);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      setIsDirty(true);

      onUpdate?.({ editor, html, json });
    },

    onSelectionUpdate: ({ editor }) => {
      const { from, to, empty } = editor.state.selection;
      const text = empty ? '' : editor.state.doc.textBetween(from, to, ' ');

      setSelection({ from, to, empty, text });
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

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  if (!editor) {
    return null;
  }

  const isOverLimit = maxCharacters !== undefined && characterCount > maxCharacters;

  return (
    <Box>
      <Box
        p={p}
        bg={bg}
        style={{
          border: withBorder ? '1px solid var(--mantine-color-gray-3)' : undefined,
          borderRadius: 'var(--mantine-radius-md)',
          borderColor: isOverLimit ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-gray-3)',
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {showCharacterCount && (
        <Text size="xs" c={isOverLimit ? 'red' : 'dimmed'} mt="xs" ta="right">
          {characterCount}
          {maxCharacters !== undefined && ` / ${maxCharacters}`}
        </Text>
      )}
    </Box>
  );
};
