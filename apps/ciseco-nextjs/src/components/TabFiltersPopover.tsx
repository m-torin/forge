'use client'

import MySwitch from '@/components/MySwitch'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import ButtonClose from '@/shared/ButtonClose/ButtonClose'
import Checkbox from '@/shared/Checkbox/Checkbox'
import Radio from '@/shared/Radio/Radio'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Cancel01Icon, FilterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
const TabFiltersPopover = ({ className }: { className?: string }) => {
  const [isOpenMoreFilter, setisOpenMoreFilter] = useState(false)
  //
  const [isOnSale, setIsIsOnSale] = useState<boolean>()
  const [rangePrices, setRangePrices] = useState<number[]>([100, 500])
  const [categoriesState, setCategoriesState] = useState<string[]>()
  const [colorsState, setColorsState] = useState<string[]>()
  const [sizesState, setSizesState] = useState<string[]>()
  const [sortOrderStates, setSortOrderStates] = useState<string>()
  //
  const closeModalMoreFilter = () => setisOpenMoreFilter(false)
  const openModalMoreFilter = () => setisOpenMoreFilter(true)
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

  return (
    <div className={className}>
      <div
        className="flex cursor-pointer items-center justify-center rounded-full border border-primary-500 bg-primary-50 px-4 py-2 text-sm text-primary-900 select-none focus:outline-hidden"
        onClick={openModalMoreFilter}
      >
        <HugeiconsIcon icon={FilterIcon} size={16} color="currentColor" strokeWidth={1.5} />
        <span className="ms-2">Products filters (3)</span>
        <span className="ms-3 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white">
          <HugeiconsIcon icon={Cancel01Icon} size={10} color="currentColor" strokeWidth={1.5} />
        </span>
      </div>

      <Dialog className="relative z-50" open={isOpenMoreFilter} onClose={closeModalMoreFilter}>
        <DialogBackdrop transition className="fixed inset-0 bg-black/30 ease-out data-closed:opacity-0" />

        <DialogPanel
          transition
          className="fixed inset-0 transition duration-300 ease-out data-closed:translate-y-10 data-closed:opacity-0"
        >
          <div className="min-h-screen text-center">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-svh align-middle" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block h-svh w-full max-w-4xl">
              <div className="inline-flex h-full w-full flex-col bg-white text-left align-middle transition-all dark:border dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
                <div className="relative shrink-0 border-b border-neutral-200 px-6 py-4 text-center dark:border-neutral-800">
                  <DialogTitle as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Products filters
                  </DialogTitle>
                  <span className="absolute top-3 left-3">
                    <ButtonClose onClick={closeModalMoreFilter} />
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
                          name="categories"
                          handleChange={handleChangeCategories}
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
                          name="colors"
                          handleChange={handleChangeColors}
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
                            name="sizes"
                            handleChange={handleChangeSizes}
                          />
                        </div>
                      </div>

                      {/* --------- */}
                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Range Prices</h3>
                        <div className="relative mt-6">
                          <div className="relative flex flex-col space-y-8">
                            <Slider
                              range
                              className="text-red-400"
                              min={PRICE_RANGE[0]}
                              max={PRICE_RANGE[1]}
                              defaultValue={rangePrices}
                              allowCross={false}
                              onChange={(_input: number | number[]) => setRangePrices(_input as number[])}
                            />

                            <div className="flex justify-between space-x-5">
                              <div>
                                <label
                                  htmlFor="minPrice"
                                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                  Min price
                                </label>
                                <div className="relative mt-1 rounded-md">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-neutral-500 sm:text-sm">$</span>
                                  </div>
                                  <input
                                    type="text"
                                    name="minPrice"
                                    disabled
                                    id="minPrice"
                                    className="block w-full rounded-full border-neutral-200 pr-3 pl-7 text-neutral-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-neutral-500 sm:text-sm">$</span>
                                  </div>
                                  <input
                                    type="text"
                                    disabled
                                    name="maxPrice"
                                    id="maxPrice"
                                    className="block w-full rounded-full border-neutral-200 pr-3 pl-7 text-neutral-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={rangePrices?.[1]}
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
                                id={item.id}
                                key={item.id}
                                name="radioNameSort"
                                label={item.name}
                                defaultChecked={sortOrderStates === item.id}
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
                            label="On sale!"
                            desc="Products currently on sale"
                            enabled={isOnSale}
                            onChange={setIsIsOnSale}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between bg-neutral-50 px-6 py-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                    <ButtonThird
                      onClick={() => {
                        setRangePrices(PRICE_RANGE)
                        setCategoriesState([])
                        setColorsState([])
                        setSortOrderStates('')
                        closeModalMoreFilter()
                      }}
                      sizeClass="py-2.5 px-5"
                    >
                      Clear
                    </ButtonThird>
                    <ButtonPrimary onClick={closeModalMoreFilter} sizeClass="py-2.5 px-5">
                      Apply
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  )
}

const FilterItem = ({
  data,
  name,
  handleChange,
}: {
  data: {
    name: string
    description?: string
    defaultChecked?: boolean
  }[]
  name: string
  handleChange: (checked: boolean, name: string) => void
}) => {
  const list1 = data.filter((_, i) => i < data.length / 2)
  const list2 = data.filter((_, i) => i >= data.length / 2)
  return (
    <div className="grid grid-cols-2 gap-8 gap-x-4 sm:gap-x-8">
      <div className="flex flex-col space-y-5">
        {list1.map((item) => (
          <Checkbox
            key={item.name}
            name={item.name}
            description={item.description}
            label={item.name}
            defaultChecked={!!item.defaultChecked}
          />
        ))}
      </div>
      <div className="flex flex-col space-y-5">
        {list2.map((item) => (
          <Checkbox
            key={item.name}
            name={item.name}
            description={item.description}
            label={item.name}
            defaultChecked={!!item.defaultChecked}
          />
        ))}
      </div>
    </div>
  )
}

export default TabFiltersPopover
