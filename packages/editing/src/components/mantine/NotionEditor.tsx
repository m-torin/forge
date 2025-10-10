'use client';

import { ActionIcon, Box, Divider, Group, Paper, Stack, Tooltip } from '@mantine/core';
import {
  IconBlockquote,
  IconBold,
  IconCode,
  IconCodeDots,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconStrikethrough,
  IconTable,
  IconUnderline,
} from '@tabler/icons-react';
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

export interface NotionEditorProps extends Omit<BaseEditorProps, 'children'> {
  /** Show toolbar */
  showToolbar?: boolean;
  /** Toolbar position */
  toolbarPosition?: 'top' | 'bottom';
  /** Paper shadow */
  shadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Paper radius */
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Paper padding */
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Minimum height */
  minHeight?: number;
  /** Placeholder text */
  _placeholder?: string;
}

/**
 * NotionEditor component
 *
 * Full-featured Notion-style editor with Mantine UI
 *
 * @example
 * ```tsx
 * <NotionEditor
 *   extensions={createRichPreset()}
 *   content="<p>Start writing...</p>"
 *   onUpdate={({ html }) => console.log(html)}
 * />
 * ```
 */
export const NotionEditor: FC<NotionEditorProps> = ({
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
  showToolbar = true,
  toolbarPosition = 'top',
  shadow = 'sm',
  radius = 'md',
  padding = 'md',
  minHeight = 300,
}) => {
  const setEditor = useSetAtom(editorAtom);
  const [, setSelection] = useAtom(selectionAtom);
  const setCharacterCount = useSetAtom(characterCountAtom);
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
        class: className || 'prose prose-sm sm:prose lg:prose-lg focus:outline-none',
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

  const toolbar = showToolbar && (
    <Group gap="xs" p="sm">
      <Tooltip label="Bold">
        <ActionIcon
          variant={editor.isActive('bold') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().toggleBold()}
        >
          <IconBold size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Italic">
        <ActionIcon
          variant={editor.isActive('italic') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().toggleItalic()}
        >
          <IconItalic size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Underline">
        <ActionIcon
          variant={editor.isActive('underline') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().toggleUnderline()}
        >
          <IconUnderline size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Strikethrough">
        <ActionIcon
          variant={editor.isActive('strike') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().toggleStrike()}
        >
          <IconStrikethrough size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Code">
        <ActionIcon
          variant={editor.isActive('code') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().toggleCode()}
        >
          <IconCode size={18} />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />

      <Tooltip label="Heading 1">
        <ActionIcon
          variant={editor.isActive('heading', { level: 1 }) ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <IconH1 size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Heading 2">
        <ActionIcon
          variant={editor.isActive('heading', { level: 2 }) ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <IconH2 size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Heading 3">
        <ActionIcon
          variant={editor.isActive('heading', { level: 3 }) ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <IconH3 size={18} />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />

      <Tooltip label="Bullet List">
        <ActionIcon
          variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <IconList size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Numbered List">
        <ActionIcon
          variant={editor.isActive('orderedList') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <IconListNumbers size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Blockquote">
        <ActionIcon
          variant={editor.isActive('blockquote') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <IconBlockquote size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Code Block">
        <ActionIcon
          variant={editor.isActive('codeBlock') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <IconCodeDots size={18} />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />

      <Tooltip label="Link">
        <ActionIcon
          variant={editor.isActive('link') ? 'filled' : 'subtle'}
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
        >
          <IconLink size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Table">
        <ActionIcon
          variant={editor.isActive('table') ? 'filled' : 'subtle'}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
        >
          <IconTable size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Image">
        <ActionIcon
          onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
        >
          <IconPhoto size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );

  return (
    <Paper shadow={shadow} radius={radius} withBorder>
      <Stack gap={0}>
        {toolbarPosition === 'top' && toolbar}
        {toolbarPosition === 'top' && <Divider />}

        <Box p={padding} style={{ minHeight }}>
          <EditorContent editor={editor} />
        </Box>

        {toolbarPosition === 'bottom' && <Divider />}
        {toolbarPosition === 'bottom' && toolbar}
      </Stack>
    </Paper>
  );
};
