'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { useCollaborativeEditing } from '../hooks/use-collaborative-editing';
import { EditorCollaborationProps } from '../types/editor';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { PresenceIndicator } from './PresenceIndicator';

// Simple SVG icons for toolbar
const BoldIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M6 4h5c1.657 0 3 1.343 3 3s-1.343 3-3 3H6V4z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M6 10h6c1.657 0 3 1.343 3 3s-1.343 3-3 3H6v-6z"
    />
  </svg>
);

const ItalicIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 6l-10 12M14 6h4M6 18h4"
    />
  </svg>
);

const StrikeIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18m-9-9v18" />
  </svg>
);

const CodeIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

const BulletListIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 10h12M4 14h16M4 18h16"
    />
  </svg>
);

const OrderedListIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
    />
  </svg>
);

const QuoteIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
    />
  </svg>
);

const UndoIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
    />
  </svg>
);

const RedoIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
    />
  </svg>
);

// Simple toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded border p-2 transition-colors ${
        isActive
          ? 'border-blue-300 bg-blue-100 text-blue-700'
          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
}

// Notification component
interface NotificationProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
}

function Notification({ type, message, onClose }: NotificationProps) {
  const colors = {
    success: 'bg-green-100 border-green-300 text-green-800',
    error: 'bg-red-100 border-red-300 text-red-800',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed right-4 top-4 rounded border p-3 ${colors[type]} z-50 shadow-lg`}>
      <div className="flex items-center justify-between">
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 text-lg leading-none">
          &times;
        </button>
      </div>
    </div>
  );
}

export function RealTimeEditor({
  documentId,
  initialContent = '',
  onContentChange,
  readOnly = false,
  showCollaborators = true,
  showPresence = true,
}: EditorCollaborationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const {
    collaborators,
    isConnected,
    sendEvent,
    updatePresence: _updatePresence,
    disconnect,
  } = useCollaborativeEditing({
    documentId,
    userId: 'current-user', // This should come from auth context
    enablePresence: showPresence,
    enableCursors: true,
    autoSave: true,
    saveInterval: 2000,
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      if (onContentChange) {
        onContentChange(html);
      }

      // Send collaboration event
      sendEvent({
        type: 'edit',
        userId: 'current-user', // This should come from auth context
        data: {
          content: html,
          operation: 'update',
        },
      });
    },
  });

  useEffect(() => {
    if (!isConnected) {
      setNotification({
        type: 'warning',
        message: 'Connection lost. Trying to reconnect...',
      });
    } else {
      setNotification({
        type: 'success',
        message: 'Real-time collaboration active',
      });
    }
  }, [isConnected]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Loading editor...</span>
      </div>
    );
  }

  if (!editor) {
    return <div className="p-4 text-gray-500">Editor failed to load</div>;
  }

  return (
    <div className="collaboration-editor rounded-lg border bg-white">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {showCollaborators && (
        <div className="flex items-center gap-3 border-b p-4">
          <div className="flex gap-2">
            {collaborators.map(collaborator => (
              <CollaboratorAvatar key={collaborator.id} collaborator={collaborator} />
            ))}
          </div>
          {showPresence && <PresenceIndicator isConnected={isConnected} />}
        </div>
      )}

      <div className="border-b p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <BoldIcon />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <ItalicIcon />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <StrikeIcon />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            >
              <CodeIcon />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <span className="text-lg font-bold">H1</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <span className="text-base font-bold">H2</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <span className="text-sm font-bold">H3</span>
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <BulletListIcon />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <OrderedListIcon />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Blockquote"
            >
              <QuoteIcon />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <UndoIcon />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <RedoIcon />
            </ToolbarButton>
          </div>
        </div>
      </div>

      <div className="prose max-w-none p-4">
        <EditorContent editor={editor} className="min-h-[300px] outline-none" />
      </div>
    </div>
  );
}
