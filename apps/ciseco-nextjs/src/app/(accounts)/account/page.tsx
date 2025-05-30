import Label from '@/components/Label/Label'
import avatar from '@/images/users/avatar1.jpg'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Input from '@/shared/Input/Input'
import Select from '@/shared/Select/Select'
import Textarea from '@/shared/Textarea/Textarea'
import {
  Calendar01Icon,
  ImageAdd02Icon,
  Mail01Icon,
  MapsLocation01Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Account page',
}

const Page = () => {
  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <h1 className="text-2xl font-semibold sm:text-3xl">Account infomation</h1>
      <div className="flex flex-col md:flex-row">
        <div className="flex shrink-0 items-start">
          {/* AVATAR */}
          <div className="relative flex overflow-hidden rounded-full">
            <Image
              src={avatar}
              alt={'avatar'}
              width={avatar.width}
              height={avatar.height}
              sizes="132px"
              priority
              className="z-0 size-32 rounded-full object-cover"
            />
            <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 text-neutral-50">
              <HugeiconsIcon icon={ImageAdd02Icon} size={30} color="currentColor" strokeWidth={1.5} />
              <span className="mt-1 text-xs">Change Image</span>
            </div>
            <input type="file" className="absolute inset-0 cursor-pointer opacity-0" />
          </div>
        </div>
        <div className="mt-10 max-w-3xl grow space-y-6 md:mt-0 md:pl-16">
          <div>
            <Label>Full name</Label>
            <Input className="mt-1.5" defaultValue="Enrico Cole" />
          </div>

          {/* ---- */}
          <div>
            <Label>Email</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <HugeiconsIcon icon={Mail01Icon} size={16} color="currentColor" strokeWidth={1.5} />
              </span>
              <Input className="rounded-l-none!" placeholder="example@email.com" />
            </div>
          </div>

          {/* ---- */}
          <div className="max-w-lg">
            <Label>Date of birth</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <HugeiconsIcon icon={Calendar01Icon} size={16} color="currentColor" strokeWidth={1.5} />
              </span>
              <Input className="rounded-l-none!" type="date" defaultValue="1990-07-22" />
            </div>
          </div>
          {/* ---- */}
          <div>
            <Label>Addess</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <HugeiconsIcon icon={MapsLocation01Icon} size={16} color="currentColor" strokeWidth={1.5} />
              </span>
              <Input className="rounded-l-none!" defaultValue="New york, USA" />
            </div>
          </div>

          {/* ---- */}
          <div>
            <Label>Gender</Label>
            <Select className="mt-1.5">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          {/* ---- */}
          <div>
            <Label>Phone number</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <HugeiconsIcon icon={SmartPhone01Icon} size={16} color="currentColor" strokeWidth={1.5} />
              </span>
              <Input className="rounded-l-none!" defaultValue="003 888 232" />
            </div>
          </div>
          {/* ---- */}
          <div>
            <Label>About you</Label>
            <Textarea className="mt-1.5" defaultValue="..." />
          </div>
          <div className="pt-2">
            <ButtonPrimary>Update account</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
