'use client';

import { Extension } from '@tiptap/core';

// Extend the Commands interface for type safety
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notionShortcuts: {
      insertEmojiTrigger: () => ReturnType;
      insertMentionTrigger: () => ReturnType;
      insertSlashTrigger: () => ReturnType;
    };
  }
}

/**
 * Notion-specific Keyboard Shortcuts Extension
 *
 * This extension adds only Notion-specific shortcuts that aren't already
 * provided by Tiptap's default extensions. Most standard shortcuts
 * (Cmd+B for bold, Cmd+Alt+1 for heading, etc.) are already handled
 * by StarterKit and other core extensions.
 */
export const KeyboardShortcuts = Extension.create({
  name: 'notionShortcuts',

  addKeyboardShortcuts() {
    return {
      // Notion-specific shortcuts that aren't in Tiptap defaults

      // Quick slash command trigger (Notion-style)
      'Mod-/': () => {
        return this.editor.commands.insertContent('/');
      },

      // Emoji trigger shortcut
      'Mod-Shift-semicolon': () => {
        // Insert colon to trigger emoji suggestions (:)
        return this.editor.commands.insertContent(':');
      },

      // Mention trigger shortcut
      'Mod-Shift-2': () => {
        // Insert @ to trigger mention suggestions (@)
        return this.editor.commands.insertContent('@');
      },

      // Table insertion (not always available in all Tiptap setups)
      'Mod-Shift-t': () => {
        return this.editor.commands.insertTable({
          rows: 3,
          cols: 3,
          withHeaderRow: true,
        });
      },

      // Horizontal rule shortcut (enhance the default)
      'Mod-Shift-Minus': () => {
        return this.editor.commands.setHorizontalRule();
      },

      // Help shortcut to show keyboard shortcuts help
      '?': () => {
        // This could trigger a help modal in the future
        return false; // Not implemented yet
      },

      // Future enhancements (placeholder shortcuts)
      'Alt-ArrowUp': () => {
        // Move current block up (future enhancement)
        return false;
      },

      'Alt-ArrowDown': () => {
        // Move current block down (future enhancement)
        return false;
      },

      'Mod-Shift-d': () => {
        // Duplicate current block (future enhancement)
        return false;
      },
    };
  },

  addCommands() {
    return {
      // Commands for programmatic access
      insertEmojiTrigger:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent(':');
        },

      insertMentionTrigger:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent('@');
        },

      insertSlashTrigger:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent('/');
        },
    };
  },
});

/**
 * Simplified keyboard shortcut descriptions for help/docs
 * Only includes Notion-specific shortcuts, not the standard Tiptap ones
 */
export const getNotionKeyboardShortcuts = () => {
  return [
    // Notion-specific shortcuts
    { category: 'Notion Features', shortcut: 'Mod+/', description: 'Open slash commands' },
    {
      category: 'Notion Features',
      shortcut: 'Mod+Shift+;',
      description: 'Insert emoji trigger (:)',
    },
    {
      category: 'Notion Features',
      shortcut: 'Mod+Shift+2',
      description: 'Insert mention trigger (@)',
    },
    { category: 'Insert Elements', shortcut: 'Mod+Shift+T', description: 'Insert table' },
    { category: 'Insert Elements', shortcut: 'Mod+Shift+-', description: 'Insert horizontal rule' },

    // Standard Tiptap shortcuts (for reference)
    { category: 'Text Formatting', shortcut: 'Mod+B', description: 'Bold text' },
    { category: 'Text Formatting', shortcut: 'Mod+I', description: 'Italic text' },
    { category: 'Text Formatting', shortcut: 'Mod+U', description: 'Underline text' },
    { category: 'Text Formatting', shortcut: 'Mod+Shift+S', description: 'Strikethrough text' },
    { category: 'Text Formatting', shortcut: 'Mod+Shift+H', description: 'Highlight text' },
    { category: 'Text Formatting', shortcut: 'Mod+E', description: 'Inline code' },

    { category: 'Paragraph Formatting', shortcut: 'Mod+Alt+0', description: 'Normal text' },
    {
      category: 'Paragraph Formatting',
      shortcut: 'Mod+Alt+1-6',
      description: 'Heading levels 1-6',
    },
    { category: 'Paragraph Formatting', shortcut: 'Mod+Shift+7', description: 'Ordered list' },
    { category: 'Paragraph Formatting', shortcut: 'Mod+Shift+8', description: 'Bullet list' },
    { category: 'Paragraph Formatting', shortcut: 'Mod+Shift+9', description: 'Task list' },
    { category: 'Paragraph Formatting', shortcut: 'Mod+Shift+B', description: 'Blockquote' },
    { category: 'Paragraph Formatting', shortcut: 'Mod+Alt+C', description: 'Code block' },

    { category: 'Text Alignment', shortcut: 'Mod+Shift+L', description: 'Align left' },
    { category: 'Text Alignment', shortcut: 'Mod+Shift+E', description: 'Align center' },
    { category: 'Text Alignment', shortcut: 'Mod+Shift+R', description: 'Align right' },
    { category: 'Text Alignment', shortcut: 'Mod+Shift+J', description: 'Justify text' },

    { category: 'Line Breaks', shortcut: 'Shift+Enter', description: 'Line break' },
    { category: 'Line Breaks', shortcut: 'Cmd+Enter', description: 'Line break' },

    { category: 'Selection', shortcut: 'Mod+A', description: 'Select all' },
  ];
};

/**
 * Platform-specific keyboard shortcut helper
 */
export const getPlatformShortcut = (shortcut: string): string => {
  const isMac =
    typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (isMac) {
    return shortcut.replace(/Mod/g, 'Cmd');
  } else {
    return shortcut.replace(/Mod/g, 'Ctrl');
  }
};

/**
 * Hook to provide keyboard shortcut help
 */
export const useKeyboardShortcuts = () => {
  const shortcuts = getNotionKeyboardShortcuts();

  const getShortcutByCategory = (category: string) => {
    return shortcuts.filter(s => s.category === category);
  };

  const getFormattedShortcut = (shortcut: string) => {
    return getPlatformShortcut(shortcut);
  };

  return {
    shortcuts,
    getShortcutByCategory,
    getFormattedShortcut,
  };
};
