/**
 * Message utilities exports
 * Centralized exports for message conversion and formatting utilities
 */

// Converter utilities
export {
  convertLegacyToPartsFormat,
  convertPartsToLegacyFormat,
  countPartsByType,
  extractFileAttachments,
  extractTextContent,
  extractToolCalls,
  extractToolResults,
  messageConverter,
  messageHasPartType,
} from './converter';

// Formatter utilities
export {
  messageFormatter,
  renderMessage,
  renderMessageMetadata,
  renderMessagePart,
  renderMessages,
  renderingPatterns,
  type MessageRenderOptions,
} from './formatter';
