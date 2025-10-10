import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { MarkdownSerializerState } from 'prosemirror-markdown';
import { MarkdownSerializer, defaultMarkdownSerializer } from 'prosemirror-markdown';

export interface MarkdownOptions {
  /** Transform pasted text to markdown */
  transformPastedText?: boolean;
  /** Transform copied text to markdown */
  transformCopiedText?: boolean;
  /** Custom markdown serializer */
  serializer?: MarkdownSerializer;
  /** Allow raw HTML passthrough */
  html?: boolean;
  /** Render tight lists */
  tightLists?: boolean;
  /** CSS class applied to tight lists */
  tightListClass?: string;
  /** Bullet list marker character */
  bulletListMarker?: string;
  /** Automatically convert URLs to links */
  linkify?: boolean;
  /** Treat newlines as hard breaks */
  breaks?: boolean;
}

/**
 * Markdown extension for TipTap v3
 *
 * Provides markdown input/output support using prosemirror-markdown
 */
export const Markdown = Extension.create<MarkdownOptions>({
  name: 'markdown',

  addOptions() {
    return {
      transformPastedText: true,
      transformCopiedText: true,
      serializer: defaultMarkdownSerializer,
      html: false,
      tightLists: false,
      tightListClass: undefined,
      bulletListMarker: '-',
      linkify: false,
      breaks: false,
    };
  },

  addStorage() {
    return {
      serializer: this.options.serializer || defaultMarkdownSerializer,
    };
  },

  addCommands() {
    return {
      /**
       * Get editor content as markdown
       */
      getMarkdown: () => () => {
        const serializer = this.storage.serializer as MarkdownSerializer;
        return serializer.serialize(this.editor.state.doc);
      },

      /**
       * Set editor content from markdown
       * Note: This requires a markdown parser which needs to be configured separately
       */
      setMarkdown:
        (markdown: string) =>
        ({ commands }: { commands: any }) => {
          // For now, just set as HTML
          // A proper implementation would use a markdown parser
          return commands.setContent(`<p>${markdown}</p>`);
        },
    } as any;
  },

  onTransaction({ transaction }) {
    // Update markdown representation in storage on every transaction
    if (transaction.docChanged) {
      const serializer = this.storage.serializer as MarkdownSerializer;
      const markdown = serializer.serialize(this.editor.state.doc);
      this.storage.markdown = markdown;
    }
  },
});

/**
 * Helper function to convert editor content to markdown
 */
export function editorToMarkdown(doc: ProseMirrorNode, serializer?: MarkdownSerializer): string {
  const ser = serializer || defaultMarkdownSerializer;
  return ser.serialize(doc);
}

/**
 * Custom markdown serializer with additional node types
 */
export function createCustomMarkdownSerializer(): MarkdownSerializer {
  const nodes: Record<string, any> = {
    ...defaultMarkdownSerializer.nodes,

    // Custom heading serializer
    heading(state: MarkdownSerializerState, node: ProseMirrorNode) {
      state.write(`${'#'.repeat(node.attrs.level)} `);
      state.renderInline(node);
      state.closeBlock(node);
    },

    // Code block serializer
    code_block(state: MarkdownSerializerState, node: ProseMirrorNode) {
      const language = node.attrs.language || '';
      state.write(`\`\`\`${language}\n`);
      state.text(node.textContent, false);
      state.ensureNewLine();
      state.write('```');
      state.closeBlock(node);
    },

    // Task list item serializer
    taskItem(state: MarkdownSerializerState, node: ProseMirrorNode) {
      const checked = node.attrs.checked ? 'x' : ' ';
      state.write(`- [${checked}] `);
      state.renderInline(node);
    },

    // Image serializer
    image(state: MarkdownSerializerState, node: ProseMirrorNode) {
      const alt = state.esc(node.attrs.alt || '');
      const src = state.esc(node.attrs.src);
      const title = node.attrs.title ? ` "${state.esc(node.attrs.title)}"` : '';
      state.write(`![${alt}](${src}${title})`);
    },

    // Horizontal rule serializer
    horizontal_rule(state: MarkdownSerializerState, node: ProseMirrorNode) {
      state.write(node.attrs.markup || '---');
      state.closeBlock(node);
    },
  };

  const marks: Record<string, any> = {
    ...defaultMarkdownSerializer.marks,

    // Custom highlight serializer (using ==text==)
    highlight: {
      open: '==',
      close: '==',
      mixable: true,
      expelEnclosingWhitespace: true,
    },

    // AI highlight serializer (same as highlight)
    aiHighlight: {
      open: '==',
      close: '==',
      mixable: true,
      expelEnclosingWhitespace: true,
    },

    // Underline serializer
    underline: {
      open: '__',
      close: '__',
      mixable: true,
      expelEnclosingWhitespace: true,
    },

    // Strikethrough serializer
    strike: {
      open: '~~',
      close: '~~',
      mixable: true,
      expelEnclosingWhitespace: true,
    },
  };

  return new MarkdownSerializer(nodes, marks);
}

/**
 * Export ProseMirror document as markdown
 *
 * @deprecated Use exportAsMarkdown from utils/export instead
 */
export function documentToMarkdown(doc: ProseMirrorNode): string {
  const serializer = createCustomMarkdownSerializer();
  return serializer.serialize(doc);
}
