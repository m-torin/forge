'use client';

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { DragHandle } from '@tiptap/extension-drag-handle';
import Emoji from '@tiptap/extension-emoji';
import { FileHandler } from '@tiptap/extension-file-handler';
import Highlight from '@tiptap/extension-highlight';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import Link from '@tiptap/extension-link';
import { EnhancedLinkExtension, enhancedLinkStyles } from './LinkNode';
// Consolidated v3 bundle imports
import { logError, logInfo } from '@repo/observability';
import { ListKit } from '@tiptap/extension-list';
import Mention from '@tiptap/extension-mention';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { UniqueID } from '@tiptap/extension-unique-id';
import { Placeholder, TrailingNode } from '@tiptap/extensions';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { clsx } from 'clsx';
import { all, createLowlight } from 'lowlight';
import { useEffect, useState } from 'react';
import {
  ALL_MEDIA_TYPES,
  createStorageUploadHandler,
  getMediaType,
  type MediaUploadConfig,
} from '../../utils/media-upload-handler';
import { createSuggestionRender, getSuggestionItems } from '../../utils/suggestion-render';
import { ContextMenu } from './ContextMenu';
import { EmojiSuggestion, SEARCHABLE_EMOJIS, type EmojiItem } from './EmojiSuggestion';
import { EnhancedSlashCommand } from './EnhancedSlashCommand';
import { NotionEditorErrorBoundary } from './ErrorBoundary';
import { FloatingToolbar } from './FloatingToolbar';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { MediaUploadNode } from './MediaUploadNode';
import { DEFAULT_USERS, MentionSuggestion, type User as MentionUser } from './MentionSuggestion';
import {
  MobileFloatingToolbar,
  MobileGestureHandler,
  MobileSelectionOverlay,
  mobileStyles,
  useIsMobile,
} from './MobileEnhancements';

// Create lowlight instance for code highlighting
const lowlight = createLowlight(all);

// User interface for mentions
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface NotionEditorProps {
  content?: string;
  placeholder?: string;
  className?: string;
  onChange?: (html: string) => void;
  onUpdate?: (editor: Editor) => void;
  editable?: boolean;
  showDragHandles?: boolean;
  showFloatingToolbar?: boolean;
  showContextMenu?: boolean;
  enableLinkPreviews?: boolean;
  enableMobileOptimizations?: boolean;
  maxWidth?: string;
  users?: User[];
  enableEmoji?: boolean;
  enableMentions?: boolean;
  enableImageUpload?: boolean;
  enableMediaUpload?: boolean;
  imageUploadConfig?: {
    maxSize?: number;
    accept?: string;
    useStoragePackage?: boolean;
    storageProvider?: string;
    uploadUrl?: string;
    headers?: Record<string, string>;
  };
  mediaUploadConfig?: MediaUploadConfig;
}

