// External NPM Package API
// Clean, simple API for external users - only the embeddable editor

// Export EmbeddableNotionEditor as "Editor" for clean external API
export {
  EmbeddableNotionEditor as Editor,
  useEmbeddableEditor as useEditor,
} from './components/EmbeddableNotionEditor';

// Export types with clean names
export type { EmbeddableNotionEditorProps as EditorProps } from './components/EmbeddableNotionEditor';

// Essential utilities and types only
export * from './utils/media-upload-handler';
export type { MediaType, MediaUploadConfig } from './utils/media-upload-handler';
