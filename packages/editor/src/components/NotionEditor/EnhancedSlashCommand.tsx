'use client';

import { logWarn } from '@repo/observability';
import { Editor, Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { Suggestion, SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { clsx } from 'clsx';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { createSuggestionRender } from '../../utils/suggestion-render';

// Extend the Commands interface for type safety
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    enhancedSlashCommand: {
      openSlashMenu: () => ReturnType;
      executeSlashCommand: (commandTitle: string) => ReturnType;
    };
  }
}

// Define the command item structure
export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => boolean;
  aliases?: string[];
  category?: string;
  shortcut?: string;
}

// Enhanced slash commands with categories and shortcuts
export const ENHANCED_SLASH_COMMANDS: SlashCommandItem[] = [
  // Text Blocks
  {
    title: 'Text',
    description: 'Just start writing with plain text.',
    icon: '📝',
    command: editor => editor.commands.setParagraph(),
    aliases: ['paragraph', 'p'],
    category: 'Basic Blocks',
    shortcut: 'Cmd+Alt+0',
  },
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    icon: '📢',
    command: editor => editor.commands.setHeading({ level: 1 }),
    aliases: ['h1', 'heading1', 'title'],
    category: 'Basic Blocks',
    shortcut: 'Cmd+Alt+1',
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    icon: '📝',
    command: editor => editor.commands.setHeading({ level: 2 }),
    aliases: ['h2', 'heading2', 'subtitle'],
    category: 'Basic Blocks',
    shortcut: 'Cmd+Alt+2',
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    icon: '📄',
    command: editor => editor.commands.setHeading({ level: 3 }),
    aliases: ['h3', 'heading3'],
    category: 'Basic Blocks',
    shortcut: 'Cmd+Alt+3',
  },

  // Lists
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    icon: '•',
    command: editor => editor.commands.toggleBulletList(),
    aliases: ['ul', 'unordered', 'bullet'],
    category: 'Lists',
    shortcut: 'Cmd+Shift+8',
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    icon: '1.',
    command: editor => editor.commands.toggleOrderedList(),
    aliases: ['ol', 'ordered', 'numbered'],
    category: 'Lists',
    shortcut: 'Cmd+Shift+7',
  },
  {
    title: 'To-do List',
    description: 'Track tasks with a to-do list.',
    icon: '☐',
    command: editor => editor.commands.toggleTaskList(),
    aliases: ['todo', 'task', 'checklist', 'checkbox'],
    category: 'Lists',
    shortcut: 'Cmd+Shift+9',
  },

  // Media & Layout
  {
    title: 'Quote',
    description: 'Capture a quote.',
    icon: '"',
    command: editor => editor.commands.setBlockquote(),
    aliases: ['blockquote', 'cite'],
    category: 'Media & Layout',
    shortcut: 'Cmd+Shift+B',
  },
  {
    title: 'Code Block',
    description: 'Capture a code snippet.',
    icon: '{}',
    command: editor => editor.commands.setCodeBlock(),
    aliases: ['code', 'codeblock', 'pre'],
    category: 'Media & Layout',
    shortcut: 'Cmd+Alt+C',
  },
  {
    title: 'Table',
    description: 'Create a table.',
    icon: '⊞',
    command: editor => editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    aliases: ['table', 'grid'],
    category: 'Media & Layout',
    shortcut: 'Cmd+Shift+T',
  },
  {
    title: 'Divider',
    description: 'Visually divide blocks.',
    icon: '---',
    command: editor => editor.commands.setHorizontalRule(),
    aliases: ['hr', 'horizontal', 'divider', 'separator'],
    category: 'Media & Layout',
    shortcut: 'Cmd+Shift+-',
  },

  // Advanced
  {
    title: 'Line Break',
    description: 'Add a soft line break.',
    icon: '↵',
    command: editor => editor.commands.setHardBreak(),
    aliases: ['br', 'break', 'newline'],
    category: 'Advanced',
    shortcut: 'Shift+Enter',
  },
];

// Suggestion component interface
export interface SlashSuggestionRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SlashSuggestionProps extends SuggestionProps<SlashCommandItem> {}

