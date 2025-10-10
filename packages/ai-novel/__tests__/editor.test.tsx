import { render, screen } from '@testing-library/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { describe, expect, test } from 'vitest';
import { EditorContent, EditorRoot } from '../src/components/editor';

describe('editorRoot', () => {
  test('renders without crashing', () => {
    render(
      <EditorRoot>
        <div>Test content</div>
      </EditorRoot>,
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});

describe('editorContent', () => {
  test('renders without crashing', () => {
    // TipTap requires at least Document, Paragraph, and Text extensions
    const minimalExtensions = [Document, Paragraph, Text];

    render(
      <EditorRoot>
        <EditorContent extensions={minimalExtensions}>
          <div>Editor content</div>
        </EditorContent>
      </EditorRoot>,
    );
    expect(screen.getByText('Editor content')).toBeInTheDocument();
  });
});
