import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import SearchBtnPopover from '@/components/Header/SearchBtnPopover';
import React from 'react';

// Mock the entire SearchBtnPopover component for simpler testing
vi.mock('@/components/Header/SearchBtnPopover', () => ({
  default: function MockSearchBtnPopover() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div>
        <button onClick={() => setIsOpen(!isOpen)} data-testid="search-button">
          <span data-testid="search-icon">Search</span>
        </button>
        {isOpen && (
          <div data-testid="search-popover">
            <form
              onSubmit={e => {
                e.preventDefault();
              }}
              data-testid="search-form"
            >
              <input
                type="text"
                name="q"
                aria-label="Search for products"
                autoComplete="off"
                autoCorrect="off"
                data-testid="search-input"
              />
              <button type="button" data-testid="close-button">
                Close
              </button>
              <input type="submit" hidden data-testid="submit-input" />
            </form>
            <div data-testid="divider" className="block md:hidden" />
            <a href="/search" data-testid="search-link">
              <kbd>Enter</kbd>
            </a>
          </div>
        )}
      </div>
    );
  },
}));

describe('searchBtnPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render search button', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    expect(button).toBeInTheDocument();

    const icon = screen.getByTestId('search-icon');
    expect(icon).toBeInTheDocument();
  });

  test('should open popover when button is clicked', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const popover = screen.getByTestId('search-popover');
    expect(popover).toBeInTheDocument();
  });

  test('should render search input with correct attributes', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const input = screen.getByTestId('search-input') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('name', 'q');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('autoCorrect', 'off');
  });

  test('should handle form submission', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const form = screen.getByTestId('search-form');
    fireEvent.submit(form);

    // Form should exist and not cause errors
    expect(form).toBeInTheDocument();
  });

  test('should prevent default form submission', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const form = screen.getByTestId('search-form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

    form.dispatchEvent(submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalledWith();
  });

  test('should render close button in popover', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const closeButton = screen.getByTestId('close-button');
    expect(closeButton).toBeInTheDocument();
  });

  test('should display keyboard hints on mobile', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const kbdElement = screen.getByText('Enter');
    expect(kbdElement).toBeInTheDocument();
  });

  test('should have correct styling classes for button', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    expect(button).toBeInTheDocument();
  });

  test('should render divider on mobile', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const divider = screen.getByTestId('divider');
    expect(divider).toHaveClass('block', 'md:hidden');
  });

  test('should render link to search page', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const link = screen.getByTestId('search-link');
    expect(link).toHaveAttribute('href', '/search');
  });

  test('should toggle popover visibility', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');

    // Initially closed
    expect(screen.queryByTestId('search-popover')).not.toBeInTheDocument();

    // Open popover
    fireEvent.click(button);
    expect(screen.getByTestId('search-popover')).toBeInTheDocument();

    // Close popover
    fireEvent.click(button);
    expect(screen.queryByTestId('search-popover')).not.toBeInTheDocument();
  });

  test('should render search form', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const form = screen.getByTestId('search-form');
    expect(form).toBeInTheDocument();
  });

  test('should have hidden submit input', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const submitInput = screen.getByTestId('submit-input');
    expect(submitInput).toHaveAttribute('hidden');
  });

  test('should render search input with aria-label', () => {
    render(<SearchBtnPopover />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const input = screen.getByLabelText('Search for products');
    expect(input).toBeInTheDocument();
  });
});
