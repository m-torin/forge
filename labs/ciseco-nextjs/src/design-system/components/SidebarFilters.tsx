'use client';

import Slider from 'rc-slider';
import { useState } from 'react';

import { Divider } from './Divider';
import MySwitch from './MySwitch';
import Checkbox from './shared/Checkbox/Checkbox';
import Input from './shared/Input/Input';
import Radio from './shared/Radio/Radio';

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
  const [rangePrices, setRangePrices] = useState([100, 500]);
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
          {DATA_categories.map((item) => (
            <div key={item.name}>
              <Checkbox
                onChange={(checked) => handleChangeCategories(checked, item.name)}
                defaultChecked={categoriesState.includes(item.name)}
                label={item.name}
                labelClassName="text-sm font-normal"
                name={item.name}
                sizeClassName="w-5 h-5"
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
          {DATA_colors.map((item) => (
            <div key={item.name} className="">
              <Checkbox
                onChange={(checked) => handleChangeColors(checked, item.name)}
                defaultChecked={colorsState.includes(item.name)}
                label={item.name}
                labelClassName="text-sm font-normal"
                name={item.name}
                sizeClassName="w-5 h-5"
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
          {DATA_sizes.map((item) => (
            <div key={item.name} className="">
              <Checkbox
                onChange={(checked) => handleChangeSizes(checked, item.name)}
                defaultChecked={sizesState.includes(item.name)}
                label={item.name}
                labelClassName="text-sm font-normal"
                name={item.name}
                sizeClassName="w-5 h-5"
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
    );
  };

  // OK
  const renderTabsSortOrder = () => {
    return (
      <div>
        <h3 className="font-semibold">Sort order</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_sortOrderRadios.map((item) => (
            <Radio
              key={item.id}
              id={item.id}
              onChange={setSortOrderStates}
              className="text-sm!"
              defaultChecked={sortOrderStates === item.id}
              label={item.name}
              name="radioNameSort"
              sizeClassName="w-5 h-5"
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
          onChange={setIsIsOnSale}
          desc="Products currently on sale"
          enabled={isOnSale}
          label="On sale!"
        />
        <Divider />
        {renderTabsSortOrder()}
      </div>
    </div>
  );
};

export default SidebarFilters;
