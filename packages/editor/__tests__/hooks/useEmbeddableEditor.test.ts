import { useEmbeddableEditor } from '#/components/EmbeddableNotionEditor/EmbeddableNotionEditor';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useEmbeddableEditor Hook', () => {
  let mockEditor: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a comprehensive mock editor that mimics TipTap's Editor
    mockEditor = {
      getHTML: vi.fn(() => '<p>Mock HTML content</p>'),
      getJSON: vi.fn(() => ({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mock HTML content' }] }],
      })),
      getText: vi.fn(() => 'Mock HTML content'),
      isEmpty: false,
      commands: {
        setContent: vi.fn(),
        clearContent: vi.fn(),
        focus: vi.fn(),
      },
    };
  });

  describe('Hook Return Value', () => {
    it('returns all expected methods', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      expect(result.current).toEqual({
        getHTML: expect.any(Function),
        getJSON: expect.any(Function),
        setContent: expect.any(Function),
        clearContent: expect.any(Function),
        focus: expect.any(Function),
        isEmpty: expect.any(Function),
        getWordCount: expect.any(Function),
        getCharacterCount: expect.any(Function),
      });
    });

    it('returns consistent function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useEmbeddableEditor());

      const firstRender = result.current;
      rerender();
      const secondRender = result.current;

      // All methods should be the same reference
      expect(firstRender.getHTML).toBe(secondRender.getHTML);
      expect(firstRender.getJSON).toBe(secondRender.getJSON);
      expect(firstRender.setContent).toBe(secondRender.setContent);
      expect(firstRender.clearContent).toBe(secondRender.clearContent);
      expect(firstRender.focus).toBe(secondRender.focus);
      expect(firstRender.isEmpty).toBe(secondRender.isEmpty);
      expect(firstRender.getWordCount).toBe(secondRender.getWordCount);
      expect(firstRender.getCharacterCount).toBe(secondRender.getCharacterCount);
    });
  });

  describe('getHTML Method', () => {
    it('calls editor.getHTML() and returns the result', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const html = result.current.getHTML(mockEditor);

      expect(mockEditor.getHTML).toHaveBeenCalledTimes(1);
      expect(html).toBe('<p>Mock HTML content</p>');
    });

    it('handles different HTML content correctly', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const customHTML =
        '<h1>Custom Title</h1><p>Custom paragraph with <strong>bold</strong> text</p>';
      mockEditor.getHTML.mockReturnValue(customHTML);

      const html = result.current.getHTML(mockEditor);

      expect(html).toBe(customHTML);
    });

    it('handles empty HTML content', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getHTML.mockReturnValue('');

      const html = result.current.getHTML(mockEditor);

      expect(html).toBe('');
    });
  });

  describe('getJSON Method', () => {
    it('calls editor.getJSON() and returns the result', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const json = result.current.getJSON(mockEditor);

      expect(mockEditor.getJSON).toHaveBeenCalledTimes(1);
      expect(json).toEqual({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mock HTML content' }] }],
      });
    });

    it('handles complex JSON structures', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const complexJSON = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Heading' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Text with ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
              { type: 'text', text: ' formatting' },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }],
              },
            ],
          },
        ],
      };

      mockEditor.getJSON.mockReturnValue(complexJSON);

      const json = result.current.getJSON(mockEditor);

      expect(json).toEqual(complexJSON);
    });

    it('handles empty JSON content', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const emptyJSON = { type: 'doc', content: [] };
      mockEditor.getJSON.mockReturnValue(emptyJSON);

      const json = result.current.getJSON(mockEditor);

      expect(json).toEqual(emptyJSON);
    });
  });

  describe('setContent Method', () => {
    it('calls editor.commands.setContent() with provided content', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const content = '<h1>New Content</h1><p>Updated paragraph</p>';
      result.current.setContent(mockEditor, content);

      expect(mockEditor.commands.setContent).toHaveBeenCalledTimes(1);
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(content);
    });

    it('handles empty content', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      result.current.setContent(mockEditor, '');

      expect(mockEditor.commands.setContent).toHaveBeenCalledWith('');
    });

    it('handles JSON content objects', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const htmlContent = '<p>JSON content</p>';

      result.current.setContent(mockEditor, htmlContent);

      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(htmlContent);
    });
  });

  describe('clearContent Method', () => {
    it('calls editor.commands.clearContent()', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      result.current.clearContent(mockEditor);

      expect(mockEditor.commands.clearContent).toHaveBeenCalledTimes(1);
    });

    it('can be called multiple times safely', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      result.current.clearContent(mockEditor);
      result.current.clearContent(mockEditor);
      result.current.clearContent(mockEditor);

      expect(mockEditor.commands.clearContent).toHaveBeenCalledTimes(3);
    });
  });

  describe('focus Method', () => {
    it('calls editor.commands.focus()', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      result.current.focus(mockEditor);

      expect(mockEditor.commands.focus).toHaveBeenCalledTimes(1);
    });

    it('can be called multiple times', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      result.current.focus(mockEditor);
      result.current.focus(mockEditor);

      expect(mockEditor.commands.focus).toHaveBeenCalledTimes(2);
    });
  });

  describe('isEmpty Method', () => {
    it('returns editor.isEmpty value when editor is empty', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.isEmpty = true;

      const isEmpty = result.current.isEmpty(mockEditor);

      expect(isEmpty).toBe(true);
    });

    it('returns editor.isEmpty value when editor has content', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.isEmpty = false;

      const isEmpty = result.current.isEmpty(mockEditor);

      expect(isEmpty).toBe(false);
    });

    it('handles undefined isEmpty property', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      delete mockEditor.isEmpty;

      const isEmpty = result.current.isEmpty(mockEditor);

      expect(isEmpty).toBeUndefined();
    });
  });

  describe('getWordCount Method', () => {
    it('counts words correctly from getText()', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getText.mockReturnValue('Hello world this is a test');

      const wordCount = result.current.getWordCount(mockEditor);

      expect(mockEditor.getText).toHaveBeenCalledTimes(1);
      expect(wordCount).toBe(6);
    });

    it('handles empty text', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getText.mockReturnValue('');

      const wordCount = result.current.getWordCount(mockEditor);

      expect(wordCount).toBe(0);
    });

    it('handles whitespace-only text', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getText.mockReturnValue(
        '   \
\\t   ',
      );

      const wordCount = result.current.getWordCount(mockEditor);

      expect(wordCount).toBe(0);
    });

    it('handles text with multiple spaces', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getText.mockReturnValue('Hello    world   with   multiple     spaces');

      const wordCount = result.current.getWordCount(mockEditor);

      expect(wordCount).toBe(5);
    });

    it('handles text with newlines and tabs', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getText.mockReturnValue(
        'Line one\
Line two\\tWith tab',
      );

      const wordCount = result.current.getWordCount(mockEditor);

      expect(wordCount).toBe(5);
    });

    it('handles single word', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getText.mockReturnValue('SingleWord');

      const wordCount = result.current.getWordCount(mockEditor);

      expect(wordCount).toBe(1);
    });

    it('handles punctuation correctly', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getText.mockReturnValue('Hello, world! How are you?');

      const wordCount = result.current.getWordCount(mockEditor);

      expect(wordCount).toBe(5);
    });
  });

  describe('getCharacterCount Method', () => {
    it('counts characters correctly from getText()', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const testText = 'Hello world';
      mockEditor.getText.mockReturnValue(testText);

      const charCount = result.current.getCharacterCount(mockEditor);

      expect(mockEditor.getText).toHaveBeenCalledTimes(1);
      expect(charCount).toBe(testText.length);
    });

    it('handles empty text', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getText.mockReturnValue('');

      const charCount = result.current.getCharacterCount(mockEditor);

      expect(charCount).toBe(0);
    });

    it('counts spaces and special characters', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const textWithSpecialChars = 'Hello, world! @#$%^&*()';
      mockEditor.getText.mockReturnValue(textWithSpecialChars);

      const charCount = result.current.getCharacterCount(mockEditor);

      expect(charCount).toBe(textWithSpecialChars.length);
    });

    it('counts unicode characters correctly', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const unicodeText = 'Hello 🌍 世界 emoji';
      mockEditor.getText.mockReturnValue(unicodeText);

      const charCount = result.current.getCharacterCount(mockEditor);

      expect(charCount).toBe(unicodeText.length);
    });

    it('counts newlines and tabs', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const textWithWhitespace =
        'Line 1\
Line 2\\tTabbed';
      mockEditor.getText.mockReturnValue(textWithWhitespace);

      const charCount = result.current.getCharacterCount(mockEditor);

      expect(charCount).toBe(textWithWhitespace.length);
    });
  });

  describe('Error Handling', () => {
    it('handles null editor gracefully', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      expect(() => {
        result.current.getHTML(null as any);
      }).toThrow();
    });

    it('handles undefined editor gracefully', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      expect(() => {
        result.current.getJSON(undefined as any);
      }).toThrow();
    });

    it('handles editor method errors', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      mockEditor.getHTML.mockImplementation(() => {
        throw new Error('Editor method failed');
      });

      expect(() => {
        result.current.getHTML(mockEditor);
      }).toThrow('Editor method failed');
    });

    it('handles missing editor methods', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const incompleteEditor = {};

      expect(() => {
        result.current.getHTML(incompleteEditor as any);
      }).toThrow();
    });
  });

  describe('Method Chaining and Combined Usage', () => {
    it('supports method chaining pattern', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      const methods = result.current;

      // Simulate a common usage pattern
      methods.setContent(mockEditor, '<p>New content</p>');
      methods.focus(mockEditor);
      const html = methods.getHTML(mockEditor);
      const wordCount = methods.getWordCount(mockEditor);

      expect(mockEditor.commands.setContent).toHaveBeenCalledWith('<p>New content</p>');
      expect(mockEditor.commands.focus).toHaveBeenCalled();
      expect(mockEditor.getHTML).toHaveBeenCalled();
      expect(mockEditor.getText).toHaveBeenCalled();
    });

    it('maintains state consistency across multiple calls', () => {
      const { result } = renderHook(() => useEmbeddableEditor());

      // Set content and verify it's reflected in subsequent calls
      result.current.setContent(mockEditor, '<p>Updated content</p>');
      mockEditor.getHTML.mockReturnValue('<p>Updated content</p>');
      mockEditor.getText.mockReturnValue('Updated content');

      const html = result.current.getHTML(mockEditor);
      const wordCount = result.current.getWordCount(mockEditor);
      const charCount = result.current.getCharacterCount(mockEditor);

      expect(html).toBe('<p>Updated content</p>');
      expect(wordCount).toBe(2);
      expect(charCount).toBe('Updated content'.length);
    });
  });
});
