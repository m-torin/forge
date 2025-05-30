'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import Checkbox from '@/shared/Checkbox/Checkbox'
import Input from '@/shared/Input/Input'
import Radio from '@/shared/Radio/Radio'
import { Popover, PopoverButton, PopoverPanel, PopoverPanelProps } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import {
  Cancel01Icon,
  DollarCircleIcon,
  Note01Icon,
  PaintBucketIcon,
  PercentCircleIcon,
  ResizeFieldRectangleIcon,
  SortingAZ02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import Slider from 'rc-slider'
import { useState } from 'react'

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
]
const DATA_colors = [{ name: 'Beige' }, { name: 'Blue' }, { name: 'Black' }, { name: 'Brown' }, { name: 'Green' }]
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
const TabFilters = ({ className }: { className?: string }) => {
  const [isOnSale, setIsIsOnSale] = useState<boolean>()
  const [rangePrices, setRangePrices] = useState<number[]>([100, 500])
  const [categoriesState, setCategoriesState] = useState<string[]>()
  const [colorsState, setColorsState] = useState<string[]>()
  const [sizesState, setSizesState] = useState<string[]>()
  const [sortOrderStates, setSortOrderStates] = useState<string>()

  //
  const handleChangeCategories = (checked: boolean, name: string) => {
    checked
      ? setCategoriesState([...(categoriesState || []), name])
      : setCategoriesState(categoriesState?.filter((i) => i !== name))
  }

  const handleChangeColors = (checked: boolean, name: string) => {
    checked ? setColorsState([...(colorsState || []), name]) : setColorsState(colorsState?.filter((i) => i !== name))
  }

  const handleChangeSizes = (checked: boolean, name: string) => {
    checked ? setSizesState([...(sizesState || []), name]) : setSizesState(sizesState?.filter((i) => i !== name))
  }

  // OK
  const renderXClear = () => {
    return (
      <span className="ms-3 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white">
        <HugeiconsIcon icon={Cancel01Icon} size={10} color="currentColor" strokeWidth={1.5} />
      </span>
    )
  }

  // OK
  const renderTabsCategories = () => {
    return (
      <FieldPopover
        buttonText="Categories"
        fieldState={categoriesState}
        onClickClear={() => setCategoriesState([])}
        anchor="bottom start"
        buttonIcon={Note01Icon}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          <Checkbox
            name="All Categories"
            label="All Categories"
            defaultChecked={categoriesState?.includes('All Categories')}
            onChange={(checked) => handleChangeCategories(checked, 'All Categories')}
          />
          <div className="w-full border-b border-neutral-200 dark:border-neutral-700" />
          {DATA_categories.map((item) => (
            <div key={item.name}>
              <Checkbox
                name={item.name}
                label={item.name}
                defaultChecked={categoriesState?.includes(item.name)}
                onChange={(checked) => handleChangeCategories(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </FieldPopover>
    )
  }

  // OK
  const renderTabsSortOrder = () => {
    return (
      <FieldPopover
        buttonText="Sort Order"
        fieldState={sortOrderStates}
        onClickClear={() => setSortOrderStates('')}
        anchor="bottom end"
        buttonIcon={SortingAZ02Icon}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          {DATA_sortOrderRadios.map((item) => (
            <Radio
              id={item.id}
              key={item.id}
              name="radioNameSort"
              label={item.name}
              defaultChecked={sortOrderStates === item.id}
              onChange={setSortOrderStates}
            />
          ))}
        </div>
      </FieldPopover>
    )
  }

  // OK
  const renderTabsColor = () => {
    return (
      <FieldPopover
        buttonText="Colors"
        fieldState={colorsState}
        onClickClear={() => setColorsState([])}
        anchor="bottom start"
        buttonIcon={PaintBucketIcon}
      >
        <div className="relative flex flex-col gap-y-5 px-5 py-6">
          {DATA_colors.map((item) => (
            <div key={item.name} className="">
              <Checkbox
                name={item.name}
                label={item.name}
                defaultChecked={colorsState?.includes(item.name)}
                onChange={(checked) => handleChangeColors(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </FieldPopover>
    )
  }

  // OK
  const renderTabsSize = () => {
    return (
      <FieldPopover
        buttonText="Sizes"
        fieldState={sizesState}
        onClickClear={() => setSizesState([])}
        anchor="bottom start"
        buttonIcon={ResizeFieldRectangleIcon}
      >
        <div className="relative flex flex-col space-y-5 px-5 py-6">
          {DATA_sizes.map((item) => (
            <div key={item.name}>
              <Checkbox
                name={item.name}
                label={item.name}
                defaultChecked={sizesState?.includes(item.name)}
                onChange={(checked) => handleChangeSizes(checked, item.name)}
              />
            </div>
          ))}
        </div>
      </FieldPopover>
    )
  }

  // OK
  const renderTabsPriceRage = () => {
    return (
      <FieldPopover
        buttonText={`${rangePrices?.[0] ?? 0}$ - ${rangePrices?.[1] ?? 0}$`}
        fieldState={sizesState}
        onClickClear={() => setRangePrices(PRICE_RANGE)}
        anchor="bottom start"
        buttonIcon={DollarCircleIcon}
      >
        <div className="relative flex flex-col gap-y-8 px-5 py-6">
          <div className="flex flex-col gap-y-5">
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
      </FieldPopover>
    )
  }

  // OK
  const renderTabIsOnsale = () => {
    return (
      <div
        className={`flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm select-none focus:outline-hidden ${
          isOnSale
            ? 'border-primary-500 bg-primary-50 text-primary-900'
            : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500'
        }`}
        onClick={() => setIsIsOnSale(!isOnSale)}
      >
        <HugeiconsIcon icon={PercentCircleIcon} size={16} color="currentColor" strokeWidth={1.5} />
        <span className="ms-2 line-clamp-1">On sale</span>
        {isOnSale && renderXClear()}
      </div>
    )
  }

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
  )
}

const FieldPopover = ({
  fieldState,
  onClickClear,
  children,
  anchor = 'bottom start',
  buttonText,
  buttonIcon: ButtonIcon = Note01Icon,
}: {
  fieldState: any[] | string | undefined
  onClickClear: () => void
  children?: React.ReactNode
  anchor?: PopoverPanelProps['anchor']
  buttonText: string
  buttonIcon: IconSvgElement
}) => {
  return (
    <Popover className="group relative">
      <PopoverButton
        className={`flex items-center justify-center rounded-full border px-4 py-2 text-sm select-none group-data-open:border-primary-500 focus:outline-hidden ${
          fieldState?.length
            ? 'border-primary-500 bg-primary-50 text-primary-900'
            : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500'
        } `}
      >
        <HugeiconsIcon icon={ButtonIcon} size={16} color="currentColor" strokeWidth={1.5} />
        <span className="ms-2">{buttonText}</span>
        {!fieldState?.length ? (
          <ChevronDownIcon className="ms-3 h-4 w-4" />
        ) : (
          <span
            className="ms-3 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white"
            onClick={onClickClear}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={10} color="currentColor" strokeWidth={1.5} />
          </span>
        )}
      </PopoverButton>

      <PopoverPanel
        transition
        anchor={anchor}
        className="z-10 mt-3 w-96 rounded-2xl border border-neutral-200 bg-white px-4 shadow-xl transition duration-200 ease-out data-closed:translate-y-1 data-closed:opacity-0 sm:px-0 dark:border-neutral-700 dark:bg-neutral-900"
      >
        {({ close }) => (
          <>
            {children}
            <div className="flex items-center justify-between bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
              <ButtonThird
                onClick={() => {
                  onClickClear()
                  close()
                  console.log('clear')
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
        )}
      </PopoverPanel>
    </Popover>
  )
}

export default TabFilters
