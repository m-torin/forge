import type { Collaborator } from './collaboration';

// Editor component props
export interface BaseEditorProps {
  documentId: string;
  userId: string;
  userName?: string;
  userColor?: string;
  userAvatar?: string;
  initialContent?: string;
  placeholder?: string;
  editable?: boolean;
  readOnly?: boolean;
  showCollaborators?: boolean;
  showPresence?: boolean;
  className?: string;
  websocketUrl?: string;
  enablePersistence?: boolean;
  // Mock provider options
  useMockProvider?: boolean;
  mockProviderType?: 'websocket' | 'broadcast';
  simulateLatency?: boolean;
  latencyMs?: number;
  simulateDrops?: boolean;
  dropRate?: number;
  onContentChange?: (content: string) => void;
  onCollaboratorChange?: (collaborators: Collaborator[]) => void;
  onConnectionChange?: (isConnected: boolean) => void;
  onError?: (error: string) => void;
}

export interface MantineEditorProps extends BaseEditorProps {
  showToolbar?: boolean;
  showCollaborators?: boolean;
  showConnectionStatus?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  labels?: Record<string, string>;
}

export interface TailwindEditorProps extends BaseEditorProps {
  showToolbar?: boolean;
  showCollaborators?: boolean;
  showConnectionStatus?: boolean;
  toolbarClassName?: string;
  contentClassName?: string;
  collaboratorsClassName?: string;
}

export interface EditorCollaborationProps extends BaseEditorProps {
  // For backwards compatibility
}

// Toolbar configuration
export interface ToolbarConfig {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  highlight?: boolean;
  textColor?: boolean;
  headings?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  blockquote?: boolean;
  codeBlock?: boolean;
  horizontalRule?: boolean;
  link?: boolean;
  textAlign?: boolean;
  undo?: boolean;
  redo?: boolean;
}
