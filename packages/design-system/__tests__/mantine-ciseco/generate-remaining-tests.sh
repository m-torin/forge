#!/bin/bash

# Generate comprehensive test files for all remaining Mantine Ciseco components
# This script creates test templates for all 113+ components

# Define component categories and their components
declare -A COMPONENT_CATEGORIES=(
  ["shared"]="Alert Avatar Badge Breadcrumb ButtonCircle ButtonPrimary ButtonSecondary ButtonThird ButtonClose Checkbox Footer Input Logo Nav NavItem NcImage PlaceIcon Next NextPrev Prev Pagination Radio Select SocialsList SocialsList1 SocialsShare SwitchDarkMode SwitchDarkMode2 Tag Textarea"
  ["navigation"]="Header2 AvatarDropdown CartBtn CategoriesDropdown CurrLangDropdown CurrLangDropdownClient HamburgerBtnMenu MegaMenuPopover SearchBtnPopover SidebarNavigation NavItem2"
  ["section"]="SectionHero2 SectionHero3 SectionPromo1 SectionPromo2 SectionPromo3 SectionClientSay SectionCollectionSlider SectionCollectionSlider2 SectionGridFeatureItems SectionGridMoreExplore SectionHowItWork SectionSliderLargeProduct SectionSliderProductCard"
  ["filter"]="ArchiveFilterListBox HeaderFilterSection SidebarFilters TabFilters TabFiltersPopover SortOrderFilter ButtonDropdown"
  ["aside"]="aside aside-category-filters aside-product-quickview aside-sidebar-cart aside-sidebar-navigation"
  ["blog"]="PostCard1 PostCard2 PostCardMeta SectionAds SectionGridPosts SectionMagazine5"
  ["gallery"]="ListingImageGallery Modal SharedModal"
  ["product"]="LikeFavoriteButton ReviewItem"
  ["collection"]="CollectionCard3 CollectionCard4 CollectionCard6"
  ["background"]="BackgroundSection BgGlassmorphism"
  ["icons"]="FiveStartIconForRate IconDiscount ItemTypeImageIcon ItemTypeVideoIcon Twitter"
  ["special"]="ViewportAwareProductGrid LocaleContext withLocale"
)

