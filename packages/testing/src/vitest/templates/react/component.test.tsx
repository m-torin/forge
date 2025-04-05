/**
 * React Component Test Template
 *
 * This serves as a template for component tests in the codebase.
 * Usage examples:
 * - Generate tests for components using the test generator
 * - Reference for consistent component testing patterns
 */
import React from "react";
// @ts-ignore - Importing from a template file
import { render, screen } from "@repo/testing/vitest";

/**
 * Example component test
 */
describe("ComponentName", () => {
  it("renders correctly", () => {
    // Render the component with test props
    render(<div data-testid="example">Example Component</div>);

    // Assert that the component renders as expected
    // @ts-ignore - Jest-specific assertion methods
    expect(screen.getByTestId("example")).toBeInTheDocument();
    // @ts-ignore - Jest-specific assertion methods
    expect(screen.getByText("Example Component")).toBeVisible();
  });

  it("handles user interactions", () => {
    // Render the component with test props
    render(<button data-testid="button">Click me</button>);

    // Interact with the component
    const button = screen.getByTestId("button");
    button.click();

    // Assert the expected outcome
    // expect(mockHandler).toHaveBeenCalled();
  });

  it("displays the correct state when props change", () => {
    // Render the component with initial props
    const { rerender } = render(<div data-testid="prop-example">Initial</div>);

    // Re-render with updated props
    rerender(<div data-testid="prop-example">Updated</div>);

    // Assert that the component updates as expected
    // @ts-ignore - Jest-specific assertion methods
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });
});

// Sample of a more complex component test
export const complexComponentTest = `
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@repo/testing/vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders the initial state correctly', () => {
    render(<MyComponent initialCount={0} />);

    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increment' })).toBeEnabled();
  });

  it('increments the counter when the button is clicked', async () => {
    render(<MyComponent initialCount={0} />);

    const button = screen.getByRole('button', { name: 'Increment' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });
  });

  it('calls the onChange handler when the counter changes', () => {
    const handleChange = vi.fn();
    render(<MyComponent initialCount={0} onChange={handleChange} />);

    const button = screen.getByRole('button', { name: 'Increment' });
    fireEvent.click(button);

    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
`;
