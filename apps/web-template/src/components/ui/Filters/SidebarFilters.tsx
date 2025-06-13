'use client';

import { RangeSlider } from '@mantine/core';
import { useState } from 'react';

import { Divider } from './Divider';
import MySwitch from './MySwitch';
import Checkbox from './Checkbox';
import Input from './Input';
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
//
const SidebarFilters = ({ className }: { className?: string }) => {
  const [isOnSale, setIsIsOnSale] = useState(true);
  const [rangePrices, setRangePrices] = useState<[number, number]>([100, 500]);
  const [categoriesState, setCategoriesState] = useState<string[]>([]);
  const [colorsState, setColorsState] = useState<string[]>([]);
  const [sizesState, setSizesState] = useState<string[]>([]);
  const [sortOrderStates, setSortOrderStates] = useState<string>('');

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
    <div className={className}>
      <div className="flex flex-col gap-y-8">
        {renderTabsCategories()}
        <Divider />
        {renderTabsColor()}
        <Divider />
        {renderTabsSize()}
        <Divider />
        {renderTabsPriceRage()}
        <Divider />
        <MySwitch
          desc="Products currently on sale"
          enabled={isOnSale}
          label="On sale!"
          onChange={setIsIsOnSale}
        />
        <Divider />
        {renderTabsSortOrder()}
      </div>
    </div>
  );
};

export default SidebarFilters;
