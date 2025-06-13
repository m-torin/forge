'use client';

import {
  IconUser,
  IconUserCircle,
  IconClipboardList,
  IconHeart,
  IconHelp,
  IconLogout,
} from '@tabler/icons-react';
import { Menu } from '@mantine/core';
import Link from 'next/link';

interface Props {
  className?: string;
  'data-testid'?: string;
}

export default function AvatarDropdown({
  className,
  'data-testid': testId = 'avatar-dropdown',
}: Props) {
  const menuItems = [
    {
      href: '/account',
      icon: <IconUser size={20} stroke={1.5} />,
      label: 'My Account',
    },
    {
      href: '/orders',
      icon: <IconClipboardList size={20} stroke={1.5} />,
      label: 'My Orders',
    },
    {
      href: '/account-wishlists',
      icon: <IconHeart size={20} stroke={1.5} />,
      label: 'Wishlist',
    },
    {
      divider: true,
    },
    {
      href: '#',
      icon: <IconHelp size={20} stroke={1.5} />,
      label: 'Help',
    },
    {
      href: '#',
      icon: <IconLogout size={20} stroke={1.5} />,
      label: 'Log out',
    },
  ];

  return (
    <div className={className} data-testid={testId}>
      <Menu
        classNames={{
          dropdown: 'rounded-3xl border-0 ring-1 ring-black/5 dark:ring-white/10 px-0',
        }}
        offset={12}
        position="bottom-end"
        shadow="lg"
        styles={{
          dropdown: {
            backgroundColor: 'transparent',
            padding: 0,
          },
        }}
        transitionProps={{ duration: 200, transition: 'pop-top-right' }}
        width={320}
      >
        <Menu.Target>
          <button className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-hidden dark:hover:bg-neutral-800">
            <IconUserCircle color="currentColor" size={24} stroke={1.5} />
          </button>
        </Menu.Target>

        <Menu.Dropdown>
          <div className="bg-white dark:bg-neutral-800 rounded-3xl">
            <div className="px-6 pt-7 pb-4">
              <div className="flex items-center space-x-3">
                <div className="size-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <IconUser size={24} stroke={1.5} />
                </div>
                <div className="grow">
                  <h4 className="font-semibold">Guest User</h4>
                  <p className="mt-0.5 text-xs">Please sign in</p>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3">
              {menuItems.map((item, index) => {
                if (item.divider) {
                  return (
                    <Menu.Divider
                      key={`divider-${item.divider}-${index}`}
                      className="my-2 mx-3 border-neutral-900/10 dark:border-neutral-100/10"
                    />
                  );
                }
                return (
                  <Menu.Item
                    key={item.label}
                    className="flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    classNames={{
                      item: 'p-0 bg-transparent hover:bg-transparent',
                    }}
                    component={Link}
                    href={item.href!}
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
