import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { HoverCard } from '@mantine/core';

import { type TCollection, type TNavigationItem } from '../../data/types';
import CollectionCard3 from '../CollectionCard3';
import { Link } from '../Link';

export function MegaMenuPopover({
  featuredCollection,
  megamenu,
}: {
  featuredCollection: TCollection;
  megamenu: TNavigationItem;
}) {
  if (megamenu.type !== 'mega-menu') {
    return null;
  }

  const renderNavlink = (item: TNavigationItem) => {
    return (
      <li key={item.id} className={`${item.isNew ? 'menuIsNew' : ''}`}>
        <Link
          className="font-normal text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          href={`${item.href ?? '#'}` as any}
        >
          {item.name}
        </Link>
      </li>
    );
  };

  return (
    <div className="hidden lg:block">
      <HoverCard
        classNames={{
          dropdown: 'left-0 right-0 p-0 rounded-none border-0',
        }}
        closeDelay={100}
        openDelay={100}
        position="bottom"
        shadow="lg"
        styles={{
          dropdown: {
            left: 0,
            maxWidth: '100vw',
            right: 0,
          },
        }}
        transitionProps={{ duration: 200, transition: 'pop' }}
        width="100vw"
      >
        <HoverCard.Target>
          <button className="-m-2.5 flex items-center p-2.5 text-sm font-medium text-gray-800 focus:outline-hidden dark:text-neutral-300">
            {megamenu.name}
            <ChevronDownIcon
              aria-hidden="true"
              className="ms-1 size-4 transition-transform group-hover:rotate-180"
            />
          </button>
        </HoverCard.Target>

        <HoverCard.Dropdown>
          <div className="w-full">
            <div className="bg-white shadow-lg dark:bg-neutral-900">
              <div className="container">
                <div className="flex justify-between py-8">
                  <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-3">
                    {megamenu.children?.map((item: any) => (
                      <div key={item.name} className="relative">
                        <p className="mb-4 text-sm font-medium text-neutral-900 dark:text-neutral-200">
                          {item.name}
                        </p>
                        <ul className="space-y-2 text-sm">{item.children?.map(renderNavlink)}</ul>
                      </div>
                    ))}
                  </div>
                  <div className="ms-8 hidden w-80 shrink-0 xl:block">
                    <CollectionCard3 className="w-full" collection={featuredCollection} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HoverCard.Dropdown>
      </HoverCard>
    </div>
  );
}
