'use client';

import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export interface SimpleEditorProps {
  documentId?: string;
  userId?: string;
  userName?: string;
  userColor?: string;
  userAvatar?: string;
  websocketUrl?: string;
  enableCollaboration?: boolean;
  className?: string;
  placeholder?: string;
  content?: string;
}

export function SimpleEditor({
  documentId = 'simple-editor-doc',
  userId = 'anonymous',
  userName = 'Anonymous User',
  userColor = '#3B82F6',
  userAvatar,
  websocketUrl = 'ws://localhost:1234',
  enableCollaboration = false,
  className,
  placeholder = 'Start writing...',
  content = '',
}: SimpleEditorProps) {
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  // Initialize Y.Doc for collaboration
  if (!ydocRef.current && enableCollaboration) {
    ydocRef.current = new Y.Doc();
  }

  // Create editor extensions
  const getExtensions = () => {
    const baseExtensions: any[] = [
      StarterKit.configure({
        // Disable default undoRedo extension when using collaboration
        undoRedo: enableCollaboration ? false : {},
      }),
      TextStyle,
      Color,
      Highlight,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ];

    // Add collaboration extensions if enabled
    if (enableCollaboration && ydocRef.current) {
      baseExtensions.push(
        Collaboration.configure({
          document: ydocRef.current,
        }),
        CollaborationCaret.configure({
          provider: providerRef.current,
          user: {
            name: userName,
            color: userColor,
            avatar: userAvatar,
          },
        }),
      );
    }

    return baseExtensions;
  };

  const editor = useEditor({
    extensions: getExtensions(),
    content,
    editorProps: {
      attributes: {
        class: clsx(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'min-h-[200px] p-4 border border-gray-200 rounded-lg',
          className,
        ),
      },
    },
  });

  // Initialize collaboration provider
  useEffect(() => {
    if (!enableCollaboration || !ydocRef.current) return;

    const provider = new WebsocketProvider(websocketUrl, documentId, ydocRef.current, {
      connect: true,
    });

    providerRef.current = provider;

    // Update collaboration caret with provider
    if (editor) {
      const collaborationCaret = editor.extensionManager.extensions.find(
        ext => ext.name === 'collaborationCaret',
      );

      if (collaborationCaret) {
        collaborationCaret.options.provider = provider;
        collaborationCaret.options.user = {
          name: userName,
          color: userColor,
          avatar: userAvatar,
        };
      }
    }

    return () => {
      provider.disconnect();
      provider.destroy();
    };
  }, [
    documentId,
    userId,
    userName,
    userColor,
    userAvatar,
    websocketUrl,
    enableCollaboration,
    editor,
  ]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
        <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="simple-editor">
      <div className="flex items-center gap-1 rounded-t-lg border-b border-gray-200 bg-gray-50 p-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx(
            'rounded px-2 py-1 text-sm font-medium transition-colors',
            editor.isActive('bold')
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx(
            'rounded px-2 py-1 text-sm font-medium transition-colors',
            editor.isActive('italic')
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={clsx(
            'rounded px-2 py-1 text-sm font-medium transition-colors',
            editor.isActive('underline')
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          Underline
        </button>
        <div className="mx-1 h-4 w-px bg-gray-300" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={clsx(
            'rounded px-2 py-1 text-sm font-medium transition-colors',
            editor.isActive('heading', { level: 2 })
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={clsx(
            'rounded px-2 py-1 text-sm font-medium transition-colors',
            editor.isActive('bulletList')
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={clsx(
            'rounded px-2 py-1 text-sm font-medium transition-colors',
            editor.isActive('blockquote')
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          Quote
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
