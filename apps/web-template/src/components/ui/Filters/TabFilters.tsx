'use client';

import { Popover, RangeSlider, Skeleton, Alert, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconX,
  IconCurrencyDollar,
  IconNote,
  IconPalette,
  IconPercentage,
  IconResize,
  IconSortAscending,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import ButtonPrimary from './ButtonPrimary';
import ButtonThird from './ButtonThird';
import Checkbox from './Checkbox';
import Input from './Input';
import Radio from './Radio';

// DEMO DATA
const DATA_categories = [
  {
    name: 'New Arrivals',
  },
  {
    name: 'Backpacks',
  },
  {
    name: 'Travel Bags',
  },
  {
    name: 'Accessories',
  },
];
const DATA_colors = [
  { name: 'Beige' },
  { name: 'Blue' },
  { name: 'Black' },
  { name: 'Brown' },
  { name: 'Green' },
];
const DATA_sizes = [{ name: 'XS' }, { name: 'S' }, { name: 'M' }, { name: 'L' }, { name: 'XL' }];
const DATA_sortOrderRadios = [
  { id: 'Most-Popular', name: 'Most Popular' },
  { id: 'Best-Rating', name: 'Best Rating' },
  { id: 'Newest', name: 'Newest' },
  { id: 'Price-low-hight', name: 'Price Low - Hight' },
  { id: 'Price-hight-low', name: 'Price Hight - Low' },
];
const PRICE_RANGE: [number, number] = [1, 500];
//
// Loading skeleton for TabFilters
function TabFiltersSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-1 flex-wrap gap-x-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={40} width={120} radius="xl" />
        ))}
      </div>
    </div>
  );
}

