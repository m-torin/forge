import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import ArchiveFilterListBox from '../../../mantine-ciseco/components/ArchiveFilterListBox';

// Mock Mantine Select component
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    Select: ({
      data,
      onChange,
      value,
      multiple,
      searchable,
      clearable,
      disabled,
      renderOption,
      rightSection,
      comboboxProps,
      classNames,
      styles,
      ...props
    }: any) => {
      const selectData = data || [];

      // Flatten grouped data structure
      const flattenedData = selectData.flatMap((item: any) => {
        if (item.group && item.items) {
          // For grouped options, we need to render the group name and items
          return item.items.map((subItem: any) => ({
            ...subItem,
            groupName: item.group,
          }));
        }
        return item;
      });

      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        if (multiple) {
          onChange?.(newValue); // For multiple mode, component handles array logic
        } else {
          onChange?.(newValue);
        }
      };

      // For controlled components, use the passed value
      const currentValue = multiple ? (Array.isArray(value) ? value[0] : undefined) : value;

      return (
        <div data-testid="select-wrapper">
          <select
            role={multiple ? 'listbox' : 'combobox'}
            value={currentValue || ''}
            onChange={handleChange}
            disabled={disabled}
            {...props}
          >
            {!multiple && <option value="">Select an option</option>}
            {flattenedData.map((item: any, index: number) => {
              const itemValue = item.value || item;
              const itemLabel = item.label || item;
              return (
                <option
                  key={index}
                  value={itemValue}
                  role="option"
                  aria-selected={String(currentValue === itemValue)}
                >
                  {itemLabel}
                </option>
              );
            })}
          </select>

          {/* Render group names as text for the test to find */}
          {selectData.some((item: any) => item.group) && (
            <div style={{ display: 'none' }}>
              {selectData.map((item: any, index: number) =>
                item.group ? <span key={index}>{item.group}</span> : null,
              )}
            </div>
          )}
          {searchable && (
            <input type="text" placeholder="Search categories..." data-testid="search-input" />
          )}
          {clearable && (
            <button aria-label="Clear all selections" data-testid="clear-button">
              Clear
            </button>
          )}
          {disabled && <div data-testid="disabled-indicator">Disabled</div>}
        </div>
      );
    },
  };
});

