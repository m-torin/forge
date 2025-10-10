'use client';

import { Command } from 'cmdk';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { SlashCommandItem } from '../../extensions/slash-command';
import { commandMenuAtom, editorAtom } from '../../state';

export interface CommandMenuProps {
  /** Command items to display */
  items?: SlashCommandItem[];
  /** Custom class name */
  className?: string;
}

/**
 * Default slash command items
 */
const defaultCommandItems: SlashCommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Big section heading',
    icon: '📝',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: '📝',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: '📝',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    icon: '•',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: '1.',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote',
    icon: '"',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Code',
    description: 'Capture a code snippet',
    icon: '</>',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
];

/**
 * CommandMenu component
 *
 * Shows slash command suggestions using cmdk
 *
 * @example
 * ```tsx
 * <EditorRoot>
 *   <EditorContent extensions={extensions} />
 *   <CommandMenu items={customItems} />
 * </EditorRoot>
 * ```
 */
export const CommandMenu: FC<CommandMenuProps> = ({ items = defaultCommandItems, className }) => {
  const editor = useAtomValue(editorAtom);
  const commandMenu = useAtomValue(commandMenuAtom);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [commandMenu.query]);

  if (!editor || !commandMenu.isOpen) {
    return null;
  }

  const filteredItems = items.filter(item => {
    const query = commandMenu.query.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.searchTerms?.some(term => term.toLowerCase().includes(query))
    );
  });

  return (
    <Command
      className={
        className || 'fixed z-50 w-72 rounded-lg border border-gray-200 bg-white shadow-lg'
      }
      style={{
        top: commandMenu.position?.top,
        left: commandMenu.position?.left,
      }}
    >
      <Command.List className="max-h-80 overflow-y-auto p-2">
        {filteredItems.length === 0 ? (
          <Command.Empty className="px-4 py-2 text-sm text-gray-500">
            No results found
          </Command.Empty>
        ) : (
          filteredItems.map((item, index) => (
            <Command.Item
              key={item.title}
              value={item.title}
              onSelect={() => {
                if (item.command) {
                  const { from, to } = editor.state.selection;
                  item.command({ editor, range: { from, to } });
                }
              }}
              className={`flex cursor-pointer items-start gap-3 rounded-md px-3 py-2 ${
                index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            </Command.Item>
          ))
        )}
      </Command.List>
    </Command>
  );
};
