import type { AnyExtension } from '@tiptap/core';

/**
 * AI highlight configuration
 */
export interface AIHighlightOptions {
  /** Highlight color */
  color?: string;
  /** Animation duration (ms) */
  duration?: number;
  /** Whether to auto-remove highlight */
  autoRemove?: boolean;
}

/**
 * Slash command item
 */
export interface SlashCommandItem {
  /** Item title */
  title: string;
  /** Item description */
  description?: string;
  /** Item icon */
  icon?: string | React.ComponentType;
  /** Command to execute */
  command: (props: { editor: any; range: any }) => void;
  /** Item keywords for search */
  keywords?: string[];
  /** Item category */
  category?: string;
  /** Whether item is disabled */
  disabled?: boolean;
}

/**
 * Slash command configuration
 */
export interface SlashCommandOptions {
  /** Command items */
  items?: SlashCommandItem[];
  /** Trigger character */
  char?: string;
  /** Whether to allow spaces in command */
  allowSpaces?: boolean;
  /** Custom render function */
  render?: () => any;
}

/**
 * Markdown configuration
 */
export interface MarkdownOptions {
  /** Transform pasted text */
  transformPastedText?: boolean;
  /** Transform copied text */
  transformCopiedText?: boolean;
  /** HTML to markdown serializer options */
  serializer?: any;
  /** Markdown to HTML parser options */
  parser?: any;
}

/**
 * Mathematics configuration (KaTeX)
 */
export interface MathematicsOptions {
  /** KaTeX render options */
  katex?: any;
  /** Inline math delimiter */
  inlineDelimiter?: string;
  /** Block math delimiter */
  blockDelimiter?: string;
}

/**
 * Twitter embed configuration
 */
export interface TwitterOptions {
  /** Default theme */
  theme?: 'light' | 'dark';
  /** Auto-embed URLs */
  autoEmbed?: boolean;
  /** Tweet width */
  width?: number | 'auto';
}

/**
 * Image resizer configuration
 */
export interface ImageResizerOptions {
  /** Enable resize handles */
  handles?: boolean;
  /** Min width */
  minWidth?: number;
  /** Max width */
  maxWidth?: number;
  /** Aspect ratio lock */
  lockAspectRatio?: boolean;
}

/**
 * Drag handle configuration
 */
export interface DragHandleOptions {
  /** Drag handle position */
  position?: 'left' | 'right';
  /** Drag handle icon */
  icon?: string | React.ComponentType;
  /** Excluded node types */
  excludedTypes?: string[];
}

/**
 * Preset configuration base
 */
export interface PresetOptions {
  /** Placeholder text */
  placeholder?: string;
  /** Character limit */
  characterLimit?: number;
  /** Enable spellcheck */
  spellcheck?: boolean;
}

/**
 * AI preset specific options
 */
export interface AIPresetOptions extends PresetOptions {
  /** AI highlight color */
  aiHighlightColor?: string;
  /** Enable markdown */
  enableMarkdown?: boolean;
  /** Enable slash commands */
  enableSlashCommands?: boolean;
}

/**
 * Collaboration preset specific options
 */
export interface CollaborationPresetOptions extends PresetOptions {
  /** User info */
  user: {
    id: string;
    name: string;
    color: string;
  };
  /** Y.Doc instance */
  document?: any;
  /** Provider instance */
  provider?: any;
}

/**
 * Extension bundle type
 */
export type ExtensionBundle = AnyExtension[];