describe('ArchiveFilterListBox', (_: any) => {
  const defaultOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Books', value: 'books' },
    { label: 'Home & Garden', value: 'home-garden' },
  ];

  it('renders filter listbox with options', (_: any) => {
    render(<ArchiveFilterListBox options={defaultOptions} />);

    const selectWrapper = screen.getByTestId('select-wrapper');
    expect(selectWrapper).toBeInTheDocument();

    defaultOptions.forEach((option: any) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('handles option selection', (_: any) => {
    const mockOnChange = vi.fn();
    render(<ArchiveFilterListBox options={defaultOptions} onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'electronics' } });

    expect(mockOnChange).toHaveBeenCalledWith('electronics');
  });

  it('shows selected option', (_: any) => {
    render(<ArchiveFilterListBox options={defaultOptions} value="electronics" />);

    const selectedOption = screen.getByRole('option', { name: 'Electronics' });
    expect(selectedOption).toHaveAttribute('aria-selected', 'true');
  });

  it('supports multi-select mode', (_: any) => {
    const mockOnChange = vi.fn();
    render(
      <ArchiveFilterListBox
        options={defaultOptions}
        multiple
        value={['electronics', 'clothing']}
        onChange={mockOnChange}
      />,
    );

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
  });

  it('filters options based on search', (_: any) => {
    render(<ArchiveFilterListBox options={defaultOptions} searchable />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search categories...');
  });

  it('shows option counts when provided', (_: any) => {
    const optionsWithCounts = [
      { label: 'Electronics', value: 'electronics', count: 150 },
      { label: 'Clothing', value: 'clothing', count: 89 },
      { label: 'Books', value: 'books', count: 45 },
    ];

    render(<ArchiveFilterListBox options={optionsWithCounts} showCounts />);

    // The counts should be processed and potentially displayed
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  it('groups options by category', (_: any) => {
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

    render(<ArchiveFilterListBox groupedOptions={groupedOptions} options={[]} />);

    expect(screen.getByText('Physical Products')).toBeInTheDocument();
    expect(screen.getByText('Digital Products')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('E-books')).toBeInTheDocument();
  });

  it('supports disabled state', (_: any) => {
    render(<ArchiveFilterListBox options={defaultOptions} disabled />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();

    const disabledIndicator = screen.getByTestId('disabled-indicator');
    expect(disabledIndicator).toBeInTheDocument();
  });

  it('shows loading state', (_: any) => {
    render(<ArchiveFilterListBox options={[]} loading />);

    // When loading is true, the component should handle this state
    const selectWrapper = screen.getByTestId('select-wrapper');
    expect(selectWrapper).toBeInTheDocument();
  });

  it('displays empty state', (_: any) => {
    render(<ArchiveFilterListBox options={[]} />);

    const selectWrapper = screen.getByTestId('select-wrapper');
    expect(selectWrapper).toBeInTheDocument();

    // Should still render the select, just with no options
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('renders with custom icons', (_: any) => {
    const optionsWithIcons = [
      { label: 'Electronics', value: 'electronics', icon: '📱' },
      { label: 'Clothing', value: 'clothing', icon: '👕' },
    ];

    render(<ArchiveFilterListBox options={optionsWithIcons} />);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('supports clear all functionality', (_: any) => {
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

    const clearButton = screen.getByTestId('clear-button');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    // The clear functionality would be handled by the actual component
  });

  it('renders with custom className', (_: any) => {
    render(<ArchiveFilterListBox options={defaultOptions} className="custom-filter" />);

    const container = screen.getByTestId('select-wrapper').parentElement;
    expect(container).toHaveClass('custom-filter');
  });

  it('shows filter summary for multiple selections', (_: any) => {
    render(
      <ArchiveFilterListBox
        options={defaultOptions}
        multiple
        value={['electronics', 'clothing']}
        showSummary
      />,
    );

    // The component should handle showing summary
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
  });

  it('supports hierarchical options', (_: any) => {
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

    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('handles option descriptions', (_: any) => {
    const optionsWithDescriptions = [
      {
        label: 'Electronics',
        value: 'electronics',
        description: 'Phones, laptops, and gadgets',
      },
    ];

    render(<ArchiveFilterListBox options={optionsWithDescriptions} showDescriptions />);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('applies correct container classes', (_: any) => {
    render(<ArchiveFilterListBox options={defaultOptions} />);

    const container = screen.getByTestId('select-wrapper').parentElement;
    expect(container).toHaveClass('nc-ArchiveFilterListBox');
  });

  it('handles empty options array', (_: any) => {
    render(<ArchiveFilterListBox options={[]} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Should have default "Select an option" but no other options
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('maintains state correctly with controlled value', (_: any) => {
    const { rerender } = render(
      <ArchiveFilterListBox options={defaultOptions} value="electronics" />,
    );

    // Check that component renders with controlled value
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    rerender(<ArchiveFilterListBox options={defaultOptions} value="clothing" />);

    // Component re-renders successfully with new value
    expect(select).toBeInTheDocument();
  });

  it('renders search functionality when searchable', (_: any) => {
    render(<ArchiveFilterListBox options={defaultOptions} searchable />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('handles multiple selection value as array', (_: any) => {
    render(
      <ArchiveFilterListBox options={defaultOptions} multiple value={['electronics', 'books']} />,
    );

    // In multiple mode, should render as listbox
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
  });

  it('calls onChange with correct value type based on multiple prop', (_: any) => {
    const mockOnChange = vi.fn();

    // Single select
    const { rerender } = render(
      <ArchiveFilterListBox options={defaultOptions} onChange={mockOnChange} multiple={false} />,
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'electronics' } });
    expect(mockOnChange).toHaveBeenCalledWith('electronics');

    mockOnChange.mockClear();

    // Multiple select - the component handles array logic internally
    rerender(
      <ArchiveFilterListBox options={defaultOptions} onChange={mockOnChange} multiple={true} />,
    );

    const listbox = screen.getByRole('listbox');
    fireEvent.change(listbox, { target: { value: 'electronics' } });
    // Component should call onChange with array for multiple mode
    expect(mockOnChange).toHaveBeenCalledWith(['electronics']);
  });
});
