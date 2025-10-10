/**
 * Utilities
 *
 * Helper functions for document management, import/export, and media handling
 */

// Export utilities
export {
  exportAs,
  exportToHTML,
  exportToJSON,
  exportToMarkdown,
  exportToPDF,
  exportToText,
  exportToWord,
  getAvailableExportFormats,
} from './export';

// Import utilities
export {
  createFileImportHandler,
  importFromFile,
  importFromHTML,
  importFromJSON,
  importFromMarkdown,
  importFromText,
  parseMarkdownFrontmatter,
} from './import';

// Document store
export {
  createApiStore,
  createDocument,
  createLocalStorageStore,
  createMemoryStore,
} from './document-store';

// Media utilities
export {
  compressImage,
  createImageDropHandler,
  createImagePasteHandler,
  createImageUploadHandler,
  fileToDataUrl,
  getImageDimensions,
  uploadFile,
} from './media';
export type { MediaUploadOptions, MediaUploadResult } from './media';

// Helper utilities
export { getAllContent, getPrevText, getUrlFromString, isValidUrl } from './helpers';