// Slash suggestion component
const SlashSuggestion = forwardRef<SlashSuggestionRef, SlashSuggestionProps>(
  ({ items, command, editor: _editor, range: _range, query }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Group commands by category
    const groupedCommands = useMemo(() => {
      const filtered = items.filter(item => {
        const lowercaseQuery = query.toLowerCase();
        return (
          query === '' ||
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.description.toLowerCase().includes(lowercaseQuery) ||
          item.aliases?.some(alias => alias.toLowerCase().includes(lowercaseQuery))
        );
      });

      return filtered.reduce(
        (groups, item) => {
          const category = item.category || 'Other';
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(item);
          return groups;
        },
        {} as Record<string, SlashCommandItem[]>,
      );
    }, [items, query]);

    const flatCommands = useMemo(() => {
      return Object.values(groupedCommands).flat();
    }, [groupedCommands]);

    const selectItem = (index: number) => {
      const item = flatCommands[index];
      if (item) {
        command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatCommands.length - 1));
    };

    const downHandler = () => {
      setSelectedIndex(prev => (prev < flatCommands.length - 1 ? prev + 1 : 0));
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [flatCommands]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    if (flatCommands.length === 0) {
      return (
        <div className="slash-suggestion-dropdown max-w-md rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="p-2 text-sm text-gray-500">No commands found</div>
        </div>
      );
    }

    let currentIndex = 0;

    return (
      <div className="slash-suggestion-dropdown max-h-80 max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
        {Object.entries(groupedCommands).map(([category, commands]) => (
          <div key={category} className="mb-2 last:mb-0">
            {Object.keys(groupedCommands).length > 1 && (
              <div className="mb-1 border-b border-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                {category}
              </div>
            )}
            {commands.map((item, _categoryIndex) => {
              const itemIndex = currentIndex++;
              return (
                <button
                  key={item.title}
                  onClick={() => selectItem(itemIndex)}
                  onMouseEnter={() => setSelectedIndex(itemIndex)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    itemIndex === selectedIndex
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50',
                  )}
                  data-testid={`slash-command-${item.title.toLowerCase().replace(/\\s+/g, '-')}`}
                  role="menuitem"
                  aria-selected={itemIndex === selectedIndex}
                >
                  <span className="flex-shrink-0 text-lg">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.title}</div>
                    <div className="truncate text-xs text-gray-500">{item.description}</div>
                  </div>
                  {item.shortcut && (
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {item.shortcut.split('+').map((key, keyIndex, arr) => (
                        <span
                          key={`${item.title}-shortcut-${key}-${key.length}`}
                          className="inline-flex"
                        >
                          <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-600 shadow-sm">
                            {key.replace('Cmd', '⌘').replace('Shift', '⇧').replace('Alt', '⌥')}
                          </kbd>
                          {keyIndex < arr.length - 1 && (
                            <span className="mx-0.5 text-gray-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
);

SlashSuggestion.displayName = 'SlashSuggestion';

// Enhanced Slash Command Extension
export const EnhancedSlashCommand = Extension.create<{
  suggestion: Omit<SuggestionOptions, 'editor'>;
}>({
  name: 'enhancedSlashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: new PluginKey('slashCommand'),
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: any;
          props: SlashCommandItem;
        }) => {
          // Remove the slash command text
          editor.chain().focus().deleteRange(range).run();

          // Execute the command
          const success = props.command(editor);

          if (!success) {
            logWarn('Slash command failed to execute:', props.title);
          }
        },
        items: ({ query, editor: _editor }: { query: string; editor: Editor }) => {
          return ENHANCED_SLASH_COMMANDS.filter(item => {
            const lowercaseQuery = query.toLowerCase();
            return (
              query === '' ||
              item.title.toLowerCase().includes(lowercaseQuery) ||
              item.description.toLowerCase().includes(lowercaseQuery) ||
              item.aliases?.some(alias => alias.toLowerCase().includes(lowercaseQuery))
            );
          }).slice(0, 20); // Limit results
        },
        render: createSuggestionRender({
          component: SlashSuggestion,
          popup: {
            placement: 'bottom-start',
            offset: 8,
            fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
            padding: 8,
            strategy: 'absolute',
          },
        }),
        startOfLine: false,
        decorationTag: 'span',
        decorationClass: 'slash-command-decoration',
        allowSpaces: false,
        allowedPrefixes: [' ', '\n'],
      } as SuggestionOptions,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Quick slash trigger
      'Mod-/': () => {
        return this.editor.commands.insertContent('/');
      },

      // Alternative quick access shortcuts for common commands
      'Mod-Alt-t': () => {
        return this.editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
      },

      'Mod-Shift-Minus': () => {
        return this.editor.commands.setHorizontalRule();
      },
    };
  },

  addCommands() {
    return {
      // Command to programmatically trigger slash menu
      openSlashMenu:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent('/');
        },

      // Quick command execution without slash menu
      executeSlashCommand:
        (commandTitle: string) =>
        ({ editor }: { editor: any }) => {
          const command = ENHANCED_SLASH_COMMANDS.find(
            cmd =>
              cmd.title.toLowerCase() === commandTitle.toLowerCase() ||
              cmd.aliases?.some(alias => alias.toLowerCase() === commandTitle.toLowerCase()),
          );

          if (command) {
            return command.command(editor);
          }

          return false;
        },
    };
  },
});

// Hook to access slash commands programmatically
export const useSlashCommands = () => {
  const getCommandsByCategory = (category: string) => {
    return ENHANCED_SLASH_COMMANDS.filter(cmd => cmd.category === category);
  };

  const searchCommands = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return ENHANCED_SLASH_COMMANDS.filter(
      item =>
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.aliases?.some(alias => alias.toLowerCase().includes(lowercaseQuery)),
    );
  };

  const getCommandByTitle = (title: string) => {
    return ENHANCED_SLASH_COMMANDS.find(
      cmd =>
        cmd.title.toLowerCase() === title.toLowerCase() ||
        cmd.aliases?.some(alias => alias.toLowerCase() === title.toLowerCase()),
    );
  };

  return {
    commands: ENHANCED_SLASH_COMMANDS,
    getCommandsByCategory,
    searchCommands,
    getCommandByTitle,
  };
};

export { SlashSuggestion };
