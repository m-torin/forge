import { AIHighlight } from '@/extensions/ai-highlight';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';

describe('AIHighlight Extension', () => {
  it('should be defined', () => {
    expect(AIHighlight).toBeDefined();
  });

  it('should register the extension', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, AIHighlight],
    });

    expect(editor.extensionManager.extensions).toContainEqual(
      expect.objectContaining({ name: 'aiHighlight' }),
    );

    editor.destroy();
  });

  it('should apply highlight with color', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, AIHighlight],
      content: '<p>Test content</p>',
    });

    editor.chain().selectAll().setAIHighlight({ color: '#ff0000' }).run();

    const html = editor.getHTML();
    expect(html).toContain('data-color="#ff0000"');

    editor.destroy();
  });

  it('should toggle highlight off', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, AIHighlight],
      content: '<p>Test content</p>',
    });

    editor.chain().selectAll().setAIHighlight({ color: '#ff0000' }).run();
    expect(editor.isActive('aiHighlight')).toBe(true);

    editor.chain().selectAll().unsetAIHighlight().run();
    expect(editor.isActive('aiHighlight')).toBe(false);

    editor.destroy();
  });

  it('should use default color when not specified', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, AIHighlight.configure({ defaultColor: '#00ff00' })],
      content: '<p>Test content</p>',
    });

    editor.chain().selectAll().setAIHighlight().run();

    const html = editor.getHTML();
    expect(html).toContain('data-color="#00ff00"');

    editor.destroy();
  });
});
