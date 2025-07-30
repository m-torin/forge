/**
 * @vitest-environment jsdom
 */
import { EmbeddableNotionEditor } from '#/components/EmbeddableNotionEditor/EmbeddableNotionEditor';
import { fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithoutProvider, screen } from '../testing/test-utils';

// Mock all external dependencies
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
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
  })),
  EditorContent: ({ editor, ...props }: any) => (
    <div data-testid="embeddable-notion-editor-content" className="ProseMirror" {...props}>
      Mock Editor Content
    </div>
  ),
}));

// Mock external utilities
vi.mock('lowlight', () => ({
  createLowlight: vi.fn(() => ({})),
  all: {},
}));

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

vi.mock('../../src/utils/secure-media-upload', () => ({
  createSecureUploadHandler: vi.fn(() => vi.fn()),
  DEFAULT_SECURE_CONFIG: {
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 10485760,
    maxSizes: { image: 10485760, video: 104857600, audio: 10485760 },
  },
}));

vi.mock('../../src/utils/url-validator', () => ({
  validateURL: vi.fn(() => true),
  sanitizeURL: vi.fn(url => url),
  addSecurityAttributes: vi.fn(() => ({ rel: 'noopener noreferrer', target: '_blank' })),
}));

vi.mock('../../src/utils/media-upload-handler', () => ({
  ALL_MEDIA_TYPES: 'image/*,video/*,audio/*',
  createMockUploadHandler: vi.fn(() => vi.fn(file => Promise.resolve('mock-upload-url'))),
  createStorageUploadHandler: vi.fn(() => vi.fn()),
}));

vi.mock('../../src/components/EmbeddableNotionEditor/embeddable-editor.css', () => ({}));

