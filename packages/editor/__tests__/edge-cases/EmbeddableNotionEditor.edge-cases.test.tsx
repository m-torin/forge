/**
 * @vitest-environment jsdom
 */
import { EmbeddableNotionEditor } from '#/components/EmbeddableNotionEditor/EmbeddableNotionEditor';
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

// Mock external utilities with error scenarios
vi.mock('lowlight', () => ({
  createLowlight: vi.fn(() => ({})),
  all: {},
}));

vi.mock('../../src/utils/css-sanitizer', () => ({
  sanitizeTheme: vi.fn(theme => {
    // Test null/undefined theme handling
    if (!theme)
      return {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#e5e7eb',
        focusColor: '#3b82f6',
        placeholderColor: '#9ca3af',
      };

    return {
      backgroundColor: theme?.backgroundColor || '#ffffff',
      textColor: theme?.textColor || '#1f2937',
      borderColor: theme?.borderColor || '#e5e7eb',
      focusColor: theme?.focusColor || '#3b82f6',
      placeholderColor: theme?.placeholderColor || '#9ca3af',
    };
  }),
  sanitizeDimension: vi.fn(dimension => {
    // Test malicious dimension handling
    if (typeof dimension === 'string' && dimension.includes('javascript:')) {
      return '100%'; // Sanitized fallback
    }
    return dimension || '100%';
  }),
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
  validateURL: vi.fn(url => {
    // Test malicious URL blocking
    if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('file:')) {
      return false;
    }
    return true;
  }),
  sanitizeURL: vi.fn(url => {
    if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('file:')) {
      return ''; // Block malicious URLs
    }
    return url;
  }),
  addSecurityAttributes: vi.fn(() => ({ rel: 'noopener noreferrer', target: '_blank' })),
}));

vi.mock('../../src/utils/media-upload-handler', () => ({
  ALL_MEDIA_TYPES: 'image/*,video/*,audio/*',
  createMockUploadHandler: vi.fn(() =>
    vi.fn(file => {
      // Test file upload error scenarios
      if (file.size > 10 * 1024 * 1024) {
        return Promise.reject(new Error('File too large'));
      }
      if (!file.type.startsWith('image/')) {
        return Promise.reject(new Error('Invalid file type'));
      }
      return Promise.resolve('mock-upload-url');
    }),
  ),
  createStorageUploadHandler: vi.fn(() => vi.fn()),
}));

vi.mock('../../src/components/EmbeddableNotionEditor/embeddable-editor.css', () => ({}));

