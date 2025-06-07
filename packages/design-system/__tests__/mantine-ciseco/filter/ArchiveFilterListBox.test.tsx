import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import ArchiveFilterListBox from '../../../mantine-ciseco/components/ArchiveFilterListBox';

describe('ArchiveFilterListBox', () => {
  const defaultOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Books', value: 'books' },
    { label: 'Home & Garden', value: 'home-garden' },
  ];

  it('renders filter listbox with options', async () => {
    render(<ArchiveFilterListBox options={defaultOptions} />);

    // Click the input to open the dropdown
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    fireEvent.click(input);

    // Wait for options to appear
    await waitFor(() => {
      defaultOptions.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  it('handles option selection', async () => {
    const mockOnChange = vi.fn();
    render(<ArchiveFilterListBox options={defaultOptions} onChange={mockOnChange} />);

    // Open dropdown first
    const input = screen.getByRole('textbox');
    fireEvent.click(input);

    // Wait for options to appear and click one
    await waitFor(() => {
      const electronicsOption = screen.getByText('Electronics');
      fireEvent.click(electronicsOption);
    });

    expect(mockOnChange).toHaveBeenCalledWith('electronics');
  });

  it('shows selected option', async () => {
    render(<ArchiveFilterListBox options={defaultOptions} value="electronics" />);

    // Check that the input shows the selected value
    const input = screen.getByRole('textbox');

    // Open dropdown to see selected state
    fireEvent.click(input);

    await waitFor(() => {
      const selectedOption = screen.getByRole('option', { name: 'Electronics' });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('supports multi-select mode', () => {
    const mockOnChange = vi.fn();
    render(
      <ArchiveFilterListBox
        options={defaultOptions}
        multiple
        value={['electronics', 'clothing']}
        onChange={mockOnChange}
      />,
    );

    const electronicsOption = screen.getByText('Electronics');
    const clothingOption = screen.getByText('Clothing');

    expect(electronicsOption).toHaveClass('selected');
    expect(clothingOption).toHaveClass('selected');

    // Clicking already selected item should deselect it
    fireEvent.click(electronicsOption);
    expect(mockOnChange).toHaveBeenCalledWith(['clothing']);
  });

  it('filters options based on search', async () => {
    render(<ArchiveFilterListBox options={defaultOptions} searchable />);

    const searchInput = screen.getByPlaceholderText('Search categories...');
    fireEvent.change(searchInput, { target: { value: 'elect' } });

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.queryByText('Clothing')).not.toBeInTheDocument();
    });
  });

  it('shows option counts when provided', () => {
    const optionsWithCounts = [
      { label: 'Electronics', value: 'electronics', count: 150 },
      { label: 'Clothing', value: 'clothing', count: 89 },
      { label: 'Books', value: 'books', count: 45 },
    ];

    render(<ArchiveFilterListBox options={optionsWithCounts} showCounts />);

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('groups options by category', () => {
    const groupedOptions = [
      {
        group: 'Physical Products',
        options: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
        ],
      },
      {
        group: 'Digital Products',
        options: [
          { label: 'E-books', value: 'ebooks' },
          { label: 'Software', value: 'software' },
        ],
      },
    ];

    render(<ArchiveFilterListBox groupedOptions={groupedOptions} />);

    expect(screen.getByText('Physical Products')).toBeInTheDocument();
    expect(screen.getByText('Digital Products')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('E-books')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<ArchiveFilterListBox options={defaultOptions} />);

    const listbox = screen.getByRole('listbox');
    listbox.focus();

    // Arrow down to navigate
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    expect(screen.getByText('All Categories')).toHaveClass('highlighted');

    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    expect(screen.getByText('Electronics')).toHaveClass('highlighted');

    // Enter to select
    fireEvent.keyDown(listbox, { key: 'Enter' });
    expect(screen.getByText('Electronics')).toHaveClass('selected');
  });

  it('supports disabled state', () => {
    render(<ArchiveFilterListBox options={defaultOptions} disabled />);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-disabled', 'true');

    const firstOption = screen.getByText('All Categories');
    fireEvent.click(firstOption);

    // Should not respond to clicks when disabled
    expect(firstOption).not.toHaveClass('selected');
  });

  it('shows loading state', () => {
    render(<ArchiveFilterListBox options={[]} loading />);

    expect(screen.getByTestId('filter-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading filters...')).toBeInTheDocument();
  });

  it('displays empty state', () => {
    render(<ArchiveFilterListBox options={[]} />);

    expect(screen.getByText('No categories available')).toBeInTheDocument();
  });

  it('renders with custom icons', () => {
    const optionsWithIcons = [
      { label: 'Electronics', value: 'electronics', icon: '📱' },
      { label: 'Clothing', value: 'clothing', icon: '👕' },
    ];

    render(<ArchiveFilterListBox options={optionsWithIcons} />);

    expect(screen.getByText('📱')).toBeInTheDocument();
    expect(screen.getByText('👕')).toBeInTheDocument();
  });

  it('supports clear all functionality', () => {
    const mockOnChange = vi.fn();
    render(
      <ArchiveFilterListBox
        options={defaultOptions}
        multiple
        value={['electronics', 'clothing']}
        onChange={mockOnChange}
        clearable
      />,
    );

    const clearButton = screen.getByLabelText('Clear all selections');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('renders with custom className', () => {
    render(<ArchiveFilterListBox options={defaultOptions} className="custom-filter" />);
    const listbox = screen.getByRole('listbox');
    expect(listbox.parentElement).toHaveClass('custom-filter');
  });

  it('shows filter summary', () => {
    render(
      <ArchiveFilterListBox
        options={defaultOptions}
        multiple
        value={['electronics', 'clothing']}
        showSummary
      />,
    );

    expect(screen.getByText('2 categories selected')).toBeInTheDocument();
  });

  it('supports hierarchical options', () => {
    const hierarchicalOptions = [
      {
        label: 'Electronics',
        value: 'electronics',
        children: [
          { label: 'Phones', value: 'phones' },
          { label: 'Laptops', value: 'laptops' },
        ],
      },
    ];

    render(<ArchiveFilterListBox options={hierarchicalOptions} hierarchical />);

    const electronicsOption = screen.getByText('Electronics');
    fireEvent.click(electronicsOption);

    expect(screen.getByText('Phones')).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
  });

  it('handles option descriptions', () => {
    const optionsWithDescriptions = [
      {
        label: 'Electronics',
        value: 'electronics',
        description: 'Phones, laptops, and gadgets',
      },
    ];

    render(<ArchiveFilterListBox options={optionsWithDescriptions} showDescriptions />);

    expect(screen.getByText('Phones, laptops, and gadgets')).toBeInTheDocument();
  });
});
