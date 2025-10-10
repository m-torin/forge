import type { AnyExtension } from '@tiptap/core';
import { AIHighlight } from '../extensions/ai-highlight';
import { Markdown } from '../extensions/markdown';
import { SlashCommand } from '../extensions/slash-command';
import { createRichPreset, type RichPresetOptions } from './rich';

export interface AIPresetOptions extends RichPresetOptions {
  /** AI highlight color */
  aiHighlightColor?: string;
  /** Enable markdown support */
  enableMarkdown?: boolean;
  /** Enable slash commands */
  enableSlashCommands?: boolean;
}

/**
 * AI preset for AI-enhanced editing
 *
 * Includes all rich features plus:
 * - AI text highlighting
 * - Slash commands
 * - Markdown support
 *
 * @example
 * ```tsx
 * const extensions = createAIPreset({
 *   placeholder: 'Type / for AI commands...',
 *   aiHighlightColor: '#3b82f6',
 *   enableMarkdown: true,
 * });
 * ```
 */
export function createAIPreset(options: AIPresetOptions = {}): AnyExtension[] {
  const {
    aiHighlightColor = '#c1ecf970',
    enableMarkdown = true,
    enableSlashCommands = true,
    ...richOptions
  } = options;

  const extensions: AnyExtension[] = [
    ...createRichPreset(richOptions),

    AIHighlight.configure({
      defaultColor: aiHighlightColor,
    }),
  ];

  if (enableSlashCommands) {
    extensions.push(
      SlashCommand.configure({
        suggestion: {
          char: '/',
        },
      }),
    );
  }

  if (enableMarkdown) {
    extensions.push(
      Markdown.configure({
        transformPastedText: true,
        transformCopiedText: true,
      }),
    );
  }

  return extensions;
}
