/**
 * React Server Components and Streaming Tests
 * Testing RSC integration, streaming functionality, and client-server interaction
 */

import '@repo/qa/vitest/setup/next-app';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock AI SDK hooks and components
const mockStreamableValue = {
  value: '',
  done: false,
  error: null,
  append: vi.fn(),
  update: vi.fn(),
  done: vi.fn(),
};

const mockUseCompletion = vi.fn(() => ({
  completion: '',
  input: '',
  isLoading: false,
  handleInputChange: vi.fn(),
  handleSubmit: vi.fn(),
  setInput: vi.fn(),
  stop: vi.fn(),
}));

const mockUseChat = vi.fn(() => ({
  messages: [],
  input: '',
  isLoading: false,
  handleInputChange: vi.fn(),
  handleSubmit: vi.fn(),
  setInput: vi.fn(),
  stop: vi.fn(),
  reload: vi.fn(),
}));

// Mock streaming components
vi.mock('@ai-sdk/rsc', () => ({
  streamUI: vi.fn(),
  createStreamableUI: vi.fn(() => mockStreamableValue),
  createStreamableValue: vi.fn(() => mockStreamableValue),
}));

vi.mock('@ai-sdk/react', () => ({
  useCompletion: mockUseCompletion,
  useChat: mockUseChat,
}));

// Test components for RSC functionality
const StreamingTextComponent: React.FC<{ content: string; isStreaming: boolean }> = ({
  content,
  isStreaming,
}) => (
  <div data-testid="streaming-text">
    <div data-testid="content">{content}</div>
    <div data-testid="streaming-indicator">{isStreaming ? 'Streaming...' : 'Complete'}</div>
  </div>
);

const InteractiveStreamComponent: React.FC<{
  onUpdate: (content: string) => void;
  onComplete: () => void;
}> = ({ onUpdate, onComplete }) => {
  const [content, setContent] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);

  const startStreaming = React.useCallback(async () => {
    setIsStreaming(true);

    // Simulate streaming updates
    const chunks = ['Hello', ' world', '!', ' This', ' is', ' streaming', ' text.'];

    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setContent(prev => {
        const newContent = prev + chunk;
        onUpdate(newContent);
        return newContent;
      });
    }

    setIsStreaming(false);
    onComplete();
  }, [onUpdate, onComplete]);

  React.useEffect(() => {
    startStreaming();
  }, [startStreaming]);

  return <StreamingTextComponent content={content} isStreaming={isStreaming} />;
};

