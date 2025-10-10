'use client';

import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import Nav from '@/shared/Nav/Nav';
import NavItem from '@/shared/Nav/NavItem';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { FilterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FC, useState } from 'react';
import { Divider } from './Divider';
import { FilterSortByMenuListBox } from './FilterSortByMenu';
import { FiltersMenuTabs } from './FiltersMenu';
import Heading from './Heading/Heading';

export interface HeaderFilterSectionProps {
  className?: string;
  heading?: string;
}

const HeaderFilterSection: FC<HeaderFilterSectionProps> = ({ className = 'mb-12', heading }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [tabActive, setTabActive] = useState('All items');

  return (
    <div className={`relative flex flex-col ${className}`}>
      {heading && (
        <Heading className="mb-12 text-neutral-900 dark:text-neutral-50">{heading}</Heading>
      )}
      <div className="flex flex-col justify-between gap-y-6 lg:flex-row lg:items-center lg:gap-x-2 lg:gap-y-0">
        <Nav className="sm:gap-x-2">
          {['All items', 'Women', 'Mans', 'Kids', 'jewels'].map(item => (
            <NavItem
              key={`filter-tab-${item}`}
              isActive={tabActive === item}
              onClick={() => setTabActive(item)}
            >
              {item}
            </NavItem>
          ))}
        </Nav>

        <span className="hidden shrink-0 lg:block">
          <ButtonPrimary
            size="smaller"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <HugeiconsIcon
              icon={FilterIcon}
              size={22}
              className="-ml-1"
              color="currentColor"
              strokeWidth={1.5}
            />
            <span className="ml-2">Filter</span>
            <ChevronDownIcon
              className={`size-5 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </ButtonPrimary>
        </span>
      </div>

      <Transition
        as="div"
        show={isOpen}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Divider className="my-8" />
        <div className="flex flex-wrap items-center gap-2.5">
          <FiltersMenuTabs />
          <FilterSortByMenuListBox className="ml-auto" />
        </div>
      </Transition>
    </div>
  );
};

export default HeaderFilterSection;
