import { Chat } from '#/components/chat';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock dependencies
vi.mock('#/hooks/use-chat-visibility', () => ({
  useChatVisibility: () => ({
    visibilityType: 'private',
  }),
}));

vi.mock('#/hooks/use-artifact', () => ({
  useArtifactSelector: () => ({
    isVisible: false,
  }),
}));

vi.mock('#/hooks/use-auto-resume', () => ({
  useAutoResume: vi.fn(),
}));

vi.mock('#/components/data-stream-provider', () => ({
  useDataStream: () => ({
    setDataStream: vi.fn(),
  }),
}));

vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    setMessages: vi.fn(),
    sendMessage: vi.fn(),
    status: 'idle',
    stop: vi.fn(),
    regenerate: vi.fn(),
    resumeStream: vi.fn(),
  }),
}));

vi.mock('swr', () => ({
  default: () => ({
    data: [],
    mutate: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

vi.mock('#/components/chat-header', () => ({
  ChatHeader: ({ onModelSelect }: { onModelSelect?: (model: string) => void }) => (
    <div data-testid="chat-header">
      <button onClick={() => onModelSelect?.('gpt-4o')}>Change Model</button>
    </div>
  ),
}));

vi.mock('#/components/messages', () => ({
  Messages: () => <div data-testid="messages">Messages</div>,
}));

vi.mock('#/components/multimodal-input', () => ({
  MultimodalInput: () => <div data-testid="multimodal-input">Input</div>,
}));

vi.mock('#/components/artifact', () => ({
  Artifact: () => <div data-testid="artifact">Artifact</div>,
}));

describe('chat Integration', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      type: 'regular' as const,
    },
    expires: '2024-12-31T23:59:59.999Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render chat component with model selection', () => {
    render(
      <Chat
        id="test-chat-id"
        initialMessages={[]}
        initialChatModel="chat-model"
        initialVisibilityType="private"
        isReadonly={false}
        session={mockSession}
        autoResume={false}
      />,
    );

    expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    expect(screen.getByTestId('messages')).toBeInTheDocument();
    expect(screen.getByTestId('multimodal-input')).toBeInTheDocument();
    expect(screen.getByTestId('artifact')).toBeInTheDocument();
  });

  test('should handle model selection', async () => {
    const { rerender } = render(
      <Chat
        id="test-chat-id"
        initialMessages={[]}
        initialChatModel="chat-model"
        initialVisibilityType="private"
        isReadonly={false}
        session={mockSession}
        autoResume={false}
      />,
    );

    // Simulate model change
    fireEvent.click(screen.getByText('Change Model'));

    // Re-render with new model
    rerender(
      <Chat
        id="test-chat-id"
        initialMessages={[]}
        initialChatModel="gpt-4o"
        initialVisibilityType="private"
        isReadonly={false}
        session={mockSession}
        autoResume={false}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    });
  });

  test('should render in readonly mode', () => {
    render(
      <Chat
        id="test-chat-id"
        initialMessages={[]}
        initialChatModel="chat-model"
        initialVisibilityType="private"
        isReadonly={true}
        session={mockSession}
        autoResume={false}
      />,
    );

    expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    expect(screen.getByTestId('messages')).toBeInTheDocument();
    // Should not render input in readonly mode
    expect(screen.queryByTestId('multimodal-input')).not.toBeInTheDocument();
  });
});
