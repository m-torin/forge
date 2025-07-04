'use client';

import { Modal, RangeSlider, Title, Skeleton, Alert, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconX, IconFilter, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import ButtonClose from './ButtonClose';
import ButtonPrimary from './ButtonPrimary';
import ButtonThird from './ButtonThird';
import Checkbox from './Checkbox';
import MySwitch from './MySwitch';
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

// Loading skeleton for TabFiltersPopover
function TabFiltersPopoverSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton height={40} width={200} radius="xl" />
    </div>
  );
}

// Error state for TabFiltersPopover
function TabFiltersPopoverError({
  error: _error,
  className,
}: {
  error: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Filter popover failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for TabFiltersPopover
function _TabFiltersPopoverEmpty({ className }: { className?: string }) {
  return (
    <div className={className}>
      <button
        disabled
        aria-label="No filters available"
        className="flex cursor-not-allowed items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-400 select-none"
        type="button"
      >
        <IconFilter color="currentColor" size={16} stroke={1.5} />
        <span className="ms-2">No filters available</span>
      </button>
    </div>
  );
}

interface TabFiltersPopoverProps {
  className?: string;
  loading?: boolean;
  error?: string;
}

const TabFiltersPopover = ({ className, loading = false, error }: TabFiltersPopoverProps) => {
  const [opened, { close, open }] = useDisclosure(false);
  //
  const [isOnSale, setIsIsOnSale] = useState<boolean>();
  const [rangePrices, setRangePrices] = useState<[number, number]>([100, 500]);
  const [categoriesState, setCategoriesState] = useState<string[]>();
  const [colorsState, setColorsState] = useState<string[]>();
  const [sizesState, setSizesState] = useState<string[]>();
  const [sortOrderStates, setSortOrderStates] = useState<string>();
  const [internalError, _setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <TabFiltersPopoverSkeleton className={className} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <TabFiltersPopoverError error={currentError} className={className} />;
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

  return (
    <ErrorBoundary
      fallback={
        <TabFiltersPopoverError error="Filter popover failed to render" className={className} />
      }
    >
      <div className={className}>
        <ErrorBoundary fallback={<Skeleton height={40} width={200} radius="xl" />}>
          <button
            aria-label="Open product filters"
            className="flex cursor-pointer items-center justify-center rounded-full border border-primary-500 bg-primary-50 px-4 py-2 text-sm text-primary-900 select-none focus:outline-hidden"
            type="button"
            onClick={open}
          >
            <IconFilter color="currentColor" size={16} stroke={1.5} />
            <span className="ms-2">Products filters (3)</span>
            <span className="ms-3 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white">
              <IconX color="currentColor" size={10} stroke={1.5} />
            </span>
          </button>
        </ErrorBoundary>

        <ErrorBoundary
          fallback={
            <div className="p-4">
              <Text c="red">Filter modal failed to load</Text>
            </div>
          }
        >
          <Modal
            classNames={{
              body: 'p-0 h-full',
              content: 'bg-white dark:bg-neutral-900',
            }}
            fullScreen
            opened={opened}
            padding={0}
            styles={{
              content: {
                borderRadius: 0,
              },
            }}
            transitionProps={{
              duration: 300,
              transition: 'slide-up',
            }}
            withCloseButton={false}
            onClose={close}
          >
            <div className="h-svh w-full max-w-4xl mx-auto">
              <div className="flex h-full w-full flex-col bg-white text-left dark:border dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
                <div className="relative shrink-0 border-b border-neutral-200 px-6 py-4 text-center dark:border-neutral-800">
                  <Title
                    className="text-lg leading-6 font-medium text-gray-900 dark:text-neutral-100"
                    order={3}
                  >
                    Products filters
                  </Title>
                  <span className="absolute top-3 left-3">
                    <ButtonClose onClick={close} />
                  </span>
                </div>

                <div className="grow overflow-y-auto">
                  <div className="divide-y divide-neutral-200 px-6 sm:px-8 md:px-10 dark:divide-neutral-800">
                    {/* --------- */}
                    {/* ---- */}
                    <div className="py-7">
                      <h3 className="text-xl font-medium">Categories</h3>
                      <div className="relative mt-6">
                        <FilterItem
                          data={DATA_categories.map((item: any) => ({
                            ...item,
                            defaultChecked: categoriesState?.includes(item.name),
                          }))}
                          handleChange={handleChangeCategories}
                          name="categories"
                        />
                      </div>
                    </div>
                    {/* --------- */}
                    {/* ---- */}
                    <div className="py-7">
                      <h3 className="text-xl font-medium">Colors</h3>
                      <div className="relative mt-6">
                        <FilterItem
                          data={DATA_colors.map((item: any) => ({
                            ...item,
                            defaultChecked: colorsState?.includes(item.name),
                          }))}
                          handleChange={handleChangeColors}
                          name="colors"
                        />
                      </div>
                      {/* --------- */}
                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Size</h3>
                        <div className="relative mt-6">
                          <FilterItem
                            data={DATA_sizes.map((item: any) => ({
                              ...item,
                              defaultChecked: sizesState?.includes(item.name),
                            }))}
                            handleChange={handleChangeSizes}
                            name="sizes"
                          />
                        </div>
                      </div>

                      {/* --------- */}
                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Range Prices</h3>
                        <div className="relative mt-6">
                          <div className="relative flex flex-col space-y-8">
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

                            <div className="flex justify-between space-x-5">
                              <div>
                                <label
                                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                  htmlFor="minPrice"
                                >
                                  Min price
                                </label>
                                <div className="relative mt-1 rounded-md">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-neutral-500 sm:text-sm">$</span>
                                  </div>
                                  <input
                                    className="block w-full rounded-full border-neutral-200 pr-3 pl-7 text-neutral-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled
                                    id="minPrice"
                                    name="minPrice"
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
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-neutral-500 sm:text-sm">$</span>
                                  </div>
                                  <input
                                    className="block w-full rounded-full border-neutral-200 pr-3 pl-7 text-neutral-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled
                                    id="maxPrice"
                                    name="maxPrice"
                                    type="text"
                                    value={rangePrices[1]}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* --------- */}
                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Sort Order</h3>
                        <div className="relative mt-6">
                          <div className="relative flex flex-col space-y-5">
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
                        </div>
                      </div>

                      {/* --------- */}
                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">On sale!</h3>
                        <div className="relative mt-6">
                          <MySwitch
                            desc="Products currently on sale"
                            enabled={isOnSale}
                            label="On sale!"
                            onChange={setIsIsOnSale}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between bg-neutral-50 px-6 py-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                    <ButtonThird
                      sizeClass="py-2.5 px-5"
                      onClick={() => {
                        setRangePrices(PRICE_RANGE as [number, number]);
                        setCategoriesState([]);
                        setColorsState([]);
                        setSortOrderStates('');
                        close();
                      }}
                    >
                      Clear
                    </ButtonThird>
                    <ButtonPrimary sizeClass="py-2.5 px-5" onClick={close}>
                      Apply
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

const FilterItem = ({
  data,
  handleChange: _handleChange,
  name: _name,
}: {
  data: {
    defaultChecked?: boolean;
    description?: string;
    name: string;
  }[];
  handleChange: (checked: boolean, name: string) => void;
  name: string;
}) => {
  const list1 = data.filter((_, i) => i < data.length / 2);
  const list2 = data.filter((_, i) => i >= data.length / 2);
  return (
    <div className="grid grid-cols-2 gap-8 gap-x-4 sm:gap-x-8">
      <div className="flex flex-col space-y-5">
        {list1.map((item: any) => (
          <Checkbox
            key={item.name}
            defaultChecked={!!item.defaultChecked}
            description={item.description}
            label={item.name}
            name={item.name}
          />
        ))}
      </div>
      <div className="flex flex-col space-y-5">
        {list2.map((item: any) => (
          <Checkbox
            key={item.name}
            defaultChecked={!!item.defaultChecked}
            description={item.description}
            label={item.name}
            name={item.name}
          />
        ))}
      </div>
    </div>
  );
};

export default TabFiltersPopover;
