'use client';

import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Menu, Tabs } from '@mantine/core';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { type FC } from 'react';

import { type TCurrency, type TLanguage } from '../../data/types';
import { Link } from '../Link';

const Currencies = ({ currencies }: { currencies: TCurrency[] }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {currencies.map((item: any) => (
        <Link
          key={item.name}
          className={clsx(
            '-m-2.5 flex items-center rounded-lg p-2.5 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-hidden dark:hover:bg-gray-700',
            item.active ? 'bg-gray-100 dark:bg-gray-700' : 'opacity-80',
          )}
          href={`${item.href}` as any}
        >
          <div dangerouslySetInnerHTML={{ __html: item.icon }} />
          <p className="ml-2 text-sm font-medium">{item.name}</p>
        </Link>
      ))}
    </div>
  );
};

const Languages = ({
  currentLocale,
  languages,
}: {
  currentLocale?: string;
  languages: TLanguage[];
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleClick = (locale: string) => {
    if (!pathname) return;

    // Get the current path without the locale
    const segments = pathname.split('/');
    segments[1] = locale; // Replace the locale segment
    const newPath = segments.join('/') || `/${locale}`;

    router.push(newPath as any);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {languages.map((item: any) => {
        const locale = item.locale || item.id?.toLowerCase() || 'en';
        const isActive = currentLocale === locale;

        return (
          <button
            key={locale}
            className={clsx(
              '-m-2.5 flex items-center rounded-lg p-2.5 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-hidden dark:hover:bg-gray-700 w-full text-left',
              isActive ? 'bg-gray-100 dark:bg-gray-700' : 'opacity-80',
            )}
            onClick={() => handleLocaleClick(locale)}
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

interface Props extends Record<string, any> {
  className?: string;
  currencies: TCurrency[];

  currentLocale?: string;
  languages: TLanguage[];
  panelClassName?: string;
  panelPosition?: 'bottom-end' | 'bottom-start';
}

const CurrLangDropdown: FC<Props> = ({
  className,
  currencies,
  currentLocale,
  languages,
  panelClassName = 'w-80',
  panelPosition = 'bottom-end',
}) => {
  return (
    <div className={className}>
      <Menu
        classNames={{
          dropdown: clsx(
            'rounded-2xl border-0 ring-1 ring-black/5 dark:ring-white/10 p-6',
            panelClassName,
          ),
        }}
        offset={16}
        position={panelPosition}
        shadow="lg"
        transitionProps={{ duration: 200, transition: 'pop-top-right' }}
        width={320}
      >
        <Menu.Target>
          <button className="-m-2.5 flex items-center p-2.5 text-sm font-medium text-gray-800 focus:outline-hidden focus-visible:outline-hidden dark:text-neutral-200 group">
            <GlobeAltIcon className="size-[18px] opacity-80" />
            <span className="ms-2">Language</span>
            <ChevronDownIcon
              aria-hidden="true"
              className="ms-1 size-4 transition-transform group-data-[expanded]:rotate-180"
            />
          </button>
        </Menu.Target>

        <Menu.Dropdown>
          <Tabs
            classNames={{
              list: 'bg-gray-100 dark:bg-neutral-700 p-1 rounded-full gap-1',
              panel: 'mt-5 p-3',
              root: 'w-full',
              tab: 'rounded-full py-2 text-sm leading-5 font-medium text-gray-700 dark:text-neutral-300 data-[active]:bg-white data-[active]:shadow-sm hover:bg-white/70 dark:hover:bg-neutral-900/40',
            }}
            defaultValue="language"
            variant="pills"
          >
            <Tabs.List>
              <Tabs.Tab className="flex-1" value="language">
                Language
              </Tabs.Tab>
              <Tabs.Tab className="flex-1" value="currency">
                Currency
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="language">
              <Languages currentLocale={currentLocale} languages={languages} />
            </Tabs.Panel>
            <Tabs.Panel value="currency">
              <Currencies currencies={currencies} />
            </Tabs.Panel>
          </Tabs>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};
export default CurrLangDropdown;
