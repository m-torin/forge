'use client';

import { SuggestionProps } from '@tiptap/suggestion';
import { clsx } from 'clsx';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

// Default mock users for demo purposes
const DEFAULT_USERS: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  { id: '4', name: 'Alice Wilson', email: 'alice@example.com' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com' },
];

interface MentionSuggestionRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionSuggestionProps extends SuggestionProps<User> {
  _editor?: any;
  _range?: any;
}

const MentionSuggestion = forwardRef<MentionSuggestionRef, MentionSuggestionProps>(
  ({ items, command, _editor, _range, query }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredItems = useMemo(() => {
      if (!query) return items.slice(0, 5);

      const lowercaseQuery = query.toLowerCase();

      return items
        .filter(
          user =>
            user.name.toLowerCase().includes(lowercaseQuery) ||
            user.email?.toLowerCase().includes(lowercaseQuery),
        )
        .slice(0, 5);
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
        <div className="mention-suggestion-dropdown max-w-sm rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="p-2 text-sm text-gray-500">No users found</div>
        </div>
      );
    }

    return (
      <div className="mention-suggestion-dropdown max-h-64 max-w-sm overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
        {filteredItems.map((user, index) => (
          <button
            key={user.id}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={clsx(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
              index === selectedIndex
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-700 hover:bg-gray-50',
            )}
            data-testid={`mention-suggestion-${user.id}`}
            role="menuitem"
            aria-selected={index === selectedIndex}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{user.name}</span>
              {user.email && <span className="truncate text-xs text-gray-500">{user.email}</span>}
            </div>
          </button>
        ))}
      </div>
    );
  },
);

MentionSuggestion.displayName = 'MentionSuggestion';

export { DEFAULT_USERS, MentionSuggestion };
export type { User };
