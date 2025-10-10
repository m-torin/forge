import { type Editor, Mark, markInputRule, markPasteRule, mergeAttributes } from '@tiptap/core';

export interface AIHighlightOptions {
  HTMLAttributes: Record<string, string>;
  /** Default highlight color */
  defaultColor?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiHighlight: {
      /**
       * Set an AI highlight mark
       */
      setAIHighlight: (attributes?: { color: string }) => ReturnType;
      /**
       * Toggle an AI highlight mark
       */
      toggleAIHighlight: (attributes?: { color: string }) => ReturnType;
      /**
       * Unset an AI highlight mark
       */
      unsetAIHighlight: () => ReturnType;
    };
  }
}

export const inputRegex = /(?:^|\s)((?:==)((?:[^~=]+))(?:==))$/;
export const pasteRegex = /(?:^|\s)((?:==)((?:[^~=]+))(?:==))/g;

/**
 * AI Highlight extension for TipTap v3
 *
 * Provides AI-powered text highlighting with customizable colors.
 * Supports markdown-style syntax: ==highlighted text==
 */
export const AIHighlight = Mark.create<AIHighlightOptions>({
  name: 'aiHighlight',

  addOptions() {
    return {
      HTMLAttributes: {},
      defaultColor: '#c1ecf970',
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.color) {
            return {};
          }

          return {
            'data-color': attributes.color,
            style: `background-color: ${attributes.color}; color: inherit`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-ai-highlight]',
      },
      {
        tag: 'mark',
        getAttrs: element => {
          // Only parse marks with data-color or background-color
          const color =
            (element as HTMLElement).getAttribute('data-color') ||
            (element as HTMLElement).style.backgroundColor;
          return color ? {} : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-ai-highlight': 'true',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAIHighlight:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleAIHighlight:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetAIHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-h': () => this.editor.commands.toggleAIHighlight(),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ];
  },
});

/**
 * Helper to remove all AI highlights from the editor
 */
export function removeAIHighlight(editor: Editor): void {
  const { tr, doc, schema } = editor.state;
  const aiHighlightMark = schema.marks.aiHighlight;

  if (!aiHighlightMark) {
    console.warn('AI Highlight mark not found in schema');
    return;
  }

  tr.removeMark(0, doc.nodeSize - 2, aiHighlightMark);
  editor.view.dispatch(tr);
}

/**
 * Helper to add AI highlight to current selection
 */
export function addAIHighlight(editor: Editor, color = '#c1ecf970'): void {
  editor.chain().setAIHighlight({ color }).run();
}
