'use client';

import { logError, logInfo } from '@repo/observability';
import { EditorContent } from '@tiptap/react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { useYjsCollaboration } from '../../hooks/use-yjs-collaboration';
import type { YjsCollaborationOptions } from '../../types/collaboration';
import {
  ALL_MEDIA_TYPES,
  createStorageUploadHandler,
  getMediaType,
  type MediaType,
  type MediaUploadConfig,
} from '../../utils/media-upload-handler';
import { EmojiDropdown } from './EmojiDropdown';
import { NotionEditorErrorBoundary } from './ErrorBoundary';
import { FloatingToolbar } from './FloatingToolbar';
import { MediaUploadNode } from './MediaUploadNode';
import { MentionDropdown } from './MentionDropdown';
import type { User } from './NotionEditor';
import { CompactTypingIndicator, TypingIndicator, useTypingIndicator } from './TypingIndicator';

export interface CollaborativeNotionEditorProps
  extends Omit<YjsCollaborationOptions, 'extensions'> {
  className?: string;
  placeholder?: string;
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
  mediaUploadConfig?: MediaUploadConfig & {
    onError?: (error: Error) => void;
    onSuccess?: (url: string, mediaType: MediaType) => void;
  };
  showFloatingToolbar?: boolean;
  showTypingIndicators?: boolean;
  typingIndicatorPosition?: 'top' | 'bottom' | 'inline';
  maxWidth?: string;
}

