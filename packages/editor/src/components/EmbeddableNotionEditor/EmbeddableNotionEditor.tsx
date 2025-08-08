'use client';

import { logError, logWarn } from '@repo/observability';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { UniqueID } from '@tiptap/extension-unique-id';
import { TrailingNode } from '@tiptap/extensions';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { clsx } from 'clsx';
import { all, createLowlight } from 'lowlight';
import { useEffect, useRef } from 'react';
import { generateNonce, sanitizeDimension, sanitizeTheme } from '../../utils/css-sanitizer';
import { createSecureUploadHandler, DEFAULT_SECURE_CONFIG } from '../../utils/secure-media-upload';
import { validateURL } from '../../utils/url-validator';
import { MediaUploadNode } from '../NotionEditor/MediaUploadNode';

// Import CSS file
import './embeddable-editor.css';

// Create lowlight instance
const lowlight = createLowlight(all);

export interface EmbeddableNotionEditorProps {
  /**
   * Initial content of the editor
   */
  content?: string;
  /**
   * Placeholder text when editor is empty
   */
  placeholder?: string;
  /**
   * CSS class name for styling
   */
  className?: string;
  /**
   * Callback when content changes
   */
  onChange?: (html: string, json?: any) => void;
  /**
   * Callback when editor updates
   */
  onUpdate?: (editor: Editor) => void;
  /**
   * Whether the editor is editable
   */
  editable?: boolean;
  /**
   * Maximum width of the editor content
   */
  maxWidth?: string;
  /**
   * Minimum height of the editor
   */
  minHeight?: string;
  /**
   * Whether to show the floating toolbar
   */
  showToolbar?: boolean;
  /**
   * Custom CSS theme overrides
   */
  theme?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    focusColor?: string;
    placeholderColor?: string;
  };
  /**
   * Features to enable/disable
   */
  features?: {
    formatting?: boolean;
    lists?: boolean;
    tables?: boolean;
    codeBlocks?: boolean;
    links?: boolean;
    tasks?: boolean;
    colors?: boolean;
    mediaUpload?: boolean;
  };
  /**
   * Media upload configuration
   */
  mediaUploadConfig?: {
    accept?: string;
    maxSize?: number;
    maxSizes?: {
      image?: number;
      video?: number;
      audio?: number;
    };
    uploadHandler?: (
      file: File,
      onProgress?: (progress: number) => void,
      abortSignal?: AbortSignal,
    ) => Promise<string>;
    onError?: (error: Error) => void;
    onSuccess?: (url: string, mediaType: 'image' | 'video' | 'audio') => void;
  };
  /**
   * Auto-save configuration
   */
  autoSave?: {
    enabled: boolean;
    delay?: number;
    onSave?: (content: string) => void;
  };
}

/**
 * Embeddable NotionEditor - A lightweight, self-contained editor
 * Perfect for embedding in external applications, CMSs, or third-party sites
 */
