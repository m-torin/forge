import { getDictionary } from '@/i18n';
import { type Metadata } from 'next';
import Image from 'next/image';
import { IconCalendar, IconCamera, IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';

import { ButtonPrimary, Input, Label, Select, Textarea } from '@/components/ui';
import avatarImage from '@repo/design-system/mantine-ciseco/images/users/avatar1.jpg';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    description: dict.account.accountDescription,
    title: dict.account.accountPage,
  };
}

const Page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <h1 className="text-2xl font-semibold sm:text-3xl">{dict.account.personalInfo}</h1>
      <div className="flex flex-col md:flex-row">
        <div className="flex shrink-0 items-start">
          {/* AVATAR */}
          <div className="relative flex overflow-hidden rounded-full">
            <Image
              width={avatarImage.width}
              priority
              className="z-0 size-32 rounded-full object-cover"
              alt="avatar"
              height={avatarImage.height}
              sizes="132px"
              src={avatarImage}
            />
            <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 text-neutral-50">
              <IconCamera size={30} stroke={1.5} />
              <span className="mt-1 text-xs">Change Image</span>
            </div>
            <input className="absolute inset-0 cursor-pointer opacity-0" type="file" />
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
                <IconMail size={16} stroke={1.5} />
              </span>
              <Input placeholder="example@email.com" className="rounded-l-none!" />
            </div>
          </div>

          {/* ---- */}
          <div className="max-w-lg">
            <Label>Date of birth</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <IconCalendar size={16} stroke={1.5} />
              </span>
              <Input className="rounded-l-none!" defaultValue="1990-07-22" type="date" />
            </div>
          </div>
          {/* ---- */}
          <div>
            <Label>Addess</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <IconMapPin size={16} stroke={1.5} />
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
                <IconPhone size={16} stroke={1.5} />
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
  );
};

export default Page;
