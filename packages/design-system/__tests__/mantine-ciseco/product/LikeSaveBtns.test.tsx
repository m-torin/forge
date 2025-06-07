import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import LikeSaveBtns from '../../../mantine-ciseco/components/LikeSaveBtns';

describe('LikeSaveBtns', () => {
  it('renders both share and save buttons', () => {
    render(<LikeSaveBtns />);

    expect(screen.getByLabelText('Share')).toBeInTheDocument();
    expect(screen.getByLabelText('Save')).toBeInTheDocument();
  });

  it('shows share button with text', () => {
    render(<LikeSaveBtns />);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('shows save button with text', () => {
    render(<LikeSaveBtns />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('handles save button toggle', () => {
    render(<LikeSaveBtns />);

    const saveButton = screen.getByLabelText('Save');
    expect(saveButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(saveButton);
    expect(saveButton).toHaveAttribute('aria-pressed', 'true');
    expect(saveButton).toHaveAttribute('aria-label', 'Remove from saved');

    fireEvent.click(saveButton);
    expect(saveButton).toHaveAttribute('aria-pressed', 'false');
    expect(saveButton).toHaveAttribute('aria-label', 'Save');
  });

  it('shows different icons for save states', () => {
    render(<LikeSaveBtns />);

    const saveButton = screen.getByLabelText('Save');
    const saveIcon = saveButton.querySelector('svg');

    // Initially not filled
    expect(saveIcon).toHaveAttribute('fill', 'none');

    fireEvent.click(saveButton);

    // After clicking, should be filled
    expect(saveIcon).toHaveAttribute('fill', 'currentColor');
  });

  it('renders with proper button structure', () => {
    render(<LikeSaveBtns />);

    const container = screen.getByLabelText('Share').closest('.flow-root');
    expect(container).toBeInTheDocument();

    const buttonsContainer = container?.querySelector('.flex');
    expect(buttonsContainer).toHaveClass('text-neutral-700', 'dark:text-neutral-300');
  });

  it('both buttons have proper hover styles', () => {
    render(<LikeSaveBtns />);

    const shareButton = screen.getByLabelText('Share');
    const saveButton = screen.getByLabelText('Save');

    expect(shareButton).toHaveClass('hover:bg-neutral-100', 'dark:hover:bg-neutral-800');
    expect(saveButton).toHaveClass('hover:bg-neutral-100', 'dark:hover:bg-neutral-800');
  });

  it('both buttons are type button', () => {
    render(<LikeSaveBtns />);

    const shareButton = screen.getByLabelText('Share');
    const saveButton = screen.getByLabelText('Save');

    expect(shareButton).toHaveAttribute('type', 'button');
    expect(saveButton).toHaveAttribute('type', 'button');
  });

  it('renders SVG icons correctly', () => {
    render(<LikeSaveBtns />);

    const shareButton = screen.getByLabelText('Share');
    const saveButton = screen.getByLabelText('Save');

    const shareIcon = shareButton.querySelector('svg');
    const saveIcon = saveButton.querySelector('svg');

    expect(shareIcon).toHaveAttribute('aria-hidden', 'true');
    expect(shareIcon).toHaveClass('h-5', 'w-5');

    expect(saveIcon).toHaveAttribute('aria-hidden', 'true');
    expect(saveIcon).toHaveClass('h-5', 'w-5');
  });

  it('shows responsive text visibility', () => {
    render(<LikeSaveBtns />);

    const shareText = screen.getByText('Share');
    const saveText = screen.getByText('Save');

    expect(shareText).toHaveClass('hidden', 'sm:block', 'ml-2');
    expect(saveText).toHaveClass('hidden', 'sm:block', 'ml-2');
  });
});
