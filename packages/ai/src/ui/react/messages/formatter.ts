/**
 * Message formatting utilities
 * Handles the repeated rendering patterns from AI SDK documentation
 */

import type { UIMessage } from 'ai';
import { getToolName, isToolUIPart } from 'ai';
import React from 'react';
import { messageConverter } from './converter';

/**
 * Render options for customizing message display
 */
export interface MessageRenderOptions {
  showRole?: boolean;
  rolePrefix?: {
    user?: string;
    assistant?: string;
    system?: string;
  };
  showMetadata?: boolean;
  showTimestamp?: boolean;
  showTokenCount?: boolean;
  className?: {
    container?: string;
    role?: string;
    content?: string;
    metadata?: string;
    part?: {
      text?: string;
      file?: string;
      toolCall?: string;
      toolResult?: string;
      reasoningText?: string;
      source?: string;
    };
  };
  customPartRenderer?: (part: any, index: number) => React.ReactNode;
  customMessageWrapper?: (message: UIMessage, children: React.ReactNode) => React.ReactNode;
}

/**
 * Default render options
 */
const defaultRenderOptions: MessageRenderOptions = {
  showRole: true,
  rolePrefix: {
    user: 'User: ',
    assistant: 'AI: ',
    system: 'System: ',
  },
  showMetadata: false,
  showTimestamp: false,
  showTokenCount: false,
  className: {},
};

/**
 * Render a single message part
 */
export function renderMessagePart(
  part: any,
  index: number,
  options: MessageRenderOptions = {},
): React.ReactNode {
  const opts = { ...defaultRenderOptions, ...options };

  // Use custom renderer if provided
  if (opts.customPartRenderer) {
    const customResult = opts.customPartRenderer(part, index);
    if (customResult !== undefined) {
      return customResult;
    }
  }

  if (isToolUIPart(part)) {
    const toolName = getToolName(part);
    const stateLabel = part.state ? ` (${part.state})` : '';
    const children: React.ReactNode[] = [
      React.createElement('strong', { key: 'label' }, `🔧 ${toolName}${stateLabel}`),
    ];

    if ('input' in part && part.input !== undefined) {
      children.push(
        React.createElement(
          'pre',
          {
            key: 'input',
            style: { fontSize: '0.9em', opacity: 0.8 },
          },
          JSON.stringify(part.input, null, 2),
        ),
      );
    }

    if ('output' in part && part.output !== undefined) {
      children.push(
        React.createElement(
          'pre',
          {
            key: 'output',
            style: { fontSize: '0.9em', opacity: 0.8 },
          },
          typeof part.output === 'string' ? part.output : JSON.stringify(part.output, null, 2),
        ),
      );
    }

    if ('errorText' in part && part.errorText) {
      children.push(
        React.createElement(
          'div',
          {
            key: 'error',
            style: { color: 'var(--error-color, #f87171)' },
          },
          part.errorText,
        ),
      );
    }

    return React.createElement(
      'div',
      {
        key: index,
        className: opts.className?.part?.toolCall,
      },
      children,
    );
  }

  switch (part.type) {
    case 'text':
      return React.createElement(
        'span',
        {
          key: index,
          className: opts.className?.part?.text,
        },
        part.text,
      );

    case 'file':
      // Handle file parts - assuming part is a file object
      if (typeof part.file === 'object' && part.file !== null && 'file' in part.file) {
        const filePart = part.file as any;
        if (filePart.file?.mediaType?.startsWith('image/')) {
          return React.createElement('img', {
            key: index,
            src: filePart.url,
            alt: filePart.filename || 'Attached image',
            className: opts.className?.part?.file,
          });
        } else {
          return React.createElement(
            'a',
            {
              key: index,
              href: filePart.url,
              download: filePart.filename,
              className: opts.className?.part?.file,
            },
            filePart.filename || 'Download file',
          );
        }
      }
      // Fallback for string parts
      return React.createElement('span', { key: index }, String(part.file));

    case 'reasoning':
      return React.createElement(
        'details',
        {
          key: index,
          className: opts.className?.part?.reasoningText,
        },
        [
          React.createElement('summary', { key: 'summary' }, '🧠 Reasoning'),
          React.createElement(
            'pre',
            {
              key: 'content',
              style: { fontSize: '0.9em', opacity: 0.8, whiteSpace: 'pre-wrap' },
            },
            part.text,
          ),
        ],
      );

    case 'source':
      // Handle both URL and document sources
      if (part.url) {
        return React.createElement(
          'span',
          {
            key: index,
            className: opts.className?.part?.source,
          },
          [
            '[',
            React.createElement(
              'a',
              {
                key: 'link',
                href: part.url,
                target: '_blank',
                rel: 'noopener noreferrer',
              },
              part.title || new URL(part.url).hostname,
            ),
            ']',
          ],
        );
      } else {
        return React.createElement(
          'span',
          {
            key: index,
            className: opts.className?.part?.source,
          },
          `[${part.title || `Source ${part.id || index}`}]`,
        );
      }

    case 'tool-error':
      return React.createElement(
        'div',
        {
          key: index,
          className: opts.className?.part?.toolResult,
          style: { color: 'var(--error-color, #f87171)' },
        },
        `Tool error: ${part.errorText || part.error?.message || 'Unknown error'}`,
      );

    default:
      // Pass through unknown part types
      return React.createElement(
        'div',
        {
          key: index,
          style: { opacity: 0.6, fontSize: '0.9em' },
        },
        `[${part.type}]`,
      );
  }
}

