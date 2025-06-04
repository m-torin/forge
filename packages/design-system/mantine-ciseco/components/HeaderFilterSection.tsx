'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { FilterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Collapse } from '@mantine/core';
import { type FC, useState } from 'react';

import { Divider } from './Divider';
import Heading from './Heading/Heading';
import ButtonPrimary from './shared/Button/ButtonPrimary';
import Nav from './shared/Nav/Nav';
import NavItem from './shared/NavItem/NavItem';
import TabFilters from './TabFilters';
import TabFiltersPopover from './TabFiltersPopover';

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
        <Nav
          containerClassName="relative flex w-full overflow-x-auto text-sm md:text-base hidden-scrollbar"
          className="sm:gap-x-2"
        >
          {['All items', 'Women', 'Mans', 'Kids', 'jewels'].map((item, index) => (
            <NavItem key={index} onClick={() => setTabActive(item)} isActive={tabActive === item}>
              {item}
            </NavItem>
          ))}
        </Nav>
        <span className="hidden shrink-0 lg:block">
          <ButtonPrimary
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className="w-full pr-16!"
            sizeClass="pl-4 py-2.5 sm:pl-6"
          >
            <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={FilterIcon} size={24} />
            <span className="ms-2.5 block truncate">Filter</span>
            <span className="absolute top-1/2 right-5 -translate-y-1/2">
              <ChevronDownIcon
                aria-hidden="true"
                className={`size-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </span>
          </ButtonPrimary>
        </span>
      </div>

      <Collapse transitionDuration={150} in={isOpen}>
        <div>
          <Divider className="my-8" />
          <TabFilters className="hidden lg:block" />
          <TabFiltersPopover className="block lg:hidden" />
        </div>
      </Collapse>
    </div>
  );
};

export default HeaderFilterSection;
