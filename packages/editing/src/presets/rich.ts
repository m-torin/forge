import type { AnyExtension } from '@tiptap/core';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';

export interface RichPresetOptions {
  /** Placeholder text */
  placeholder?: string;
  /** Character limit */
  characterLimit?: number;
  /** Enable tables */
  enableTables?: boolean;
  /** Enable task lists */
  enableTaskLists?: boolean;
  /** Enable images */
  enableImages?: boolean;
  /** Enable text color */
  enableColor?: boolean;
  /** Heading levels to enable */
  headingLevels?: number[];
}

/**
 * Rich preset for full-featured rich text editing
 *
 * Includes all basic features plus:
 * - Underline, Link, Image
 * - Tables (optional)
 * - Task lists (optional)
 * - Highlight, text color (optional)
 *
 * @example
 * ```tsx
 * const extensions = createRichPreset({
 *   placeholder: 'Start writing...',
 *   enableTables: true,
 *   enableTaskLists: true,
 * });
 * ```
 */
export function createRichPreset(options: RichPresetOptions = {}): AnyExtension[] {
  const {
    placeholder = 'Start writing...',
    characterLimit,
    enableTables = true,
    enableTaskLists = true,
    enableImages = true,
    enableColor = true,
    headingLevels = [1, 2, 3, 4, 5, 6],
  } = options;

  const extensions: AnyExtension[] = [
    StarterKit.configure({
      heading: {
        levels: headingLevels as (1 | 2 | 3 | 4 | 5 | 6)[],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),

    Placeholder.configure({
      placeholder,
    }),

    Underline,

    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'editor-link',
      },
    }),

    Highlight.configure({
      multicolor: true,
    }),

    TextStyle,
  ];

  // Character limit
  if (characterLimit) {
    extensions.push(
      CharacterCount.configure({
        limit: characterLimit,
      }),
    );
  }

  // Images
  if (enableImages) {
    extensions.push(
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    );
  }

  // Tables
  if (enableTables) {
    extensions.push(Table, TableRow, TableCell, TableHeader);
  }

  // Task lists
  if (enableTaskLists) {
    extensions.push(
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    );
  }

  // Color
  if (enableColor) {
    extensions.push(Color);
  }

  return extensions;
}