// Error state for TabFilters
function TabFiltersError({ error: _error, className }: { error: string; className?: string }) {
  return (
    <div className={className}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Filter controls failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for TabFilters
function _TabFiltersEmpty({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-1 flex-wrap gap-x-4">
        <div className="flex items-center justify-center px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-full border border-dashed border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
          No filters available
        </div>
      </div>
    </div>
  );
}

interface TabFiltersProps {
  className?: string;
  loading?: boolean;
  error?: string;
}

const TabFilters = ({ className, loading = false, error }: TabFiltersProps) => {
  const [isOnSale, setIsIsOnSale] = useState<boolean>();
  const [rangePrices, setRangePrices] = useState<[number, number]>([100, 500]);
  const [categoriesState, setCategoriesState] = useState<string[]>();
  const [colorsState, setColorsState] = useState<string[]>();
  const [sizesState, setSizesState] = useState<string[]>();
  const [sortOrderStates, setSortOrderStates] = useState<string>();
  const [internalError, _setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <TabFiltersSkeleton className={className} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <TabFiltersError error={currentError} className={className} />;
  }

  //
  const handleChangeCategories = (checked: boolean, name: string) => {
    checked
      ? setCategoriesState([...(categoriesState ?? []), name])
      : setCategoriesState(categoriesState?.filter((i) => i !== name));
  };

  const handleChangeColors = (checked: boolean, name: string) => {
    checked
      ? setColorsState([...(colorsState ?? []), name])
      : setColorsState(colorsState?.filter((i) => i !== name));
  };

  const handleChangeSizes = (checked: boolean, name: string) => {
    checked
      ? setSizesState([...(sizesState ?? []), name])
      : setSizesState(sizesState?.filter((i) => i !== name));
  };

  // OK
  const renderTabsCategories = () => {
    return (
      <FieldPopover
        anchor="bottom-start"
        buttonIcon={IconNote}
        buttonText="Categories"
        fieldState={categoriesState}
        onClickClear={() => setCategoriesState([])}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          <Checkbox
            defaultChecked={categoriesState?.includes('All Categories')}
            label="All Categories"
            name="All Categories"
            onChange={(checked) => handleChangeCategories(checked, 'All Categories')}
          />
          <div className="w-full border-b border-neutral-200 dark:border-neutral-700" />
          {DATA_categories.map((item: any) => (
            <div key={item.name}>
              <Checkbox
                defaultChecked={categoriesState?.includes(item.name)}
                label={item.name}
                name={item.name}
                onChange={(checked) => handleChangeCategories(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </FieldPopover>
    );
  };

  // OK
  const renderTabsSortOrder = () => {
    return (
      <FieldPopover
        anchor="bottom-end"
        buttonIcon={IconSortAscending}
        buttonText="Sort Order"
        fieldState={sortOrderStates}
        onClickClear={() => setSortOrderStates('')}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          {DATA_sortOrderRadios.map((item: any) => (
            <Radio
              key={item.id}
              defaultChecked={sortOrderStates === item.id}
              id={item.id}
              label={item.name}
              name="radioNameSort"
              onChange={setSortOrderStates}
            />
          ))}
        </div>
      </FieldPopover>
    );
  };

  // OK
  const renderTabsColor = () => {
    return (
      <FieldPopover
        anchor="bottom-start"
        buttonIcon={IconPalette}
        buttonText="Colors"
        fieldState={colorsState}
        onClickClear={() => setColorsState([])}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          {DATA_colors.map((item: any) => (
            <div key={item.name} className="">
              <Checkbox
                defaultChecked={colorsState?.includes(item.name)}
                label={item.name}
                name={item.name}
                onChange={(checked) => handleChangeColors(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </FieldPopover>
    );
  };

  // OK
  const renderTabsSize = () => {
    return (
      <FieldPopover
        anchor="bottom-start"
        buttonIcon={IconResize}
        buttonText="Sizes"
        fieldState={sizesState}
        onClickClear={() => setSizesState([])}
      >
        <div className="relative flex flex-col space-y-5 px-5 py-6">
          {DATA_sizes.map((item: any) => (
            <div key={item.name}>
              <Checkbox
                defaultChecked={sizesState?.includes(item.name)}
                label={item.name}
                name={item.name}
                onChange={(checked) => handleChangeSizes(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </FieldPopover>
    );
  };

  // OK
  const renderTabsPriceRage = () => {
    return (
      <FieldPopover
        anchor="bottom-start"
        buttonIcon={IconCurrencyDollar}
        buttonText={`${rangePrices[0]}$ - ${rangePrices[1]}$`}
        fieldState={sizesState}
        onClickClear={() => setRangePrices(PRICE_RANGE)}
      >
        <div className="relative flex flex-col gap-y-8 px-5 py-6">
          <div className="flex flex-col gap-y-5">
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
      </FieldPopover>
    );
  };

  const renderXClear = () => {
    return <IconX className="ml-1" color="currentColor" size={14} stroke={1.5} />;
  };

  // OK
  const renderTabIsOnsale = () => {
    return (
      <button
        aria-label="Filter by on sale items"
        aria-pressed={isOnSale}
        className={`flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm select-none focus:outline-hidden ${
          isOnSale
            ? 'border-primary-500 bg-primary-50 text-primary-900'
            : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500'
        }`}
        type="button"
        onClick={() => setIsIsOnSale(!isOnSale)}
      >
        <IconPercentage color="currentColor" size={16} stroke={1.5} />
        <span className="ms-2 line-clamp-1">On sale</span>
        {isOnSale && renderXClear()}
      </button>
    );
  };

  return (
    <ErrorBoundary
      fallback={<TabFiltersError error="Filter controls failed to render" className={className} />}
    >
      <div className={className}>
        <div className="flex flex-1 flex-wrap gap-x-4">
          <ErrorBoundary fallback={<Skeleton height={40} width={120} radius="xl" />}>
            {renderTabsPriceRage()}
          </ErrorBoundary>
          <ErrorBoundary fallback={<Skeleton height={40} width={120} radius="xl" />}>
            {renderTabsCategories()}
          </ErrorBoundary>
          <ErrorBoundary fallback={<Skeleton height={40} width={120} radius="xl" />}>
            {renderTabsColor()}
          </ErrorBoundary>
          <ErrorBoundary fallback={<Skeleton height={40} width={120} radius="xl" />}>
            {renderTabsSize()}
          </ErrorBoundary>
          <ErrorBoundary fallback={<Skeleton height={40} width={120} radius="xl" />}>
            {renderTabIsOnsale()}
          </ErrorBoundary>
          <div className="ml-auto">
            <ErrorBoundary fallback={<Skeleton height={40} width={120} radius="xl" />}>
              {renderTabsSortOrder()}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const FieldPopover = ({
  anchor = 'bottom-start',
  buttonIcon: ButtonIcon = IconNote,
  buttonText,
  children,
  fieldState,
  onClickClear,
}: {
  anchor?: 'bottom-end' | 'bottom-start';
  buttonIcon: any;
  buttonText: string;
  children?: React.ReactNode;
  fieldState: any[] | string | undefined;
  onClickClear: () => void;
}) => {
  const [opened, { close, open: _open, toggle }] = useDisclosure(false);

  return (
    <ErrorBoundary fallback={<Skeleton height={40} width={120} radius="xl" />}>
      <Popover
        classNames={{
          dropdown: 'rounded-2xl border border-neutral-200 dark:border-neutral-700 px-0',
        }}
        offset={12}
        opened={opened}
        position={anchor}
        shadow="xl"
        transitionProps={{ duration: 200, transition: 'pop' }}
        width={384}
        onChange={(opened) => {
          if (!opened) close();
        }}
      >
        <Popover.Target>
          <button
            className={`flex items-center justify-center rounded-full border px-4 py-2 text-sm select-none focus:outline-hidden ${
              opened ? 'border-primary-500' : ''
            } ${
              fieldState?.length
                ? 'border-primary-500 bg-primary-50 text-primary-900'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500'
            }`}
            onClick={toggle}
          >
            <ButtonIcon color="currentColor" size={16} stroke={1.5} />
            <span className="ms-2">{buttonText}</span>
            {!fieldState?.length ? (
              <IconChevronDown className="ms-3 h-4 w-4" />
            ) : (
              <button
                aria-label="Clear filter"
                className="ms-3 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white border-none"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClickClear();
                }}
              >
                <IconX color="currentColor" size={10} stroke={1.5} />
              </button>
            )}
          </button>
        </Popover.Target>

        <Popover.Dropdown className="p-0">
          <ErrorBoundary
            fallback={
              <div className="p-4">
                <Text size="sm" c="red">
                  Filter options failed to load
                </Text>
              </div>
            }
          >
            {children}
            <div className="flex items-center justify-between bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900 rounded-b-2xl">
              <ErrorBoundary fallback={<Skeleton height={32} width={60} />}>
                <ButtonThird
                  sizeClass="px-4 py-2 sm:px-5"
                  onClick={() => {
                    onClickClear();
                    close();
                  }}
                >
                  Clear
                </ButtonThird>
              </ErrorBoundary>
              <ErrorBoundary fallback={<Skeleton height={32} width={60} />}>
                <ButtonPrimary sizeClass="px-4 py-2 sm:px-5" onClick={close}>
                  Apply
                </ButtonPrimary>
              </ErrorBoundary>
            </div>
          </ErrorBoundary>
        </Popover.Dropdown>
      </Popover>
    </ErrorBoundary>
  );
};

export default TabFilters;
