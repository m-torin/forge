import CollectionCard3 from '@/components/CollectionCard3';
import { TCollection } from '@/data/data';
import { TNavigationItem } from '@/data/navigation';
import { Link } from '@/shared/link';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { FC } from 'react';

const Lv1MenuItem = ({ menuItem }: { menuItem: TNavigationItem }) => {
  return (
    <Link
      className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 lg:text-[15px] xl:px-5 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      href={menuItem.href || '#'}
    >
      {menuItem.name}
      {menuItem.children?.length && (
        <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4 text-neutral-400" aria-hidden="true" />
      )}
    </Link>
  );
};

const MegaMenu = ({
  menuItem,
  collection,
}: {
  menuItem: TNavigationItem;
  collection: TCollection;
}) => {
  const renderNavlink = (item: TNavigationItem) => {
    return (
      <li key={item.id} className={clsx('menu-item', item.isNew && 'menuIsNew')}>
        <Link
          className="font-normal text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          href={item.href || '#'}
        >
          {item.name}
        </Link>
      </li>
    );
  };

  return (
    <li className="menu-megamenu menu-item">
      <Lv1MenuItem menuItem={menuItem} />

      {menuItem.children?.length && menuItem.type === 'mega-menu' ? (
        <div className="sub-menu absolute inset-x-0 top-full z-10">
          <div className="bg-white shadow-lg dark:bg-neutral-900">
            <div className="container">
              <div className="flex border-t border-neutral-200 py-12 text-sm dark:border-neutral-700">
                <div className="grid flex-1 grid-cols-4 gap-6 pr-6 xl:gap-8 xl:pr-20">
                  {menuItem.children?.map(menuChild => (
                    <div key={`navigation-child-${menuChild.id}`}>
                      <p className="font-medium text-neutral-900 dark:text-neutral-200">
                        {menuChild.name}
                      </p>
                      <ul className="mt-4 grid space-y-4">
                        {menuChild.children?.map(renderNavlink)}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="xl:w-5/14 w-2/5">
                  <CollectionCard3 collection={collection} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
};

const DropdownMenu = ({ menuItem }: { menuItem: TNavigationItem }) => {
  const renderMenuLink = (menuItem: TNavigationItem) => {
    return (
      <Link
        className="flex items-center rounded-md px-4 py-2 font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        href={menuItem.href || '#'}
      >
        {menuItem.name}
        {menuItem.children?.length && (
          <ChevronDownIcon className="ml-2 h-4 w-4 text-neutral-500" aria-hidden="true" />
        )}
      </Link>
    );
  };

  const renderDropdown = (menuItem: TNavigationItem) => {
    return (
      <li key={menuItem.id} className="menu-dropdown menu-item relative px-2">
        {renderMenuLink(menuItem)}
        {menuItem.children?.length && (
          <div className="sub-menu absolute left-full top-0 z-10 w-56 pl-2">
            <ul className="relative grid space-y-1 rounded-lg bg-white py-4 text-sm shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
              {menuItem.children.map(child => {
                if (child.type === 'dropdown' && child.children?.length) {
                  return renderDropdown(child);
                }
                return (
                  <li key={child.id} className="px-2">
                    {renderMenuLink(child)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <li className="menu-dropdown menu-item relative">
      <Lv1MenuItem menuItem={menuItem} />

      {menuItem.children?.length && menuItem.type === 'dropdown' ? (
        <div className="sub-menu absolute left-0 top-full z-10 w-56">
          <ul className="relative grid space-y-1 rounded-lg bg-white py-4 text-sm shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            {menuItem.children?.map(childItem => {
              if (childItem.type === 'dropdown' && childItem.children?.length) {
                return renderDropdown(childItem);
              }
              return (
                <li key={childItem.id} className="px-2">
                  {renderMenuLink(childItem)}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </li>
  );
};

export interface Props {
  menu: TNavigationItem[];
  className?: string;
  featuredCollection: TCollection;
  'data-testid'?: string;
}
const Navigation: FC<Props> = ({
  menu,
  className,
  featuredCollection,
  'data-testid': testId = 'navigation',
}) => {
  return (
    <ul className={clsx('flex', className)} data-testid={testId}>
      {menu.map(menuItem => {
        if (menuItem.type === 'dropdown') {
          return <DropdownMenu key={menuItem.id} menuItem={menuItem} />;
        }
        if (menuItem.type === 'mega-menu') {
          return <MegaMenu collection={featuredCollection} key={menuItem.id} menuItem={menuItem} />;
        }
        return (
          <li key={menuItem.id} className="menu-item relative">
            <Lv1MenuItem key={menuItem.id} menuItem={menuItem} />
          </li>
        );
      })}
    </ul>
  );
};

export default Navigation;
