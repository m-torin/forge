import { ChatHeader } from '#/components/chat-header';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock dependencies
vi.mock('#/components/model-selector', () => ({
  ModelSelector: ({
    selectedModel,
    onModelSelect,
  }: {
    selectedModel: string;
    onModelSelect: (model: string) => void;
  }) => (
    <div data-testid="model-selector">
      <button onClick={() => onModelSelect('gpt-4o')}>Change to GPT-4o</button>
      <span>Selected: {selectedModel}</span>
    </div>
  ),
}));

vi.mock('#/components/visibility-selector', () => ({
  VisibilitySelector: ({ selectedVisibilityType }: { selectedVisibilityType: string }) => (
    <div data-testid="visibility-selector">
      <span>Visibility: {selectedVisibilityType}</span>
    </div>
  ),
}));

vi.mock('#/components/chat-actions', () => ({
  ChatActions: ({ chatId, isReadonly }: { chatId: string; isReadonly: boolean }) => (
    <div data-testid="chat-actions">
      <span>Chat ID: {chatId}</span>
      <span>Readonly: {isReadonly.toString()}</span>
    </div>
  ),
}));

vi.mock('#/components/user-menu', () => ({
  UserMenu: ({ session }: { session: any }) => (
    <div data-testid="user-menu">
      <span>User: {session.user.name}</span>
    </div>
  ),
}));

describe('chatHeader Component', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      type: 'regular' as const,
    },
    expires: '2024-12-31T23:59:59.999Z',
  };

  const defaultProps = {
    chatId: 'test-chat-id',
    selectedModelId: 'chat-model',
    selectedVisibilityType: 'private' as const,
    isReadonly: false,
    session: mockSession,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render all header components', () => {
    render(<ChatHeader {...defaultProps} />);

    expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    expect(screen.getByTestId('visibility-selector')).toBeInTheDocument();
    expect(screen.getByTestId('chat-actions')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  test('should display correct selected model', () => {
    render(<ChatHeader {...defaultProps} selectedModelId="gpt-4o" />);

    expect(screen.getByText('Selected: gpt-4o')).toBeInTheDocument();
  });

  test('should display correct visibility type', () => {
    render(<ChatHeader {...defaultProps} selectedVisibilityType="public" />);

    expect(screen.getByText('Visibility: public')).toBeInTheDocument();
  });

  test('should display readonly status', () => {
    render(<ChatHeader {...defaultProps} isReadonly={true} />);

    expect(screen.getByText('Readonly: true')).toBeInTheDocument();
  });

  test('should display user information', () => {
    render(<ChatHeader {...defaultProps} />);

    expect(screen.getByText('User: Test User')).toBeInTheDocument();
  });

  test('should handle model selection callback', () => {
    const mockOnModelSelect = vi.fn();

    render(<ChatHeader {...defaultProps} onModelSelect={mockOnModelSelect} />);

    fireEvent.click(screen.getByText('Change to GPT-4o'));

    expect(mockOnModelSelect).toHaveBeenCalledWith('gpt-4o');
  });

  test('should handle missing onModelSelect callback gracefully', () => {
    render(<ChatHeader {...defaultProps} />);

    // Should not throw when clicking the model selector button
    expect(() => {
      fireEvent.click(screen.getByText('Change to GPT-4o'));
    }).not.toThrow();
  });

  test('should display correct chat ID', () => {
    render(<ChatHeader {...defaultProps} chatId="custom-chat-id" />);

    expect(screen.getByText('Chat ID: custom-chat-id')).toBeInTheDocument();
  });

  test('should handle different session types', () => {
    const guestSession = {
      user: {
        id: 'guest-user-id',
        name: 'Guest User',
        email: 'guest@example.com',
        type: 'guest' as const,
      },
      expires: '2024-12-31T23:59:59.999Z',
    };

    render(<ChatHeader {...defaultProps} session={guestSession} />);

    expect(screen.getByText('User: Guest User')).toBeInTheDocument();
  });
});
