import Heading from '@/components/Heading/Heading';
import { render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

describe('heading', () => {
  test('should render heading with text', () => {
    render(<Heading>Test Heading</Heading>);

    const heading = screen.getByText('Test Heading');
    expect(heading).toBeInTheDocument();
  });

  test('should render as h2 by default', () => {
    render(<Heading>Main Title</Heading>);

    const heading = screen.getByRole('heading');
    expect(heading.tagName).toBe('H2');
  });

  test('should render different heading levels', () => {
    render(<Heading level="h1">Primary Title</Heading>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.tagName).toBe('H1');
  });

  test('should apply custom className', () => {
    const { container } = render(<Heading className="custom-heading">Styled Heading</Heading>);

    // The className is applied to the root div
    const rootDiv = container.querySelector('div.custom-heading');
    expect(rootDiv).toBeInTheDocument();
  });

  test('should render with different font classes', () => {
    render(<Heading fontClass="text-2xl font-bold">Large Heading</Heading>);

    const heading = screen.getByText('Large Heading');
    expect(heading).toBeInTheDocument();
  });

  test('should render with heading dimension', () => {
    render(<Heading headingDim="Subtitle">Main Heading</Heading>);

    const heading = screen.getByText('Main Heading');
    const subtitle = screen.getByText('Subtitle');

    expect(heading).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  test('should render centered text', () => {
    render(<Heading isCenter>Centered Heading</Heading>);

    const heading = screen.getByText('Centered Heading');
    // The isCenter class is applied to the wrapper, not the heading itself
    const wrapper = heading.closest('div');
    expect(wrapper?.className).toContain('items-center');
  });

  test('should render with description text', () => {
    render(<Heading description="This is a description">Heading with Description</Heading>);

    const heading = screen.getByText('Heading with Description');
    const description = screen.getByText('This is a description');

    expect(heading).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  test('should render with navigation buttons', () => {
    const mockNext = vi.fn();
    const mockPrev = vi.fn();

    render(
      <Heading hasNextPrev onClickNext={mockNext} onClickPrev={mockPrev}>
        Heading with Navigation
      </Heading>,
    );

    const heading = screen.getByText('Heading with Navigation');
    expect(heading).toBeInTheDocument();
  });

  test('should handle disabled navigation buttons', () => {
    render(
      <Heading hasNextPrev nextBtnDisabled prevBtnDisabled>
        Heading with Disabled Navigation
      </Heading>,
    );

    const heading = screen.getByText('Heading with Disabled Navigation');
    expect(heading).toBeInTheDocument();
  });

  test('should render with custom font class', () => {
    render(<Heading fontClass="text-5xl font-black">Custom Font Heading</Heading>);

    const heading = screen.getByText('Custom Font Heading');
    expect(heading).toHaveClass('text-5xl', 'font-black');
  });

  test('should render with heading dimension and description', () => {
    render(
      <Heading headingDim="Subtitle" description="Description text">
        Complete Heading
      </Heading>,
    );

    const heading = screen.getByText('Complete Heading');
    const subtitle = screen.getByText('Subtitle');
    const description = screen.getByText('Description text');

    expect(heading).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  test('should pass through additional props', () => {
    render(
      <Heading data-testid="custom-heading" id="main-title">
        Test Heading
      </Heading>,
    );

    const heading = screen.getByTestId('custom-heading');
    expect(heading).toHaveAttribute('id', 'main-title');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<Heading>Test Heading</Heading>);
    }).not.toThrow();
  });
});