function CollaborativeNotionEditorCore({
  documentId,
  userId,
  userName = 'Anonymous User',
  userColor = '#3B82F6',
  userAvatar,
  websocketUrl = 'ws://localhost:1234',
  enablePersistence = true,
  enablePresence = true,
  enableCursors = true,
  useMockProvider = false,
  mockProviderType = 'websocket',
  simulateLatency = true,
  latencyMs = 50,
  simulateDrops = false,
  dropRate = 0.05,
  className,
  placeholder = "Type '/' for commands, ':' for emojis, '@' for mentions...",
  users = [],
  enableEmoji = true,
  enableMentions = true,
  enableImageUpload = true,
  enableMediaUpload = false,
  imageUploadConfig = {},
  mediaUploadConfig,
  showFloatingToolbar = true,
  showTypingIndicators = true,
  typingIndicatorPosition = 'bottom',
  maxWidth = '100%',
}: CollaborativeNotionEditorProps) {
  // State for dropdowns
  const [isEmojiDropdownOpen, setIsEmojiDropdownOpen] = useState(false);
  const [emojiQuery, _setEmojiQuery] = useState('');
  const [emojiDropdownPosition, _setEmojiDropdownPosition] = useState({ top: 0, left: 0 });

  const [isMentionDropdownOpen, setIsMentionDropdownOpen] = useState(false);
  const [mentionQuery, _setMentionQuery] = useState('');
  const [mentionDropdownPosition, _setMentionDropdownPosition] = useState({ top: 0, left: 0 });

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
      if (enableMediaUpload && mediaUploadConfig) {
        try {
          const handler = await createStorageUploadHandler(mediaUploadConfig);
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

  // Enhanced extensions for collaborative NotionEditor
  const getNotionExtensions = () => {
    const { StarterKit } = require('@tiptap/starter-kit');
    const { BulletList, OrderedList } = require('@tiptap/extension-list');
    const { HorizontalRule } = require('@tiptap/extension-horizontal-rule');
    const { FileHandler } = require('@tiptap/extension-file-handler');
    const Placeholder = require('@tiptap/extension-placeholder');
    const { TextStyle } = require('@tiptap/extension-text-style');
    const Color = require('@tiptap/extension-color');
    const Highlight = require('@tiptap/extension-highlight');
    const Underline = require('@tiptap/extension-underline');
    const TextAlign = require('@tiptap/extension-text-align');
    const Link = require('@tiptap/extension-link');
    const { TaskList } = require('@tiptap/extension-task-list');
    const { TaskItem } = require('@tiptap/extension-task-item');
    const { Table } = require('@tiptap/extension-table');
    const { TableRow } = require('@tiptap/extension-table-row');
    const { TableHeader } = require('@tiptap/extension-table-header');
    const { TableCell } = require('@tiptap/extension-table-cell');
    const { CodeBlockLowlight } = require('@tiptap/extension-code-block-lowlight');
    const { UniqueID } = require('@tiptap/extension-unique-id');
    const { TrailingNode } = require('@tiptap/extensions');
    const Emoji = require('@tiptap/extension-emoji');
    const Mention = require('@tiptap/extension-mention');
    const { all, createLowlight } = require('lowlight');

    const lowlight = createLowlight(all);

    return [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      BulletList,
      OrderedList,
      HorizontalRule,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        emptyNodeClass: 'is-empty',
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'notion-link',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'notion-task-list',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'notion-task-item',
        },
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'notion-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'notion-table-row',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'notion-table-header',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'notion-table-cell',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'notion-code-block',
        },
      }),
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
                  editor
                    .chain()
                    .focus()
                    .insertContentAt(range, [
                      {
                        type: 'mention',
                        attrs: props,
                      },
                      {
                        type: 'text',
                        text: ' ',
                      },
                    ])
                    .run();
                },
              },
            }),
          ]
        : []),
      ...((enableImageUpload && uploadHandler) || (enableMediaUpload && mediaUploadHandler)
        ? [
            MediaUploadNode.configure({
              accept: enableMediaUpload
                ? mediaUploadConfig?.accept || ALL_MEDIA_TYPES
                : imageUploadConfig.accept || 'image/*',
              maxSize: enableMediaUpload
                ? mediaUploadConfig?.maxSize
                : imageUploadConfig.maxSize || 10 * 1024 * 1024,
              maxSizes: enableMediaUpload ? mediaUploadConfig?.maxSizes : undefined,
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
                  if (enableMediaUpload) {
                    const mediaType = getMediaType(file.type);
                    if (mediaType === 'video' || mediaType === 'audio' || mediaType === 'image') {
                      currentEditor
                        .chain()
                        .focus()
                        .insertContent({
                          type: 'mediaUpload',
                          attrs: { src: null, mediaType },
                        })
                        .run();
                    }
                  } else if (file.type.startsWith('image/')) {
                    // Insert image upload node for each dropped image
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
                  if (enableMediaUpload) {
                    const mediaType = getMediaType(file.type);
                    if (mediaType === 'video' || mediaType === 'audio' || mediaType === 'image') {
                      currentEditor
                        .chain()
                        .focus()
                        .insertContent({
                          type: 'mediaUpload',
                          attrs: { src: null, mediaType },
                        })
                        .run();
                    }
                  } else if (file.type.startsWith('image/')) {
                    // Insert image upload node for each pasted image
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
    ];
  };

  const { editor, collaborators, isConnected, isLoading, error, provider } = useYjsCollaboration({
    documentId,
    userId,
    userName,
    userColor,
    userAvatar,
    websocketUrl,
    enablePersistence,
    enablePresence,
    enableCursors,
    useMockProvider,
    mockProviderType,
    simulateLatency,
    latencyMs,
    simulateDrops,
    dropRate,
    extensions: getNotionExtensions(),
  });

  // Typing indicator state
  const { isTyping: _isTyping, typingUsers } = useTypingIndicator({
    editor,
    provider,
    userId,
    typingTimeout: 2000,
    updateInterval: 500,
  });

  // Enhanced collaborators with typing state
  const enhancedCollaborators = collaborators.map(collaborator => ({
    ...collaborator,
    isTyping: typingUsers.includes(collaborator.id),
  }));

  if (isLoading) {
    return (
      <div className="notion-collaborative-editor-loading">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mb-4 h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notion-collaborative-editor-error rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">Collaboration Error: {error}</p>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div
      className="notion-collaborative-editor-container relative"
      data-testid="collaborative-notion-editor"
    >
      {/* Enhanced Collaboration Status Bar */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-3 text-sm">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className={clsx(
                  'h-2.5 w-2.5 rounded-full transition-all duration-300',
                  isConnected ? 'bg-green-500' : 'bg-red-500',
                )}
              />
              {isConnected && (
                <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-green-500 opacity-20" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <span
                className={clsx('font-medium', isConnected ? 'text-green-700' : 'text-red-700')}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {!isConnected && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <span>•</span>
                  <span>Attempting to reconnect...</span>
                  <div className="flex gap-0.5">
                    <div className="h-1 w-1 animate-pulse rounded-full bg-red-400" />
                    <div
                      className="h-1 w-1 animate-pulse rounded-full bg-red-400"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="h-1 w-1 animate-pulse rounded-full bg-red-400"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Collaborators */}
          {enhancedCollaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <span className="font-medium text-gray-600">{enhancedCollaborators.length}</span>
              </div>

              <div className="flex -space-x-1">
                {enhancedCollaborators.slice(0, 5).map(collaborator => (
                  <div
                    key={collaborator.id}
                    className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-sm transition-transform hover:z-10 hover:scale-110"
                    style={{ backgroundColor: collaborator.color }}
                    title={`${collaborator.name} ${collaborator.isTyping ? '(Typing...)' : '(Active)'}`}
                  >
                    {collaborator.avatar ? (
                      <img
                        src={collaborator.avatar}
                        alt={collaborator.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      collaborator.name.charAt(0).toUpperCase()
                    )}

                    {/* Status indicator - typing pulse or active dot */}
                    <div
                      className={clsx(
                        'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white',
                        collaborator.isTyping ? 'animate-pulse' : '',
                      )}
                      style={{
                        backgroundColor: collaborator.isTyping ? '#10B981' : collaborator.color,
                      }}
                    />
                  </div>
                ))}
                {enhancedCollaborators.length > 5 && (
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-500 text-xs font-semibold text-white shadow-sm"
                    title={`+${enhancedCollaborators.length - 5} more collaborators`}
                  >
                    +{enhancedCollaborators.length - 5}
                  </div>
                )}
              </div>

              {/* Compact typing indicator in header */}
              {showTypingIndicators && typingIndicatorPosition === 'inline' && (
                <CompactTypingIndicator
                  collaborators={enhancedCollaborators}
                  currentUserId={userId}
                />
              )}
            </div>
          )}

          {/* Sync Status */}
          {isConnected && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <svg
                  className="h-3 w-3 animate-spin text-green-500"
                  style={{ animationDuration: '2s' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Auto-sync</span>
              </div>
            </div>
          )}
        </div>

        {/* Server Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
            <span>
              {isConnected ? (
                <span className="text-green-600">Live</span>
              ) : (
                <span className="text-red-600">Offline</span>
              )}
            </span>
          </div>

          {isConnected && (
            <>
              <span>•</span>
              <span>Document: {documentId.substring(0, 8)}...</span>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Notion Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .notion-collaborative-editor-container .ProseMirror {
          line-height: 1.6;
          color: #37352f;
          max-width: ${maxWidth};
          margin: 0 auto;
          padding: 2rem;
        }
        
        .notion-collaborative-editor-container .is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #9b9a97;  
          pointer-events: none;
          height: 0;
        }
        
        .notion-collaborative-editor-container h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 0.5rem 0;
        }
        
        .notion-collaborative-editor-container h2 {
          font-size: 1.875rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 1.25rem 0 0.5rem 0;
        }
        
        .notion-collaborative-editor-container h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem 0;
        }
        
        .notion-collaborative-editor-container .notion-mention {
          background-color: rgba(55, 126, 184, 0.1);
          color: #377eb8;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }
        
        .notion-collaborative-editor-container .notion-mention:hover {
          background-color: rgba(55, 126, 184, 0.2);
        }
        
        .notion-collaborative-editor-container .notion-emoji {
          font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
          font-size: 1.1em;
          line-height: 1;
        }

        /* Enhanced collaboration cursor styling */
        .notion-collaborative-editor-container .collaboration-cursor__caret {
          border-left: 2px solid;
          border-right: 1px solid;
          margin-left: -1px;
          margin-right: -1px;
          pointer-events: none;
          position: relative;
          word-break: normal;
          animation: cursor-blink 1.2s infinite;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8);
        }

        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        .notion-collaborative-editor-container .collaboration-cursor__label {
          border-radius: 4px 4px 4px 0;
          color: white;
          font-size: 11px;
          font-style: normal;
          font-weight: 600;
          left: -1px;
          line-height: normal;
          padding: 0.2rem 0.4rem;
          position: absolute;
          top: -1.6em;
          user-select: none;
          white-space: nowrap;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.15),
            0 1px 3px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(4px);
          z-index: 100;
          animation: label-fade-in 0.2s ease-out;
          transition: all 0.15s ease-out;
        }

        @keyframes label-fade-in {
          from {
            opacity: 0;
            transform: translateY(-2px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .notion-collaborative-editor-container .collaboration-cursor__label::before {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 6px;
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid inherit;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
        }

        /* Cursor selection styling */
        .notion-collaborative-editor-container .collaboration-cursor__selection {
          mix-blend-mode: multiply;
          pointer-events: none;
          opacity: 0.3;
          transition: opacity 0.2s ease-out;
        }

        .notion-collaborative-editor-container .collaboration-cursor__selection:hover {
          opacity: 0.2;
        }

        /* Enhanced cursor visibility in different contexts */
        .notion-collaborative-editor-container .collaboration-cursor__caret-code {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 1px;
        }

        .notion-collaborative-editor-container .collaboration-cursor__caret-heading {
          border-width: 3px 1px;
          height: 1.2em;
        }

        /* Multiple cursor management */
        .notion-collaborative-editor-container .collaboration-cursor__caret[data-user-count="2"] {
          border-left-width: 3px;
        }

        .notion-collaborative-editor-container .collaboration-cursor__caret[data-user-count="3"] {
          border-left-width: 4px;
        }

        .notion-collaborative-editor-container .collaboration-cursor__caret[data-user-count="4+"] {
          border-left-width: 5px;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.3) 2px,
            rgba(255, 255, 255, 0.3) 4px
          );
        }
      `,
        }}
      />

      {/* Typing Indicator - Top */}
      {showTypingIndicators && typingIndicatorPosition === 'top' && (
        <div className="px-8 pt-4">
          <TypingIndicator collaborators={enhancedCollaborators} currentUserId={userId} />
        </div>
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className={clsx('notion-collaborative-editor-content', className)}
        data-testid="collaborative-notion-editor-content"
        role="textbox"
        aria-label={placeholder}
        aria-multiline="true"
      />

      {/* Typing Indicator - Bottom */}
      {showTypingIndicators && typingIndicatorPosition === 'bottom' && (
        <div className="px-8 pb-4">
          <TypingIndicator collaborators={enhancedCollaborators} currentUserId={userId} />
        </div>
      )}

      {/* Floating Toolbar */}
      {showFloatingToolbar && <FloatingToolbar editor={editor} />}

      {/* Emoji Dropdown */}
      {enableEmoji && (
        <EmojiDropdown
          editor={editor}
          isOpen={isEmojiDropdownOpen}
          onClose={() => setIsEmojiDropdownOpen(false)}
          position={emojiDropdownPosition}
          query={emojiQuery}
        />
      )}

      {/* Mention Dropdown */}
      {enableMentions && (
        <MentionDropdown
          editor={editor}
          isOpen={isMentionDropdownOpen}
          onClose={() => setIsMentionDropdownOpen(false)}
          position={mentionDropdownPosition}
          query={mentionQuery}
          users={users}
        />
      )}
    </div>
  );
}

// Wrapper component with error boundary
export function CollaborativeNotionEditor(props: CollaborativeNotionEditorProps) {
  return (
    <NotionEditorErrorBoundary>
      <CollaborativeNotionEditorCore {...props} />
    </NotionEditorErrorBoundary>
  );
}
