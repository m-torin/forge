'use client';

import { usePathname } from 'next/navigation';

import { Link } from '@/components/ui';

const pages: {
  name: string;
  link: string;
}[] = [
  {
    name: 'Settings',
    link: '/account',
  },
  {
    name: 'Wishlists',
    link: '/account-wishlists',
  },
  {
    name: 'Registries',
    link: '/registries',
  },
  {
    name: 'Orders history',
    link: '/orders',
  },
  {
    name: 'Change password',
    link: '/account-password',
  },
  {
    name: 'Billing',
    link: '/account-billing',
  },
];

const PageTab = () => {
  const pathname = usePathname();

  return (
    <div>
      <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
        {pages.map((item: any) => {
          let isActive = pathname === item.link;
          if (item.link === '/orders' && pathname.includes('/orders/')) {
            isActive = true;
          }
          if (item.link === '/registries' && pathname.includes('/registries')) {
            isActive = true;
          }

          return (
            <Link
              key={item.link}
              href={item.link as any}
              className={`block shrink-0 border-b-2 py-5 text-sm sm:text-base md:py-8 ${
                isActive
                  ? 'border-primary-500 font-medium text-neutral-950 dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PageTab;
