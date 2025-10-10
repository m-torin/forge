import type { Editor, Range } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { type SuggestionOptions, type SuggestionProps } from '@tiptap/suggestion';
import type { ReactNode, RefObject } from 'react';
import tippy, { type Instance, type Props } from 'tippy.js';

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: ReactNode;
  searchTerms?: string[];
  command?: (props: { editor: Editor; range: Range }) => void;
}

export interface SlashCommandOptions {
  suggestion: Omit<SuggestionOptions, 'editor'>;
  items?: SlashCommandItem[];
}

/**
 * Slash Command extension for TipTap v3
 *
 * Provides a command palette triggered by '/' character
 * Compatible with @tiptap/suggestion
 */
/**
 * Handle command menu navigation
 * Helper for editorProps.handleDOMEvents.keydown
 *
 * @param event - Keyboard event
 * @returns true if event was handled
 */
export const handleCommandNavigation = (event: KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
    const slashCommand = document.querySelector('#slash-command');
    if (slashCommand) {
      return true;
    }
  }
  return false;
};

/**
 * Create suggestion items helper
 * @param items - Array of command items
 * @returns Same array (for backwards compatibility)
 */
export const createSuggestionItems = (items: SlashCommandItem[]) => items;

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }) => {
          props.command?.({ editor, range });
        },
      } as Omit<SuggestionOptions, 'editor'>,
      items: [],
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
});

/**
 * Filter suggestion items based on query
 */
export function filterSuggestionItems(
  items: SlashCommandItem[],
  query: string,
): SlashCommandItem[] {
  const lowerQuery = query.toLowerCase();

  if (!lowerQuery) {
    return items;
  }

  return items.filter(item => {
    const searchIn = [
      item.title.toLowerCase(),
      item.description.toLowerCase(),
      ...(item.searchTerms || []).map(term => term.toLowerCase()),
    ];

    return searchIn.some(text => text.includes(lowerQuery));
  });
}

/**
 * Default suggestion renderer factory
 * Returns handlers for Tippy.js popup
 */
export function createSuggestionRenderer(renderComponent: any) {
  let component: any | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: SuggestionProps) => {
      const { editor, clientRect } = props;
      const { selection } = editor.state;

      const parentNode = selection.$from.node(selection.$from.depth);
      const blockType = parentNode.type.name;

      // Don't show in code blocks
      if (blockType === 'codeBlock') {
        return false;
      }

      component = renderComponent(props);
      popup = createPopup(clientRect as any, component);
    },

    onUpdate: (props: SuggestionProps) => {
      component?.updateProps?.(props);
      popup?.setProps?.({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        popup?.hide?.();
        return true;
      }

      return component?.onKeyDown?.(props) ?? false;
    },

    onExit: () => {
      popup?.destroy?.();
      component?.destroy?.();
      component = null;
      popup = null;
    },
  };
}

/**
 * Create Tippy.js popup (to be implemented with actual Tippy.js)
 */
function createPopup(_clientRect: () => DOMRect, _element: HTMLElement) {
  // This will be properly implemented when integrating with UI components
  // For now, return a minimal interface
  return {
    setProps: () => {},
    hide: () => {},
    destroy: () => {},
  };
}

/**
 * Render items for slash command suggestions
 * Creates a popup with EditorCommandOut component
 *
 * @param elementRef - Optional reference element for positioning
 * @returns Suggestion render handlers for TipTap
 */
export const renderItems = (elementRef?: RefObject<Element> | null) => {
  let component: ReactRenderer | null = null;
  let popup: Instance<Props>[] | null = null;

  return {
    onStart: (props: SuggestionProps) => {
      // Import EditorCommandOut dynamically to avoid circular deps
      const { EditorCommandOut } = require('../components/light/EditorCommand');

      component = new ReactRenderer(EditorCommandOut, {
        props,
        editor: props.editor,
      });

      const { selection } = props.editor.state;
      const parentNode = selection.$from.node(selection.$from.depth);
      const blockType = parentNode.type.name;

      // Don't show in code blocks
      if (blockType === 'codeBlock') {
        component.destroy();
        component = null;
        return;
      }

      const clientRect = props.clientRect?.();
      if (!clientRect || !props.clientRect) {
        return;
      }

      // @ts-expect-error - tippy types
      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => (elementRef ? elementRef.current : document.body),
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate: (props: SuggestionProps) => {
      component?.updateProps(props);

      if (props.clientRect) {
        popup?.[0]?.setProps({
          getReferenceClientRect: () => props.clientRect?.() || new DOMRect(),
        });
      }
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        popup?.[0]?.hide();
        return true;
      }

      // @ts-expect-error - component ref types
      return component?.ref?.onKeyDown(props);
    },

    onExit: () => {
      popup?.[0]?.destroy();
      component?.destroy();
    },
  };
};
