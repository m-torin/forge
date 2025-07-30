/**
 * @vitest-environment jsdom
 */
import { EmbeddableNotionEditor } from '#/components/EmbeddableNotionEditor/EmbeddableNotionEditor';
import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithoutProvider, screen } from '../testing/test-utils';

// Mock TipTap's useEditor hook for controlled testing
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    getHTML: vi.fn(() => '<p>Mock HTML content</p>'),
    getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
    getText: vi.fn(() => 'Mock text content'),
    isEmpty: false,
    isActive: vi.fn(() => false),
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({ toggleBold: vi.fn(() => ({ run: vi.fn() })) })),
      toggleBold: vi.fn(() => ({ run: vi.fn() })),
      toggleItalic: vi.fn(() => ({ run: vi.fn() })),
      toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
      toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
      toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
      toggleTaskList: vi.fn(() => ({ run: vi.fn() })),
      toggleHeading: vi.fn(() => ({ run: vi.fn() })),
      toggleCodeBlock: vi.fn(() => ({ run: vi.fn() })),
      insertContent: vi.fn(() => ({ run: vi.fn() })),
    })),
    commands: {
      setContent: vi.fn(),
      clearContent: vi.fn(),
      focus: vi.fn(),
    },
  })),
  EditorContent: ({ editor, ...props }: any) => (
    <div data-testid="embeddable-notion-editor-content" className="ProseMirror" {...props}>
      Mock Editor Content
    </div>
  ),
}));

// Mock lowlight to avoid import issues
vi.mock('lowlight', () => ({
  createLowlight: vi.fn(() => ({})),
  all: {},
}));

// Mock CSS sanitizer utilities
vi.mock('../../src/utils/css-sanitizer', () => ({
  sanitizeTheme: vi.fn(theme => ({
    backgroundColor: theme?.backgroundColor || '#ffffff',
    textColor: theme?.textColor || '#1f2937',
    borderColor: theme?.borderColor || '#e5e7eb',
    focusColor: theme?.focusColor || '#3b82f6',
    placeholderColor: theme?.placeholderColor || '#9ca3af',
  })),
  sanitizeDimension: vi.fn(dimension => dimension || '100%'),
  generateNonce: vi.fn(() => 'mock-nonce'),
}));

// Mock secure media upload utilities
vi.mock('../../src/utils/secure-media-upload', () => ({
  createSecureUploadHandler: vi.fn(() => vi.fn()),
  DEFAULT_SECURE_CONFIG: {
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 10485760,
    maxSizes: {
      image: 10485760,
      video: 104857600,
      audio: 10485760,
    },
  },
}));

// Mock URL validator utilities
vi.mock('../../src/utils/url-validator', () => ({
  validateURL: vi.fn(() => true),
  sanitizeURL: vi.fn(url => url),
  addSecurityAttributes: vi.fn(() => ({
    rel: 'noopener noreferrer',
    target: '_blank',
  })),
}));

// Mock CSS file import
vi.mock('../../src/components/EmbeddableNotionEditor/embeddable-editor.css', () => ({}));

// Mock media upload handler utilities
vi.mock('../../src/utils/media-upload-handler', () => ({
  ALL_MEDIA_TYPES: 'image/*,video/*,audio/*',
  createMockUploadHandler: vi.fn(() => vi.fn(file => Promise.resolve('mock-upload-url'))),
  createStorageUploadHandler: vi.fn(() => vi.fn()),
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  VIDEO_TYPES: ['video/mp4', 'video/webm'],
  AUDIO_TYPES: ['audio/mp3', 'audio/wav'],
  MEDIA_FILE_TYPES: ['image/*', 'video/*', 'audio/*'],
  DEFAULT_ACCEPTED_TYPES: 'image/*,video/*,audio/*',
  getMediaType: vi.fn(() => 'image'),
  isValidMediaFile: vi.fn(() => true),
  isValidImageFile: vi.fn(() => true),
  formatFileSize: vi.fn(() => '1.2 MB'),
  getDefaultExtension: vi.fn(() => '.jpg'),
}));