export function EmbeddableNotionEditor({
  content = '',
  placeholder = 'Start writing...',
  className,
  onChange,
  onUpdate,
  editable = true,
  maxWidth = '100%',
  minHeight = '200px',
  showToolbar = true,
  theme = {},
  features = {
    formatting: true,
    lists: true,
    tables: true,
    codeBlocks: true,
    links: true,
    tasks: true,
    colors: true,
    mediaUpload: false,
  },
  mediaUploadConfig = {},
  autoSave,
}: EmbeddableNotionEditorProps) {
  // Use ref for auto-save timeout instead of window global
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sanitize theme values to prevent CSS injection
  const safeTheme = sanitizeTheme(theme);
  const safeMaxWidth = sanitizeDimension(maxWidth) || '100%';
  const safeMinHeight = sanitizeDimension(minHeight) || '200px';

  const editor = useEditor({
    // Enable Tiptap's built-in security features
    enableContentCheck: true,
    emitContentError: true,
    injectCSS: false, // We use external CSS now
    injectNonce:
      typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
        ? generateNonce()
        : undefined,

    // Content error handling
    onContentError({ editor, error, disableCollaboration: _disableCollaboration }) {
      logWarn('EmbeddableNotionEditor: Content validation error', {
        operation: 'embeddable_editor_content_error',
        error: error.message,
      });
      // For embedded contexts, we'll try to sanitize rather than block
      try {
        editor.commands.setContent('');
      } catch (e) {
        logError('Failed to clear invalid content', {
          operation: 'embeddable_editor_clear_content_error',
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },

    extensions: [
      StarterKit.configure({
        // Disable extensions we'll configure separately
        bulletList: features.lists ? {} : false,
        orderedList: features.lists ? {} : false,
        codeBlock: features.codeBlocks ? {} : false,
        bold: features.formatting ? {} : false,
        italic: features.formatting ? {} : false,
        strike: features.formatting ? {} : false,
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        emptyNodeClass: 'is-empty',
      }),
      ...(features.formatting ? [TextStyle, Underline] : []),
      ...(features.colors ? [Color, Highlight.configure({ multicolor: true })] : []),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      ...(features.links
        ? [
            Link.configure({
              openOnClick: false,
              HTMLAttributes: {
                class: 'embeddable-editor-link',
              },
              validate: (url: string) => validateURL(url),
            }),
          ]
        : []),
      ...(features.tasks
        ? [
            TaskList.configure({
              HTMLAttributes: {
                class: 'embeddable-editor-task-list',
              },
            }),
            TaskItem.configure({
              HTMLAttributes: {
                class: 'embeddable-editor-task-item',
              },
              nested: true,
            }),
          ]
        : []),
      ...(features.tables
        ? [
            Table.configure({
              resizable: true,
              HTMLAttributes: {
                class: 'embeddable-editor-table',
              },
            }),
            TableRow.configure({
              HTMLAttributes: {
                class: 'embeddable-editor-table-row',
              },
            }),
            TableHeader.configure({
              HTMLAttributes: {
                class: 'embeddable-editor-table-header',
              },
            }),
            TableCell.configure({
              HTMLAttributes: {
                class: 'embeddable-editor-table-cell',
              },
            }),
          ]
        : []),
      ...(features.codeBlocks
        ? [
            CodeBlockLowlight.configure({
              lowlight,
              HTMLAttributes: {
                class: 'embeddable-editor-code-block',
              },
            }),
          ]
        : []),
      ...(features.mediaUpload
        ? [
            MediaUploadNode.configure({
              accept: mediaUploadConfig.accept || DEFAULT_SECURE_CONFIG.allowedTypes.join(','),
              maxSize: mediaUploadConfig.maxSize || DEFAULT_SECURE_CONFIG.maxSize,
              maxSizes: mediaUploadConfig.maxSizes || DEFAULT_SECURE_CONFIG.maxSizes,
              upload:
                mediaUploadConfig.uploadHandler ||
                createSecureUploadHandler({
                  allowedTypes:
                    mediaUploadConfig.accept?.split(',') || DEFAULT_SECURE_CONFIG.allowedTypes,
                  maxSize: mediaUploadConfig.maxSize || DEFAULT_SECURE_CONFIG.maxSize,
                  maxSizes: mediaUploadConfig.maxSizes || DEFAULT_SECURE_CONFIG.maxSizes,
                }),
              onError: mediaUploadConfig.onError || (() => {}),
              onSuccess: mediaUploadConfig.onSuccess || (() => {}),
            }),
          ]
        : []),
      UniqueID.configure({
        types: ['heading', 'paragraph', 'codeBlock', 'table', 'taskList', 'blockquote'],
      }),
      TrailingNode.configure({
        node: 'paragraph',
        notAfter: ['heading', 'blockquote', 'codeBlock'],
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();

      onChange?.(html, json);
      onUpdate?.(editor);

      // Auto-save functionality using component-scoped ref
      if (autoSave?.enabled) {
        const delay = autoSave.delay || 1000;

        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set new timeout
        autoSaveTimeoutRef.current = setTimeout(() => {
          autoSave.onSave?.(html);
        }, delay);
      }
    },
    editorProps: {
      attributes: {
        class: clsx('embeddable-notion-editor-content', 'focus:outline-none', className),
        style: `max-width: ${safeMaxWidth}; min-height: ${safeMinHeight}`,
      },
    },
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="embeddable-notion-editor-loading">
        <div className="animate-pulse rounded bg-gray-200" style={{ height: safeMinHeight }} />
      </div>
    );
  }

  // Create CSS variables from sanitized theme
  const cssVariables = {
    '--editor-bg': safeTheme.backgroundColor,
    '--editor-text': safeTheme.textColor,
    '--editor-border': safeTheme.borderColor,
    '--editor-focus': safeTheme.focusColor,
    '--editor-placeholder': safeTheme.placeholderColor,
    '--editor-min-height': safeMinHeight,
  } as React.CSSProperties;

  return (
    <div
      className="embeddable-notion-editor"
      style={cssVariables}
      data-testid="embeddable-notion-editor"
    >
      {/* Optional Simple Toolbar */}
      {showToolbar && (
        <div className="embeddable-editor-toolbar">
          {features.formatting && (
            <>
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'active' : ''}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'active' : ''}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'active' : ''}
                title="Underline"
              >
                <u>U</u>
              </button>
            </>
          )}

          {features.lists && (
            <>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'active' : ''}
                title="Bullet List"
              >
                •
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'active' : ''}
                title="Numbered List"
              >
                1.
              </button>
            </>
          )}

          {features.tasks && (
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={editor.isActive('taskList') ? 'active' : ''}
              title="Task List"
            >
              ✓
            </button>
          )}

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
            title="Heading 1"
          >
            H1
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
            title="Heading 2"
          >
            H2
          </button>

          {features.mediaUpload && (
            <button
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: 'mediaUpload',
                    attrs: { src: null, mediaType: 'image' },
                  })
                  .run();
              }}
              title="Upload Media"
              style={{ fontSize: '14px', padding: '4px 8px' }}
            >
              📎
            </button>
          )}

          {features.codeBlocks && (
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'active' : ''}
              title="Code Block"
            >
              &lt;/&gt;
            </button>
          )}
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} data-testid="embeddable-notion-editor-content" />
    </div>
  );
}

/**
 * Hook for programmatic control of the embeddable editor
 */
export function useEmbeddableEditor() {
  return {
    /**
     * Get the current content as HTML
     */
    getHTML: (editor: Editor) => editor.getHTML(),

    /**
     * Get the current content as JSON
     */
    getJSON: (editor: Editor) => editor.getJSON(),

    /**
     * Set content programmatically
     */
    setContent: (editor: Editor, content: string) => {
      editor.commands.setContent(content);
    },

    /**
     * Clear all content
     */
    clearContent: (editor: Editor) => {
      editor.commands.clearContent();
    },

    /**
     * Focus the editor
     */
    focus: (editor: Editor) => {
      editor.commands.focus();
    },

    /**
     * Check if editor has content
     */
    isEmpty: (editor: Editor) => editor.isEmpty,

    /**
     * Get word count
     */
    getWordCount: (editor: Editor) => {
      const text = editor.getText();
      return text.split(/\s+/).filter(word => word.length > 0).length;
    },

    /**
     * Get character count
     */
    getCharacterCount: (editor: Editor) => {
      const text = editor.getText();
      return text.length;
    },
  };
}
