import { describe, expect, it } from 'vitest';

import { createRender, screen } from '../setup';

import { Thread } from '../../components/thread';

// Create a custom render function that can be extended with providers if needed
const customRender = createRender();

describe('Thread Component', () => {
  it('renders children correctly', () => {
    customRender(
      <Thread>
        <div data-testid="child-element">Child content</div>
      </Thread>,
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    customRender(
      <Thread data-testid="thread">
        <div>Content</div>
      </Thread>,
    );

    const threadElement = screen.getByTestId('thread');
    expect(threadElement).toHaveClass('flex');
    expect(threadElement).toHaveClass('flex-1');
    expect(threadElement).toHaveClass('flex-col');
    expect(threadElement).toHaveClass('items-start');
    expect(threadElement).toHaveClass('gap-4');
    expect(threadElement).toHaveClass('overflow-y-auto');
    expect(threadElement).toHaveClass('p-8');
    expect(threadElement).toHaveClass('pb-0');
  });

  it('merges custom className with default styles', () => {
    customRender(
      <Thread data-testid="thread" className="custom-class">
        <div>Content</div>
      </Thread>,
    );

    const threadElement = screen.getByTestId('thread');
    expect(threadElement).toHaveClass('custom-class');
    expect(threadElement).toHaveClass('flex');
    expect(threadElement).toHaveClass('flex-1');
  });

  it('passes additional props to the div element', () => {
    customRender(
      <Thread data-testid="thread" id="chat-thread" aria-label="Chat thread">
        <div>Content</div>
      </Thread>,
    );

    const threadElement = screen.getByTestId('thread');
    expect(threadElement).toHaveAttribute('aria-label', 'Chat thread');
    expect(threadElement).toHaveAttribute('id', 'chat-thread');
  });
});