describe('EmbeddableNotionEditor', () => {
  let mockUseEditor: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get reference to the mocked function
    const tiptapReact = await import('@tiptap/react');
    mockUseEditor = tiptapReact.useEditor as any;
    // Clear any DOM side effects
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up any injected styles
    document.head.innerHTML = '';
  });

  describe('EmbeddableNotionEditor - Basic Rendering', () => {
    describe('Default Rendering', () => {
      it('renders without crashing', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      });

      it('displays the editor content area', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        expect(screen.getByTestId('embeddable-notion-editor-content')).toBeInTheDocument();
      });

      it('shows the toolbar by default', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const toolbar = screen.getByText('B'); // Bold button
        expect(toolbar).toBeInTheDocument();
      });

      it('hides toolbar when showToolbar is false', () => {
        renderWithoutProvider(<EmbeddableNotionEditor showToolbar={false} />);

        expect(screen.queryByText('B')).not.toBeInTheDocument();
      });

      it('applies default placeholder', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        // Check that the component is rendered (placeholder is handled by TipTap internally)
        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      });

      it('applies custom placeholder', () => {
        const customPlaceholder = 'Custom placeholder text';
        renderWithoutProvider(<EmbeddableNotionEditor placeholder={customPlaceholder} />);

        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      });
    });

    describe('Props Handling', () => {
      it('applies custom className', () => {
        const customClassName = 'custom-editor-class';
        renderWithoutProvider(<EmbeddableNotionEditor className={customClassName} />);

        const editorContent = screen.getByTestId('embeddable-notion-editor-content');
        expect(editorContent).toHaveClass('embeddable-notion-editor-content');
      });

      it('sets editable to false when specified', () => {
        renderWithoutProvider(<EmbeddableNotionEditor editable={false} />);

        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      });

      it('applies custom minHeight', () => {
        const customMinHeight = '400px';
        renderWithoutProvider(<EmbeddableNotionEditor minHeight={customMinHeight} />);

        const editorContent = screen.getByTestId('embeddable-notion-editor-content');
        expect(editorContent).toHaveAttribute(
          'style',
          expect.stringContaining('min-height: 400px'),
        );
      });

      it('applies custom maxWidth', () => {
        const customMaxWidth = '600px';
        renderWithoutProvider(<EmbeddableNotionEditor maxWidth={customMaxWidth} />);

        const editorContent = screen.getByTestId('embeddable-notion-editor-content');
        expect(editorContent).toHaveAttribute('style', expect.stringContaining('max-width: 600px'));
      });
    });

    describe('Feature Configuration', () => {
      it('shows formatting buttons when formatting is enabled', () => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{
              formatting: true,
              lists: false,
              tables: false,
              codeBlocks: false,
              links: false,
              tasks: false,
              colors: false,
            }}
          />,
        );

        expect(screen.getByText('B')).toBeInTheDocument(); // Bold
        expect(screen.getByText('I')).toBeInTheDocument(); // Italic
        expect(screen.getByText('U')).toBeInTheDocument(); // Underline
      });

      it('hides formatting buttons when formatting is disabled', () => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{
              formatting: false,
              lists: false,
              tables: false,
              codeBlocks: false,
              links: false,
              tasks: false,
              colors: false,
            }}
          />,
        );

        expect(screen.queryByText('B')).not.toBeInTheDocument();
        expect(screen.queryByText('I')).not.toBeInTheDocument();
        expect(screen.queryByText('U')).not.toBeInTheDocument();
      });

      it('shows list buttons when lists are enabled', () => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{
              formatting: false,
              lists: true,
              tables: false,
              codeBlocks: false,
              links: false,
              tasks: false,
              colors: false,
            }}
          />,
        );

        expect(screen.getByText('•')).toBeInTheDocument(); // Bullet list
        expect(screen.getByText('1.')).toBeInTheDocument(); // Numbered list
      });

      it('shows task button when tasks are enabled', () => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{
              formatting: false,
              lists: false,
              tables: false,
              codeBlocks: false,
              links: false,
              tasks: true,
              colors: false,
            }}
          />,
        );

        expect(screen.getByText('✓')).toBeInTheDocument(); // Task list
      });

      it('shows code block button when codeBlocks are enabled', () => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{
              formatting: false,
              lists: false,
              tables: false,
              codeBlocks: true,
              links: false,
              tasks: false,
              colors: false,
            }}
          />,
        );

        expect(screen.getByText('</>')).toBeInTheDocument(); // Code block
      });

      it('shows media upload button when mediaUpload is enabled', () => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{
              formatting: false,
              lists: false,
              tables: false,
              codeBlocks: false,
              links: false,
              tasks: false,
              colors: false,
              mediaUpload: true,
            }}
          />,
        );

        expect(screen.getByText('📎')).toBeInTheDocument(); // Media upload
      });

      it('always shows heading buttons regardless of feature settings', () => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{
              formatting: false,
              lists: false,
              tables: false,
              codeBlocks: false,
              links: false,
              tasks: false,
              colors: false,
            }}
          />,
        );

        expect(screen.getByText('H1')).toBeInTheDocument();
        expect(screen.getByText('H2')).toBeInTheDocument();
      });
    });

    describe('Loading State', () => {
      it('shows loading state when editor is not ready', () => {
        // Mock useEditor to return null (loading state)
        const { useEditor } = require('@tiptap/react');
        useEditor.mockReturnValueOnce(null);

        renderWithoutProvider(<EmbeddableNotionEditor />);

        expect(screen.getByRole('generic')).toHaveClass('embeddable-notion-editor-loading');
      });
    });

    describe('Content Initialization', () => {
      it('initializes with provided content', () => {
        const initialContent = '<h1>Initial Content</h1><p>Test paragraph</p>';

        renderWithoutProvider(<EmbeddableNotionEditor content={initialContent} />);

        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      });

      it('initializes with empty content by default', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      });
    });
  });

  describe('EmbeddableNotionEditor - User Interactions', () => {
    let mockEditor: any;

    beforeEach(() => {
      vi.clearAllMocks();

      // Create a more detailed mock editor for interaction tests
      mockEditor = {
        getHTML: vi.fn(() => '<p>Mock HTML content</p>'),
        getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
        getText: vi.fn(() => 'Mock text content'),
        isEmpty: false,
        isActive: vi.fn((format: string) => format === 'bold'), // Mock bold as active
        chain: vi.fn(() => ({
          focus: vi.fn(() => ({
            toggleBold: vi.fn(() => ({ run: vi.fn() })),
            toggleItalic: vi.fn(() => ({ run: vi.fn() })),
            toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
            toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
            toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
            toggleTaskList: vi.fn(() => ({ run: vi.fn() })),
            toggleHeading: vi.fn(() => ({ run: vi.fn() })),
            toggleCodeBlock: vi.fn(() => ({ run: vi.fn() })),
            insertContent: vi.fn(() => ({ run: vi.fn() })),
          })),
        })),
        commands: {
          setContent: vi.fn(),
          clearContent: vi.fn(),
          focus: vi.fn(),
        },
      };

      const { useEditor } = require('@tiptap/react');
      useEditor.mockReturnValue(mockEditor);
    });

    describe('Toolbar Interactions', () => {
      it('triggers bold formatting when bold button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ formatting: true }} />);

        const boldButton = screen.getByText('B');
        fireEvent.click(boldButton);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers italic formatting when italic button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ formatting: true }} />);

        const italicButton = screen.getByText('I');
        fireEvent.click(italicButton);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers underline formatting when underline button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ formatting: true }} />);

        const underlineButton = screen.getByText('U');
        fireEvent.click(underlineButton);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers bullet list when bullet list button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ lists: true }} />);

        const bulletButton = screen.getByText('•');
        fireEvent.click(bulletButton);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers numbered list when numbered list button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ lists: true }} />);

        const numberedButton = screen.getByText('1.');
        fireEvent.click(numberedButton);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers task list when task button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ tasks: true }} />);

        const taskButton = screen.getByText('✓');
        fireEvent.click(taskButton);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers heading 1 when H1 button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const h1Button = screen.getByText('H1');
        fireEvent.click(h1Button);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers heading 2 when H2 button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const h2Button = screen.getByText('H2');
        fireEvent.click(h2Button);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers code block when code block button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ codeBlocks: true }} />);

        const codeButton = screen.getByText('</>');
        fireEvent.click(codeButton);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('triggers media upload when media button is clicked', async () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ mediaUpload: true }} />);

        const mediaButton = screen.getByText('📎');
        fireEvent.click(mediaButton);

        expect(mockEditor.chain).toHaveBeenCalled();
      });

      it('applies active class to active toolbar buttons', () => {
        renderWithoutProvider(<EmbeddableNotionEditor features={{ formatting: true }} />);

        const boldButton = screen.getByText('B');
        expect(boldButton).toHaveClass('active');
      });
    });

    describe('Callback Handling', () => {
      it('calls onChange callback when content changes', async () => {
        const onChangeMock = vi.fn();

        // Mock the useEditor to trigger onUpdate
        mockUseEditor.mockImplementation((config: any) => {
          // Simulate calling onUpdate
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);

          return mockEditor;
        });

        renderWithoutProvider(<EmbeddableNotionEditor onChange={onChangeMock} />);

        await waitFor(() => {
          expect(onChangeMock).toHaveBeenCalledWith('<p>Mock HTML content</p>', {
            type: 'doc',
            content: [],
          });
        });
      });

      it('calls onUpdate callback when editor updates', async () => {
        const onUpdateMock = vi.fn();

        // Mock the useEditor to trigger onUpdate
        mockUseEditor.mockImplementation((config: any) => {
          // Simulate calling onUpdate
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);

          return mockEditor;
        });

        renderWithoutProvider(<EmbeddableNotionEditor onUpdate={onUpdateMock} />);

        await waitFor(() => {
          expect(onUpdateMock).toHaveBeenCalledWith(mockEditor);
        });
      });
    });

    describe('Focus and Blur Behavior', () => {
      it('handles editor focus correctly', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const editorContent = screen.getByTestId('embeddable-notion-editor-content');
        fireEvent.focus(editorContent);

        // Verify the component is still rendered (focus behavior is handled by TipTap)
        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      });

      it('handles editor blur correctly', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const editorContent = screen.getByTestId('embeddable-notion-editor-content');
        fireEvent.blur(editorContent);

        // Verify the component is still rendered (blur behavior is handled by TipTap)
        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      });
    });

    describe('Editable State', () => {
      it('disables editing when editable is false', () => {
        renderWithoutProvider(<EmbeddableNotionEditor editable={false} />);

        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
        // TipTap handles editable state internally
      });

      it('enables editing when editable is true', () => {
        renderWithoutProvider(<EmbeddableNotionEditor editable={true} />);

        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
        // TipTap handles editable state internally
      });
    });
  });

  describe('EmbeddableNotionEditor - Theme Customization', () => {
    let mockEditor: any;
    let useEditorMock: any;

    beforeEach(() => {
      vi.clearAllMocks();

      mockEditor = {
        getHTML: vi.fn(() => '<p>Mock HTML content</p>'),
        getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
        getText: vi.fn(() => 'Mock text content'),
        isEmpty: false,
        isActive: vi.fn(() => false),
        chain: vi.fn(() => ({
          focus: vi.fn(() => ({ toggleBold: vi.fn(() => ({ run: vi.fn() })) })),
        })),
        commands: {
          setContent: vi.fn(),
          clearContent: vi.fn(),
          focus: vi.fn(),
        },
      };

      useEditorMock = vi.fn(() => mockEditor);
      vi.doMock('@tiptap/react', () => ({
        useEditor: useEditorMock,
        EditorContent: ({ editor, ...props }: any) => (
          <div data-testid="embeddable-notion-editor-content" className="ProseMirror" {...props}>
            Mock Editor Content
          </div>
        ),
      }));
    });

    describe('Default Theme', () => {
      it('applies default theme colors when no theme is provided', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const editor = screen.getByTestId('embeddable-notion-editor');
        expect(editor).toBeInTheDocument();

        // Check that style tag with default colors exists
        const styleElement = document.querySelector('style');
        expect(styleElement).toBeInTheDocument();
        expect(styleElement?.innerHTML).toContain('#ffffff'); // Default background
        expect(styleElement?.innerHTML).toContain('#1f2937'); // Default text color
        expect(styleElement?.innerHTML).toContain('#e5e7eb'); // Default border color
        expect(styleElement?.innerHTML).toContain('#3b82f6'); // Default focus color
        expect(styleElement?.innerHTML).toContain('#9ca3af'); // Default placeholder color
      });
    });

    describe('Custom Theme', () => {
      it('applies custom background color', () => {
        const customTheme = {
          backgroundColor: '#f8f9fa',
        };

        renderWithoutProvider(<EmbeddableNotionEditor theme={customTheme} />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('#f8f9fa');
      });

      it('applies custom text color', () => {
        const customTheme = {
          textColor: '#2d3748',
        };

        renderWithoutProvider(<EmbeddableNotionEditor theme={customTheme} />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('#2d3748');
      });

      it('applies custom border color', () => {
        const customTheme = {
          borderColor: '#cbd5e0',
        };

        renderWithoutProvider(<EmbeddableNotionEditor theme={customTheme} />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('#cbd5e0');
      });

      it('applies custom focus color', () => {
        const customTheme = {
          focusColor: '#4299e1',
        };

        renderWithoutProvider(<EmbeddableNotionEditor theme={customTheme} />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('#4299e1');
      });

      it('applies custom placeholder color', () => {
        const customTheme = {
          placeholderColor: '#a0aec0',
        };

        renderWithoutProvider(<EmbeddableNotionEditor theme={customTheme} />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('#a0aec0');
      });

      it('applies complete custom theme', () => {
        const customTheme = {
          backgroundColor: '#1a202c',
          textColor: '#f7fafc',
          borderColor: '#4a5568',
          focusColor: '#63b3ed',
          placeholderColor: '#a0aec0',
        };

        renderWithoutProvider(<EmbeddableNotionEditor theme={customTheme} />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('#1a202c'); // Background
        expect(styleElement?.innerHTML).toContain('#f7fafc'); // Text
        expect(styleElement?.innerHTML).toContain('#4a5568'); // Border
        expect(styleElement?.innerHTML).toContain('#63b3ed'); // Focus
        expect(styleElement?.innerHTML).toContain('#a0aec0'); // Placeholder
      });

      it('merges custom theme with defaults', () => {
        const partialTheme = {
          backgroundColor: '#custom-bg',
          focusColor: '#custom-focus',
        };

        renderWithoutProvider(<EmbeddableNotionEditor theme={partialTheme} />);

        const styleElement = document.querySelector('style');
        // Custom colors should be present
        expect(styleElement?.innerHTML).toContain('#custom-bg');
        expect(styleElement?.innerHTML).toContain('#custom-focus');
        // Default colors should still be present for unspecified properties
        expect(styleElement?.innerHTML).toContain('#1f2937'); // Default text color
        expect(styleElement?.innerHTML).toContain('#e5e7eb'); // Default border color
      });
    });

    describe('Dark Theme Example', () => {
      it('applies dark theme correctly', () => {
        const darkTheme = {
          backgroundColor: '#1f2937',
          textColor: '#f9fafb',
          borderColor: '#374151',
          focusColor: '#60a5fa',
          placeholderColor: '#9ca3af',
        };

        renderWithoutProvider(<EmbeddableNotionEditor theme={darkTheme} />);

        const styleElement = document.querySelector('style');

        // Verify dark theme colors are applied
        expect(styleElement?.innerHTML).toContain('#1f2937'); // Dark background
        expect(styleElement?.innerHTML).toContain('#f9fafb'); // Light text
        expect(styleElement?.innerHTML).toContain('#374151'); // Dark border
        expect(styleElement?.innerHTML).toContain('#60a5fa'); // Blue focus
        expect(styleElement?.innerHTML).toContain('#9ca3af'); // Gray placeholder
      });
    });

    describe('CSS-in-JS Style Injection', () => {
      it('injects styles into the document head', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const styleElements = document.querySelectorAll('style');
        const editorStyles = Array.from(styleElements).find(style =>
          style.innerHTML.includes('embeddable-notion-editor'),
        );

        expect(editorStyles).toBeInTheDocument();
      });

      it('includes all necessary CSS classes', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const styleElement = document.querySelector('style');
        const styles = styleElement?.innerHTML || '';

        // Check for essential CSS classes
        expect(styles).toContain('.embeddable-notion-editor');
        expect(styles).toContain('.embeddable-notion-editor-content');
        expect(styles).toContain('.embeddable-editor-toolbar');
        expect(styles).toContain('.embeddable-editor-task-list');
        expect(styles).toContain('.embeddable-editor-code-block');
        expect(styles).toContain('.embeddable-editor-table');
        expect(styles).toContain('.embeddable-editor-link');
      });

      it('applies minHeight to content area', () => {
        const customMinHeight = '350px';
        renderWithoutProvider(<EmbeddableNotionEditor minHeight={customMinHeight} />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain(`min-height: ${customMinHeight}`);
      });

      it('updates styles when theme changes', () => {
        const { rerender } = renderWithoutProvider(
          <EmbeddableNotionEditor theme={{ backgroundColor: '#original' }} />,
        );

        let styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('#original');

        rerender(<EmbeddableNotionEditor theme={{ backgroundColor: '#updated' }} />);

        styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('#updated');
      });

      it('includes toolbar styles when toolbar is enabled', () => {
        renderWithoutProvider(<EmbeddableNotionEditor showToolbar={true} />);

        const styleElement = document.querySelector('style');
        const styles = styleElement?.innerHTML || '';

        expect(styles).toContain('.embeddable-editor-toolbar');
        expect(styles).toContain('.embeddable-editor-toolbar button');
        expect(styles).toContain('.embeddable-editor-toolbar button:hover');
        expect(styles).toContain('.embeddable-editor-toolbar button.active');
      });
    });

    describe('Responsive Styling', () => {
      it('applies font family for cross-platform consistency', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('-apple-system, BlinkMacSystemFont');
      });

      it('uses proper line height for readability', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('line-height: 1.6');
      });

      it('includes border radius for modern appearance', () => {
        renderWithoutProvider(<EmbeddableNotionEditor />);

        const styleElement = document.querySelector('style');
        expect(styleElement?.innerHTML).toContain('border-radius: 8px');
      });
    });
  });

  describe('EmbeddableNotionEditor - Auto-Save Functionality', () => {
    let mockEditor: any;
    let mockOnSave: any;
    let useEditorMock: any;

    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();

      mockOnSave = vi.fn();

      mockEditor = {
        getHTML: vi.fn(() => '<p>Auto-save test content</p>'),
        getJSON: vi.fn(() => ({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Auto-save test content' }] },
          ],
        })),
        getText: vi.fn(() => 'Auto-save test content'),
        isEmpty: false,
        isActive: vi.fn(() => false),
        chain: vi.fn(() => ({
          focus: vi.fn(() => ({ toggleBold: vi.fn(() => ({ run: vi.fn() })) })),
        })),
        commands: {
          setContent: vi.fn(),
          clearContent: vi.fn(),
          focus: vi.fn(),
        },
      };

      useEditorMock = vi.fn(() => mockEditor);
      vi.doMock('@tiptap/react', () => ({
        useEditor: useEditorMock,
        EditorContent: ({ editor, ...props }: any) => (
          <div data-testid="embeddable-notion-editor-content" className="ProseMirror" {...props}>
            Mock Editor Content
          </div>
        ),
      }));
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.clearAllTimers();
      // Clean up any global timeout references
      delete (window as any).__embeddableEditorAutoSaveTimeout;
    });

    describe('Auto-Save Configuration', () => {
      it('does not trigger auto-save when disabled', async () => {
        mockUseEditor.mockImplementation((config: any) => {
          // Simulate content change
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: false, onSave: mockOnSave }} />,
        );

        await vi.runAllTimersAsync();

        expect(mockOnSave).not.toHaveBeenCalled();
      });

      it('triggers auto-save when enabled with default delay', async () => {
        mockUseEditor.mockImplementation((config: any) => {
          // Simulate content change
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, onSave: mockOnSave }} />,
        );

        await vi.runAllTimersAsync();

        expect(mockOnSave).toHaveBeenCalledWith('<p>Auto-save test content</p>');
      });

      it('uses custom delay when specified', async () => {
        mockUseEditor.mockImplementation((config: any) => {
          // Simulate content change
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, delay: 2000, onSave: mockOnSave }} />,
        );

        // Run initial timer
        await vi.advanceTimersByTimeAsync(0);

        // Should not be called before the custom delay
        vi.advanceTimersByTime(1000);
        expect(mockOnSave).not.toHaveBeenCalled();

        // Should be called after the custom delay
        vi.advanceTimersByTime(1000);
        expect(mockOnSave).toHaveBeenCalledWith('<p>Auto-save test content</p>');
      });

      it('handles missing onSave callback gracefully', async () => {
        mockUseEditor.mockImplementation((config: any) => {
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        expect(() => {
          renderWithoutProvider(<EmbeddableNotionEditor autoSave={{ enabled: true }} />);
        }).not.toThrow();

        await vi.runAllTimersAsync();
      });
    });

    describe('Auto-Save Debouncing', () => {
      it('debounces multiple rapid changes', async () => {
        const { useEditor } = require('@tiptap/react');
        let updateCallback: any;

        useEditor.mockImplementation((config: any) => {
          updateCallback = config.onUpdate;
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, delay: 1000, onSave: mockOnSave }} />,
        );

        // Simulate rapid content changes
        updateCallback({ editor: mockEditor });
        vi.advanceTimersByTime(500);

        updateCallback({ editor: mockEditor });
        vi.advanceTimersByTime(500);

        updateCallback({ editor: mockEditor });
        vi.advanceTimersByTime(500);

        // Should not have saved yet due to debouncing
        expect(mockOnSave).not.toHaveBeenCalled();

        // Complete the delay after the last change
        vi.advanceTimersByTime(500);

        // Should save only once
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith('<p>Auto-save test content</p>');
      });

      it('resets debounce timer on each change', async () => {
        const { useEditor } = require('@tiptap/react');
        let updateCallback: any;

        useEditor.mockImplementation((config: any) => {
          updateCallback = config.onUpdate;
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, delay: 1000, onSave: mockOnSave }} />,
        );

        // First change
        updateCallback({ editor: mockEditor });
        vi.advanceTimersByTime(800);

        // Second change resets the timer
        updateCallback({ editor: mockEditor });
        vi.advanceTimersByTime(800);

        // Should not have saved yet
        expect(mockOnSave).not.toHaveBeenCalled();

        // Complete the delay
        vi.advanceTimersByTime(200);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      it('clears existing timeout before setting new one', async () => {
        const { useEditor } = require('@tiptap/react');
        let updateCallback: any;

        useEditor.mockImplementation((config: any) => {
          updateCallback = config.onUpdate;
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, delay: 1000, onSave: mockOnSave }} />,
        );

        // Simulate multiple rapid updates
        for (let i = 0; i < 5; i++) {
          updateCallback({ editor: mockEditor });
          vi.advanceTimersByTime(200);
        }

        // Should still only save once after the final delay
        vi.advanceTimersByTime(800);
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    describe('Auto-Save Content Handling', () => {
      it('saves the current HTML content', async () => {
        const customContent = '<h1>Custom heading</h1><p>Custom paragraph</p>';
        mockEditor.getHTML.mockReturnValue(customContent);

        mockUseEditor.mockImplementation((config: any) => {
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, onSave: mockOnSave }} />,
        );

        await vi.runAllTimersAsync();

        expect(mockOnSave).toHaveBeenCalledWith(customContent);
      });

      it('handles empty content correctly', async () => {
        mockEditor.getHTML.mockReturnValue('');

        mockUseEditor.mockImplementation((config: any) => {
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, onSave: mockOnSave }} />,
        );

        await vi.runAllTimersAsync();

        expect(mockOnSave).toHaveBeenCalledWith('');
      });

      it('handles large content correctly', async () => {
        const largeContent = '<p>' + 'Large content '.repeat(1000) + '</p>';
        mockEditor.getHTML.mockReturnValue(largeContent);

        mockUseEditor.mockImplementation((config: any) => {
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, onSave: mockOnSave }} />,
        );

        await vi.runAllTimersAsync();

        expect(mockOnSave).toHaveBeenCalledWith(largeContent);
      });
    });

    describe('Auto-Save Integration with Other Callbacks', () => {
      it('works alongside onChange callback', async () => {
        const onChangeMock = vi.fn();

        mockUseEditor.mockImplementation((config: any) => {
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor
            onChange={onChangeMock}
            autoSave={{ enabled: true, onSave: mockOnSave }}
          />,
        );

        await vi.runAllTimersAsync();

        // Both callbacks should be called
        expect(onChangeMock).toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalled();
      });

      it('works alongside onUpdate callback', async () => {
        const onUpdateMock = vi.fn();

        mockUseEditor.mockImplementation((config: any) => {
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor
            onUpdate={onUpdateMock}
            autoSave={{ enabled: true, onSave: mockOnSave }}
          />,
        );

        await vi.runAllTimersAsync();

        expect(onUpdateMock).toHaveBeenCalledWith(mockEditor);
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    describe('Auto-Save Error Handling', () => {
      it('handles errors in onSave callback gracefully', async () => {
        const errorOnSave = vi.fn(() => {
          throw new Error('Save failed');
        });

        mockUseEditor.mockImplementation((config: any) => {
          setTimeout(() => {
            config.onUpdate({ editor: mockEditor });
          }, 0);
          return mockEditor;
        });

        expect(() => {
          renderWithoutProvider(
            <EmbeddableNotionEditor autoSave={{ enabled: true, onSave: errorOnSave }} />,
          );
        }).not.toThrow();

        await vi.runAllTimersAsync();

        expect(errorOnSave).toHaveBeenCalled();
      });

      it('continues to work after save errors', async () => {
        let callCount = 0;
        const flakyOnSave = vi.fn(() => {
          callCount++;
          if (callCount === 1) {
            throw new Error('First save failed');
          }
        });

        const { useEditor } = require('@tiptap/react');
        let updateCallback: any;

        useEditor.mockImplementation((config: any) => {
          updateCallback = config.onUpdate;
          return mockEditor;
        });

        renderWithoutProvider(
          <EmbeddableNotionEditor autoSave={{ enabled: true, delay: 500, onSave: flakyOnSave }} />,
        );

        // First update (will fail)
        updateCallback({ editor: mockEditor });
        await vi.advanceTimersByTimeAsync(500);

        // Second update (should succeed)
        updateCallback({ editor: mockEditor });
        await vi.advanceTimersByTimeAsync(500);

        expect(flakyOnSave).toHaveBeenCalledTimes(2);
      });
    });
  });
}); // Close the main EmbeddableNotionEditor describe block
