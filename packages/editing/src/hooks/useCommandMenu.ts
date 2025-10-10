import { useAtom, useAtomValue } from 'jotai';
import { useCallback } from 'react';
import type { SlashCommandItem } from '../extensions/slash-command';
import { commandMenuAtom, editorAtom } from '../state/atoms';

/**
 * Hook for managing slash command menu state
 *
 * @returns Command menu state and actions
 *
 * @example
 * ```tsx
 * function CustomCommandMenu() {
 *   const { isOpen, query, position, close } = useCommandMenu();
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div style={{ top: position?.top, left: position?.left }}>
 *       <input value={query} readOnly />
 *       <button onClick={close}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCommandMenu() {
  const [commandMenu, setCommandMenu] = useAtom(commandMenuAtom);
  const editor = useAtomValue(editorAtom);

  /**
   * Open command menu at specific position
   */
  const open = useCallback(
    (position?: { top: number; left: number }) => {
      setCommandMenu({
        isOpen: true,
        query: '',
        selectedIndex: 0,
        position,
      });
    },
    [setCommandMenu],
  );

  /**
   * Close command menu
   */
  const close = useCallback(() => {
    setCommandMenu({
      isOpen: false,
      query: '',
      selectedIndex: 0,
      position: undefined,
    });
  }, [setCommandMenu]);

  /**
   * Update search query
   */
  const setQuery = useCallback(
    (query: string) => {
      setCommandMenu(prev => ({
        ...prev,
        query,
        selectedIndex: 0, // Reset selection on query change
      }));
    },
    [setCommandMenu],
  );

  /**
   * Set selected index
   */
  const setSelectedIndex = useCallback(
    (index: number) => {
      setCommandMenu(prev => ({
        ...prev,
        selectedIndex: index,
      }));
    },
    [setCommandMenu],
  );

  /**
   * Navigate to next item
   */
  const selectNext = useCallback(
    (maxIndex: number) => {
      setCommandMenu(prev => ({
        ...prev,
        selectedIndex: Math.min(prev.selectedIndex + 1, maxIndex),
      }));
    },
    [setCommandMenu],
  );

  /**
   * Navigate to previous item
   */
  const selectPrevious = useCallback(() => {
    setCommandMenu(prev => ({
      ...prev,
      selectedIndex: Math.max(prev.selectedIndex - 1, 0),
    }));
  }, [setCommandMenu]);

  /**
   * Execute selected command
   */
  const executeCommand = useCallback(
    (item: SlashCommandItem) => {
      if (!editor || !item.command) return;

      const { from, to } = editor.state.selection;
      item.command({ editor, range: { from, to } });
      close();
    },
    [editor, close],
  );

  /**
   * Filter items based on query
   */
  const filterItems = useCallback(
    (items: SlashCommandItem[]) => {
      const query = commandMenu.query.toLowerCase();
      if (!query) return items;

      return items.filter(item => {
        return (
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.searchTerms?.some(term => term.toLowerCase().includes(query))
        );
      });
    },
    [commandMenu.query],
  );

  return {
    /** Whether command menu is open */
    isOpen: commandMenu.isOpen,
    /** Current search query */
    query: commandMenu.query,
    /** Selected item index */
    selectedIndex: commandMenu.selectedIndex,
    /** Menu position */
    position: commandMenu.position,
    /** Open command menu */
    open,
    /** Close command menu */
    close,
    /** Update search query */
    setQuery,
    /** Set selected index */
    setSelectedIndex,
    /** Navigate to next item */
    selectNext,
    /** Navigate to previous item */
    selectPrevious,
    /** Execute command */
    executeCommand,
    /** Filter items by query */
    filterItems,
  };
}
