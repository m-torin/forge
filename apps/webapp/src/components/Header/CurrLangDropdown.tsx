'use client';

import { getCurrencies, getLanguages } from '@/data/navigation';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  PopoverPanelProps,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { FC } from 'react';
import { Link } from '../Link';

const Currencies = ({ currencies }: { currencies: Awaited<ReturnType<typeof getCurrencies>> }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {currencies.map((item, _index) => (
        <Link
          key={`currency-${item.name}`}
          href={item.href}
          className={clsx(
            'focus:outline-hidden -m-2.5 flex items-center rounded-lg p-2.5 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700',
            item.active ? 'bg-gray-100 dark:bg-gray-700' : 'opacity-80',
          )}
        >
          <div dangerouslySetInnerHTML={{ __html: item.icon }} />
          <p className="ml-2 text-sm font-medium">{item.name}</p>
        </Link>
      ))}
    </div>
  );
};

const Languages = ({ languages }: { languages: Awaited<ReturnType<typeof getLanguages>> }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {languages.map((item, _index) => (
        <Link
          href={item.href}
          key={`language-${item.name}`}
          className={clsx(
            'focus:outline-hidden -m-2.5 flex items-center rounded-lg p-2.5 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700',
            item.active ? 'bg-gray-100 dark:bg-gray-700' : 'opacity-80',
          )}
        >
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

interface Props {
  panelAnchor?: PopoverPanelProps['anchor'];
  panelClassName?: PopoverPanelProps['className'];

  className?: string;
  currencies: Awaited<ReturnType<typeof getCurrencies>>;
  languages: Awaited<ReturnType<typeof getLanguages>>;
  'data-testid'?: string;
}

const CurrLangDropdown: FC<Props> = ({
  panelAnchor = 'bottom end',
  className,
  languages,
  currencies,
  panelClassName = 'mt-4 w-80',
  'data-testid': testId = 'curr-lang-dropdown',
}) => {
  return (
    <div className={className} data-testid={testId}>
      <Popover>
        <PopoverButton className="focus:outline-hidden focus-visible:outline-hidden -m-2.5 flex items-center p-2.5 text-sm font-medium text-gray-800 dark:text-neutral-200">
          <GlobeAltIcon className="size-[18px] opacity-80" />
          <span className="ms-2">Language</span>
          <ChevronDownIcon className="group-data-open:rotate-180 ms-1 size-4" aria-hidden="true" />
        </PopoverButton>

        <PopoverPanel
          anchor={panelAnchor}
          transition
          className={clsx(
            'data-closed:translate-y-1 data-closed:opacity-0 z-10 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out dark:bg-neutral-800',
            panelClassName,
          )}
        >
          <TabGroup>
            <TabList className="flex space-x-1 rounded-full bg-gray-100 p-1 dark:bg-neutral-700">
              {['Language', 'Currency'].map(category => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    clsx(
                      'focus:outline-hidden w-full rounded-full py-2 text-sm font-medium leading-5 text-gray-700 focus:ring-0',
                      selected
                        ? 'bg-white shadow-sm'
                        : 'text-gray-700 hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-neutral-900/40',
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </TabList>
            <TabPanels className="mt-5">
              <TabPanel className="focus:outline-hidden rounded-xl p-3 focus:ring-0">
                <Languages languages={languages} />
              </TabPanel>
              <TabPanel className="focus:outline-hidden rounded-xl p-3 focus:ring-0">
                <Currencies currencies={currencies} />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </PopoverPanel>
      </Popover>
    </div>
  );
};
export default CurrLangDropdown;
