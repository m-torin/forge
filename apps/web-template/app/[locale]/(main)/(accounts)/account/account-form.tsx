'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IconCalendar, IconCamera, IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { ButtonPrimary, Input, Label, Select, Textarea } from '@/components/ui';
import { notifications } from '@mantine/notifications';
import { updateUser } from '@/actions/user';
import avatarImage from '@repo/design-system/mantine-ciseco/images/users/avatar1.jpg';

interface AccountFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    address?: string | null;
    gender?: string | null;
    bio?: string | null;
  };
  locale: string;
  dict: any;
}

export function AccountForm({ user, locale, dict }: AccountFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    address: user.address || '',
    gender: user.gender || '',
    bio: user.bio || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUpdating(true);
    try {
      const result = await updateUser({
        name: formData.name,
        // Note: email update should have verification flow
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address || undefined,
        gender: formData.gender || undefined,
        bio: formData.bio || undefined,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Your account has been updated',
          color: 'green',
        });
        router.refresh();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update account',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred while updating your account',
        color: 'red',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row">
        <div className="flex shrink-0 items-start">
          {/* AVATAR */}
          <div className="relative flex overflow-hidden rounded-full">
            <Image
              width={132}
              height={132}
              priority
              className="z-0 size-32 rounded-full object-cover"
              alt="avatar"
              src={user.image || avatarImage}
            />
            <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 text-neutral-50">
              <IconCamera size={30} stroke={1.5} />
              <span className="mt-1 text-xs">Change Image</span>
            </div>
            <input
              className="absolute inset-0 cursor-pointer opacity-0"
              type="file"
              accept="image/*"
              disabled
              title="Image upload coming soon"
            />
          </div>
        </div>
        <div className="mt-10 max-w-3xl grow space-y-6 md:mt-0 md:pl-16">
          <div>
            <Label>Full name</Label>
            <Input
              className="mt-1.5"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          {/* ---- */}
          <div>
            <Label>Email</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <IconMail size={16} stroke={1.5} />
              </span>
              <Input
                placeholder="example@email.com"
                className="rounded-l-none!"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                type="email"
                disabled
                title="Email changes require verification (coming soon)"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">Email changes require verification</p>
          </div>

          {/* ---- */}
          <div className="max-w-lg">
            <Label>Date of birth</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <IconCalendar size={16} stroke={1.5} />
              </span>
              <Input
                className="rounded-l-none!"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                type="date"
              />
            </div>
          </div>

          {/* ---- */}
          <div>
            <Label>Address</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <IconMapPin size={16} stroke={1.5} />
              </span>
              <Input
                className="rounded-l-none!"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* ---- */}
          <div>
            <Label>Gender</Label>
            <Select
              className="mt-1.5"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </Select>
          </div>

          {/* ---- */}
          <div>
            <Label>Phone number</Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <IconPhone size={16} stroke={1.5} />
              </span>
              <Input
                className="rounded-l-none!"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 234 567 8900"
                type="tel"
              />
            </div>
          </div>

          {/* ---- */}
          <div>
            <Label>About you</Label>
            <Textarea
              className="mt-1.5"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={4}
            />
          </div>

          <div className="pt-2">
            <ButtonPrimary type="submit" loading={isUpdating}>
              Update account
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </form>
  );
}
