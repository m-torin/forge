import type { Editor } from '@tiptap/core';
import type { ExportOptions } from '../types';

/**
 * Export editor content to HTML
 *
 * @param editor - TipTap editor instance
 * @param options - Export options
 * @returns HTML string
 *
 * @example
 * ```ts
 * const html = exportToHTML(editor, { includeStyles: true });
 * ```
 */
export function exportToHTML(editor: Editor, options: Partial<ExportOptions> = {}): string {
  const includeStyles = options.includeStyles ?? false;

  let html = editor.getHTML();

  if (includeStyles) {
    // Add basic editor styles
    const styles = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        p { margin: 0.5em 0; }
        h1 { font-size: 2em; font-weight: bold; }
        h2 { font-size: 1.5em; font-weight: bold; }
        h3 { font-size: 1.25em; font-weight: 600; }
        ul, ol { padding-left: 1.5em; }
        code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
        pre { background: #1e1e1e; color: #d4d4d4; padding: 1em; border-radius: 5px; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1em; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    `;
    html = styles + html;
  }

  // Metadata support removed - not part of ExportOptions interface

  return html;
}

/**
 * Export editor content to JSON
 *
 * @param editor - TipTap editor instance
 * @param options - Export options
 * @returns JSON object
 *
 * @example
 * ```ts
 * const json = exportToJSON(editor);
 * ```
 */
export function exportToJSON(editor: Editor, _options: Partial<ExportOptions> = {}): any {
  const json = editor.getJSON();

  // Metadata support removed - not part of ExportOptions interface

  return json;
}

/**
 * Export editor content to Markdown
 *
 * @param editor - TipTap editor instance
 * @param options - Export options
 * @returns Markdown string
 *
 * @example
 * ```ts
 * const markdown = exportToMarkdown(editor);
 * ```
 */
export function exportToMarkdown(editor: Editor, _options: Partial<ExportOptions> = {}): string {
  // Basic markdown conversion - this is a simplified implementation
  // In a real implementation, you'd use a proper HTML to Markdown converter
  let markdown = editor.getText();

  // Simple conversions
  markdown = markdown
    .replace(/^# (.+)$/gm, '# $1')
    .replace(/^## (.+)$/gm, '## $1')
    .replace(/^### (.+)$/gm, '### $1')
    .replace(/\*\*(.+?)\*\*/g, '**$1**')
    .replace(/\*(.+?)\*/g, '*$1*')
    .replace(/`(.+?)`/g, '`$1`');

  return markdown;
}

/**
 * Export editor content to plain text
 *
 * @param editor - TipTap editor instance
 * @param options - Export options
 * @returns Plain text string
 *
 * @example
 * ```ts
 * const text = exportToText(editor);
 * ```
 */
export function exportToText(editor: Editor, _options: Partial<ExportOptions> = {}): string {
  return editor.getText();
}

/**
 * Export editor content to PDF (placeholder)
 *
 * @param editor - TipTap editor instance
 * @param options - Export options
 * @returns Promise that resolves to PDF blob
 *
 * @example
 * ```ts
 * const pdf = await exportToPDF(editor, { filename: 'document.pdf' });
 * ```
 */
export async function exportToPDF(
  editor: Editor,
  _options: Partial<ExportOptions> = {},
): Promise<Blob> {
  // This is a placeholder implementation
  // In a real implementation, you'd use a library like Puppeteer or jsPDF
  const html = exportToHTML(editor, { includeStyles: true });
  const blob = new Blob([html], { type: 'text/html' });
  return blob;
}

/**
 * Export editor content to Word document (placeholder)
 *
 * @param editor - TipTap editor instance
 * @param options - Export options
 * @returns Promise that resolves to Word document blob
 *
 * @example
 * ```ts
 * const doc = await exportToWord(editor, { filename: 'document.docx' });
 * ```
 */
export async function exportToWord(
  editor: Editor,
  _options: Partial<ExportOptions> = {},
): Promise<Blob> {
  // This is a placeholder implementation
  // In a real implementation, you'd use a library like docx
  const html = exportToHTML(editor, { includeStyles: true });
  const blob = new Blob([html], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  return blob;
}

/**
 * Get all available export formats
 *
 * @returns Array of export format names
 */
export function getAvailableExportFormats(): string[] {
  return ['html', 'json', 'markdown', 'text', 'pdf', 'word'];
}

/**
 * Export editor content with the specified format
 *
 * @param editor - TipTap editor instance
 * @param format - Export format
 * @param options - Export options
 * @returns Exported content
 *
 * @example
 * ```ts
 * const content = await exportAs(editor, 'html', { includeStyles: true });
 * ```
 */
export async function exportAs(
  editor: Editor,
  format: string,
  options: Partial<ExportOptions> = {},
): Promise<any> {
  switch (format) {
    case 'html':
      return exportToHTML(editor, options);
    case 'json':
      return exportToJSON(editor, options);
    case 'markdown':
      return exportToMarkdown(editor, options);
    case 'text':
      return exportToText(editor, options);
    case 'pdf':
      return exportToPDF(editor, options);
    case 'word':
      return exportToWord(editor, options);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
