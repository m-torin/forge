"use client";

import { Editor } from "@tiptap/core";
import { emojis, gitHubEmojis } from "@tiptap/extension-emoji";
import { clsx } from "clsx";
import { useMemo, useState } from "react";

interface EmojiDropdownProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  query: string;
}

// Combined emoji list with GitHub emojis
const EMOJI_LIST = [...emojis, ...gitHubEmojis];

// Group emojis by category for better organization
const EMOJI_CATEGORIES = {
  "Smileys & People": [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
  ],
  "Animals & Nature": [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐽",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",
  ],
  "Food & Drink": [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
  ],
  Activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
  ],
  "Travel & Places": [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🏍️",
    "🛵",
    "🚲",
    "🛴",
    "🛹",
  ],
  Objects: [
    "⌚",
    "📱",
    "📲",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "🕹️",
    "🗜️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
  ],
  Symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
  ],
  Flags: [
    "🏁",
    "🚩",
    "🎌",
    "🏴",
    "🏳️",
    "🏳️‍🌈",
    "🏳️‍⚧️",
    "🏴‍☠️",
    "🇦🇫",
    "🇦🇽",
    "🇦🇱",
    "🇩🇿",
    "🇦🇸",
    "🇦🇩",
    "🇦🇴",
    "🇦🇮",
    "🇦🇶",
  ],
};

export function EmojiDropdown({
  editor,
  isOpen,
  onClose,
  position,
  query,
}: EmojiDropdownProps) {
  const [selectedCategory, setSelectedCategory] = useState("Smileys & People");

  const filteredEmojis = useMemo(() => {
    if (!query) {
      return (
        EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] ||
        []
      );
    }

    // Search through all emojis based on query
    return EMOJI_LIST.filter((emoji: any) => {
      if (typeof emoji === "string") {
        return emoji.includes(query);
      }
      // For emoji objects with shortcodes
      return (
        emoji.shortcodes?.some((code: string) => code.includes(query)) ||
        emoji.tags?.some((tag: string) => tag.includes(query))
      );
    })
      .slice(0, 50) // Limit results
      .map((emoji: any) =>
        typeof emoji === "string"
          ? emoji
          : emoji.fallbackImage || emoji.emoji || "",
      );
  }, [query, selectedCategory]);

  const insertEmoji = (emoji: string) => {
    if (!editor) return;

    editor.chain().focus().insertContent(emoji).run();
    onClose();
  };

  if (!isOpen || !editor) return null;

  return (
    <div
      className="emoji-dropdown fixed z-50 max-h-96 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {!query && (
        <div className="border-b border-gray-100 p-2">
          <div className="flex gap-1 overflow-x-auto">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                className={clsx(
                  "flex-shrink-0 rounded px-2 py-1 text-xs transition-colors",
                  selectedCategory === category
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100",
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto p-2">
        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji) => (
              <div key={emoji.unicode || emoji.name}>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-gray-100"
                  onClick={() => insertEmoji(emoji)}
                  title={emoji}
                >
                  {emoji}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">No emojis found</div>
        )}
      </div>

      {!query && (
        <div className="border-t border-gray-100 p-2 text-xs text-gray-500">
          Type : followed by emoji name to search
        </div>
      )}
    </div>
  );
}
