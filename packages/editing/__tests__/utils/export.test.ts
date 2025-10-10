import { exportToHTML, exportToJSON } from '@/utils/export';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';

describe('Export utilities', () => {
  const createTestEditor = (content: string) => {
    return new Editor({
      extensions: [Document, Paragraph, Text],
      content,
    });
  };

  describe('exportToHTML', () => {
    it('should export basic HTML', () => {
      const editor = createTestEditor('<p>Hello world</p>');
      const html = exportToHTML(editor);

      expect(html).toContain('Hello world');
      editor.destroy();
    });

    it('should include styles when requested', () => {
      const editor = createTestEditor('<p>Hello world</p>');
      const html = exportToHTML(editor, { includeStyles: true });

      expect(html).toContain('<style>');
      expect(html).toContain('font-family');
      editor.destroy();
    });

    it('should include metadata when requested', () => {
      const editor = createTestEditor('<p>Hello world</p>');
      const html = exportToHTML(editor, {
        includeStyles: true,
      });

      expect(html).toContain('<p>Hello world</p>');
      expect(html).toContain('font-family');
      editor.destroy();
    });
  });

  describe('exportToJSON', () => {
    it('should export JSON', () => {
      const editor = createTestEditor('<p>Hello world</p>');
      const json = exportToJSON(editor);

      expect(json).toHaveProperty('type', 'doc');
      expect(json).toHaveProperty('content');
      editor.destroy();
    });

    it('should include metadata when requested', () => {
      const editor = createTestEditor('<p>Hello world</p>');
      const json = exportToJSON(editor, {});

      expect(json).toHaveProperty('type');
      expect(json).toHaveProperty('content');
      editor.destroy();
    });
  });
});
