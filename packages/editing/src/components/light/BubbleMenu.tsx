'use client';

import type { BubbleMenuProps as TipTapBubbleMenuProps } from '@tiptap/react/menus';
import { BubbleMenu as TipTapBubbleMenu } from '@tiptap/react/menus';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { editorAtom, hasSelectionAtom } from '../../state';

export interface BubbleMenuProps {
  /** Custom class name */
  className?: string;
  /** Custom buttons */
  children?: React.ReactNode;
}

/**
 * BubbleMenu component
 *
 * Floating toolbar that appears when text is selected
 *
 * @example
 * ```tsx
 * <EditorRoot>
 *   <EditorContent extensions={extensions} />
 *   <BubbleMenu />
 * </EditorRoot>
 * ```
 */
export const BubbleMenu: FC<BubbleMenuProps> = ({ className, children }) => {
  const editor = useAtomValue(editorAtom);
  const hasSelection = useAtomValue(hasSelectionAtom);

  if (!editor || !hasSelection) {
    return null;
  }

  return (
    <TipTapBubbleMenu
      editor={editor}
      options={
        {
          placement: 'top',
          onShow: () => undefined,
        } satisfies NonNullable<TipTapBubbleMenuProps['options']>
      }
      className={
        className ||
        'flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg'
      }
    >
      {children || (
        <>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <BoldIcon />
          </BubbleMenuButton>

          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <ItalicIcon />
          </BubbleMenuButton>

          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon />
          </BubbleMenuButton>

          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <StrikeIcon />
          </BubbleMenuButton>

          <div className="mx-1 h-4 w-px bg-gray-300" />

          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            <CodeIcon />
          </BubbleMenuButton>

          <BubbleMenuButton
            onClick={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive('link')}
            title="Link"
          >
            <LinkIcon />
          </BubbleMenuButton>
        </>
      )}
    </TipTapBubbleMenu>
  );
};

/**
 * BubbleMenu button component
 */
interface BubbleMenuButtonProps {
  onClick: () => void;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}

function BubbleMenuButton({ onClick, isActive, title, children }: BubbleMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      title={title}
      className={`rounded p-1.5 transition-colors hover:bg-gray-100 ${
        isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

// Simple SVG icons
function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2h5a3 3 0 0 1 0 6H4V2zm0 6h6a3 3 0 0 1 0 6H4V8z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2h6v2h-2l-3 8h2v2H5v-2h2l3-8H8V2z" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2v6a4 4 0 0 0 8 0V2h-2v6a2 2 0 1 1-4 0V2H4zm-1 12h10v2H3v-2z" />
    </svg>
  );
}

function StrikeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 8h12v1H2V8zm3-5h6a2 2 0 0 1 0 4H9v2a1 1 0 0 0 2 0h2a3 3 0 0 1-6 0V7H5a2 2 0 0 1 0-4z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.854 4.146a.5.5 0 0 1 0 .708L2.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm4.292 0a.5.5 0 0 0 0 .708L13.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z" />
      <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z" />
    </svg>
  );
}
