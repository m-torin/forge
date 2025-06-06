import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import LikeSaveBtns from '../../../mantine-ciseco/components/LikeSaveBtns';

describe('LikeSaveBtns', () => {
  const mockOnLike = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnLike.mockClear();
    mockOnSave.mockClear();
  });

  it('renders both like and save buttons', () => {
    render(<LikeSaveBtns onLike={mockOnLike} onSave={mockOnSave} />);

    expect(screen.getByLabelText('Like')).toBeInTheDocument();
    expect(screen.getByLabelText('Save')).toBeInTheDocument();
  });

  it('handles like button click', () => {
    render(<LikeSaveBtns onLike={mockOnLike} onSave={mockOnSave} />);

    const likeButton = screen.getByLabelText('Like');
    fireEvent.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(true);
  });

  it('handles save button click', () => {
    render(<LikeSaveBtns onLike={mockOnLike} onSave={mockOnSave} />);

    const saveButton = screen.getByLabelText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(true);
  });

  it('shows liked state', () => {
    render(<LikeSaveBtns liked onLike={mockOnLike} onSave={mockOnSave} />);

    const likeButton = screen.getByLabelText('Like');
    expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    expect(likeButton).toHaveClass('liked');
  });

  it('shows saved state', () => {
    render(<LikeSaveBtns saved onLike={mockOnLike} onSave={mockOnSave} />);

    const saveButton = screen.getByLabelText('Save');
    expect(saveButton).toHaveAttribute('aria-pressed', 'true');
    expect(saveButton).toHaveClass('saved');
  });

  it('displays like count', () => {
    render(<LikeSaveBtns likeCount={42} showCounts onLike={mockOnLike} onSave={mockOnSave} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays save count', () => {
    render(<LikeSaveBtns saveCount={15} showCounts onLike={mockOnLike} onSave={mockOnSave} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LikeSaveBtns size="sm" onLike={mockOnLike} onSave={mockOnSave} />);
    expect(screen.getByLabelText('Like')).toHaveClass('size-sm');

    rerender(<LikeSaveBtns size="lg" onLike={mockOnLike} onSave={mockOnSave} />);
    expect(screen.getByLabelText('Like')).toHaveClass('size-lg');
  });

  it('handles disabled state', () => {
    render(<LikeSaveBtns disabled onLike={mockOnLike} onSave={mockOnSave} />);

    const likeButton = screen.getByLabelText('Like');
    const saveButton = screen.getByLabelText('Save');

    expect(likeButton).toBeDisabled();
    expect(saveButton).toBeDisabled();

    fireEvent.click(likeButton);
    fireEvent.click(saveButton);

    expect(mockOnLike).not.toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('renders with custom className', () => {
    render(<LikeSaveBtns className="custom-buttons" onLike={mockOnLike} onSave={mockOnSave} />);
    const container = screen.getByLabelText('Like').parentElement;
    expect(container).toHaveClass('custom-buttons');
  });

  it('supports vertical layout', () => {
    render(<LikeSaveBtns vertical onLike={mockOnLike} onSave={mockOnSave} />);
    const container = screen.getByLabelText('Like').parentElement;
    expect(container).toHaveClass('flex-col');
  });

  it('shows tooltips on hover', async () => {
    render(<LikeSaveBtns showTooltips onLike={mockOnLike} onSave={mockOnSave} />);

    const likeButton = screen.getByLabelText('Like');
    fireEvent.mouseEnter(likeButton);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Like this item');
    });
  });
});
