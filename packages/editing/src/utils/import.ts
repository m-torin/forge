import type { Editor, JSONContent } from '@tiptap/core';

/**
 * Import HTML content into editor
 *
 * @param editor - TipTap editor instance
 * @param html - HTML string to import
 * @param clearExisting - Whether to clear existing content
 *
 * @example
 * ```ts
 * importFromHTML(editor, '<p>Hello world</p>', true);
 * ```
 */
export function importFromHTML(editor: Editor, html: string, clearExisting: boolean = true): void {
  if (clearExisting) {
    editor.commands.setContent(html);
  } else {
    editor.commands.insertContent(html);
  }
}

/**
 * Import JSON content into editor
 *
 * @param editor - TipTap editor instance
 * @param json - JSON content object
 * @param clearExisting - Whether to clear existing content
 *
 * @example
 * ```ts
 * const json = { type: 'doc', content: [...] };
 * importFromJSON(editor, json, true);
 * ```
 */
export function importFromJSON(
  editor: Editor,
  json: JSONContent,
  clearExisting: boolean = true,
): void {
  if (clearExisting) {
    editor.commands.setContent(json);
  } else {
    editor.commands.insertContent(json);
  }
}

/**
 * Import Markdown content into editor
 *
 * @param editor - TipTap editor instance
 * @param markdown - Markdown string to import
 * @param clearExisting - Whether to clear existing content
 *
 * @example
 * ```ts
 * importFromMarkdown(editor, '# Hello\n\nWorld', true);
 * ```
 */
export function importFromMarkdown(
  editor: Editor,
  markdown: string,
  clearExisting: boolean = true,
): void {
  // Check if markdown extension is available
  const setMarkdown = (editor as any).commands?.setMarkdown;

  if (!setMarkdown) {
    console.warn('Markdown extension not found, importing as HTML');
    // Fallback: treat as plain text wrapped in paragraphs
    const html = markdown
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
    importFromHTML(editor, html, clearExisting);
    return;
  }

  if (clearExisting) {
    setMarkdown(markdown);
  } else {
    // Insert markdown at current cursor position
    editor.commands.insertContent(markdown);
  }
}

/**
 * Import plain text into editor
 *
 * @param editor - TipTap editor instance
 * @param text - Plain text to import
 * @param clearExisting - Whether to clear existing content
 *
 * @example
 * ```ts
 * importFromText(editor, 'Hello\nWorld', true);
 * ```
 */
export function importFromText(editor: Editor, text: string, clearExisting: boolean = true): void {
  // Convert plain text to paragraphs
  const html = text
    .split('\n\n')
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  importFromHTML(editor, html, clearExisting);
}

/**
 * Import content from a file
 *
 * @param editor - TipTap editor instance
 * @param file - File object
 * @param clearExisting - Whether to clear existing content
 * @returns Promise that resolves when import is complete
 *
 * @example
 * ```ts
 * const file = event.target.files[0];
 * await importFromFile(editor, file);
 * ```
 */
export async function importFromFile(
  editor: Editor,
  file: File,
  clearExisting: boolean = true,
): Promise<void> {
  const text = await file.text();
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'html':
    case 'htm':
      importFromHTML(editor, text, clearExisting);
      break;

    case 'json':
      try {
        const json = JSON.parse(text);
        importFromJSON(editor, json, clearExisting);
      } catch (_error) {
        throw new Error('Invalid JSON file');
      }
      break;

    case 'md':
    case 'markdown':
      importFromMarkdown(editor, text, clearExisting);
      break;

    case 'txt':
      importFromText(editor, text, clearExisting);
      break;

    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Create a file input handler for importing documents
 *
 * @param editor - TipTap editor instance
 * @param clearExisting - Whether to clear existing content
 * @param onError - Error callback
 * @returns File input change handler
 *
 * @example
 * ```tsx
 * const handleFileImport = createFileImportHandler(editor, true, (error) => {
 *   console.error('Import failed:', error);
 * });
 *
 * <input type="file" accept=".html,.json,.md,.txt" onChange={handleFileImport} />
 * ```
 */
export function createFileImportHandler(
  editor: Editor,
  clearExisting: boolean = true,
  onError?: (error: Error) => void,
) {
  return async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importFromFile(editor, file, clearExisting);
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      } else {
        console.error('Failed to import file:', error);
      }
    }

    // Reset input
    event.target.value = '';
  };
}

/**
 * Parse markdown frontmatter
 *
 * @param markdown - Markdown string with optional frontmatter
 * @returns Object containing metadata and content
 *
 * @example
 * ```ts
 * const { metadata, content } = parseMarkdownFrontmatter(markdown);
 * console.log(metadata.title, metadata.author);
 * ```
 */
export function parseMarkdownFrontmatter(markdown: string): {
  metadata: Record<string, string>;
  content: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content: markdown };
  }

  const [, frontmatter, content] = match;
  const metadata: Record<string, string> = {};

  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  });

  return { metadata, content };
}
