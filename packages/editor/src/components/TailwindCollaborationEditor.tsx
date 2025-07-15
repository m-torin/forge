'use client';

import type { YjsCollaborationOptions } from '../types/collaboration';
import { CollaborativeSimpleEditor } from './SimpleEditor/CollaborativeSimpleEditor';

interface TailwindCollaborationEditorProps extends Omit<YjsCollaborationOptions, 'extensions'> {
  className?: string;
  placeholder?: string;
}

/**
 * TailwindCollaborationEditor - A Tailwind-styled collaborative editor
 * This is currently implemented as a wrapper around CollaborativeSimpleEditor
 * In the future, this could be expanded with more Tailwind-specific features
 */
export function TailwindCollaborationEditor(props: TailwindCollaborationEditorProps) {
  return <CollaborativeSimpleEditor {...props} />;
}

export default TailwindCollaborationEditor;
