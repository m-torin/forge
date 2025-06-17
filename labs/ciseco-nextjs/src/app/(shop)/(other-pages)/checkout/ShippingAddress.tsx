'use client'

import Label from '@/components/Label/Label'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import Input from '@/shared/Input/Input'
import Radio from '@/shared/Radio/Radio'
import Select from '@/shared/Select/Select'
import { FC } from 'react'

interface Props {
  isActive: boolean
  onCloseActive: () => void
  onOpenActive: () => void
}

const ShippingAddress: FC<Props> = ({ isActive, onCloseActive, onOpenActive }) => {
  const renderShippingAddress = () => {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col items-start p-6 sm:flex-row">
          <span className="hidden sm:block">
            <svg
              className="mt-0.5 h-6 w-6 text-neutral-700 dark:text-neutral-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.1401 15.0701V13.11C12.1401 10.59 14.1801 8.54004 16.7101 8.54004H18.6701"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.62012 8.55005H7.58014C10.1001 8.55005 12.1501 10.59 12.1501 13.12V13.7701V17.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.14008 6.75L5.34009 8.55L7.14008 10.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.8601 6.75L18.6601 8.55L16.8601 10.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <div className="sm:ml-8">
            <h3 className="flex text-neutral-700 dark:text-neutral-300">
              <span className="uppercase">SHIPPING ADDRESS</span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="ml-3 h-5 w-5 text-neutral-900 dark:text-neutral-100"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </h3>
            <div className="mt-1 text-sm font-semibold">
              <span className="">{`St. Paul's Road, Norris, SD 57560, Dakota, USA`}</span>
            </div>
          </div>
          <button
            className="mt-5 rounded-lg bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:mt-0 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
            onClick={onOpenActive}
          >
            Change
          </button>
        </div>
        <div
          className={`space-y-4 border-t border-neutral-200 px-6 py-7 sm:space-y-6 dark:border-neutral-700 ${
            isActive ? 'block' : 'hidden'
          }`}
        >
          {/* ============ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
            <div>
              <Label className="text-sm">First name</Label>
              <Input className="mt-1.5" defaultValue="Cole" />
            </div>
            <div>
              <Label className="text-sm">Last name</Label>
              <Input className="mt-1.5" defaultValue="Enrico " />
            </div>
          </div>

          {/* ============ */}
          <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-3">
            <div className="flex-1">
              <Label className="text-sm">Address</Label>
              <Input className="mt-1.5" placeholder="" defaultValue={'123, Dream Avenue, USA'} type={'text'} />
            </div>
            <div className="sm:w-1/3">
              <Label className="text-sm">Apt, Suite *</Label>
              <Input className="mt-1.5" defaultValue="55U - DD5 " />
            </div>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
            <div>
              <Label className="text-sm">City</Label>
              <Input className="mt-1.5" defaultValue="Norris" />
            </div>
            <div>
              <Label className="text-sm">Country</Label>
              <Select className="mt-1.5" defaultValue="United States ">
                <option value="United States">United States</option>
                <option value="United States">Canada</option>
                <option value="United States">Mexico</option>
                <option value="United States">Israel</option>
                <option value="United States">France</option>
                <option value="United States">England</option>
                <option value="United States">Laos</option>
                <option value="United States">China</option>
              </Select>
            </div>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
            <div>
              <Label className="text-sm">State/Province</Label>
              <Input className="mt-1.5" defaultValue="Texas" />
            </div>
            <div>
              <Label className="text-sm">Postal code</Label>
              <Input className="mt-1.5" defaultValue="2500 " />
            </div>
          </div>

          {/* ============ */}
          <div>
            <Label className="text-sm">Address type</Label>
            <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              <Radio
                label={`<span class="text-sm font-medium">Home <span class="font-light">(All Day Delivery)</span></span>`}
                id="Address-type-home"
                name="Address-type"
                defaultChecked
              />
              <Radio
                label={`<span class="text-sm font-medium">Office <span class="font-light">(Delivery <span class="font-medium">9 AM - 5 PM</span>)</span> </span>`}
                id="Address-type-office"
                name="Address-type"
              />
            </div>
          </div>

          {/* ============ */}
          <div className="flex flex-col pt-6 sm:flex-row">
            <ButtonPrimary className="shadow-none sm:px-7!" onClick={onCloseActive}>
              Save and next to Payment
            </ButtonPrimary>
            <ButtonSecondary className="mt-3 sm:mt-0 sm:ml-3" onClick={onCloseActive}>
              Cancel
            </ButtonSecondary>
          </div>
        </div>
      </div>
    )
  }
  return renderShippingAddress()
}

export default ShippingAddress
