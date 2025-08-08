'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { useKeyboardShortcuts } from './KeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const { shortcuts, getShortcutByCategory, getFormattedShortcut } = useKeyboardShortcuts();
  const [selectedCategory, setSelectedCategory] = useState('Text Formatting');

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        aria-label="Close shortcuts help"
      />

      <div className="relative mx-4 max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-2xl font-light text-gray-400 hover:text-gray-600"
            aria-label="Close shortcuts help"
          >
            ×
          </button>
        </div>

        <div className="flex h-full max-h-[60vh]">
          <div className="w-64 overflow-y-auto border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
                Categories
              </h3>
              <nav className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={clsx(
                      'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                      selectedCategory === category
                        ? 'bg-blue-100 font-medium text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100',
                    )}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">{selectedCategory}</h3>
              <div className="space-y-3">
                {getShortcutByCategory(selectedCategory).map(shortcut => (
                  <div
                    key={shortcut.shortcut + shortcut.description}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                  >
                    <span className="text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {getFormattedShortcut(shortcut.shortcut)
                        .split('+')
                        .map((key, keyIndex, arr) => (
                          <span
                            key={`${shortcut.description}-${key}-${key.length}`}
                            className="inline-flex"
                          >
                            <kbd className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                              {key.trim()}
                            </kbd>
                            {keyIndex < arr.length - 1 && (
                              <span className="mx-1 text-gray-400">+</span>
                            )}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Press{' '}
              <kbd className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                ?
              </kbd>{' '}
              to open this help again
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage keyboard shortcuts help modal
 */
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const openHelp = () => setIsOpen(true);
  const closeHelp = () => setIsOpen(false);
  const toggleHelp = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    openHelp,
    closeHelp,
    toggleHelp,
  };
}
