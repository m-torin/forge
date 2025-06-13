'use client';

import { IconChevronDown } from '@tabler/icons-react';
import {
  IconX,
  IconCurrencyDollar,
  IconNote,
  IconPalette,
  IconPercentage,
  IconResize,
  IconSortAscending,
} from '@tabler/icons-react';
import { Popover, RangeSlider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

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
const TabFilters = ({ className }: { className?: string }) => {
  const [isOnSale, setIsIsOnSale] = useState<boolean>();
  const [rangePrices, setRangePrices] = useState<[number, number]>([100, 500]);
  const [categoriesState, setCategoriesState] = useState<string[]>();
  const [colorsState, setColorsState] = useState<string[]>();
  const [sizesState, setSizesState] = useState<string[]>();
  const [sortOrderStates, setSortOrderStates] = useState<string>();

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
    <div className={className}>
      <div className="flex flex-1 flex-wrap gap-x-4">
        {renderTabsPriceRage()}
        {renderTabsCategories()}
        {renderTabsColor()}
        {renderTabsSize()}
        {renderTabIsOnsale()}
        <div className="ml-auto">{renderTabsSortOrder()}</div>
      </div>
    </div>
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
        <>
          {children}
          <div className="flex items-center justify-between bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900 rounded-b-2xl">
            <ButtonThird
              sizeClass="px-4 py-2 sm:px-5"
              onClick={() => {
                onClickClear();
                close();
              }}
            >
              Clear
            </ButtonThird>
            <ButtonPrimary sizeClass="px-4 py-2 sm:px-5" onClick={close}>
              Apply
            </ButtonPrimary>
          </div>
        </>
      </Popover.Dropdown>
    </Popover>
  );
};

export default TabFilters;
