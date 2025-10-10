'use client';

import { ActionIcon, Divider, Group, Paper, Tooltip } from '@mantine/core';
import {
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconHighlight,
  IconItalic,
  IconLink,
  IconStrikethrough,
  IconUnderline,
} from '@tabler/icons-react';
import { BubbleMenu } from '@tiptap/react/menus';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { editorAtom, hasSelectionAtom } from '../../state';

export interface FloatingToolbarProps {
  /** Show text formatting buttons */
  showTextFormatting?: boolean;
  /** Show heading buttons */
  showHeadings?: boolean;
  /** Show link button */
  showLink?: boolean;
  /** Show highlight button */
  showHighlight?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom buttons */
  children?: React.ReactNode;
}

/**
 * FloatingToolbar component
 *
 * Floating toolbar that appears when text is selected
 * Uses Mantine components for consistent styling
 *
 * @example
 * ```tsx
 * <EditorRoot>
 *   <EditorContent extensions={extensions} />
 *   <FloatingToolbar />
 * </EditorRoot>
 * ```
 */
export const FloatingToolbar: FC<FloatingToolbarProps> = ({
  showTextFormatting = true,
  showHeadings = true,
  showLink = true,
  showHighlight = false,
  className,
  children,
}) => {
  const editor = useAtomValue(editorAtom);
  const hasSelection = useAtomValue(hasSelectionAtom);

  if (!editor || !hasSelection) {
    return null;
  }

  return (
    <BubbleMenu editor={editor} options={{ placement: 'top' }} className={className}>
      <Paper shadow="md" p="xs" withBorder>
        <Group gap="xs">
          {children || (
            <>
              {showTextFormatting && (
                <>
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
                </>
              )}

              {showTextFormatting && showHeadings && <Divider orientation="vertical" />}

              {showHeadings && (
                <>
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
                </>
              )}

              {(showHeadings || showTextFormatting) && (showLink || showHighlight) && (
                <Divider orientation="vertical" />
              )}

              {showLink && (
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
              )}

              {showHighlight && (
                <Tooltip label="Highlight">
                  <ActionIcon
                    variant={editor.isActive('highlight') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    disabled={!editor.can().toggleHighlight()}
                  >
                    <IconHighlight size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
            </>
          )}
        </Group>
      </Paper>
    </BubbleMenu>
  );
};
