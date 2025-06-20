'use client';

import { RangeSlider, Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle, IconFilter } from '@tabler/icons-react';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import Checkbox from './Checkbox';
import { Divider } from './Divider';
import Input from './Input';
import MySwitch from './MySwitch';
import Radio from './Radio';

// DEMO DATA
const DATA_categories = [
  {
    name: 'Backpacks',
  },
  {
    name: 'Travel Bags',
  },
  {
    name: 'Laptop Sleeves',
  },
  {
    name: 'Organization',
  },
  {
    name: 'Accessories',
  },
];
const DATA_colors = [
  { name: 'White' },
  { name: 'Beige' },
  { name: 'Blue' },
  { name: 'Black' },
  { name: 'Brown' },
];
const DATA_sizes = [{ name: 'XS' }, { name: 'S' }, { name: 'M' }, { name: 'L' }, { name: 'XL' }];
const DATA_sortOrderRadios = [
  { id: 'Most-Popular', name: 'Most Popular' },
  { id: 'Best-Rating', name: 'Best Rating' },
  { id: 'Newest', name: 'Newest' },
  { id: 'Price-low-hight', name: 'Price Low - Hight' },
  { id: 'Price-hight-low', name: 'Price Hight - Low' },
];
const PRICE_RANGE = [1, 500];

// Loading skeleton for SidebarFilters
function SidebarFiltersSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton height={20} width="40%" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton height={20} width={20} />
                  <Skeleton height={16} width="60%" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error state for SidebarFilters
function SidebarFiltersError({ error: _error, className }: { error: string; className?: string }) {
  return (
    <div className={className}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Filter sidebar failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for SidebarFilters
function _SidebarFiltersEmpty({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <IconFilter size={48} stroke={1} color="var(--mantine-color-gray-5)" />
        <Text size="lg" fw={600} c="dimmed" mt="md">
          No filters available
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          Filter options are not available at this time
        </Text>
      </div>
    </div>
  );
}

interface SidebarFiltersProps {
  className?: string;
  loading?: boolean;
  error?: string;
}

const SidebarFilters = ({ className, loading = false, error }: SidebarFiltersProps) => {
  const [isOnSale, setIsIsOnSale] = useState(true);
  const [rangePrices, setRangePrices] = useState<[number, number]>([100, 500]);
  const [categoriesState, setCategoriesState] = useState<string[]>([]);
  const [colorsState, setColorsState] = useState<string[]>([]);
  const [sizesState, setSizesState] = useState<string[]>([]);
  const [sortOrderStates, setSortOrderStates] = useState<string>('');
  const [internalError, _setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <SidebarFiltersSkeleton className={className} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SidebarFiltersError error={currentError} className={className} />;
  }

  //
  const handleChangeCategories = (checked: boolean, name: string) => {
    checked
      ? setCategoriesState([...categoriesState, name])
      : setCategoriesState(categoriesState.filter((i) => i !== name));
  };
  const handleChangeColors = (checked: boolean, name: string) => {
    checked
      ? setColorsState([...colorsState, name])
      : setColorsState(colorsState.filter((i) => i !== name));
  };
  const handleChangeSizes = (checked: boolean, name: string) => {
    checked
      ? setSizesState([...sizesState, name])
      : setSizesState(sizesState.filter((i) => i !== name));
  };

  // OK
  const renderTabsCategories = () => {
    return (
      <div>
        <h3 className="font-semibold">Categories</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_categories.map((item: any) => (
            <div key={item.name}>
              <Checkbox
                defaultChecked={categoriesState.includes(item.name)}
                label={item.name}
                labelClassName="text-sm font-normal"
                name={item.name}
                sizeClassName="w-5 h-5"
                onChange={(checked) => handleChangeCategories(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // OK
  const renderTabsColor = () => {
    return (
      <div>
        <h3 className="font-semibold">Colors</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_colors.map((item: any) => (
            <div key={item.name} className="">
              <Checkbox
                defaultChecked={colorsState.includes(item.name)}
                label={item.name}
                labelClassName="text-sm font-normal"
                name={item.name}
                sizeClassName="w-5 h-5"
                onChange={(checked) => handleChangeColors(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // OK
  const renderTabsSize = () => {
    return (
      <div>
        <h3 className="font-semibold">Sizes</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_sizes.map((item: any) => (
            <div key={item.name} className="">
              <Checkbox
                defaultChecked={sizesState.includes(item.name)}
                label={item.name}
                labelClassName="text-sm font-normal"
                name={item.name}
                sizeClassName="w-5 h-5"
                onChange={(checked) => handleChangeSizes(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // OK
  const renderTabsPriceRage = () => {
    return (
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-6">
          <span className="font-medium">Price range</span>
          <RangeSlider
            classNames={{
              bar: 'bg-neutral-900 dark:bg-neutral-100',
              root: 'mt-2',
              thumb: 'border-2 border-white shadow-md',
              track: 'bg-neutral-200 dark:bg-neutral-700',
            }}
            max={PRICE_RANGE[1]}
            min={PRICE_RANGE[0]}
            minRange={1}
            step={1}
            value={rangePrices}
            onChange={(value) => setRangePrices(value as [number, number])}
          />
        </div>

        <div className="flex justify-between gap-x-5">
          <div>
            <label
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="minPrice"
            >
              Min price
            </label>
            <div className="relative mt-1 rounded-md">
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500 sm:text-sm">
                $
              </span>

              <Input
                className="disabled:bg-white!"
                disabled
                id="minPrice"
                name="minPrice"
                sizeClass="pr-10 pl-4 py-2"
                type="text"
                value={rangePrices[0]}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="maxPrice"
            >
              Max price
            </label>
            <div className="relative mt-1 rounded-md">
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500 sm:text-sm">
                $
              </span>
              <Input
                className="disabled:bg-white!"
                disabled
                id="maxPrice"
                name="maxPrice"
                sizeClass="pr-10 pl-4 py-2"
                type="text"
                value={rangePrices[1]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // OK
  const renderTabsSortOrder = () => {
    return (
      <div>
        <h3 className="font-semibold">Sort order</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_sortOrderRadios.map((item: any) => (
            <Radio
              key={item.id}
              className="text-sm"
              defaultChecked={sortOrderStates === item.id}
              id={item.id}
              label={item.name}
              name="radioNameSort"
              sizeClassName="w-5 h-5"
              onChange={setSortOrderStates}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <SidebarFiltersError error="Filter sidebar failed to render" className={className} />
      }
    >
      <div className={className}>
        <div className="flex flex-col gap-y-8">
          <ErrorBoundary fallback={<Skeleton height={80} />}>
            {renderTabsCategories()}
          </ErrorBoundary>
          <Divider />
          <ErrorBoundary fallback={<Skeleton height={80} />}>{renderTabsColor()}</ErrorBoundary>
          <Divider />
          <ErrorBoundary fallback={<Skeleton height={80} />}>{renderTabsSize()}</ErrorBoundary>
          <Divider />
          <ErrorBoundary fallback={<Skeleton height={120} />}>
            {renderTabsPriceRage()}
          </ErrorBoundary>
          <Divider />
          <ErrorBoundary fallback={<Skeleton height={40} />}>
            <MySwitch
              desc="Products currently on sale"
              enabled={isOnSale}
              label="On sale!"
              onChange={setIsIsOnSale}
            />
          </ErrorBoundary>
          <Divider />
          <ErrorBoundary fallback={<Skeleton height={120} />}>
            {renderTabsSortOrder()}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SidebarFilters;