/**
 * Render metadata for a message
 */
export function renderMessageMetadata(
  message: UIMessage,
  options: MessageRenderOptions = {},
): React.ReactNode | null {
  const opts = { ...defaultRenderOptions, ...options };

  if (!opts.showMetadata && !opts.showTimestamp && !opts.showTokenCount) {
    return null;
  }

  const metadata: React.ReactNode[] = [];

  // Timestamp
  if (opts.showTimestamp && message.metadata && (message.metadata as any).createdAt) {
    const timestamp = new Date((message.metadata as any).createdAt).toLocaleTimeString();
    metadata.push(React.createElement('span', { key: 'timestamp' }, timestamp));
  }

  // Token count
  if (opts.showTokenCount && message.metadata && (message.metadata as any).totalTokens) {
    metadata.push(
      React.createElement(
        'span',
        { key: 'tokens' },
        `${(message.metadata as any).totalTokens} tokens`,
      ),
    );
  }

  // Other metadata
  if (opts.showMetadata && message.metadata) {
    Object.entries(message.metadata).forEach(([key, value]) => {
      if (key !== 'createdAt' && key !== 'totalTokens') {
        metadata.push(React.createElement('span', { key }, `${key}: ${value}`));
      }
    });
  }

  if (metadata.length === 0) return null;

  return React.createElement(
    'div',
    {
      className: opts.className?.metadata,
      style: { fontSize: '0.8em', opacity: 0.6, marginTop: '0.5em' },
    },
    metadata
      .map((item, index) => [
        index > 0 && React.createElement('span', { key: `sep-${index}` }, ' • '),
        item,
      ])
      .flat()
      .filter(Boolean),
  );
}

/**
 * Render a single message with all parts
 */
export function renderMessage(
  message: UIMessage,
  options: MessageRenderOptions = {},
): React.ReactNode {
  const opts = { ...defaultRenderOptions, ...options };

  // Convert legacy format if needed
  const normalizedMessage = messageConverter.fromLegacy(message);

  // Role prefix
  const roleElement = opts.showRole
    ? React.createElement(
        'span',
        {
          className: opts.className?.role,
          key: 'role',
        },
        opts.rolePrefix?.[normalizedMessage.role as keyof typeof opts.rolePrefix] ||
          `${normalizedMessage.role}: `,
      )
    : null;

  // Message parts
  const partsElement = React.createElement(
    'div',
    {
      key: 'parts',
      className: opts.className?.content,
    },
    normalizedMessage.parts?.map((part, index) => renderMessagePart(part, index, options)) || [],
  );

  // Metadata
  const metadataElement = renderMessageMetadata(normalizedMessage, options);

  // Combine all elements
  const children = [roleElement, partsElement, metadataElement].filter(Boolean);

  // Apply custom wrapper if provided
  if (opts.customMessageWrapper) {
    return opts.customMessageWrapper(
      normalizedMessage,
      React.createElement('div', { key: 'content' }, children),
    );
  }

  // Default wrapper
  return React.createElement(
    'div',
    {
      key: normalizedMessage.id,
      className: opts.className?.container,
      style: { marginBottom: '1em' },
    },
    children,
  );
}

/**
 * Render multiple messages (the most common pattern from docs)
 */
export function renderMessages(
  messages: UIMessage[],
  options: MessageRenderOptions = {},
): React.ReactNode[] {
  return messages.map(message => renderMessage(message, options));
}

/**
 * Common rendering patterns from the documentation
 */
export const renderingPatterns = {
  /**
   * Basic pattern - exactly like the docs examples
   */
  basic: (messages: UIMessage[]) =>
    renderMessages(messages, {
      showRole: true,
      rolePrefix: { user: 'User: ', assistant: 'AI: ' },
    }),

  /**
   * With metadata display
   */
  withMetadata: (messages: UIMessage[]) =>
    renderMessages(messages, {
      showRole: true,
      showMetadata: true,
      showTimestamp: true,
      showTokenCount: true,
    }),

  /**
   * Minimal - no role prefixes
   */
  minimal: (messages: UIMessage[]) =>
    renderMessages(messages, {
      showRole: false,
    }),

  /**
   * Files only - for showing file attachments
   */
  filesOnly: (messages: UIMessage[]) => {
    return messages
      .map(message => {
        const files = message.parts?.filter((p: any) => p.type === 'file') || [];
        return files.map((file, index) => renderMessagePart(file, index));
      })
      .flat();
  },

  /**
   * Text only - extract and render just text
   */
  textOnly: (messages: UIMessage[]) => {
    return messages
      .map(message => {
        const text =
          message.parts
            ?.filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('\n') || '';
        return text ? React.createElement('div', { key: message.id }, text) : null;
      })
      .filter(Boolean);
  },
};

/**
 * Main formatter object with all utilities
 */
export const messageFormatter = {
  // Core rendering functions
  renderMessagePart,
  renderMessage,
  renderMessages,
  renderMessageMetadata,

  // Common patterns
  ...renderingPatterns,

  // Utility functions
  createCustomRenderer: (customOptions: MessageRenderOptions) => (messages: UIMessage[]) =>
    renderMessages(messages, customOptions),

  // Convenience wrappers for common use cases
  forChat: (messages: UIMessage[]) => renderingPatterns.basic(messages),
  forPreview: (messages: UIMessage[]) => renderingPatterns.minimal(messages),
  forDebug: (messages: UIMessage[]) => renderingPatterns.withMetadata(messages),
};