function NotionEditorCore({
  content = '',
  placeholder = "Type '/' for commands...",
  className,
  onChange,
  onUpdate,
  editable = true,
  showDragHandles = true,
  showFloatingToolbar = true,
  showContextMenu = true,
  enableLinkPreviews = true,
  enableMobileOptimizations = true,
  maxWidth = '100%',
  users = [],
  enableEmoji = true,
  enableMentions = true,
  enableImageUpload = true,
  enableMediaUpload = false,
  imageUploadConfig = {},
  mediaUploadConfig = {},
}: NotionEditorProps) {
  // Provide users list for mentions
  const mentionUsers: MentionUser[] = users.length > 0 ? users : DEFAULT_USERS;

  // Mobile optimizations
  const isMobile = useIsMobile();
  const [isMobileToolbarVisible, setIsMobileToolbarVisible] = useState(false);
  const shouldUseMobileOptimizations = enableMobileOptimizations && isMobile;

  // State for upload handlers
  const [uploadHandler, setUploadHandler] = useState<
    | ((
        file: File,
        onProgress?: (progress: number) => void,
        abortSignal?: AbortSignal,
      ) => Promise<string>)
    | undefined
  >(undefined);
  const [mediaUploadHandler, setMediaUploadHandler] = useState<
    | ((
        file: File,
        onProgress?: (progress: number) => void,
        abortSignal?: AbortSignal,
      ) => Promise<string>)
    | undefined
  >(undefined);

  // Initialize upload handlers async
  useEffect(() => {
    const initImageUpload = async () => {
      if (enableImageUpload) {
        try {
          const handler = await createStorageUploadHandler(imageUploadConfig);
          setUploadHandler(handler);
        } catch {
          // Silently ignore upload handler creation errors
        }
      } else {
        setUploadHandler(undefined);
      }
    };

    void initImageUpload();
  }, [enableImageUpload, imageUploadConfig]);

  useEffect(() => {
    const initMediaUpload = async () => {
      if (enableMediaUpload) {
        try {
          const handler = await createStorageUploadHandler({
            accept: ALL_MEDIA_TYPES,
            ...mediaUploadConfig,
          });
          setMediaUploadHandler(handler);
        } catch {
          // Silently ignore upload handler creation errors
        }
      } else {
        setMediaUploadHandler(undefined);
      }
    };

    void initMediaUpload();
  }, [enableMediaUpload, mediaUploadConfig]);

  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default extensions we want to configure separately
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      ListKit.configure({
        // Configure list extensions
        bulletList: {
          HTMLAttributes: {
            class: 'notion-bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'notion-ordered-list',
          },
        },
        taskList: {
          HTMLAttributes: {
            class: 'notion-task-list',
          },
        },
        taskItem: {
          HTMLAttributes: {
            class: 'notion-task-item',
          },
          nested: true,
        },
      }),
      HorizontalRule,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        emptyNodeClass: 'is-empty',
      }),
      TextStyleKit.configure({
        // Configure color extension
        color: {
          types: ['textStyle'],
        },
        // Disable features we don't use
        backgroundColor: false,
        fontFamily: false,
        fontSize: false,
        lineHeight: false,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      enableLinkPreviews
        ? EnhancedLinkExtension.configure({
            openOnClick: false,
            showPreviews: true,
            HTMLAttributes: {
              class: 'enhanced-notion-link',
            },
          })
        : Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: 'notion-link',
            },
          }),
      TableKit.configure({
        // Configure table extensions
        table: {
          resizable: true,
          HTMLAttributes: {
            class: 'notion-table',
          },
        },
        tableRow: {
          HTMLAttributes: {
            class: 'notion-table-row',
          },
        },
        tableHeader: {
          HTMLAttributes: {
            class: 'notion-table-header',
          },
        },
        tableCell: {
          HTMLAttributes: {
            class: 'notion-table-cell',
          },
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'notion-code-block',
        },
      }),
      // New Phase 1 extensions
      UniqueID.configure({
        types: ['heading', 'paragraph', 'codeBlock', 'table', 'taskList', 'blockquote'],
      }),
      TrailingNode.configure({
        node: 'paragraph',
        notAfter: ['heading', 'blockquote', 'codeBlock'],
      }),
      ...(enableEmoji
        ? [
            Emoji.configure({
              HTMLAttributes: {
                class: 'notion-emoji',
              },
              enableEmoticons: true,
              suggestion: {
                char: ':',
                command: ({
                  editor,
                  range,
                  props,
                }: {
                  editor: any;
                  range: any;
                  props: EmojiItem;
                }) => {
                  // Remove the emoji trigger text and insert the emoji
                  editor.chain().focus().insertContentAt(range, props.emoji).run();
                },
                items: ({ query }: { query: string }) => {
                  return getSuggestionItems(
                    SEARCHABLE_EMOJIS,
                    query,
                    (item, q) => {
                      const lowercaseQuery = q.toLowerCase();
                      return (
                        item.name.toLowerCase().includes(lowercaseQuery) ||
                        item.shortcodes.some(code => code.toLowerCase().includes(lowercaseQuery)) ||
                        item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
                        false
                      );
                    },
                    10,
                  );
                },
                render: createSuggestionRender({
                  component: EmojiSuggestion,
                  popup: {
                    placement: 'bottom-start',
                    offset: 6,
                    fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                    padding: 8,
                    strategy: 'absolute',
                  },
                }),
              },
            }),
          ]
        : []),
      ...(enableMentions
        ? [
            Mention.configure({
              HTMLAttributes: {
                class: 'notion-mention',
              },
              renderText({ options, node }: { options: any; node: any }) {
                return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
              },
              suggestion: {
                char: '@',
                command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
                  // Remove the mention text and insert the mention node
                  editor
                    .chain()
                    .focus()
                    .insertContentAt(range, [
                      {
                        type: 'mention',
                        attrs: {
                          id: props?.id || 'unknown',
                          label: props?.name || 'Unknown User',
                        },
                      },
                      {
                        type: 'text',
                        text: ' ',
                      },
                    ])
                    .run();
                },
                items: ({ query }: { query: string }) => {
                  return getSuggestionItems(
                    mentionUsers,
                    query,
                    (user: MentionUser, q: string) => {
                      const lowercaseQuery = q.toLowerCase();
                      return (
                        user.name.toLowerCase().includes(lowercaseQuery) ||
                        user.email?.toLowerCase().includes(lowercaseQuery) ||
                        false
                      );
                    },
                    5,
                  );
                },
                render: createSuggestionRender({
                  component: MentionSuggestion,
                  popup: {
                    placement: 'bottom-start',
                    offset: 6,
                    fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                    padding: 8,
                    strategy: 'absolute',
                  },
                }),
              },
            }),
          ]
        : []),
      KeyboardShortcuts,
      EnhancedSlashCommand,
      ...(showDragHandles
        ? [
            DragHandle.configure({
              render: () => {
                const handle = document.createElement('div');
                handle.className = 'drag-handle';
                handle.innerHTML = '⋮⋮';
                handle.contentEditable = 'false';
                handle.draggable = true;
                return handle;
              },
              onNodeChange: ({ node, _editor }: { node: any; editor: any; _editor?: any }) => {
                // Optional: Add hover highlighting or other interactions
                if (node) {
                  logInfo('Hovering over node:', node.type.name);
                }
              },
            }),
          ]
        : []),
      ...((enableImageUpload && uploadHandler) || (enableMediaUpload && mediaUploadHandler)
        ? [
            MediaUploadNode.configure({
              accept: enableMediaUpload
                ? mediaUploadConfig.accept || ALL_MEDIA_TYPES
                : imageUploadConfig.accept || 'image/*',
              maxSize: enableMediaUpload
                ? mediaUploadConfig.maxSize
                : imageUploadConfig.maxSize || 10 * 1024 * 1024,
              maxSizes: enableMediaUpload ? mediaUploadConfig.maxSizes : undefined,
              upload: enableMediaUpload ? mediaUploadHandler : uploadHandler,
              onError: error => {
                logError(`${enableMediaUpload ? 'Media' : 'Image'} upload error:`, error);
              },
              onSuccess: (url, mediaType) => {
                logInfo(`${mediaType} uploaded successfully:`, url);
              },
            }),
            FileHandler.configure({
              allowedMimeTypes: enableMediaUpload
                ? ALL_MEDIA_TYPES.split(',')
                : ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
              onDrop: (currentEditor: any, files: File[]) => {
                files.forEach((file: File) => {
                  const mediaType = getMediaType(file.type);
                  if (
                    enableMediaUpload &&
                    (mediaType === 'video' || mediaType === 'audio' || mediaType === 'image')
                  ) {
                    // Insert media upload node for any media type
                    currentEditor
                      .chain()
                      .focus()
                      .insertContent({
                        type: 'mediaUpload',
                        attrs: { src: null, mediaType },
                      })
                      .run();
                  } else if (file.type.startsWith('image/')) {
                    // Insert media upload node for images only
                    currentEditor
                      .chain()
                      .focus()
                      .insertContent({
                        type: 'mediaUpload',
                        attrs: { src: null, mediaType: 'image' },
                      })
                      .run();
                  }
                });
              },
              onPaste: (currentEditor: any, files: File[]) => {
                files.forEach((file: File) => {
                  const mediaType = getMediaType(file.type);
                  if (
                    enableMediaUpload &&
                    (mediaType === 'video' || mediaType === 'audio' || mediaType === 'image')
                  ) {
                    // Insert media upload node for any media type
                    currentEditor
                      .chain()
                      .focus()
                      .insertContent({
                        type: 'mediaUpload',
                        attrs: { src: null, mediaType },
                      })
                      .run();
                  } else if (file.type.startsWith('image/')) {
                    // Insert media upload node for images only
                    currentEditor
                      .chain()
                      .focus()
                      .insertContent({
                        type: 'mediaUpload',
                        attrs: { src: null, mediaType: 'image' },
                      })
                      .run();
                  }
                });
              },
            }),
          ]
        : []),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      onUpdate?.(editor);
    },
    editorProps: {
      attributes: {
        class: clsx(
          'notion-editor-content',
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl',
          'max-w-none focus:outline-none',
          className,
        ),
        style: `max-width: ${maxWidth}`,
      },
    },
  });

  if (!editor) {
    return (
      <div className="notion-editor-loading">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mb-4 h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="notion-editor-container relative" data-testid="notion-editor-container">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .notion-editor-content {
          line-height: 1.6;
          color: #37352f;
        }
        
        .notion-editor-content .is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #9b9a97;  
          pointer-events: none;
          height: 0;
        }
        
        .notion-editor-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 0.5rem 0;
        }
        
        .notion-editor-content h2 {
          font-size: 1.875rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 1.25rem 0 0.5rem 0;
        }
        
        .notion-editor-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem 0;
        }
        
        .notion-editor-content p {
          margin: 0.5rem 0;
        }
        
        .notion-editor-content ul, .notion-editor-content ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .notion-editor-content blockquote {
          border-left: 3px solid #e5e5e5;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .notion-task-list {
          list-style: none;
          padding: 0;
        }
        
        .notion-task-item {
          display: flex;
          align-items: flex-start;
          margin: 0.25rem 0;
        }
        
        .notion-task-item input[type="checkbox"] {
          margin-right: 0.5rem;
          margin-top: 0.125rem;
        }
        
        .notion-code-block {
          background: #f7f6f3;
          border-radius: 0.375rem;
          padding: 1rem;
          margin: 1rem 0;
          font-family: 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
        }
        
        .notion-table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        
        .notion-table-header {
          background-color: #f7f6f3;
          font-weight: 600;
        }
        
        .notion-table-cell, .notion-table-header {
          border: 1px solid #e5e5e5;
          padding: 0.5rem;
          text-align: left;
        }
        
        .notion-link {
          color: #0066cc;
          text-decoration: underline;
        }
        
        ${enableLinkPreviews ? enhancedLinkStyles : ''}
        
        ${shouldUseMobileOptimizations ? mobileStyles : ''}
        
        .drag-handle {
          position: absolute;
          left: -2rem;
          top: 0.25rem;
          width: 1rem;
          height: 1rem;
          color: #9b9a97;
          cursor: grab;
          opacity: 0;
          transition: opacity 0.2s;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notion-editor-content:hover .drag-handle {
          opacity: 1;
        }
        
        .drag-handle:hover {
          color: #37352f;
          background-color: rgba(55, 53, 47, 0.08);
          border-radius: 0.25rem;
        }
        
        .notion-mention {
          background-color: rgba(55, 126, 184, 0.1);
          color: #377eb8;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }
        
        .notion-mention:hover {
          background-color: rgba(55, 126, 184, 0.2);
        }
        
        .notion-emoji {
          font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
          font-size: 1.1em;
          line-height: 1;
        }
        
        /* Image upload node styling */
        .image-upload-node {
          margin: 1rem 0;
        }
        
        .image-upload-node img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .image-upload-node .group:hover button {
          opacity: 1;
        }
        
        /* Floating UI suggestion positioning */
        .tiptap-suggestion-floating {
          z-index: 1000;
          max-width: calc(100vw - 16px);
          max-height: calc(100vh - 16px);
          pointer-events: auto;
        }
        
        .tiptap-suggestion-floating[data-placement^="top"] {
          margin-bottom: 4px;
        }
        
        .tiptap-suggestion-floating[data-placement^="bottom"] {
          margin-top: 4px;
        }
        
        .tiptap-suggestion-floating[data-placement$="start"] {
          margin-right: 4px;
        }
        
        .tiptap-suggestion-floating[data-placement$="end"] {
          margin-left: 4px;
        }
        
        /* Enhanced suggestion dropdown styling */
        .slash-suggestion-dropdown,
        .emoji-suggestion-dropdown,
        .mention-suggestion-dropdown {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
          animation: suggestion-fade-in 0.15s ease-out;
        }
        
        @keyframes suggestion-fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Dark mode support for suggestions */
        @media (prefers-color-scheme: dark) {
          .tiptap-suggestion-floating .slash-suggestion-dropdown,
          .tiptap-suggestion-floating .emoji-suggestion-dropdown,
          .tiptap-suggestion-floating .mention-suggestion-dropdown {
            background: rgba(26, 26, 26, 0.95);
            border-color: rgba(255, 255, 255, 0.15);
            color: #e5e5e5;
          }
        }
      `,
        }}
      />

      {shouldUseMobileOptimizations ? (
        <MobileGestureHandler
          onSwipeUp={() => setIsMobileToolbarVisible(true)}
          onLongPress={() => setIsMobileToolbarVisible(true)}
        >
          {showContextMenu ? (
            <ContextMenu editor={editor}>
              <EditorContent
                editor={editor}
                className="notion-editor"
                data-testid="notion-editor-content"
                role="textbox"
                aria-label={placeholder}
                aria-multiline="true"
              />
            </ContextMenu>
          ) : (
            <EditorContent
              editor={editor}
              className="notion-editor"
              data-testid="notion-editor-content"
              role="textbox"
              aria-label={placeholder}
              aria-multiline="true"
            />
          )}

          {/* Mobile Selection Overlay */}
          <MobileSelectionOverlay
            editor={editor}
            onShowToolbar={() => setIsMobileToolbarVisible(true)}
          />
        </MobileGestureHandler>
      ) : showContextMenu ? (
        <ContextMenu editor={editor}>
          <EditorContent
            editor={editor}
            className="notion-editor"
            data-testid="notion-editor-content"
            role="textbox"
            aria-label={placeholder}
            aria-multiline="true"
          />
        </ContextMenu>
      ) : (
        <EditorContent
          editor={editor}
          className="notion-editor"
          data-testid="notion-editor-content"
          role="textbox"
          aria-label={placeholder}
          aria-multiline="true"
        />
      )}

      {/* Floating Toolbar */}
      {showFloatingToolbar && !shouldUseMobileOptimizations && (
        <FloatingToolbar editor={editor} showDropdowns={true} />
      )}

      {/* Mobile Toolbar */}
      {shouldUseMobileOptimizations && (
        <MobileFloatingToolbar
          editor={editor}
          isVisible={isMobileToolbarVisible}
          onClose={() => setIsMobileToolbarVisible(false)}
        />
      )}

      {/* All suggestion dropdowns (slash, emoji, mention) are now handled by Tiptap extensions */}
    </div>
  );
}

// Wrapper component with error boundary
export function NotionEditor(props: NotionEditorProps) {
  return (
    <NotionEditorErrorBoundary>
      <NotionEditorCore {...props} />
    </NotionEditorErrorBoundary>
  );
}
