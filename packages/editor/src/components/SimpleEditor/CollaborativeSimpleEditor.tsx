'use client';

import { EditorContent } from '@tiptap/react';
import { clsx } from 'clsx';
import { useYjsCollaboration } from '../../hooks/use-yjs-collaboration';
import type { YjsCollaborationOptions } from '../../types/collaboration';

export interface CollaborativeSimpleEditorProps
  extends Omit<YjsCollaborationOptions, 'extensions'> {
  className?: string;
  placeholder?: string;
}

export function CollaborativeSimpleEditor({
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
  placeholder: _placeholder = 'Start writing...',
}: CollaborativeSimpleEditorProps) {
  const { editor, collaborators, isConnected, isLoading, error } = useYjsCollaboration({
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
    extensions: [], // Use default extensions from hook
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
        <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="collaborative-simple-editor">
      {/* Status Bar */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div
            className={clsx('h-2 w-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')}
          />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        {collaborators.length > 0 && (
          <div className="flex items-center gap-1">
            <span>
              {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
            </span>
            <div className="flex -space-x-1">
              {collaborators.slice(0, 3).map(collaborator => (
                <div
                  key={collaborator.id}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-white text-xs text-white"
                  style={{ backgroundColor: collaborator.color }}
                  title={collaborator.name}
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
                </div>
              ))}
              {collaborators.length > 3 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-400 text-xs text-white">
                  +{collaborators.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Simple Toolbar */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
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
        <div className="mx-1 h-4 w-px bg-gray-300" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Redo
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className={clsx(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'min-h-[200px] p-4',
          className,
        )}
      />
    </div>
  );
}
