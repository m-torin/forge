import type { AnyExtension } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { createRichPreset, type RichPresetOptions } from './rich';

export interface CollaborationPresetOptions extends RichPresetOptions {
  /** Y.Doc instance */
  document?: Y.Doc;
  /** User information */
  user?: {
    id: string;
    name: string;
    color: string;
  };
  /** Provider instance (WebSocket, etc.) */
  provider?: any;
  /** Field name in Y.Doc */
  field?: string;
}

/**
 * Collaboration preset for real-time collaborative editing
 *
 * Includes all rich features plus:
 * - Yjs collaboration
 * - Collaborative cursors
 * - User presence
 *
 * @example
 * ```tsx
 * import * as Y from 'yjs';
 *
 * const ydoc = new Y.Doc();
 *
 * const extensions = createCollaborationPreset({
 *   document: ydoc,
 *   user: {
 *     id: 'user-123',
 *     name: 'John Doe',
 *     color: '#3b82f6',
 *   },
 * });
 * ```
 */
export function createCollaborationPreset(
  options: CollaborationPresetOptions = {},
): AnyExtension[] {
  const {
    document = new Y.Doc(),
    user = {
      id: 'anonymous',
      name: 'Anonymous',
      color: '#3b82f6',
    },
    provider,
    field = 'default',
    ...richOptions
  } = options;

  const extensions: AnyExtension[] = [
    ...createRichPreset(richOptions),

    Collaboration.configure({
      document,
      field,
    }),

    CollaborationCursor.configure({
      provider,
      user: {
        name: user.name,
        color: user.color,
      },
    }),
  ];

  return extensions;
}
