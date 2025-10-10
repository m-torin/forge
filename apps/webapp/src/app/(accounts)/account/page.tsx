import avatar from '@/images/users/avatar1.jpg';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { Field, Fieldset, Label } from '@/shared/fieldset';
import { Input, InputGroup } from '@/shared/input';
import { Select } from '@/shared/select';
import { Textarea } from '@/shared/textarea';
import {
  Calendar01Icon,
  ImageAdd02Icon,
  Mail01Icon,
  MapsLocation01Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Metadata } from 'next';
import Form from 'next/form';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Account page',
};

const Page = () => {
  const handleSubmit = async (formData: FormData) => {
    'use server';
    const _formObject = Object.fromEntries(formData.entries());
    // TODO: Update the account
  };

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <h1 className="text-2xl font-semibold sm:text-3xl">Account infomation</h1>

      <Form action={handleSubmit}>
        <Fieldset className="flex flex-col md:flex-row">
          <div className="flex shrink-0 items-start">
            {/* AVATAR */}
            <div className="relative flex overflow-hidden rounded-full">
              <Image
                src={avatar}
                alt="avatar"
                width={avatar.width}
                height={avatar.height}
                sizes="132px"
                priority
                className="z-0 size-32 rounded-full object-cover"
              />
              <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 text-neutral-50">
                <HugeiconsIcon
                  icon={ImageAdd02Icon}
                  size={30}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                <span className="mt-1 text-xs">Change Image</span>
              </div>
              <input
                type="file"
                name="avatar"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </div>
          <div className="mt-10 max-w-3xl grow space-y-7 md:mt-0 md:pl-16">
            <Field>
              <Label>Full name</Label>
              <Input name="full-name" defaultValue="Enrico Cole" />
            </Field>

            {/* ---- */}
            <Field>
              <Label>Email</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={Mail01Icon} size={16} />
                <Input name="email" type="email" placeholder="example@email.com" />
              </InputGroup>
            </Field>

            {/* ---- */}
            <Field className="max-w-lg">
              <Label>Date of birth</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={Calendar01Icon} size={16} />
                <Input name="date-of-birth" type="date" defaultValue="1990-07-22" />
              </InputGroup>
            </Field>
            {/* ---- */}
            <Field>
              <Label>Addess</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={MapsLocation01Icon} size={16} />
                <Input name="address" defaultValue="New york, USA" />
              </InputGroup>
            </Field>

            {/* ---- */}
            <Field>
              <Label>Gender</Label>
              <Select name="gender" defaultValue="Male">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </Field>

            {/* ---- */}
            <Field>
              <Label>Phone number</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={SmartPhone01Icon} size={16} />
                <Input name="phone-number" defaultValue="003 888 232" />
              </InputGroup>
            </Field>
            {/* ---- */}
            <Field>
              <Label>About you</Label>
              <Textarea rows={4} name="about-you" defaultValue="..." />
            </Field>
            <div className="pt-2">
              <ButtonPrimary type="submit">Update account</ButtonPrimary>
            </div>
          </div>
        </Fieldset>
      </Form>
    </div>
  );
};

export default Page;
