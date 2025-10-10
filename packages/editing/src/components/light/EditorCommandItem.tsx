'use client';

import type { Editor, Range } from '@tiptap/core';
import { useCurrentEditor } from '@tiptap/react';
import { CommandEmpty, CommandItem } from 'cmdk';
import { useAtomValue } from 'jotai';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';
import { rangeAtom } from '../../state/atoms';

interface EditorCommandItemProps {
  readonly onCommand: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

/**
 * EditorCommandItem - Individual command item in the slash menu
 * Compatible with TipTap v3
 *
 * @example
 * ```tsx
 * <EditorCommandItem
 *   onCommand={({ editor, range }) => {
 *     editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
 *   }}
 * >
 *   <div className="icon">H1</div>
 *   <div>
 *     <p>Heading 1</p>
 *     <p className="description">Big section heading</p>
 *   </div>
 * </EditorCommandItem>
 * ```
 */
export const EditorCommandItem = forwardRef<
  HTMLDivElement,
  EditorCommandItemProps & ComponentPropsWithoutRef<typeof CommandItem>
>(({ children, onCommand, ...rest }, ref) => {
  const { editor } = useCurrentEditor();
  const range = useAtomValue(rangeAtom);

  if (!editor || !range) return null;

  return (
    <CommandItem ref={ref} {...rest} onSelect={() => onCommand({ editor, range })}>
      {children}
    </CommandItem>
  );
});

EditorCommandItem.displayName = 'EditorCommandItem';

/**
 * EditorCommandEmpty - Empty state for command menu
 * Re-exports cmdk's CommandEmpty
 */
export const EditorCommandEmpty = CommandEmpty;

export default EditorCommandItem;