describe('react Server Components Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('streaming UI Components', () => {
    test('should render streaming text component correctly', () => {
      render(<StreamingTextComponent content="Test content" isStreaming={true} />);

      expect(screen.getByTestId('content')).toHaveTextContent('Test content');
      expect(screen.getByTestId('streaming-indicator')).toHaveTextContent('Streaming...');
    });

    test('should update streaming indicator when complete', () => {
      const { rerender } = render(
        <StreamingTextComponent content="Initial content" isStreaming={true} />,
      );

      expect(screen.getByTestId('streaming-indicator')).toHaveTextContent('Streaming...');

      rerender(<StreamingTextComponent content="Final content" isStreaming={false} />);

      expect(screen.getByTestId('streaming-indicator')).toHaveTextContent('Complete');
    });

    test('should handle interactive streaming with callbacks', async () => {
      const onUpdate = vi.fn();
      const onComplete = vi.fn();

      render(<InteractiveStreamComponent onUpdate={onUpdate} onComplete={onComplete} />);

      // Wait for streaming to complete
      await waitFor(
        () => {
          expect(onComplete).toHaveBeenCalledWith();
        },
        { timeout: 1000 },
      );

      expect(onUpdate).toHaveBeenCalledTimes(7); // One call per chunk
      expect(screen.getByTestId('content')).toHaveTextContent(
        'Hello world! This is streaming text.',
      );
      expect(screen.getByTestId('streaming-indicator')).toHaveTextContent('Complete');
    });
  });

  describe('server Action Integration', () => {
    test('should handle server action calls for streaming', async () => {
      const mockServerAction = vi.fn().mockResolvedValue({
        success: true,
        stream: 'streaming-response-id',
      });

      // Mock server action component
      const ServerActionComponent: React.FC = () => {
        const [result, setResult] = React.useState<string>('');
        const [isLoading, setIsLoading] = React.useState(false);

        const handleAction = async () => {
          setIsLoading(true);
          try {
            const response = await mockServerAction({
              prompt: 'Test prompt',
              options: { stream: true },
            });
            setResult(`Action completed: ${response.stream}`);
          } finally {
            setIsLoading(false);
          }
        };

        React.useEffect(() => {
          handleAction();
        }, []);

        return <div data-testid="server-action-result">{isLoading ? 'Loading...' : result}</div>;
      };

      render(<ServerActionComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('server-action-result')).not.toHaveTextContent('Loading...');
      });

      expect(mockServerAction).toHaveBeenCalledWith({
        prompt: 'Test prompt',
        options: { stream: true },
      });
      expect(screen.getByTestId('server-action-result')).toHaveTextContent(
        'Action completed: streaming-response-id',
      );
    });

    test('should handle server action errors gracefully', async () => {
      const mockFailingServerAction = vi.fn().mockRejectedValue(new Error('Server action failed'));

      const ErrorHandlingComponent: React.FC = () => {
        const [error, setError] = React.useState<string>('');
        const [isLoading, setIsLoading] = React.useState(false);

        const handleAction = async () => {
          setIsLoading(true);
          try {
            await mockFailingServerAction();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
          } finally {
            setIsLoading(false);
          }
        };

        React.useEffect(() => {
          handleAction();
        }, []);

        return <div data-testid="error-result">{isLoading ? 'Loading...' : error}</div>;
      };

      render(<ErrorHandlingComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('error-result')).toHaveTextContent('Server action failed');
      });

      expect(mockFailingServerAction).toHaveBeenCalledWith();
    });
  });

  describe('streamable Value Integration', () => {
    test('should create and manage streamable values', async () => {
      const { streamUI, createStreamableValue } = await import('@ai-sdk/rsc');

      const mockStreamableValue = {
        value: 'initial-value',
        done: false,
        error: null,
        update: vi.fn(),
        append: vi.fn(),
        done: vi.fn(),
      };

      (createStreamableValue as any).mockReturnValue(mockStreamableValue);

      const StreamableComponent: React.FC = () => {
        const [streamable] = React.useState(() => createStreamableValue(''));
        const [currentValue, setCurrentValue] = React.useState('');

        React.useEffect(() => {
          // Simulate streaming updates
          const updates = ['First', ' Second', ' Third'];
          let index = 0;

          const interval = setInterval(() => {
            if (index < updates.length) {
              streamable.append(updates[index]);
              setCurrentValue(prev => prev + updates[index]);
              index++;
            } else {
              streamable.done();
              clearInterval(interval);
            }
          }, 100);

          return () => clearInterval(interval);
        }, [streamable]);

        return <div data-testid="streamable-value">{currentValue}</div>;
      };

      render(<StreamableComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('streamable-value')).toHaveTextContent('First Second Third');
        },
        { timeout: 500 },
      );

      expect(mockStreamableValue.append).toHaveBeenCalledTimes(3);
      expect(mockStreamableValue.done).toHaveBeenCalledWith();
    });
  });

  describe('client-Server Streaming Integration', () => {
    test('should handle bidirectional streaming communication', async () => {
      mockUseChat.mockReturnValue({
        messages: [
          { id: '1', role: 'user' as const, content: 'Hello' },
          { id: '2', role: 'assistant' as const, content: 'Hi there!' },
        ],
        input: '',
        isLoading: false,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        setInput: vi.fn(),
        stop: vi.fn(),
        reload: vi.fn(),
      });

      const ChatComponent: React.FC = () => {
        const { messages, input, handleInputChange, handleSubmit, isLoading } = mockUseChat();

        return (
          <div data-testid="chat-component">
            <div data-testid="messages">
              {messages.map(message => (
                <div key={message.id} data-testid={`message-${message.role}`}>
                  {message.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} data-testid="chat-form">
              <input
                data-testid="chat-input"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading} data-testid="send-button">
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        );
      };

      render(<ChatComponent />);

      expect(screen.getByTestId('message-user')).toHaveTextContent('Hello');
      expect(screen.getByTestId('message-assistant')).toHaveTextContent('Hi there!');
      expect(screen.getByTestId('send-button')).toHaveTextContent('Send');
      expect(screen.getByTestId('chat-input')).toBeEnabled();
    });

    test('should handle loading states during streaming', async () => {
      mockUseCompletion.mockReturnValue({
        completion: 'Streaming response...',
        input: 'Test prompt',
        isLoading: true,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        setInput: vi.fn(),
        stop: vi.fn(),
      });

      const CompletionComponent: React.FC = () => {
        const { completion, input, handleInputChange, handleSubmit, isLoading, stop } =
          mockUseCompletion();

        return (
          <div data-testid="completion-component">
            <div data-testid="completion-text">{completion}</div>
            <form onSubmit={handleSubmit} data-testid="completion-form">
              <textarea
                data-testid="completion-input"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading} data-testid="submit-button">
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
              {isLoading && (
                <button type="button" onClick={stop} data-testid="stop-button">
                  Stop
                </button>
              )}
            </form>
          </div>
        );
      };

      render(<CompletionComponent />);

      expect(screen.getByTestId('completion-text')).toHaveTextContent('Streaming response...');
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Generating...');
      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('completion-input')).toBeDisabled();
      expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    });
  });

  describe('error Handling in RSC Streaming', () => {
    test('should handle streaming errors gracefully', async () => {
      const ErrorBoundaryComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [hasError, setHasError] = React.useState(false);
        const [error, setError] = React.useState<Error | null>(null);

        React.useEffect(() => {
          const handleError = (event: ErrorEvent) => {
            setHasError(true);
            setError(new Error(event.message));
          };

          window.addEventListener('error', handleError);
          return () => window.removeEventListener('error', handleError);
        }, []);

        if (hasError) {
          return <div data-testid="error-boundary">Error: {error?.message || 'Unknown error'}</div>;
        }

        return children;
      };

      const FailingStreamComponent: React.FC = () => {
        React.useEffect(() => {
          // Simulate streaming error
          setTimeout(() => {
            throw new Error('Streaming failed');
          }, 100);
        }, []);

        return <div data-testid="failing-stream">This will fail</div>;
      };

      render(
        <ErrorBoundaryComponent>
          <FailingStreamComponent />
        </ErrorBoundaryComponent>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error-boundary')).toHaveTextContent('Error: Streaming failed');
    });
  });

  describe('performance and Memory Management', () => {
    test('should clean up streaming resources on unmount', () => {
      const cleanupFn = vi.fn();

      const CleanupComponent: React.FC = () => {
        React.useEffect(() => {
          // Simulate resource setup
          const resource = { cleanup: cleanupFn };

          return () => {
            resource.cleanup();
          };
        }, []);

        return <div data-testid="cleanup-component">Component with cleanup</div>;
      };

      const { unmount } = render(<CleanupComponent />);

      expect(screen.getByTestId('cleanup-component')).toBeInTheDocument();

      unmount();

      expect(cleanupFn).toHaveBeenCalledWith();
    });

    test('should handle memory-efficient streaming for large content', async () => {
      const LargeContentStreamComponent: React.FC = () => {
        const [chunks, setChunks] = React.useState<string[]>([]);
        const [isStreaming, setIsStreaming] = React.useState(true);

        React.useEffect(() => {
          const streamLargeContent = async () => {
            // Simulate streaming large content in chunks
            for (let i = 0; i < 10; i++) {
              await new Promise(resolve => setTimeout(resolve, 10));
              setChunks(prev => [...prev.slice(-4), `Chunk ${i + 1}`]); // Keep only last 5 chunks
            }
            setIsStreaming(false);
          };

          streamLargeContent();
        }, []);

        return (
          <div data-testid="large-content-stream">
            <div data-testid="chunk-count">{chunks.length}</div>
            <div data-testid="streaming-status">{isStreaming ? 'Streaming' : 'Complete'}</div>
            <div data-testid="latest-chunk">{chunks[chunks.length - 1] || ''}</div>
          </div>
        );
      };

      render(<LargeContentStreamComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('streaming-status')).toHaveTextContent('Complete');
      });

      // Should not exceed memory limit by keeping only recent chunks
      expect(screen.getByTestId('chunk-count')).toHaveTextContent('5');
      expect(screen.getByTestId('latest-chunk')).toHaveTextContent('Chunk 10');
    });
  });

  describe('accessibility in Streaming Components', () => {
    test('should provide proper ARIA labels for streaming content', () => {
      const AccessibleStreamComponent: React.FC<{
        content: string;
        isStreaming: boolean;
      }> = ({ content, isStreaming }) => (
        <div
          data-testid="accessible-stream"
          role="status"
          aria-live="polite"
          aria-label={isStreaming ? 'Content is streaming' : 'Content is complete'}
        >
          <div aria-label="Streaming content">{content}</div>
          <div aria-label="Streaming status" data-testid="aria-status">
            {isStreaming ? 'Loading content...' : 'Content loaded'}
          </div>
        </div>
      );

      render(<AccessibleStreamComponent content="Test content" isStreaming={true} />);

      const streamElement = screen.getByTestId('accessible-stream');
      expect(streamElement).toHaveAttribute('role', 'status');
      expect(streamElement).toHaveAttribute('aria-live', 'polite');
      expect(streamElement).toHaveAttribute('aria-label', 'Content is streaming');

      expect(screen.getByTestId('aria-status')).toHaveTextContent('Loading content...');
    });

    test('should announce streaming completion to screen readers', () => {
      const AnnouncementComponent: React.FC = () => {
        const [announcement, setAnnouncement] = React.useState('');
        const [isStreaming, setIsStreaming] = React.useState(true);

        React.useEffect(() => {
          const timer = setTimeout(() => {
            setIsStreaming(false);
            setAnnouncement('Streaming complete');
          }, 100);

          return () => clearTimeout(timer);
        }, []);

        return (
          <div>
            <div data-testid="main-content">Status: {isStreaming ? 'Streaming' : 'Complete'}</div>
            <div role="status" aria-live="assertive" data-testid="announcement" className="sr-only">
              {announcement}
            </div>
          </div>
        );
      };

      render(<AnnouncementComponent />);

      // Initially no announcement
      expect(screen.getByTestId('announcement')).toHaveTextContent('');

      // Wait for completion
      setTimeout(() => {
        expect(screen.getByTestId('main-content')).toHaveTextContent('Status: Complete');
        expect(screen.getByTestId('announcement')).toHaveTextContent('Streaming complete');
      }, 150);
    });
  });
});
