/**
 * TipTap v3 Custom Extensions
 *
 * All extensions are exported individually for tree-shaking
 */

// AI Features
export { AIHighlight, addAIHighlight, removeAIHighlight } from './ai-highlight';
export type { AIHighlightOptions } from './ai-highlight';

export {
  SlashCommand,
  createSuggestionItems,
  createSuggestionRenderer,
  filterSuggestionItems,
  handleCommandNavigation,
} from './slash-command';
export type { SlashCommandItem, SlashCommandOptions } from './slash-command';

// Content Extensions
export {
  Markdown,
  createCustomMarkdownSerializer,
  documentToMarkdown,
  editorToMarkdown,
} from './markdown';
export type { MarkdownOptions } from './markdown';

export { Mathematics, validateLatex } from './mathematics';
export type { MathematicsOptions } from './mathematics';

export { Twitter, extractTweetId, isValidTwitterUrl } from './twitter';
export type { SetTweetOptions, TwitterOptions } from './twitter';

export { YoutubeEnhanced, extractYoutubeId, isValidYoutubeUrl } from './youtube-enhanced';
export type { YoutubeEnhancedOptions } from './youtube-enhanced';

// UI Enhancement Extensions
export {
  ImageResizer,
  ImageResizerComponent,
  calculateAspectRatio,
  getImageDimensions,
} from './image-resizer';
export type { ImageResizerOptions } from './image-resizer';

export {
  DragHandleConfigured,
  createDragHandle,
  dragHandleStyles,
  getDefaultExcludedNodeTypes,
} from './drag-handle';
export type { DragHandleConfig } from './drag-handle';
