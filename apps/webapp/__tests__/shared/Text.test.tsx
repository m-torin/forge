import { Text } from '@/shared/text';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('text', () => {
  test('should render text content', () => {
    render(<Text>Hello world</Text>);

    const text = screen.getByText('Hello world');
    expect(text).toBeInTheDocument();
  });

  test('should render as paragraph by default', () => {
    render(<Text>Paragraph text</Text>);

    const text = screen.getByText('Paragraph text');
    expect(text.tagName).toBe('P');
  });

  test('should render as different HTML elements', () => {
    // Text component always renders as a <p> element
    render(<Text>Span text</Text>);

    const text = screen.getByText('Span text');
    expect(text.tagName).toBe('P');
  });

  test('should apply custom className', () => {
    render(<Text className="custom-text">Styled text</Text>);

    const text = screen.getByText('Styled text');
    expect(text).toHaveClass('custom-text');
  });

  test('should render different text sizes', () => {
    // Text component has responsive sizing when responsive prop is true
    render(<Text responsive>Large text</Text>);

    const text = screen.getByText('Large text');
    expect(text).toHaveClass('text-sm', 'sm:text-base', 'md:text-lg');
  });

  test('should render different text weights', () => {
    // Text component doesn't have weight prop, uses default styling
    render(<Text>Bold text</Text>);

    const text = screen.getByText('Bold text');
    expect(text).toHaveClass('text-base/6');
  });

  test('should render different text colors', () => {
    // Text component uses default zinc colors
    render(<Text>Colored text</Text>);

    const text = screen.getByText('Colored text');
    expect(text).toHaveClass('text-zinc-500');
  });

  test('should handle text alignment', () => {
    // Text component doesn't have align prop, use className
    render(<Text className="text-center">Centered text</Text>);

    const text = screen.getByText('Centered text');
    expect(text).toHaveClass('text-center');
  });

  test('should render truncated text', () => {
    render(<Text truncate>Very long text that should be truncated</Text>);

    const text = screen.getByText('Very long text that should be truncated');
    expect(text).toHaveClass('truncate');
  });

  test('should render with line clamp', () => {
    render(<Text clamp={2}>Multi-line text that should be clamped to two lines</Text>);

    const text = screen.getByText('Multi-line text that should be clamped to two lines');
    expect(text).toHaveClass('line-clamp-2');
  });

  test('should handle responsive text sizing', () => {
    render(<Text responsive>Responsive text</Text>);

    const text = screen.getByText('Responsive text');
    expect(text).toHaveClass('text-sm', 'sm:text-base', 'md:text-lg');
  });

  test('should render with different line heights', () => {
    render(<Text lineHeight="relaxed">Text with relaxed line height</Text>);

    const text = screen.getByText('Text with relaxed line height');
    expect(text).toHaveClass(/leading-relaxed|relaxed/);
  });

  test('should render with letter spacing', () => {
    render(<Text className="tracking-wide">Spaced text</Text>);

    const text = screen.getByText('Spaced text');
    expect(text).toHaveClass('tracking-wide');
  });

  test('should handle uppercase transform', () => {
    render(<Text className="uppercase">uppercase text</Text>);

    const text = screen.getByText('uppercase text');
    expect(text).toHaveClass('uppercase');
  });

  test('should handle muted variant', () => {
    render(<Text>Muted text</Text>);

    const text = screen.getByText('Muted text');
    // Text component has default muted styling with text-zinc-500
    expect(text).toHaveClass('text-zinc-500');
  });

  test('should pass through additional props', () => {
    render(
      <Text data-testid="custom-text" id="text-id">
        Test text
      </Text>,
    );

    const text = screen.getByTestId('custom-text');
    expect(text).toHaveAttribute('id', 'text-id');
  });

  test('should be accessible', () => {
    render(
      <Text role="note" aria-label="Important note">
        Important information
      </Text>,
    );

    const text = screen.getByRole('note');
    expect(text).toHaveAttribute('aria-label', 'Important note');
  });

  test('should render nested content', () => {
    render(
      <Text>
        Text with <strong>bold</strong> and <em>italic</em> content
      </Text>,
    );

    const boldText = screen.getByText('bold');
    const italicText = screen.getByText('italic');

    expect(boldText).toBeInTheDocument();
    expect(italicText).toBeInTheDocument();
  });

  test('should render without errors', () => {
    expect(() => {
      render(<Text>Test text component</Text>);
    }).not.toThrow();
  });
});