# Function to generate test file content
generate_test_file() {
  local component_name=$1
  local category=$2
  local file_path=$3
  
  cat > "$file_path" << EOF
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import ${component_name} from '@/mantine-ciseco/${component_name}';

describe('${component_name}', () => {
  it('renders ${component_name} component', () => {
    render(<${component_name} />);
    expect(screen.getByTestId('${component_name,,}')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<${component_name} className="custom-${component_name,,}" />);
    expect(screen.getByTestId('${component_name,,}')).toHaveClass('custom-${component_name,,}');
  });

  it('handles click events', () => {
    const mockOnClick = vi.fn();
    render(<${component_name} onClick={mockOnClick} />);
    
    const element = screen.getByTestId('${component_name,,}');
    fireEvent.click(element);
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost'];
    
    variants.forEach(variant => {
      const { rerender } = render(<${component_name} variant={variant} />);
      expect(screen.getByTestId('${component_name,,}')).toHaveClass(\`variant-\${variant}\`);
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
    
    sizes.forEach(size => {
      const { rerender } = render(<${component_name} size={size} />);
      expect(screen.getByTestId('${component_name,,}')).toHaveClass(\`size-\${size}\`);
    });
  });

  it('handles disabled state', () => {
    render(<${component_name} disabled />);
    const element = screen.getByTestId('${component_name,,}');
    
    expect(element).toHaveClass('disabled');
    expect(element).toHaveAttribute('disabled');
  });

  it('renders with loading state', () => {
    render(<${component_name} loading />);
    
    expect(screen.getByTestId('${component_name,,}')).toHaveClass('loading');
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const mockOnKeyDown = vi.fn();
    render(<${component_name} onKeyDown={mockOnKeyDown} />);
    
    const element = screen.getByTestId('${component_name,,}');
    
    fireEvent.keyDown(element, { key: 'Enter' });
    expect(mockOnKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
    
    fireEvent.keyDown(element, { key: ' ' });
    expect(mockOnKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: ' ' }));
  });

  it('has proper accessibility attributes', () => {
    render(
      <${component_name} 
        ariaLabel="Test ${component_name}"
        ariaDescribedBy="description"
        role="button"
      />
    );
    
    const element = screen.getByTestId('${component_name,,}');
    expect(element).toHaveAttribute('aria-label', 'Test ${component_name}');
    expect(element).toHaveAttribute('aria-describedby', 'description');
    expect(element).toHaveAttribute('role', 'button');
  });

  it('renders with custom styles', () => {
    const customStyle = { backgroundColor: 'red', padding: '20px' };
    render(<${component_name} style={customStyle} />);
    
    const element = screen.getByTestId('${component_name,,}');
    expect(element).toHaveStyle(customStyle);
  });

  it('supports responsive design', () => {
    render(<${component_name} responsive />);
    const element = screen.getByTestId('${component_name,,}');
    
    expect(element).toHaveClass('responsive-component');
  });

  it('handles focus and blur events', () => {
    const mockOnFocus = vi.fn();
    const mockOnBlur = vi.fn();
    
    render(<${component_name} onFocus={mockOnFocus} onBlur={mockOnBlur} />);
    
    const element = screen.getByTestId('${component_name,,}');
    
    fireEvent.focus(element);
    expect(mockOnFocus).toHaveBeenCalled();
    
    fireEvent.blur(element);
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('renders with tooltip', async () => {
    render(<${component_name} tooltip="Helpful tooltip text" />);
    
    const element = screen.getByTestId('${component_name,,}');
    fireEvent.mouseEnter(element);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful tooltip text');
    });
  });

  it('supports dark mode styling', () => {
    render(<${component_name} />);
    const element = screen.getByTestId('${component_name,,}');
    
    expect(element).toHaveClass('light-mode', 'dark:dark-mode');
  });

  it('handles animation states', async () => {
    render(<${component_name} animated />);
    const element = screen.getByTestId('${component_name,,}');
    
    expect(element).toHaveClass('animate-entrance');
    
    await waitFor(() => {
      expect(element).toHaveClass('animation-complete');
    });
  });

  it('renders with icon support', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;
    render(<${component_name} icon={<TestIcon />} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  // Add category-specific tests based on component type
  ${category === "product" ? `
  it('integrates with cart functionality', () => {
    const mockAddToCart = vi.fn();
    render(<${component_name} onAddToCart={mockAddToCart} />);
    
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    
    expect(mockAddToCart).toHaveBeenCalled();
  });
  ` : ""}

  ${category === "navigation" ? `
  it('handles navigation events', () => {
    const mockNavigate = vi.fn();
    render(<${component_name} onNavigate={mockNavigate} />);
    
    const navElement = screen.getByRole('navigation') || screen.getByTestId('${component_name,,}');
    fireEvent.click(navElement);
    
    expect(mockNavigate).toHaveBeenCalled();
  });
  ` : ""}

  ${category === "form" ? `
  it('handles form validation', () => {
    render(<${component_name} required />);
    const element = screen.getByTestId('${component_name,,}');
    
    expect(element).toHaveAttribute('required');
    expect(element).toHaveClass('validation-required');
  });
  ` : ""}
});
EOF
}

# Create test directories if they don't exist
for category in "${!COMPONENT_CATEGORIES[@]}"; do
  mkdir -p "$category"
done

# Generate test files for each component
for category in "${!COMPONENT_CATEGORIES[@]}"; do
  echo "Generating tests for $category components..."
  
  for component in ${COMPONENT_CATEGORIES[$category]}; do
    file_path="$category/${component}.test.tsx"
    
    # Skip if file already exists
    if [[ ! -f "$file_path" ]]; then
      echo "  Creating $file_path"
      generate_test_file "$component" "$category" "$file_path"
    else
      echo "  Skipping $file_path (already exists)"
    fi
  done
done

echo "Test generation complete!"
echo "Generated test files for all remaining components."
echo "Total categories processed: ${#COMPONENT_CATEGORIES[@]}"

# Create a summary file
cat > "test-generation-summary.md" << EOF
# Mantine Ciseco Test Generation Summary

## Generated Test Files

This script generated comprehensive test files for all remaining Mantine Ciseco components.

### Categories and Component Count:
$(for category in "${!COMPONENT_CATEGORIES[@]}"; do
  component_count=$(echo ${COMPONENT_CATEGORIES[$category]} | wc -w)
  echo "- **$category**: $component_count components"
done)

### Test Coverage Features:
- ✅ Basic rendering tests
- ✅ Props and variants testing
- ✅ Event handling (click, focus, blur, keyboard)
- ✅ Accessibility testing (ARIA attributes, keyboard navigation)
- ✅ Responsive design testing
- ✅ Dark mode support testing
- ✅ Animation and transition testing
- ✅ Tooltip and overlay testing
- ✅ Custom styling and theming
- ✅ Loading and disabled states
- ✅ Category-specific functionality (product, navigation, form)

### Next Steps:
1. Review generated test files for accuracy
2. Customize tests based on specific component requirements
3. Add integration tests for complex workflows
4. Run test suite to ensure all tests pass
5. Achieve target coverage of 95%+

### Commands to Run Tests:
\`\`\`bash
# Run all tests
pnpm test

# Run tests for specific category
pnpm test mantine-ciseco/shared
pnpm test mantine-ciseco/product
pnpm test mantine-ciseco/navigation

# Run with coverage
pnpm test --coverage
\`\`\`
EOF

echo "Summary written to test-generation-summary.md"