import type { AnyExtension } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { DragHandleConfigured } from '../extensions/drag-handle';
import { ImageResizer } from '../extensions/image-resizer';
import { Mathematics } from '../extensions/mathematics';
import { Twitter } from '../extensions/twitter';
import { YoutubeEnhanced } from '../extensions/youtube-enhanced';
import { createAIPreset, type AIPresetOptions } from './ai';

export interface FullPresetOptions extends AIPresetOptions {
  /** Enable mathematics (KaTeX) */
  enableMath?: boolean;
  /** Enable Twitter embeds */
  enableTwitter?: boolean;
  /** Enable YouTube embeds */
  enableYoutube?: boolean;
  /** Enable image resizer */
  enableImageResizer?: boolean;
  /** Enable drag handle */
  enableDragHandle?: boolean;
  /** Enable code syntax highlighting */
  enableCodeHighlight?: boolean;
}

/**
 * Full preset with all features enabled
 *
 * Includes everything from AI preset plus:
 * - Mathematics (KaTeX)
 * - Twitter embeds
 * - YouTube embeds
 * - Image resizer
 * - Drag handle
 * - Code syntax highlighting
 *
 * @example
 * ```tsx
 * const extensions = createFullPreset({
 *   placeholder: 'Start writing with all features...',
 *   enableMath: true,
 *   enableTwitter: true,
 *   enableYoutube: true,
 * });
 * ```
 */
export function createFullPreset(options: FullPresetOptions = {}): AnyExtension[] {
  const {
    enableMath = true,
    enableTwitter = true,
    enableYoutube = true,
    enableImageResizer = true,
    enableDragHandle = true,
    enableCodeHighlight = true,
    ...aiOptions
  } = options;

  const extensions: AnyExtension[] = [...createAIPreset(aiOptions)];

  // Mathematics
  if (enableMath) {
    extensions.push(
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
        },
      }),
    );
  }

  // Twitter
  if (enableTwitter) {
    extensions.push(
      Twitter.configure({
        addPasteHandler: true,
      }),
    );
  }

  // YouTube
  if (enableYoutube) {
    extensions.push(
      YoutubeEnhanced.configure({
        controls: true,
        modestBranding: true,
      }),
    );
  }

  // Image resizer
  if (enableImageResizer) {
    extensions.push(
      ImageResizer.configure({
        minWidth: 50,
        maxWidth: 1200,
      }),
    );
  }

  // Drag handle
  if (enableDragHandle) {
    extensions.push(
      DragHandleConfigured.configure({
        // excludedNodeTypes: ['codeBlock', 'image'], // Not supported by current drag handle
      }),
    );
  }

  // Code highlighting
  if (enableCodeHighlight) {
    // Remove default code block from StarterKit
    const starterKitIndex = extensions.findIndex(ext => ext.name === 'starterKit');
    if (starterKitIndex !== -1) {
      extensions.splice(starterKitIndex, 1);
    }

    extensions.push(
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
        defaultLanguage: 'plaintext',
      }),
    );
  }

  return extensions;
}
