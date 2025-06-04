'use client';

import { UserCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu } from '@mantine/core';

import { useLocalizeHref } from '../../hooks/useLocale';
import avatarImage from '../../images/users/avatar4.jpg';
import { Link } from '../Link';
import Avatar from '../shared/Avatar/Avatar';

interface Props {
  className?: string;
}

export default function AvatarDropdown({ className }: Props) {
  const localizeHref = useLocalizeHref();

  const menuItems = [
    {
      href: '/account',
      icon: (
        <svg width="24" viewBox="0 0 24 24" fill="none" height="24">
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z"
          />
        </svg>
      ),
      label: 'My Account',
    },
    {
      href: '/orders',
      icon: (
        <svg width="24" viewBox="0 0 24 24" fill="none" height="24">
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M8 12.2H15"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M8 16.2H12.38"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M16 4.02002C19.33 4.20002 21 5.43002 21 10V16C21 20 20 22 15 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002"
          />
        </svg>
      ),
      label: 'My Orders',
    },
    {
      href: '/account-wishlists',
      icon: (
        <svg width="24" viewBox="0 0 24 24" fill="none" height="24">
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
          />
        </svg>
      ),
      label: 'Wishlist',
    },
    {
      divider: true,
    },
    {
      href: '#',
      icon: (
        <svg width="24" viewBox="0 0 24 24" fill="none" height="24">
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.97 22C17.4928 22 21.97 17.5228 21.97 12C21.97 6.47715 17.4928 2 11.97 2C6.44715 2 1.97 6.47715 1.97 12C1.97 17.5228 6.44715 22 11.97 22Z"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.89999 4.92993L8.43999 8.45993"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.89999 19.07L8.43999 15.54"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.05 19.07L15.51 15.54"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.05 4.92993L15.51 8.45993"
          />
        </svg>
      ),
      label: 'Help',
    },
    {
      href: '#',
      icon: (
        <svg width="24" viewBox="0 0 24 24" fill="none" height="24">
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12H3.62"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.85 8.6499L2.5 11.9999L5.85 15.3499"
          />
        </svg>
      ),
      label: 'Log out',
    },
  ];

  return (
    <div className={className}>
      <Menu
        width={320}
        offset={12}
        position="bottom-end"
        shadow="lg"
        transitionProps={{ duration: 200, transition: 'pop-top-right' }}
        classNames={{
          dropdown: 'rounded-3xl border-0 ring-1 ring-black/5 dark:ring-white/10 px-0',
        }}
        styles={{
          dropdown: {
            backgroundColor: 'transparent',
            padding: 0,
          },
        }}
      >
        <Menu.Target>
          <button className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-hidden dark:hover:bg-neutral-800">
            <HugeiconsIcon
              strokeWidth={1.5}
              color="currentColor"
              icon={UserCircle02Icon}
              size={24}
            />
          </button>
        </Menu.Target>

        <Menu.Dropdown>
          <div className="bg-white dark:bg-neutral-800 rounded-3xl">
            <div className="px-6 pt-7 pb-4">
              <div className="flex items-center space-x-3">
                <Avatar imgUrl={avatarImage} sizeClass="size-12" />
                <div className="grow">
                  <h4 className="font-semibold">Eden Smith</h4>
                  <p className="mt-0.5 text-xs">Los Angeles, CA</p>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3">
              {menuItems.map((item, index) => {
                if (item.divider) {
                  return (
                    <Menu.Divider
                      key={index}
                      className="my-2 mx-3 border-neutral-900/10 dark:border-neutral-100/10"
                    />
                  );
                }

                return (
                  <Menu.Item
                    key={index}
                    href={localizeHref(item.href!)}
                    component={Link}
                    className="flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    classNames={{
                      item: 'p-0 bg-transparent hover:bg-transparent',
                    }}
                    styles={{
                      item: {
                        '&[data-hovered]': {
                          backgroundColor: 'transparent',
                        },
                      },
                    }}
                  >
                    <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                      {item.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                  </Menu.Item>
                );
              })}
            </div>
          </div>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
