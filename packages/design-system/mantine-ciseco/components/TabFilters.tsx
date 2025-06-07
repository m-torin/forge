'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  Cancel01Icon,
  DollarCircleIcon,
  Note01Icon,
  PaintBucketIcon,
  PercentCircleIcon,
  ResizeFieldRectangleIcon,
  SortingAZ02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Slider from 'rc-slider';
import { useState } from 'react';

import ButtonPrimary from './shared/Button/ButtonPrimary';
import ButtonThird from './shared/Button/ButtonThird';
import Checkbox from './shared/Checkbox/Checkbox';
import Input from './shared/Input/Input';
import Radio from './shared/Radio/Radio';

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
const PRICE_RANGE = [1, 500];
//
const TabFilters = ({ className }: { className?: string }) => {
  const [isOnSale, setIsIsOnSale] = useState<boolean>();
  const [rangePrices, setRangePrices] = useState<number[]>([100, 500]);
  const [categoriesState, setCategoriesState] = useState<string[]>();
  const [colorsState, setColorsState] = useState<string[]>();
  const [sizesState, setSizesState] = useState<string[]>();
  const [sortOrderStates, setSortOrderStates] = useState<string>();

  //
  const handleChangeCategories = (checked: boolean, name: string) => {
    checked
      ? setCategoriesState([...(categoriesState || []), name])
      : setCategoriesState(categoriesState?.filter((i) => i !== name));
  };

  const handleChangeColors = (checked: boolean, name: string) => {
    checked
      ? setColorsState([...(colorsState || []), name])
      : setColorsState(colorsState?.filter((i) => i !== name));
  };

  const handleChangeSizes = (checked: boolean, name: string) => {
    checked
      ? setSizesState([...(sizesState || []), name])
      : setSizesState(sizesState?.filter((i) => i !== name));
  };

  // OK
  const renderTabsCategories = () => {
    return (
      <FieldPopover
        anchor="bottom-start"
        buttonIcon={Note01Icon}
        buttonText="Categories"
        onClickClear={() => setCategoriesState([])}
        fieldState={categoriesState}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          <Checkbox
            onChange={(checked) => handleChangeCategories(checked, 'All Categories')}
            defaultChecked={categoriesState?.includes('All Categories')}
            label="All Categories"
            name="All Categories"
          />
          <div className="w-full border-b border-neutral-200 dark:border-neutral-700" />
          {DATA_categories.map((item) => (
            <div key={item.name}>
              <Checkbox
                onChange={(checked) => handleChangeCategories(checked, item.name)}
                defaultChecked={categoriesState?.includes(item.name)}
                label={item.name}
                name={item.name}
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
        buttonIcon={SortingAZ02Icon}
        buttonText="Sort Order"
        onClickClear={() => setSortOrderStates('')}
        fieldState={sortOrderStates}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          {DATA_sortOrderRadios.map((item) => (
            <Radio
              key={item.id}
              id={item.id}
              onChange={setSortOrderStates}
              defaultChecked={sortOrderStates === item.id}
              label={item.name}
              name="radioNameSort"
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
        buttonIcon={PaintBucketIcon}
        buttonText="Colors"
        onClickClear={() => setColorsState([])}
        fieldState={colorsState}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          {DATA_colors.map((item) => (
            <div key={item.name} className="">
              <Checkbox
                onChange={(checked) => handleChangeColors(checked, item.name)}
                defaultChecked={colorsState?.includes(item.name)}
                label={item.name}
                name={item.name}
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
        buttonIcon={ResizeFieldRectangleIcon}
        buttonText="Sizes"
        onClickClear={() => setSizesState([])}
        fieldState={sizesState}
      >
        <div className="relative flex flex-col space-y-5 px-5 py-6">
          {DATA_sizes.map((item) => (
            <div key={item.name}>
              <Checkbox
                onChange={(checked) => handleChangeSizes(checked, item.name)}
                defaultChecked={sizesState?.includes(item.name)}
                label={item.name}
                name={item.name}
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
        buttonIcon={DollarCircleIcon}
        buttonText={`${rangePrices?.[0] ?? 0}$ - ${rangePrices?.[1] ?? 0}$`}
        onClickClear={() => setRangePrices(PRICE_RANGE)}
        fieldState={sizesState}
      >
        <div className="relative flex flex-col gap-y-8 px-5 py-6">
          <div className="flex flex-col gap-y-5">
            <span className="font-medium">Price range</span>
            <Slider
              allowCross={false}
              onChange={(_input) => setRangePrices(_input as number[])}
              defaultValue={[rangePrices?.[0] ?? 500, rangePrices?.[1] ?? 1000]}
              max={PRICE_RANGE[1]}
              min={PRICE_RANGE[0]}
              range
              step={1}
            />
          </div>

          <div className="flex justify-between gap-x-5">
            <div>
              <label
                htmlFor="minPrice"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Min price
              </label>
              <div className="relative mt-1 rounded-md">
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500 sm:text-sm">
                  $
                </span>

                <Input
                  id="minPrice"
                  className="disabled:bg-white!"
                  disabled
                  name="minPrice"
                  sizeClass="pr-10 pl-4 py-2"
                  type="text"
                  value={rangePrices?.[0]}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="maxPrice"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Max price
              </label>
              <div className="relative mt-1 rounded-md">
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500 sm:text-sm">
                  $
                </span>
                <Input
                  id="maxPrice"
                  className="disabled:bg-white!"
                  disabled
                  name="maxPrice"
                  sizeClass="pr-10 pl-4 py-2"
                  type="text"
                  value={rangePrices?.[1]}
                />
              </div>
            </div>
          </div>
        </div>
      </FieldPopover>
    );
  };

  const renderXClear = () => {
    return (
      <HugeiconsIcon
        strokeWidth={1.5}
        color="currentColor"
        icon={Cancel01Icon}
        className="ml-1"
        size={14}
      />
    );
  };

  // OK
  const renderTabIsOnsale = () => {
    return (
      <div
        onClick={() => setIsIsOnSale(!isOnSale)}
        className={`flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm select-none focus:outline-hidden ${
          isOnSale
            ? 'border-primary-500 bg-primary-50 text-primary-900'
            : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500'
        }`}
      >
        <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={PercentCircleIcon} size={16} />
        <span className="ms-2 line-clamp-1">On sale</span>
        {isOnSale && renderXClear()}
      </div>
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
  buttonIcon: ButtonIcon = Note01Icon,
  buttonText,
  children,
  fieldState,
  onClickClear,
}: {
  fieldState: any[] | string | undefined;
  onClickClear: () => void;
  children?: React.ReactNode;
  anchor?: 'bottom-start' | 'bottom-end';
  buttonText: string;
  buttonIcon: IconSvgElement;
}) => {
  const [opened, { close, open, toggle }] = useDisclosure(false);

  return (
    <Popover
      width={384}
      offset={12}
      onChange={(opened) => {
        if (!opened) close();
      }}
      opened={opened}
      position={anchor}
      shadow="xl"
      transitionProps={{ duration: 200, transition: 'pop' }}
      classNames={{
        dropdown: 'rounded-2xl border border-neutral-200 dark:border-neutral-700 px-0',
      }}
    >
      <Popover.Target>
        <button
          onClick={toggle}
          className={`flex items-center justify-center rounded-full border px-4 py-2 text-sm select-none focus:outline-hidden ${
            opened ? 'border-primary-500' : ''
          } ${
            fieldState?.length
              ? 'border-primary-500 bg-primary-50 text-primary-900'
              : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500'
          } `}
        >
          <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={ButtonIcon} size={16} />
          <span className="ms-2">{buttonText}</span>
          {!fieldState?.length ? (
            <ChevronDownIcon className="ms-3 h-4 w-4" />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClickClear();
              }}
              className="ms-3 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white border-none"
              aria-label="Clear filter"
              type="button"
            >
              <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={Cancel01Icon} size={10} />
            </button>
          )}
        </button>
      </Popover.Target>

      <Popover.Dropdown className="p-0">
        <>
          {children}
          <div className="flex items-center justify-between bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900 rounded-b-2xl">
            <ButtonThird
              onClick={() => {
                onClickClear();
                close();
              }}
              sizeClass="px-4 py-2 sm:px-5"
            >
              Clear
            </ButtonThird>
            <ButtonPrimary onClick={close} sizeClass="px-4 py-2 sm:px-5">
              Apply
            </ButtonPrimary>
          </div>
        </>
      </Popover.Dropdown>
    </Popover>
  );
};

export default TabFilters;
