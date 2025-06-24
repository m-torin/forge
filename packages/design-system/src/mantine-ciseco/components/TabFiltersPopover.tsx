'use client';

import { Cancel01Icon, FilterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Modal, RangeSlider, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

import MySwitch from './MySwitch';
import ButtonPrimary from './shared/Button/ButtonPrimary';
import ButtonThird from './shared/Button/ButtonThird';
import ButtonClose from './shared/ButtonClose/ButtonClose';
import Checkbox from './shared/Checkbox/Checkbox';
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
const PRICE_RANGE: [number, number] = [1, 500];
//
const TabFiltersPopover = ({ className }: { className?: string }) => {
  const [opened, { close, open }] = useDisclosure(false);
  //
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

  return (
    <div className={className}>
      <button
        aria-label="Open product filters"
        className="flex cursor-pointer items-center justify-center rounded-full border border-primary-500 bg-primary-50 px-4 py-2 text-sm text-primary-900 select-none focus:outline-hidden"
        type="button"
        onClick={open}
      >
        <HugeiconsIcon color="currentColor" icon={FilterIcon} size={16} strokeWidth={1.5} />
        <span className="ms-2">Products filters (3)</span>
        <span className="ms-3 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white">
          <HugeiconsIcon color="currentColor" icon={Cancel01Icon} size={10} strokeWidth={1.5} />
        </span>
      </button>

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
                      data={DATA_categories.map((item) => ({
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
                      data={DATA_colors.map((item) => ({
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
                        data={DATA_sizes.map((item) => ({
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
                        {DATA_sortOrderRadios.map((item) => (
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
    </div>
  );
};

const FilterItem = ({
  data,
  handleChange: handleChange,
  name: name,
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
        {list1.map((item) => (
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
        {list2.map((item) => (
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
