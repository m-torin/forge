/**
 * Document export utilities for various formats
 * Supports Markdown, HTML, JSON exports with metadata
 */

'use client';

import { logError } from '@repo/observability';
import { Editor } from '@tiptap/core';

export interface ExportOptions {
  title?: string;
  author?: string;
  timestamp?: Date;
  includeMetadata?: boolean;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * Export editor content to Markdown format
 * @param editor - TipTap editor instance
 * @param options - Export configuration options
 * @returns Export result with content, filename, and MIME type
 */
export function exportToMarkdown(editor: Editor, options: ExportOptions = {}): ExportResult {
  const {
    title = 'Untitled Document',
    author,
    timestamp = new Date(),
    includeMetadata = true,
  } = options;

  // Get the editor content as HTML first
  const html = editor.getHTML();

  // Convert HTML to Markdown (basic conversion)
  let markdown = htmlToMarkdown(html);

  // Add metadata header if requested
  if (includeMetadata) {
    const metadata = [
      '---',
      `title: "${title}"`,
      author && `author: "${author}"`,
      `created: ${timestamp.toISOString()}`,
      `exported: ${new Date().toISOString()}`,
      '---',
      '',
    ]
      .filter(Boolean)
      .join('\n');

    markdown = metadata + markdown;
  }

  return {
    content: markdown,
    filename: `${sanitizeFilename(title)}.md`,
    mimeType: 'text/markdown',
  };
}

/**
 * Export editor content to HTML format
 * @param editor - TipTap editor instance
 * @param options - Export configuration options
 * @returns Export result with styled HTML document
 */
export function exportToHTML(editor: Editor, options: ExportOptions = {}): ExportResult {
  const {
    title = 'Untitled Document',
    author,
    timestamp = new Date(),
    includeMetadata = true,
  } = options;

  const html = editor.getHTML();

  // Create a complete HTML document
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${author ? `<meta name="author" content="${escapeHtml(author)}">` : ''}
  ${includeMetadata ? `<meta name="created" content="${timestamp.toISOString()}">` : ''}
  ${includeMetadata ? `<meta name="exported" content="${new Date().toISOString()}">` : ''}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    h1 { font-size: 2.25rem; }
    h2 { font-size: 1.875rem; }
    h3 { font-size: 1.5rem; }
    blockquote {
      border-left: 4px solid #e5e5e5;
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      color: #666;
    }
    code {
      background: #f5f5f5;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-family: 'SF Mono', Consolas, monospace;
    }
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    .notion-mention {
      background-color: rgba(55, 126, 184, 0.1);
      color: #377eb8;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-weight: 500;
      text-decoration: none;
    }
    ul[data-type="taskList"] {
      list-style: none;
      padding: 0;
    }
    li[data-type="taskItem"] {
      display: flex;
      align-items: flex-start;
      margin: 0.25rem 0;
    }
    li[data-type="taskItem"] input[type="checkbox"] {
      margin-right: 0.5rem;
      margin-top: 0.125rem;
    }
  </style>
</head>
<body>
  ${
    includeMetadata
      ? `
  <header style="border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem;">
    <h1 style="margin: 0;">${escapeHtml(title)}</h1>
    ${author ? `<p style="margin: 0.5rem 0 0 0; color: #666;">by ${escapeHtml(author)}</p>` : ''}
    <p style="margin: 0.5rem 0 0 0; color: #999; font-size: 0.875rem;">
      Created: ${timestamp.toLocaleDateString()} |
      Exported: ${new Date().toLocaleDateString()}
    </p>
  </header>
  `
      : ''
  }

  <main>
    ${html}
  </main>
</body>
</html>`;

  return {
    content: fullHtml,
    filename: `${sanitizeFilename(title)}.html`,
    mimeType: 'text/html',
  };
}

/**
 * Export editor content to JSON format
 * @param editor - TipTap editor instance
 * @param options - Export configuration options
 * @returns Export result with structured JSON content
 */
export function exportToJSON(editor: Editor, options: ExportOptions = {}): ExportResult {
  const {
    title = 'Untitled Document',
    author,
    timestamp = new Date(),
    includeMetadata = true,
  } = options;

  const json = editor.getJSON();

  const exportData = {
    ...(includeMetadata && {
      metadata: {
        title,
        author,
        created: timestamp.toISOString(),
        exported: new Date().toISOString(),
        version: '1.0',
        editor: 'NotionEditor',
      },
    }),
    content: json,
  };

  return {
    content: JSON.stringify(exportData, null, 2),
    filename: `${sanitizeFilename(title)}.json`,
    mimeType: 'application/json',
  };
}

/**
 * Create a backup of the editor content with full metadata
 * @param editor - TipTap editor instance
 * @param options - Export configuration options
 * @returns Complete backup with HTML, JSON, and text content
 */
export function createBackup(editor: Editor, options: ExportOptions = {}): ExportResult {
  const { title = 'Document Backup', author, timestamp = new Date() } = options;

  const backup = {
    metadata: {
      title,
      author,
      created: timestamp.toISOString(),
      exported: new Date().toISOString(),
      version: '1.0',
      editor: 'NotionEditor',
      type: 'backup',
    },
    content: {
      html: editor.getHTML(),
      json: editor.getJSON(),
      text: editor.getText(),
    },
    settings: {
      // Could include editor settings, extensions enabled, etc.
      extensions: ['emoji', 'mentions', 'tables', 'tasks', 'collaboration'],
    },
  };

  return {
    content: JSON.stringify(backup, null, 2),
    filename: `backup_${sanitizeFilename(title)}_${new Date().toISOString().split('T')[0]}.json`,
    mimeType: 'application/json',
  };
}

/**
 * Download content as a file
 * @param exportResult - Export result to download
 */
export function downloadFile(exportResult: ExportResult): void {
  const blob = new Blob([exportResult.content], { type: exportResult.mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = exportResult.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Restore editor content from backup
 * @param editor - TipTap editor instance
 * @param backupContent - JSON backup content
 * @returns True if restore was successful
 */
export function restoreFromBackup(editor: Editor, backupContent: string): boolean {
  try {
    const backup = JSON.parse(backupContent);

    // Validate backup structure
    if (!backup.content || (!backup.content.json && !backup.content.html)) {
      throw new Error('Invalid backup format');
    }

    // Prefer JSON content for full fidelity, fall back to HTML
    if (backup.content.json) {
      editor.commands.setContent(backup.content.json);
    } else if (backup.content.html) {
      editor.commands.setContent(backup.content.html);
    }

    return true;
  } catch (error) {
    logError('Failed to restore from backup:', error);
    return false;
  }
}

// Helper functions

function htmlToMarkdown(html: string): string {
  // Basic HTML to Markdown conversion
  let markdown = html
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')

    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')

    // Code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "'$1'")
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, "'''\n$1\n'''\n")

    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

    // Blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (match, content) => {
      return (
        content
          .split('\n')
          .map((line: string) => `> ${line}`)
          .join('\n') + '\n\n'
      );
    })

    // Lists
    .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
      let counter = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
    })

    // Task lists
    .replace(
      /<li[^>]*data-type="taskItem"[^>]*data-checked="true"[^>]*>(.*?)<\/li>/gi,
      '- [x] $1\n',
    )
    .replace(
      /<li[^>]*data-type="taskItem"[^>]*data-checked="false"[^>]*>(.*?)<\/li>/gi,
      '- [ ] $1\n',
    )

    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')

    // Horizontal rules
    .replace(/<hr[^>]*>/gi, '---\n\n')

    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, '')

    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  return markdown;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}
