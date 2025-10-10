/**
 * @repo/editing - Unified TipTap v3 Editor
 *
 * Main entry point for the editing package.
 * For tree-shaking, prefer specific imports:
 * - '@repo/editing/light' - Tailwind components
 * - '@repo/editing/mantine' - Mantine components
 * - '@repo/editing/presets/*' - Extension bundles
 * - '@repo/editing/extensions/*' - Custom extensions
 */

// Core types
export type * from './types';

// TipTap core types (for backwards compatibility)
export type { Editor as EditorInstance, JSONContent } from '@tiptap/core';

// ===================================================================
// NOTE: For optimal tree-shaking, use specific imports:
//
// - '@repo/editing/light' - Tailwind components
// - '@repo/editing/mantine' - Mantine components
// - '@repo/editing/collaboration' - Collaboration components
// - '@repo/editing/extensions' - All extensions
// - '@repo/editing/presets' - Extension presets
// - '@repo/editing/state' - Jotai atoms & selectors
// - '@repo/editing/hooks' - React hooks
// - '@repo/editing/utils' - Utilities
//
// The exports below are provided for convenience but may include
// unused code if you only need specific features.
// ===================================================================

// Light components (Tailwind)
export { BubbleMenu } from './components/light/BubbleMenu';
export type { BubbleMenuProps } from './components/light/BubbleMenu';
export { CommandMenu } from './components/light/CommandMenu';
export type { CommandMenuProps } from './components/light/CommandMenu';
export { EditorContent } from './components/light/EditorContent';
export type { EditorContentProps } from './components/light/EditorContent';
export { EditorRoot, useEditorTunnel } from './components/light/EditorRoot';
export type { EditorRootProps } from './components/light/EditorRoot';

// Legacy API-compatible components (TipTap v3)
export { EditorBubble } from './components/light/EditorBubble';
export type { EditorBubbleProps } from './components/light/EditorBubble';
export { EditorBubbleItem } from './components/light/EditorBubbleItem';
export {
  EditorCommand,
  EditorCommandList,
  EditorCommandOut,
  EditorCommandTunnelContext,
} from './components/light/EditorCommand';
export { EditorCommandEmpty, EditorCommandItem } from './components/light/EditorCommandItem';

// Mantine components
export { DocumentManager } from './components/mantine/DocumentManager';
export type { DocumentManagerProps } from './components/mantine/DocumentManager';
export { FloatingToolbar } from './components/mantine/FloatingToolbar';
export type { FloatingToolbarProps } from './components/mantine/FloatingToolbar';
export { MinimalEditor } from './components/mantine/MinimalEditor';
export type { MinimalEditorProps } from './components/mantine/MinimalEditor';
export { NotionEditor } from './components/mantine/NotionEditor';
export type { NotionEditorProps } from './components/mantine/NotionEditor';

// Collaboration components
export { CollaborationProvider } from './components/collaboration/CollaborationProvider';
export type { CollaborationProviderProps } from './components/collaboration/CollaborationProvider';
export { CollaborativeEditor } from './components/collaboration/CollaborativeEditor';
export type { CollaborativeEditorProps } from './components/collaboration/CollaborativeEditor';
export { CursorOverlay } from './components/collaboration/CursorOverlay';
export type { CursorOverlayProps } from './components/collaboration/CursorOverlay';
export { PresenceIndicator } from './components/collaboration/PresenceIndicator';
export type { PresenceIndicatorProps } from './components/collaboration/PresenceIndicator';

// Extensions (recommend importing individually for better tree-shaking)
export { AIHighlight, addAIHighlight, removeAIHighlight } from './extensions/ai-highlight';
export { DragHandle } from './extensions/drag-handle';
export { ImageResizer } from './extensions/image-resizer';
export { Markdown, documentToMarkdown } from './extensions/markdown';
export { Mathematics } from './extensions/mathematics';
export {
  SlashCommand as Command,
  SlashCommand,
  createSuggestionItems,
  handleCommandNavigation,
  renderItems,
} from './extensions/slash-command';
export { Twitter } from './extensions/twitter';
export { YoutubeEnhanced } from './extensions/youtube-enhanced';

// Presets
export { createAIPreset } from './presets/ai';
export { createBasicPreset } from './presets/basic';
export { createCollaborationPreset } from './presets/collaboration';
export { createFullPreset } from './presets/full';
export { createRichPreset } from './presets/rich';

// State (Jotai atoms)
export * from './state/atoms';
export * from './state/selectors';

// Hooks
export {
  useAICompletion,
  useCollaboration,
  useCollaborator,
  useCommandMenu,
  useEditor,
  useEditorInstance,
  useEditorSelection,
  useEditorStats,
  usePersistence,
  useSyncStatus,
} from './hooks';
export type { UseAICompletionOptions, UsePersistenceOptions } from './hooks';

// Utilities
export {
  createApiStore,
  createDocument,
  createLocalStorageStore,
  createMemoryStore,
} from './utils/document-store';
export {
  exportAs,
  exportToHTML,
  exportToJSON,
  exportToMarkdown,
  exportToPDF,
  exportToText,
  exportToWord,
  getAvailableExportFormats,
} from './utils/export';
export { getAllContent, getPrevText, getUrlFromString, isValidUrl } from './utils/helpers';
export {
  createFileImportHandler,
  importFromFile,
  importFromHTML,
  importFromJSON,
  importFromMarkdown,
  importFromText,
  parseMarkdownFrontmatter,
} from './utils/import';
export {
  compressImage,
  createImageDropHandler,
  createImagePasteHandler,
  createImageUpload,
  createImageUploadHandler,
  fileToDataUrl,
  getImageDimensions,
  handleImageDrop,
  handleImagePaste,
  uploadFile,
} from './utils/media';
export type {
  ImageUploadOptions,
  MediaUploadOptions,
  MediaUploadResult,
  UploadFn,
} from './utils/media';