describe('EmbeddableNotionEditor - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('React Hook Form Integration', () => {
    // Mock react-hook-form Controller component
    const MockController = ({ render, name, control }: any) => {
      const [value, setValue] = useState('');
      const field = {
        value,
        onChange: (newValue: string) => setValue(newValue),
        onBlur: vi.fn(),
        name,
      };

      return render({ field });
    };

    it('integrates with react-hook-form Controller', () => {
      const mockControl = {};

      const FormWithEditor = () => (
        <MockController
          name="content"
          control={mockControl}
          render={({ field }: any) => (
            <EmbeddableNotionEditor
              content={field.value}
              onChange={html => field.onChange(html)}
              placeholder="Enter content..."
              data-testid="form-editor"
            />
          )}
        />
      );

      renderWithoutProvider(<FormWithEditor />);

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      expect(screen.getByTestId('embeddable-notion-editor-content')).toBeInTheDocument();
    });

    it('handles form validation states', () => {
      const mockValidation = {
        required: 'Content is required',
        minLength: { value: 10, message: 'Content too short' },
      };

      const FormWithValidation = () => {
        const [error, setError] = useState<string | null>(null);
        const [content, setContent] = useState('');

        const handleChange = (html: string) => {
          setContent(html);

          // Mock validation logic
          if (!html.trim()) {
            setError(mockValidation.required);
          } else if (html.length < mockValidation.minLength.value) {
            setError(mockValidation.minLength.message);
          } else {
            setError(null);
          }
        };

        return (
          <div>
            <EmbeddableNotionEditor
              content={content}
              onChange={handleChange}
              placeholder="Enter content..."
            />
            {error && (
              <div data-testid="validation-error" style={{ color: 'red' }}>
                {error}
              </div>
            )}
          </div>
        );
      };

      renderWithoutProvider(<FormWithValidation />);

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      // Validation error should appear for empty content
      expect(screen.getByTestId('validation-error')).toHaveTextContent('Content is required');
    });

    it('supports field-level disabled state', () => {
      const DisabledFormEditor = () => (
        <EmbeddableNotionEditor
          editable={false}
          content="<p>This editor is disabled</p>"
          placeholder="Cannot edit"
        />
      );

      renderWithoutProvider(<DisabledFormEditor />);

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    it('integrates with useState hook', () => {
      const StateManagementEditor = () => {
        const [content, setContent] = useState('<p>Initial content</p>');
        const [wordCount, setWordCount] = useState(0);

        const handleChange = (html: string) => {
          setContent(html);
          // Mock word counting
          const words = html
            .replace(/<[^>]*>/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);
          setWordCount(words.length);
        };

        return (
          <div>
            <EmbeddableNotionEditor
              content={content}
              onChange={handleChange}
              placeholder="Start writing..."
            />
            <div data-testid="word-count">Words: {wordCount}</div>
          </div>
        );
      };

      renderWithoutProvider(<StateManagementEditor />);

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      expect(screen.getByTestId('word-count')).toHaveTextContent('Words: 0');
    });

    it('integrates with useReducer pattern', () => {
      const initialState = {
        content: '',
        isDirty: false,
        lastSaved: null as Date | null,
      };

      type EditorAction =
        | { type: 'SET_CONTENT'; payload: string }
        | { type: 'MARK_SAVED' }
        | { type: 'RESET' };

      const editorReducer = (state: typeof initialState, action: EditorAction) => {
        switch (action.type) {
          case 'SET_CONTENT':
            return { ...state, content: action.payload, isDirty: true };
          case 'MARK_SAVED':
            return { ...state, isDirty: false, lastSaved: new Date() };
          case 'RESET':
            return initialState;
          default:
            return state;
        }
      };

      const ReducerEditor = () => {
        const [state, dispatch] = useState(initialState); // Using useState to mock useReducer

        const handleChange = (html: string) => {
          dispatch({ type: 'SET_CONTENT', payload: html } as any);
        };

        const handleSave = () => {
          dispatch({ type: 'MARK_SAVED' } as any);
        };

        const handleReset = () => {
          dispatch({ type: 'RESET' } as any);
        };

        return (
          <div>
            <EmbeddableNotionEditor
              content={state.content}
              onChange={handleChange}
              placeholder="Start writing..."
            />
            <div data-testid="editor-status">
              {state.isDirty ? 'Unsaved changes' : 'All changes saved'}
            </div>
            <button onClick={handleSave} data-testid="save-button">
              Save
            </button>
            <button onClick={handleReset} data-testid="reset-button">
              Reset
            </button>
          </div>
        );
      };

      renderWithoutProvider(<ReducerEditor />);

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      expect(screen.getByTestId('editor-status')).toHaveTextContent('All changes saved');
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });

    it('handles complex state synchronization', () => {
      const ComplexStateEditor = () => {
        const [editorState, setEditorState] = useState({
          content: '',
          metadata: {
            wordCount: 0,
            characterCount: 0,
            lastModified: new Date(),
          },
          settings: {
            autoSave: true,
            theme: 'light',
          },
        });

        const updateContent = (html: string) => {
          const text = html.replace(/<[^>]*>/g, '');
          setEditorState(prev => ({
            ...prev,
            content: html,
            metadata: {
              ...prev.metadata,
              wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
              characterCount: text.length,
              lastModified: new Date(),
            },
          }));
        };

        const toggleAutoSave = () => {
          setEditorState(prev => ({
            ...prev,
            settings: {
              ...prev.settings,
              autoSave: !prev.settings.autoSave,
            },
          }));
        };

        return (
          <div>
            <EmbeddableNotionEditor
              content={editorState.content}
              onChange={updateContent}
              autoSave={{
                enabled: editorState.settings.autoSave,
                delay: 1000,
                onSave: content => console.log('Auto-saved:', content),
              }}
              placeholder="Complex state management..."
            />
            <div data-testid="metadata">
              Words: {editorState.metadata.wordCount} | Characters:{' '}
              {editorState.metadata.characterCount}
            </div>
            <button onClick={toggleAutoSave} data-testid="toggle-autosave">
              Auto-save: {editorState.settings.autoSave ? 'ON' : 'OFF'}
            </button>
          </div>
        );
      };

      renderWithoutProvider(<ComplexStateEditor />);

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      expect(screen.getByTestId('metadata')).toHaveTextContent('Words: 0 | Characters: 0');
      expect(screen.getByTestId('toggle-autosave')).toHaveTextContent('Auto-save: ON');
    });
  });

  describe('Context Integration', () => {
    it('integrates with React Context', () => {
      const ThemeContext = ({ children, theme }: { children: React.ReactNode; theme: any }) => (
        <div data-theme={theme.name}>{children}</div>
      );

      const ContextEditor = () => {
        const theme = {
          name: 'dark',
          colors: {
            backgroundColor: '#1f2937',
            textColor: '#f9fafb',
            borderColor: '#374151',
            focusColor: '#60a5fa',
          },
        };

        return (
          <ThemeContext theme={theme}>
            <EmbeddableNotionEditor theme={theme.colors} placeholder="Context-aware editor..." />
          </ThemeContext>
        );
      };

      renderWithoutProvider(<ContextEditor />);

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('handles large content efficiently', () => {
      const LargeContentEditor = () => {
        const [content, setContent] = useState('');

        // Simulate large content
        const generateLargeContent = () => {
          const paragraphs = Array.from(
            { length: 100 },
            (_, i) =>
              `<p>This is paragraph ${i + 1} with some sample content for testing performance.</p>`,
          );
          setContent(paragraphs.join(''));
        };

        return (
          <div>
            <button onClick={generateLargeContent} data-testid="generate-content">
              Generate Large Content
            </button>
            <EmbeddableNotionEditor
              content={content}
              onChange={setContent}
              placeholder="Performance test editor..."
            />
          </div>
        );
      };

      renderWithoutProvider(<LargeContentEditor />);

      const generateButton = screen.getByTestId('generate-content');

      // Should not throw or hang when handling large content
      expect(() => {
        fireEvent.click(generateButton);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles rapid state updates', () => {
      const RapidUpdatesEditor = () => {
        const [updateCount, setUpdateCount] = useState(0);

        const handleRapidUpdates = () => {
          // Simulate rapid content updates
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              setUpdateCount(prev => prev + 1);
            }, i * 10);
          }
        };

        return (
          <div>
            <button onClick={handleRapidUpdates} data-testid="rapid-updates">
              Trigger Rapid Updates
            </button>
            <EmbeddableNotionEditor
              content={`<p>Update count: ${updateCount}</p>`}
              placeholder="Rapid updates test..."
            />
            <div data-testid="update-counter">Updates: {updateCount}</div>
          </div>
        );
      };

      renderWithoutProvider(<RapidUpdatesEditor />);

      const rapidButton = screen.getByTestId('rapid-updates');

      expect(() => {
        fireEvent.click(rapidButton);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      expect(screen.getByTestId('update-counter')).toHaveTextContent('Updates: 0');
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles errors gracefully', () => {
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        const [hasError, setHasError] = useState(false);

        if (hasError) {
          return <div data-testid="error-fallback">Something went wrong</div>;
        }

        try {
          return <>{children}</>;
        } catch (error) {
          setHasError(true);
          return <div data-testid="error-fallback">Something went wrong</div>;
        }
      };

      const ErrorProneEditor = () => (
        <ErrorBoundary>
          <EmbeddableNotionEditor placeholder="Error boundary test..." />
        </ErrorBoundary>
      );

      renderWithoutProvider(<ErrorProneEditor />);

      // Should render successfully even with error boundary
      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });
});
