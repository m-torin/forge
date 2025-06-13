# Filter Components

This directory contains filter components migrated from
`@repo/design-system/mantine-ciseco/components/` to be used directly in the web-template app without
dependencies on the design-system package.

## Components

### Main Filter Components

- **`SidebarFilters`** - Comprehensive sidebar filter with categories, colors, sizes, price range,
  and sorting
- **`TabFilters`** - Horizontal tab-based filters with popovers for mobile-friendly filtering
- **`TabFiltersPopover`** - Full-screen modal filter interface for mobile devices
- **`ArchiveFilterListBox`** - Dropdown select component for filtering and sorting

### Base Components

- **`Button`** - Base button component with Next.js Link support
- **`ButtonPrimary`** - Primary styled button
- **`ButtonThird`** - Secondary styled button
- **`ButtonClose`** - Close button with X icon
- **`Checkbox`** - Custom checkbox with Tabler icon
- **`Radio`** - Custom radio button component
- **`Input`** - Text input component
- **`Label`** - Form label component
- **`MySwitch`** - Toggle switch using Mantine Switch
- **`Divider`** - Horizontal divider/separator

## Migration Changes

### Icon Library

- **Before**: `@hugeicons/react` and `@heroicons/react`
- **After**: `@tabler/icons-react` (following project standards)

### Icon Replacements

- `Cancel01Icon` → `IconX`
- `DollarCircleIcon` → `IconCurrencyDollar`
- `Note01Icon` → `IconNote`
- `PaintBucketIcon` → `IconPalette`
- `PercentCircleIcon` → `IconPercentage`
- `ResizeFieldRectangleIcon` → `IconResize`
- `SortingAZ02Icon` → `IconSortAscending`
- `FilterIcon` → `IconFilter`
- `Tick01Icon` → `IconCheck`
- `XMarkIcon` → `IconX`
- `CheckIcon` → `IconCheck`
- `ChevronDownIcon` → `IconChevronDown`

### Import Updates

- All React imports use named imports (`import { FC } from 'react'`)
- All clsx imports use named imports (`import { clsx } from 'clsx'`)
- Mantine components maintained their original imports

### Styling

- All Tailwind CSS styling preserved exactly as original
- Mantine styling and classNames preserved
- Dark mode support maintained

## Usage

```tsx
import {
  SidebarFilters,
  TabFilters,
  TabFiltersPopover,
  ArchiveFilterListBox
} from '@/components/ui';

// Basic usage
<SidebarFilters />
<TabFilters />
<TabFiltersPopover />
<ArchiveFilterListBox
  options={[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ]}
/>
```

## Demo Page

A demo page showcasing all filter components is available at: `/filters-demo`

## Dependencies

These components require the following packages (already installed in web-template):

- `@mantine/core` - For RangeSlider, Popover, Modal, Switch, Select
- `@mantine/hooks` - For useDisclosure hook
- `@tabler/icons-react` - For icons
- `clsx` - For conditional CSS classes
- `next` - For Link component

## Component Features

### SidebarFilters

- Categories with checkboxes
- Color selection with checkboxes
- Size selection with checkboxes
- Price range slider with min/max inputs
- On sale toggle switch
- Sort order radio buttons
- Responsive design

### TabFilters

- Horizontal filter tabs
- Popover-based filter panels
- Price range with visual slider
- Clear functionality per filter
- Apply/Clear actions
- Mobile-responsive

### TabFiltersPopover

- Full-screen modal on mobile
- Grid-based filter layout
- Same filter options as TabFilters
- Touch-friendly interface
- Slide-up animation

### ArchiveFilterListBox

- Mantine Select component
- Searchable options
- Grouped options support
- Multiple selection
- Custom option rendering
- Hierarchical data support

All components maintain their original functionality and styling while being self-contained within
the web-template app.