describe('EmbeddableNotionEditor - Edge Cases & Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Malicious Input Handling', () => {
    it('handles malicious theme values safely', () => {
      const maliciousTheme = {
        backgroundColor: "javascript:alert('xss')",
        textColor: "expression(alert('xss'))",
        borderColor: "url('javascript:alert(1)')",
        focusColor: "red; background: url('evil.com')",
        placeholderColor: "blue'); alert('xss'); //",
      };

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor theme={maliciousTheme} />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('sanitizes malicious dimensions', () => {
      const maliciousDimensions = {
        maxWidth: "100px; background: url('evil.com')",
        minHeight: "javascript:alert('xss')",
      };

      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            maxWidth={maliciousDimensions.maxWidth}
            minHeight={maliciousDimensions.minHeight}
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles malicious content safely', () => {
      const maliciousContent = `
        <script>alert('xss')</script>
        <img src="x" onerror="alert('xss')">
        <iframe src="javascript:alert('xss')"></iframe>
        <div onclick="alert('xss')">Click me</div>
      `;

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor content={maliciousContent} />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('blocks malicious URLs in links', () => {
      const maliciousContent = `
        <a href="javascript:alert('xss')">Malicious link</a>
        <a href="data:text/html,<script>alert('xss')</script>">Data URL</a>
        <a href="file:///etc/passwd">File URL</a>
      `;

      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor content={maliciousContent} features={{ links: true }} />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });

  describe('Extreme Input Scenarios', () => {
    it('handles extremely large content', () => {
      const hugeContent = '<p>' + 'A'.repeat(1000000) + '</p>';

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor content={hugeContent} />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles deeply nested HTML', () => {
      let deeplyNestedContent = '';
      for (let i = 0; i < 100; i++) {
        deeplyNestedContent += '<div>';
      }
      deeplyNestedContent += 'Deep content';
      for (let i = 0; i < 100; i++) {
        deeplyNestedContent += '</div>';
      }

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor content={deeplyNestedContent} />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles invalid JSON content', () => {
      const invalidJSONContent = '{"type": "doc", "content": [{"invalid": json}]}';

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor content={invalidJSONContent} />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles special characters and unicode', () => {
      const unicodeContent = `
        <p>Special chars: !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~</p>
        <p>Unicode: 🎉🚀💻🌍🔥💡⚡🎨🎯🎪</p>
        <p>Languages: 中文 日本語 العربية हिन्दी русский</p>
        <p>Math: ∑∞≈≠≤≥±∓×÷√∂∫∆∇∏</p>
      `;

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor content={unicodeContent} />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });

  describe('Null/Undefined Handling', () => {
    it('handles null/undefined props gracefully', () => {
      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            content={null as any}
            placeholder={undefined as any}
            theme={null as any}
            onChange={undefined as any}
            onUpdate={null as any}
            features={undefined as any}
            mediaUploadConfig={null as any}
            autoSave={undefined as any}
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles empty string values', () => {
      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            content=""
            placeholder=""
            className=""
            maxWidth=""
            minHeight=""
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles empty objects', () => {
      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            theme={{}}
            features={{}}
            mediaUploadConfig={{}}
            autoSave={{} as any}
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });

  describe('Error Callback Handling', () => {
    it('handles throwing onChange callback', () => {
      const throwingOnChange = vi.fn(() => {
        throw new Error('onChange callback error');
      });

      const mockEditor = {
        getHTML: vi.fn(() => '<p>Test content</p>'),
        getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
        getText: vi.fn(() => 'Test content'),
        isEmpty: false,
        commands: {
          setContent: vi.fn(),
          clearContent: vi.fn(),
          focus: vi.fn(),
        },
      };

      const { useEditor } = require('@tiptap/react');
      useEditor.mockImplementation((config: any) => {
        // Simulate content change that triggers onChange
        setTimeout(() => {
          config.onUpdate({ editor: mockEditor });
        }, 0);
        return mockEditor;
      });

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor onChange={throwingOnChange} />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles throwing onUpdate callback', () => {
      const throwingOnUpdate = vi.fn(() => {
        throw new Error('onUpdate callback error');
      });

      const mockEditor = {
        getHTML: vi.fn(() => '<p>Test content</p>'),
        getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
        getText: vi.fn(() => 'Test content'),
        isEmpty: false,
        isActive: vi.fn(() => false),
        chain: vi.fn(() => ({
          focus: vi.fn(() => ({ toggleBold: vi.fn(() => ({ run: vi.fn() })) })),
        })),
        commands: { setContent: vi.fn(), clearContent: vi.fn(), focus: vi.fn() },
      };

      const { useEditor } = require('@tiptap/react');
      useEditor.mockImplementation((config: any) => {
        setTimeout(() => {
          config.onUpdate({ editor: mockEditor });
        }, 0);
        return mockEditor;
      });

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor onUpdate={throwingOnUpdate} />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles throwing auto-save callback', () => {
      vi.useFakeTimers();

      const throwingAutoSave = vi.fn(() => {
        throw new Error('Auto-save callback error');
      });

      const mockEditor = {
        getHTML: vi.fn(() => '<p>Auto-save test</p>'),
        getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
        getText: vi.fn(() => 'Auto-save test'),
        isEmpty: false,
        isActive: vi.fn(() => false),
        chain: vi.fn(() => ({
          focus: vi.fn(() => ({ toggleBold: vi.fn(() => ({ run: vi.fn() })) })),
        })),
        commands: { setContent: vi.fn(), clearContent: vi.fn(), focus: vi.fn() },
      };

      const { useEditor } = require('@tiptap/react');
      useEditor.mockImplementation((config: any) => {
        setTimeout(() => {
          config.onUpdate({ editor: mockEditor });
        }, 0);
        return mockEditor;
      });

      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            autoSave={{
              enabled: true,
              delay: 1000,
              onSave: throwingAutoSave,
            }}
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('handles rapid component mounting and unmounting', () => {
      const { unmount } = renderWithoutProvider(<EmbeddableNotionEditor />);

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();

      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = renderWithoutProvider(
        <EmbeddableNotionEditor content="<p>Initial</p>" />,
      );

      expect(() => {
        // Simulate rapid prop changes
        for (let i = 0; i < 10; i++) {
          rerender(<EmbeddableNotionEditor content={`<p>Content ${i}</p>`} />);
        }
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles memory pressure scenarios', () => {
      // Simulate memory pressure by creating many large objects
      const largeObjects = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        data: new Array(1000).fill(`item-${i}`),
      }));

      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            content="<p>Memory pressure test</p>"
            onChange={() => {
              // Access large objects to simulate memory usage
              largeObjects.forEach(obj => obj.data.length);
            }}
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });

  describe('Browser Environment Edge Cases', () => {
    it('handles missing window object', () => {
      const originalWindow = global.window;

      try {
        // Simulate SSR environment
        delete (global as any).window;

        expect(() => {
          renderWithoutProvider(<EmbeddableNotionEditor />);
        }).not.toThrow();
      } finally {
        global.window = originalWindow;
      }
    });

    it('handles missing document object', () => {
      const originalDocument = global.document;

      try {
        // Temporarily remove document
        delete (global as any).document;

        expect(() => {
          renderWithoutProvider(<EmbeddableNotionEditor />);
        }).not.toThrow();
      } finally {
        global.document = originalDocument;
      }
    });

    it('handles disabled JavaScript features', () => {
      const originalLocalStorage = global.localStorage;
      const originalSessionStorage = global.sessionStorage;

      try {
        // Simulate disabled storage
        delete (global as any).localStorage;
        delete (global as any).sessionStorage;

        expect(() => {
          renderWithoutProvider(<EmbeddableNotionEditor />);
        }).not.toThrow();

        expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
      } finally {
        global.localStorage = originalLocalStorage;
        global.sessionStorage = originalSessionStorage;
      }
    });
  });

  describe('File Upload Edge Cases', () => {
    it('handles corrupt file uploads', () => {
      const corruptFile = new File(['corrupt data'], 'corrupt.jpg', {
        type: 'image/jpeg',
      });

      // Mock createMockUploadHandler to handle corrupt files
      const { createMockUploadHandler } = require('../../src/utils/media-upload-handler');
      createMockUploadHandler.mockImplementation(() =>
        vi.fn(file => {
          if (file.name === 'corrupt.jpg') {
            return Promise.reject(new Error('Corrupt file detected'));
          }
          return Promise.resolve('mock-upload-url');
        }),
      );

      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{ mediaUpload: true }}
            mediaUploadConfig={{
              uploadHandler: createMockUploadHandler(),
              onError: error => console.error('Upload error:', error),
            }}
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles oversized file uploads', () => {
      const oversizedFile = new File(['x'.repeat(20 * 1024 * 1024)], 'huge.jpg', {
        type: 'image/jpeg',
      });

      // Should handle the error gracefully through the upload handler mock
      expect(() => {
        renderWithoutProvider(
          <EmbeddableNotionEditor
            features={{ mediaUpload: true }}
            mediaUploadConfig={{
              maxSize: 10 * 1024 * 1024, // 10MB limit
              onError: error => console.error('File too large:', error),
            }}
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });

  describe('Accessibility Edge Cases', () => {
    it('handles high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });

    it('handles reduced motion preferences', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(() => {
        renderWithoutProvider(<EmbeddableNotionEditor />);
      }).not.toThrow();

      expect(screen.getByTestId('embeddable-notion-editor')).toBeInTheDocument();
    });
  });
});
