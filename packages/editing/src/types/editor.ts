import type { AnyExtension, Editor, EditorOptions, JSONContent } from '@tiptap/core';
import type { ReactNode } from 'react';

/**
 * Editor configuration options
 */
export interface EditorConfig {
  /** Initial content (HTML or JSON) */
  content?: string | JSONContent;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Auto-focus on mount */
  autofocus?: boolean | 'start' | 'end' | number;
  /** Maximum character count */
  maxCharacters?: number;
  /** Enable spell check */
  spellcheck?: boolean;
}

/**
 * Editor callbacks
 */
export interface EditorCallbacks {
  /** Called when editor is created */
  onCreate?: (props: { editor: Editor }) => void;
  /** Called when content is updated */
  onUpdate?: (props: { editor: Editor; html: string; json: any }) => void;
  /** Called when selection changes */
  onSelectionUpdate?: (props: { editor: Editor }) => void;
  /** Called when focus changes */
  onFocus?: (props: { editor: Editor; event: FocusEvent }) => void;
  /** Called when blur occurs */
  onBlur?: (props: { editor: Editor; event: FocusEvent }) => void;
  /** Called when editor is destroyed */
  onDestroy?: () => void;
}

/**
 * Common editor props
 */
export interface BaseEditorProps extends EditorConfig, EditorCallbacks {
  /** TipTap extensions */
  extensions: AnyExtension[];
  /** Custom class name */
  className?: string;
  /** Children elements */
  children?: ReactNode;
  /** Additional editor props forwarded to TipTap */
  editorProps?: EditorOptions['editorProps'];
}

/**
 * Selection state
 */
export interface SelectionState {
  from: number;
  to: number;
  empty: boolean;
  text?: string;
}

/**
 * Editor theme options
 */
export interface EditorTheme {
  mode?: 'light' | 'dark';
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

/**
 * Export format options
 */
export type ExportFormat = 'html' | 'markdown' | 'json' | 'text' | 'pdf';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  /** Include styles in export */
  includeStyles?: boolean;
  /** Custom filename */
  filename?: string;
  /** PDF specific options */
  pdf?: {
    pageSize?: 'A4' | 'Letter';
    margin?: number;
  };
}
