'use client';

import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { useEffect } from 'react';
import { collaboratorsAtom, editorAtom } from '../../state';

export interface CursorOverlayProps {
  /** Show cursor labels */
  showLabels?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * CursorOverlay component
 *
 * Displays cursors for all active collaborators
 * Uses TipTap's CollaborationCursor extension under the hood
 *
 * @example
 * ```tsx
 * <CollaborationProvider documentId="doc-123" user={currentUser}>
 *   <EditorRoot>
 *     <EditorContent extensions={createCollaborationPreset()} />
 *     <CursorOverlay showLabels />
 *   </EditorRoot>
 * </CollaborationProvider>
 * ```
 */
export const CursorOverlay: FC<CursorOverlayProps> = ({ showLabels = true }) => {
  const editor = useAtomValue(editorAtom);
  const collaborators = useAtomValue(collaboratorsAtom);

  // This component relies on TipTap's CollaborationCursor extension
  // which renders cursors natively in the editor
  // We just provide styling and optional UI enhancements

  useEffect(() => {
    if (!editor) return;

    // Apply custom cursor styles based on collaborators
    const style = document.createElement('style');
    style.id = 'collaboration-cursor-styles';

    const cssRules = collaborators
      .map(
        collaborator => `
      .collaboration-cursor__caret[data-user="${collaborator.id}"] {
        border-color: ${collaborator.color};
      }
      .collaboration-cursor__label[data-user="${collaborator.id}"] {
        background-color: ${collaborator.color};
        display: ${showLabels ? 'block' : 'none'};
      }
    `,
      )
      .join('\n');

    style.textContent = cssRules;

    // Remove old styles and add new
    const oldStyle = document.getElementById('collaboration-cursor-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [editor, collaborators, showLabels]);

  // CollaborationCursor extension handles rendering
  // This component just manages styling
  return null;
};
