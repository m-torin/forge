import type { AnyExtension } from '@tiptap/core';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';

export interface BasicPresetOptions {
  /** Placeholder text */
  placeholder?: string;
  /** Character limit */
  characterLimit?: number;
  /** Enable spell check */
  spellcheck?: boolean;
  /** Heading levels to enable */
  headingLevels?: number[];
}

/**
 * Basic preset for simple rich text editing
 *
 * Includes:
 * - StarterKit (paragraph, heading, bold, italic, etc.)
 * - Placeholder
 * - Character count
 *
 * @example
 * ```tsx
 * const extensions = createBasicPreset({
 *   placeholder: 'Start writing...',
 *   characterLimit: 5000,
 * });
 * ```
 */
export function createBasicPreset(options: BasicPresetOptions = {}): AnyExtension[] {
  const { placeholder = 'Start writing...', characterLimit, headingLevels = [1, 2, 3] } = options;

  return [
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

    ...(characterLimit
      ? [
          CharacterCount.configure({
            limit: characterLimit,
          }),
        ]
      : []),
  ];
}
