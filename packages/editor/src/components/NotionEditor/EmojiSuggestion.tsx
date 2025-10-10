'use client';

import { emojis, gitHubEmojis } from '@tiptap/extension-emoji';
import { SuggestionProps } from '@tiptap/suggestion';
import { clsx } from 'clsx';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

// Combined emoji list with GitHub emojis
const EMOJI_LIST = [...emojis, ...gitHubEmojis];

// Group emojis by category for better organization
const _EMOJI_CATEGORIES = {
  'Smileys & People': [
    '😀',
    '😃',
    '😄',
    '😁',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
  ],
  'Animals & Nature': [
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '🐨',
    '🐯',
    '🦁',
    '🐮',
    '🐷',
    '🐽',
    '🐸',
    '🐵',
    '🙈',
    '🙉',
    '🙊',
  ],
  'Food & Drink': [
    '🍎',
    '🍐',
    '🍊',
    '🍋',
    '🍌',
    '🍉',
    '🍇',
    '🍓',
    '🍈',
    '🍒',
    '🍑',
    '🥭',
    '🍍',
    '🥥',
    '🥝',
    '🍅',
    '🍆',
    '🥑',
    '🥦',
  ],
  Activities: [
    '⚽',
    '🏀',
    '🏈',
    '⚾',
    '🥎',
    '🎾',
    '🏐',
    '🏉',
    '🥏',
    '🎱',
    '🪀',
    '🏓',
    '🏸',
    '🏒',
    '🏑',
    '🥍',
    '🏏',
    '🪃',
    '🥅',
  ],
  'Travel & Places': [
    '🚗',
    '🚕',
    '🚙',
    '🚌',
    '🚎',
    '🏎️',
    '🚓',
    '🚑',
    '🚒',
    '🚐',
    '🛻',
    '🚚',
    '🚛',
    '🚜',
    '🏍️',
    '🛵',
    '🚲',
    '🛴',
    '🛹',
  ],
  Objects: [
    '⌚',
    '📱',
    '📲',
    '💻',
    '⌨️',
    '🖥️',
    '🖨️',
    '🖱️',
    '🖲️',
    '🕹️',
    '🗜️',
    '💽',
    '💾',
    '💿',
    '📀',
    '📼',
    '📷',
    '📸',
    '📹',
  ],
  Symbols: [
    '❤️',
    '🧡',
    '💛',
    '💚',
    '💙',
    '💜',
    '🖤',
    '🤍',
    '🤎',
    '💔',
    '❣️',
    '💕',
    '💞',
    '💓',
    '💗',
    '💖',
    '💘',
    '💝',
    '💟',
  ],
  Flags: [
    '🏁',
    '🚩',
    '🎌',
    '🏴',
    '🏳️',
    '🏳️‍🌈',
    '🏳️‍⚧️',
    '🏴‍☠️',
    '🇦🇫',
    '🇦🇽',
    '🇦🇱',
    '🇩🇿',
    '🇦🇸',
    '🇦🇩',
    '🇦🇴',
    '🇦🇮',
    '🇦🇶',
  ],
};

interface EmojiItem {
  name: string;
  emoji: string;
  shortcodes: string[];
  tags?: string[];
  category?: string;
}

// Transform EMOJI_LIST into searchable format
const SEARCHABLE_EMOJIS: EmojiItem[] = EMOJI_LIST.map(emoji => ({
  name: emoji.name,
  emoji: emoji.fallbackImage ? emoji.name : emoji.emoji || emoji.name,
  shortcodes: emoji.shortcodes || [emoji.name],
  tags: emoji.tags || [],
  category: emoji.group || 'Other',
}));

interface EmojiSuggestionRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface EmojiSuggestionProps extends SuggestionProps<EmojiItem> {}

const EmojiSuggestion = forwardRef<EmojiSuggestionRef, EmojiSuggestionProps>(
  ({ items, command, query }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredItems = useMemo(() => {
      if (!query) return items.slice(0, 10);

      const lowercaseQuery = query.toLowerCase();

      return items
        .filter(
          item =>
            item.name.toLowerCase().includes(lowercaseQuery) ||
            item.shortcodes.some(code => code.toLowerCase().includes(lowercaseQuery)) ||
            item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)),
        )
        .slice(0, 10);
    }, [items, query]);

    const selectItem = (index: number) => {
      const item = filteredItems[index];
      if (item) {
        command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + filteredItems.length - 1) % filteredItems.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % filteredItems.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [filteredItems]);

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

    if (filteredItems.length === 0) {
      return (
        <div className="emoji-suggestion-dropdown max-w-sm rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="p-2 text-sm text-gray-500">No emojis found</div>
        </div>
      );
    }

    return (
      <div className="emoji-suggestion-dropdown max-h-64 max-w-sm overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
        {filteredItems.map(item => (
          <button
            key={item.emoji || item.name}
            onClick={() => selectItem(filteredItems.indexOf(item))}
            onMouseEnter={() => setSelectedIndex(filteredItems.indexOf(item))}
            className={clsx(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
              filteredItems.indexOf(item) === selectedIndex
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-700 hover:bg-gray-50',
            )}
            data-testid={`emoji-suggestion-${item.name}`}
            role="menuitem"
            aria-selected={filteredItems.indexOf(item) === selectedIndex}
          >
            <span className="text-lg">{item.emoji}</span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">:{item.name}:</span>
              {item.shortcodes.length > 1 && (
                <span className="truncate text-xs text-gray-500">
                  {item.shortcodes
                    .slice(1)
                    .map(code => `:${code}:`)
                    .join(', ')}
                </span>
              )}
            </div>
            {item.category && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-400">
                {item.category}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  },
);

EmojiSuggestion.displayName = 'EmojiSuggestion';

export { EmojiSuggestion, SEARCHABLE_EMOJIS };
export type { EmojiItem };
