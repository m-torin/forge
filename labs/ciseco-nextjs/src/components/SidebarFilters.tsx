'use client'

import MySwitch from '@/components/MySwitch'
import Checkbox from '@/shared/Checkbox/Checkbox'
import Input from '@/shared/Input/Input'
import Radio from '@/shared/Radio/Radio'
import Slider from 'rc-slider'
import { useState } from 'react'
import { Divider } from './Divider'

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
]
const DATA_colors = [{ name: 'White' }, { name: 'Beige' }, { name: 'Blue' }, { name: 'Black' }, { name: 'Brown' }]
const DATA_sizes = [{ name: 'XS' }, { name: 'S' }, { name: 'M' }, { name: 'L' }, { name: 'XL' }]
const DATA_sortOrderRadios = [
  { name: 'Most Popular', id: 'Most-Popular' },
  { name: 'Best Rating', id: 'Best-Rating' },
  { name: 'Newest', id: 'Newest' },
  { name: 'Price Low - Hight', id: 'Price-low-hight' },
  { name: 'Price Hight - Low', id: 'Price-hight-low' },
]
const PRICE_RANGE = [1, 500]
//
const SidebarFilters = ({ className }: { className?: string }) => {
  const [isOnSale, setIsIsOnSale] = useState(true)
  const [rangePrices, setRangePrices] = useState([100, 500])
  const [categoriesState, setCategoriesState] = useState<string[]>([])
  const [colorsState, setColorsState] = useState<string[]>([])
  const [sizesState, setSizesState] = useState<string[]>([])
  const [sortOrderStates, setSortOrderStates] = useState<string>('')

  //
  const handleChangeCategories = (checked: boolean, name: string) => {
    checked
      ? setCategoriesState([...categoriesState, name])
      : setCategoriesState(categoriesState.filter((i) => i !== name))
  }
  const handleChangeColors = (checked: boolean, name: string) => {
    checked ? setColorsState([...colorsState, name]) : setColorsState(colorsState.filter((i) => i !== name))
  }
  const handleChangeSizes = (checked: boolean, name: string) => {
    checked ? setSizesState([...sizesState, name]) : setSizesState(sizesState.filter((i) => i !== name))
  }

  // OK
  const renderTabsCategories = () => {
    return (
      <div>
        <h3 className="font-semibold">Categories</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_categories.map((item) => (
            <div key={item.name}>
              <Checkbox
                name={item.name}
                label={item.name}
                defaultChecked={categoriesState.includes(item.name)}
                sizeClassName="w-5 h-5"
                labelClassName="text-sm font-normal"
                onChange={(checked) => handleChangeCategories(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // OK
  const renderTabsColor = () => {
    return (
      <div>
        <h3 className="font-semibold">Colors</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_colors.map((item) => (
            <div key={item.name} className="">
              <Checkbox
                sizeClassName="w-5 h-5"
                labelClassName="text-sm font-normal"
                name={item.name}
                label={item.name}
                defaultChecked={colorsState.includes(item.name)}
                onChange={(checked) => handleChangeColors(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // OK
  const renderTabsSize = () => {
    return (
      <div>
        <h3 className="font-semibold">Sizes</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_sizes.map((item) => (
            <div key={item.name} className="">
              <Checkbox
                name={item.name}
                label={item.name}
                defaultChecked={sizesState.includes(item.name)}
                onChange={(checked) => handleChangeSizes(checked, item.name)}
                sizeClassName="w-5 h-5"
                labelClassName="text-sm font-normal"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // OK
  const renderTabsPriceRage = () => {
    return (
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-6">
          <span className="font-medium">Price range</span>
          <Slider
            range
            min={PRICE_RANGE[0]}
            max={PRICE_RANGE[1]}
            step={1}
            defaultValue={[rangePrices?.[0] ?? 500, rangePrices?.[1] ?? 1000]}
            allowCross={false}
            onChange={(_input) => setRangePrices(_input as number[])}
          />
        </div>

        <div className="flex justify-between gap-x-5">
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Min price
            </label>
            <div className="relative mt-1 rounded-md">
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500 sm:text-sm">
                $
              </span>

              <Input
                sizeClass="pr-10 pl-4 py-2"
                type="text"
                name="minPrice"
                className="disabled:bg-white!"
                disabled
                id="minPrice"
                value={rangePrices?.[0]}
              />
            </div>
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Max price
            </label>
            <div className="relative mt-1 rounded-md">
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500 sm:text-sm">
                $
              </span>
              <Input
                className="disabled:bg-white!"
                sizeClass="pr-10 pl-4 py-2"
                type="text"
                disabled
                name="maxPrice"
                id="maxPrice"
                value={rangePrices?.[1]}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // OK
  const renderTabsSortOrder = () => {
    return (
      <div>
        <h3 className="font-semibold">Sort order</h3>
        <div className="mt-8 flex flex-col gap-y-4">
          {DATA_sortOrderRadios.map((item) => (
            <Radio
              id={item.id}
              key={item.id}
              name="radioNameSort"
              label={item.name}
              defaultChecked={sortOrderStates === item.id}
              sizeClassName="w-5 h-5"
              onChange={setSortOrderStates}
              className="text-sm!"
            />
          ))}
        </div>
      </div>
    )
  }

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
        <MySwitch label="On sale!" desc="Products currently on sale" enabled={isOnSale} onChange={setIsIsOnSale} />
        <Divider />
        {renderTabsSortOrder()}
      </div>
    </div>
  )
}

export default SidebarFilters
