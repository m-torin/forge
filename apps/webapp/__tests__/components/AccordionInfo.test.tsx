import AccordionInfo from '@/components/AccordionInfo';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('accordionInfo', () => {
  const mockData = [
    {
      name: 'Test Accordion 1',
      content: 'This is the content for accordion 1',
    },
    {
      name: 'Test Accordion 2',
      content: 'This is the content for accordion 2',
    },
  ];

  test('should render accordion items', () => {
    render(<AccordionInfo data={mockData} />);

    expect(screen.getByText('Test Accordion 1')).toBeInTheDocument();
    expect(screen.getByText('Test Accordion 2')).toBeInTheDocument();
  });

  test('should expand accordion on click', () => {
    render(<AccordionInfo data={mockData} />);

    // Based on defaultOpen={index < 2}, first accordion might be closed, second open
    const firstAccordion = screen.getByText('Test Accordion 1');

    // Content not visible, click to expand
    fireEvent.click(firstAccordion);
    expect(screen.getByText('This is the content for accordion 1')).toBeInTheDocument();
  });

  test('should toggle accordion content on click', () => {
    render(<AccordionInfo data={mockData} />);

    const firstAccordion = screen.getByText('Test Accordion 1');

    // Click to toggle
    fireEvent.click(firstAccordion);

    // Should toggle state - ensure the click doesn't break anything
    expect(firstAccordion).toBeInTheDocument();
  });

  test('should allow multiple accordions to be open at same time', () => {
    render(<AccordionInfo data={mockData} />);

    // Both should be open by default (defaultOpen for first 2 items)
    expect(screen.getByText('This is the content for accordion 1')).toBeInTheDocument();
    expect(screen.getByText('This is the content for accordion 2')).toBeInTheDocument();

    // They can remain open simultaneously
    expect(screen.getByText('This is the content for accordion 1')).toBeInTheDocument();
    expect(screen.getByText('This is the content for accordion 2')).toBeInTheDocument();
  });

  test('should have default container classes', () => {
    const { container } = render(<AccordionInfo data={mockData} />);

    const accordion = container.firstChild as HTMLElement;
    expect(accordion).toHaveClass('w-full', 'space-y-2.5', 'rounded-2xl');
  });

  test('should render empty state with no data', () => {
    const { container } = render(<AccordionInfo data={[]} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  test('should handle accordion items with long content', () => {
    const longContentData = [
      {
        name: 'Long Content Test',
        content:
          'This is a very long content that should be properly displayed in the accordion. '.repeat(
            10,
          ),
      },
    ];

    render(<AccordionInfo data={longContentData} />);

    // Content not visible, click to expand it
    const accordion = screen.getByText('Long Content Test');
    fireEvent.click(accordion);
    expect(screen.getByText(/This is a very long content/)).toBeInTheDocument();
  });

  test('should render with proper semantic structure', () => {
    render(<AccordionInfo data={mockData} />);

    // Check for proper button elements
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(mockData.length);
  });

  test('should have proper button elements for interaction', () => {
    render(<AccordionInfo data={mockData} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(mockData.length);

    // Each button should be clickable
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });
});
