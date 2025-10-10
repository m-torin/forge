"use client";

import { Editor } from "@tiptap/core";
import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface MentionDropdownProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  query: string;
  users?: User[];
}

// Default mock users for demo purposes
const DEFAULT_USERS: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com" },
  { id: "4", name: "Alice Wilson", email: "alice@example.com" },
  { id: "5", name: "Charlie Brown", email: "charlie@example.com" },
];

export function MentionDropdown({
  editor,
  isOpen,
  onClose,
  position,
  query,
  users = DEFAULT_USERS,
}: MentionDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredUsers = useMemo(() => {
    if (!query) return users.slice(0, 5);

    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email?.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);
  }, [query, users]);

  const selectUser = useCallback(
    (user: User) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .insertContent({
          type: "mention",
          attrs: {
            id: user.id,
            label: user.name,
          },
        })
        .run();

      onClose();
    },
    [editor, onClose],
  );

  const _handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return false;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredUsers.length - 1 ? prev + 1 : 0,
          );
          return true;

        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredUsers.length - 1,
          );
          return true;

        case "Enter":
          event.preventDefault();
          if (filteredUsers[selectedIndex]) {
            selectUser(filteredUsers[selectedIndex]);
          }
          return true;

        case "Escape":
          event.preventDefault();
          onClose();
          return true;

        default:
          return false;
      }
    },
    [isOpen, filteredUsers, selectedIndex, selectUser, onClose],
  );

  // Reset selected index when filtered users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredUsers.length]);

  if (!isOpen || !editor || filteredUsers.length === 0) return null;

  return (
    <div
      className="mention-dropdown fixed z-50 max-h-64 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="max-h-64 overflow-y-auto">
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            className={clsx(
              "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
              user.id === filteredUsers[selectedIndex]?.id
                ? "bg-blue-50 text-blue-900"
                : "text-gray-700 hover:bg-gray-50",
            )}
            onClick={() => selectUser(user)}
            onMouseEnter={() => setSelectedIndex(filteredUsers.indexOf(user))}
          >
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.name}</div>
              {user.email && (
                <div className="truncate text-xs text-gray-500">
                  {user.email}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
        ↑↓ to navigate • Enter to select • Esc to cancel
      </div>
    </div>
  );
}
