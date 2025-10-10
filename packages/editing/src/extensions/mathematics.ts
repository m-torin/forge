import { Node, mergeAttributes } from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';
import type { KatexOptions } from 'katex';

export interface MathematicsOptions {
  /**
   * Determine if LaTeX should render at the given position
   * By default, LaTeX decorations render when expressions are not inside code blocks
   */
  shouldRender: (state: EditorState, pos: number) => boolean;

  /**
   * KaTeX rendering options
   * @see https://katex.org/docs/options.html
   */
  katexOptions?: KatexOptions;

  /** HTML attributes for the math node */
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathematics: {
      /**
       * Insert a LaTeX math expression
       */
      setLatex: (options: { latex: string }) => ReturnType;

      /**
       * Remove LaTeX and convert back to plain text
       */
      unsetLatex: () => ReturnType;
    };
  }
}

/**
 * Mathematics extension for TipTap v3
 *
 * Adds support for LaTeX mathematical expressions using KaTeX
 *
 * @example
 * ```tsx
 * import { Mathematics } from '@repo/editing/extensions/mathematics';
 * import 'katex/dist/katex.min.css'; // Don't forget KaTeX styles!
 *
 * const extensions = [
 *   Mathematics.configure({
 *     katexOptions: {
 *       throwOnError: false,
 *       displayMode: false,
 *     }
 *   })
 * ];
 * ```
 *
 * @see https://katex.org/
 */
export const Mathematics = Node.create<MathematicsOptions>({
  name: 'mathematics',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  marks: '',

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => ({
          'data-latex': attributes.latex,
        }),
      },
    };
  },

  addOptions() {
    return {
      shouldRender: (state, pos) => {
        const $pos = state.doc.resolve(pos);

        if (!$pos.parent.isTextblock) {
          return false;
        }

        // Don't render in code blocks
        return $pos.parent.type.name !== 'codeBlock';
      },
      katexOptions: {
        throwOnError: false,
        displayMode: false,
        output: 'html' as const,
      },
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      setLatex:
        ({ latex }) =>
        ({ chain, state }) => {
          if (!latex) {
            return false;
          }

          const { from, to, $anchor } = state.selection;

          if (!this.options.shouldRender(state, $anchor.pos)) {
            return false;
          }

          return chain()
            .insertContentAt(
              { from, to },
              {
                type: this.name,
                attrs: {
                  latex,
                },
              },
            )
            .setTextSelection({ from, to: from + 1 })
            .run();
        },

      unsetLatex:
        () =>
        ({ editor, state, chain }) => {
          const latex = editor.getAttributes(this.name).latex;
          if (typeof latex !== 'string') {
            return false;
          }

          const { from, to } = state.selection;

          return chain()
            .command(({ tr }) => {
              tr.insertText(latex, from, to);
              return true;
            })
            .setTextSelection({
              from,
              to: from + latex.length,
            })
            .run();
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
      {
        tag: 'span[data-latex]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = node.attrs.latex ?? '';
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
        'data-latex': latex,
      }),
      latex,
    ];
  },

  renderText({ node }) {
    return node.attrs.latex ?? '';
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('span');
      const latex: string = node.attrs.latex ?? '';

      // Apply options HTML attributes
      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        dom.setAttribute(key, String(value));
      });

      // Apply node HTML attributes
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        dom.setAttribute(key, String(value));
      });

      // Make selectable on click
      dom.addEventListener('click', () => {
        if (editor.isEditable && typeof getPos === 'function') {
          const pos = getPos();
          if (pos !== undefined) {
            const nodeSize = node.nodeSize;
            editor.commands.setTextSelection({ from: pos, to: pos + nodeSize });
          }
        }
      });

      dom.contentEditable = 'false';
      dom.classList.add('math-inline');

      // Render KaTeX (lazy load to avoid SSR issues)
      try {
        // Dynamic import for KaTeX to support SSR
        if (typeof window !== 'undefined') {
          const loadKatex = async () => {
            try {
              const katex = await import('katex');
              dom.innerHTML = katex.default.renderToString(latex, this.options.katexOptions);
            } catch {
              // Silently fail if KaTeX cannot be loaded
            }
          };
          void loadKatex();
        } else {
          dom.textContent = latex;
        }
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        dom.textContent = latex;
      }

      return {
        dom,
      };
    };
  },
});

/**
 * Helper to validate LaTeX syntax
 */
export function validateLatex(latex: string): boolean {
  if (!latex || latex.trim().length === 0) {
    return false;
  }

  // Basic validation - check for balanced braces
  let braceCount = 0;
  for (const char of latex) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) return false;
  }

  return braceCount === 0;
}
