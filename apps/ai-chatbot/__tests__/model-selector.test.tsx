import { ModelSelector } from '#/components/model-selector';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the provider
vi.mock('#/lib/ai/providers', () => ({
  myProvider: {
    getAvailableModels: vi.fn(),
  },
}));

const mockGetAvailableModels = vi.mocked(
  (await import('#/lib/ai/providers')).myProvider.getAvailableModels,
);

describe('modelSelector Component', () => {
  const mockOnModelSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render with available models', () => {
    const mockModels = [
      {
        id: 'chat-model',
        name: 'Grok Vision',
        provider: 'xAI',
        description: 'Multimodal chat model',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Most capable model',
      },
    ];

    mockGetAvailableModels.mockReturnValue(mockModels);

    render(<ModelSelector selectedModel="chat-model" onModelSelect={mockOnModelSelect} />);

    expect(screen.getByText('Grok Vision')).toBeInTheDocument();
    expect(screen.getByText('(xAI)')).toBeInTheDocument();
  });

  test('should show "No models available" when no models are available', () => {
    mockGetAvailableModels.mockReturnValue([]);

    render(<ModelSelector selectedModel="" onModelSelect={mockOnModelSelect} />);

    expect(screen.getByText('No models available')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should call onModelSelect when a model is selected', () => {
    const mockModels = [
      {
        id: 'chat-model',
        name: 'Grok Vision',
        provider: 'xAI',
        description: 'Multimodal chat model',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Most capable model',
      },
    ];

    mockGetAvailableModels.mockReturnValue(mockModels);

    render(<ModelSelector selectedModel="chat-model" onModelSelect={mockOnModelSelect} />);

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click on GPT-4o option
    fireEvent.click(screen.getByText('GPT-4o'));

    expect(mockOnModelSelect).toHaveBeenCalledWith('gpt-4o');
  });

  test('should display provider information for each model', () => {
    const mockModels = [
      {
        id: 'chat-model',
        name: 'Grok Vision',
        provider: 'xAI',
        description: 'Multimodal chat model',
      },
      {
        id: 'claude-sonnet',
        name: 'Claude Sonnet',
        provider: 'Anthropic',
        description: 'Balanced performance',
      },
    ];

    mockGetAvailableModels.mockReturnValue(mockModels);

    render(<ModelSelector selectedModel="chat-model" onModelSelect={mockOnModelSelect} />);

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('(xAI)')).toBeInTheDocument();
    expect(screen.getByText('(Anthropic)')).toBeInTheDocument();
  });

  test('should display model descriptions', () => {
    const mockModels = [
      {
        id: 'chat-model',
        name: 'Grok Vision',
        provider: 'xAI',
        description: 'Multimodal chat model',
      },
    ];

    mockGetAvailableModels.mockReturnValue(mockModels);

    render(<ModelSelector selectedModel="chat-model" onModelSelect={mockOnModelSelect} />);

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Multimodal chat model')).toBeInTheDocument();
  });

  test('should handle fallback when selected model is not available', () => {
    const mockModels = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Most capable model',
      },
    ];

    mockGetAvailableModels.mockReturnValue(mockModels);

    render(
      <ModelSelector
        selectedModel="chat-model" // This model is not in the available list
        onModelSelect={mockOnModelSelect}
      />,
    );

    // Should show the first available model as current
    expect(screen.getByText('GPT-4o')).toBeInTheDocument();
    expect(screen.getByText('(OpenAI)')).toBeInTheDocument();
  });
});
