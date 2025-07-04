import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import Heading from '../../../src/mantine-ciseco/components/Heading/Heading';

describe('Heading', (_: any) => {
  it('renders heading with text', (_: any) => {
    render(<Heading>Test Heading</Heading>);
    expect(screen.getByRole('heading')).toHaveTextContent('Test Heading');
  });

  it('renders as h2 by default', (_: any) => {
    render(<Heading>Default Heading</Heading>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.tagName).toBe('H2');
  });

  it('renders with different heading levels', (_: any) => {
    const { rerender } = render(<Heading level="h1">H1 Heading</Heading>);
    expect(screen.getByRole('heading', { level: 1 }).tagName).toBe('H1');

    rerender(<Heading level="h2">H2 Heading</Heading>);
    expect(screen.getByRole('heading', { level: 2 }).tagName).toBe('H2');

    rerender(<Heading level="h3">H3 Heading</Heading>);
    expect(screen.getByRole('heading', { level: 3 }).tagName).toBe('H3');

    rerender(<Heading level="h4">H4 Heading</Heading>);
    expect(screen.getByRole('heading', { level: 4 }).tagName).toBe('H4');

    rerender(<Heading level="h5">H5 Heading</Heading>);
    expect(screen.getByRole('heading', { level: 5 }).tagName).toBe('H5');

    rerender(<Heading level="h6">H6 Heading</Heading>);
    expect(screen.getByRole('heading', { level: 6 }).tagName).toBe('H6');
  });

  it('renders with custom className', (_: any) => {
    const { container } = render(<Heading className="custom-heading">Test</Heading>);
    // The className is applied to the wrapper div
    const wrapper = container.querySelector('.custom-heading');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders with description', (_: any) => {
    render(<Heading description="This is a description">Heading with Description</Heading>);
    expect(screen.getByText('This is a description')).toBeInTheDocument();
    expect(screen.getByText('This is a description')).toHaveClass(
      'text-neutral-500',
      'dark:text-neutral-400',
    );
  });

  it('renders with custom font class', (_: any) => {
    render(<Heading fontClass="text-4xl font-bold">Large Heading</Heading>);
    expect(screen.getByRole('heading')).toHaveClass('text-4xl', 'font-bold');
  });

  it('renders with center alignment', (_: any) => {
    render(<Heading isCenter>Centered Heading</Heading>);
    const container = screen.getByRole('heading').parentElement;
    expect(container).toHaveClass(
      'mx-auto',
      'flex',
      'w-full',
      'flex-col',
      'items-center',
      'text-center',
    );
  });

  it('renders with heading dim', (_: any) => {
    render(<Heading headingDim="dimmed text">Heading with Dim</Heading>);
    expect(screen.getByText('dimmed text')).toHaveClass('text-neutral-400');
  });

  it('renders with next/prev buttons', (_: any) => {
    const onClickNext = () => {};
    const onClickPrev = () => {};
    const { container } = render(
      <Heading hasNextPrev onClickNext={onClickNext} onClickPrev={onClickPrev}>
        Heading with Navigation
      </Heading>,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('disables next/prev buttons', (_: any) => {
    const { container } = render(
      <Heading hasNextPrev nextBtnDisabled prevBtnDisabled>
        Heading with Disabled Navigation
      </Heading>,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('renders children components', (_: any) => {
    render(
      <Heading>
        Text with <strong>bold</strong> and <em>italic</em> parts
      </Heading>,
    );
    const heading = screen.getByRole('heading');
    expect(heading.querySelector('strong')).toHaveTextContent('bold');
    expect(heading.querySelector('em')).toHaveTextContent('italic');
  });
});
